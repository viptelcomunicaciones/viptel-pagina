# Payload CMS Features — Design Specification

**Fecha**: 2026-08-24
**Versión**: 1.0
**Estado**: Diseño aprobado para implementación
**Plan asociado**: `2026-08-24-payload-cms-features-implementation.md`

---

## 1. Alcance y Objetivos

### 1.1 Propósito
Especificar el diseño técnico para implementar features faltantes y mejoras críticas en Payload CMS 3.86 del backend de Viptel Comunicaciones, elevando el CMS a nivel enterprise-ready.

### 1.2 Objetivos de Diseño
- **Seguridad**: Control de acceso granular por rol, organización y campo
- **Confiabilidad**: Revalidation automática, soft-delete, transaction safety
- **Escalabilidad**: Cloud storage, background jobs, search distribuido
- **Observabilidad**: Error tracking, structured logging, health checks
- **UX Editorial**: Rich text completo, dashboard personalizado, query presets

### 1.3 Fuera de Alcance
- Migración de base de datos (ya en PostgreSQL + Drizzle)
- Cambios en website Astro (excepto endpoints de revalidation/search)
- Rediseño de UI admin (solo componentes funcionales)
- Multi-tenancy completo (solo foundation en Fase 2)

---

## 2. Arquitectura de Solución

### 2.1 Diagrama de Componentes Nuevos

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PAYLOAD CMS BACKEND                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │   Access     │  │    Hooks     │  │    Jobs      │  │  Storage   │ │
│  │  Control     │  │              │  │   Queue      │  │  Adapter   │ │
│  │              │  │              │  │              │  │            │ │
│  │ roleBased.ts │  │ revalidate   │  │ revalidate   │  │  R2/S3     │ │
│  │ orgScoped.ts │  │ cleanupV.    │  │ syncSearch   │  │  Plugin    │ │
│  │ timeLimited  │  │ webhookDel.  │  │ generateSM   │  │            │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘ │
│         │                 │                 │                 │        │
│         └─────────────────┼─────────────────┼─────────────────┘        │
│                           ▼                 ▼                          │
│              ┌─────────────────────────────────────────┐              │
│              │         COLLECTIONS (7)                 │              │
│              │  Users │ Pages │ Posts │ Projects       │              │
│              │  Services │ Media │ Categories          │              │
│              └─────────────────────────────────────────┘              │
│                           │                                           │
│                           ▼                                           │
│              ┌─────────────────────────────────────────┐              │
│              │         PLUGINS                         │              │
│              │  seo │ nested-docs │ redirects          │              │
│              │  form-builder │ search │ sentry         │              │
│              │  storage-r2 │ email-resend │ mcp        │              │
│              └─────────────────────────────────────────┘              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
            ┌───────────────┐   ┌───────────────┐
            │  ASTRO SSR    │   │  EXTERNAL     │
            │  (Website)    │   │  SERVICES     │
            │               │   │               │
            │ /api/revalidate│  │ Meilisearch   │
            │ /api/search   │   │ Cloudflare R2 │
            │ /api/health   │   │ Resend        │
            │ /api/webhook  │   │ Sentry        │
            └───────────────┘   └───────────────┘
```

### 2.2 Flujo de Datos Clave

#### 2.2.1 Publish → Revalidation Flow
```
Editor clicks "Publish" in Payload Admin
         │
         ▼
Payload afterChange hook (collection-level)
         │
         ▼
Job `revalidateFrontend` queued (inline, sync)
         │
         ▼
POST /api/revalidate (Astro) with { path, secret }
         │
         ▼
Astro invalidates Next.js cache / regenerates page
         │
         ▼
200 OK → Job marked succeeded
```

#### 2.2.2 Search Index Sync Flow
```
Document created/updated/deleted (any collection)
         │
         ▼
Payload afterChange hook → Job `syncSearchIndex` queued
         │
         ▼
Job executes: Meilisearch indexDocuments / deleteDocument
         │
         ▼
Astro /api/search queries Meilisearch directly
```

#### 2.2.3 Media Upload Flow (R2)
```
Editor uploads image in Payload Admin
         │
         ▼
Payload Media collection upload handler
         │
         ▼
@payloadcms/storage-r2 plugin streams to R2
         │
         ▼
R2 returns signed URL / public URL
         │
         ▼
Payload stores R2 key in DB, serves via /api/media/file/:filename
         │
         ▼
Astro resolveMediaUrl() converts to absolute R2 URL
```

---

## 3. Especificación por Feature

### 3.1 Authentication & Roles (Fase 1)

#### 3.1.1 Users Collection - Nueva Estructura

```typescript
// backend/src/collections/Users/index.ts
export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 7200, // 2h
    verify: true,
    maxLoginAttempts: 5,
    lockTime: 600000, // 10min
    useAPIKey: true,
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'roles', '_status', 'lastLogin'],
    group: 'Admin',
  },
  access: {
    admin: ({ req: { user } }) => user?.roles?.includes('admin') || false,
    create: ({ req: { user } }) => user?.roles?.includes('admin') || false,
    read: ({ req: { user } }) => Boolean(user), // authenticated users read all
    update: ({ req: { user }, id }) => {
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      return user.id === id // self-update
    },
    delete: ({ req: { user } }) => user?.roles?.includes('admin') || false,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Administrador', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Marketing', value: 'marketing' },
        { label: 'Ventas', value: 'sales' },
      ],
      defaultValue: ['editor'],
      required: true,
      saveToJWT: true, // Critical: avoids DB lookup per request
      access: {
        read: ({ req: { user } }) => user?.roles?.includes('admin') || false,
        update: ({ req: { user } }) => user?.roles?.includes('admin') || false,
      },
    },
    {
      name: 'lastLogin',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true },
      hooks: {
        beforeChange: [
          ({ operation, value }) => {
            if (operation === 'create' || operation === 'update') {
              return new Date()
            }
            return value
          },
        ],
      },
    },
  ],
  timestamps: true,
}
```

#### 3.1.2 Access Control Factories

```typescript
// backend/src/access/roleBased.ts
import type { Access } from 'payload'

export function createRoleBasedAccess(...allowedRoles: string[]): Access {
  return ({ req: { user } }) => {
    if (!user) return false
    return allowedRoles.some((role) => user.roles?.includes(role))
  }
}

// Pre-built common combinations
export const adminOnly = createRoleBasedAccess('admin')
export const adminOrEditor = createRoleBasedAccess('admin', 'editor')
export const contentRoles = createRoleBasedAccess('admin', 'editor', 'marketing')
export const allAuthenticated = ({ req: { user } }) => Boolean(user)
```

```typescript
// backend/src/access/orgScoped.ts
import type { Access } from 'payload'

export function createOrgScopedAccess(options: {
  orgField?: string
  userOrgField?: string
  allowAdmin?: boolean
} = {}): Access {
  const { orgField = 'organization', userOrgField = 'organization', allowAdmin = true } = options
  
  return ({ req: { user } }) => {
    if (!user) return false
    if (allowAdmin && user.roles?.includes('admin')) return true
    
    const userOrgs = user[userOrgField]
    if (!userOrgs) return false
    
    const orgIds = Array.isArray(userOrgs) ? userOrgs : [userOrgs]
    return { [orgField]: { in: orgIds } }
  }
}
```

```typescript
// backend/src/access/timeLimited.ts
import type { Access } from 'payload'

export function createTimeLimitedAccess(options: {
  days?: number
  startField?: string
  endField?: string
  allowAdmin?: boolean
} = {}): Access {
  const { 
    days = 30, 
    startField = 'publishDate', 
    endField = 'unpublishDate', 
    allowAdmin = true 
  } = options

  return ({ req: { user } }) => {
    if (!user) return false
    if (allowAdmin && user.roles?.includes('admin')) return true

    const now = new Date().toISOString()
    
    return {
      and: [
        { [startField]: { less_than_equal: now } },
        {
          or: [
            { [endField]: { exists: false } },
            { [endField]: { greater_than: now } },
          ],
        },
      ],
    }
  }
}
```

### 3.2 Jobs Queue (Fase 3)

#### 3.2.1 Configuración en payload.config.ts

```typescript
// backend/src/payload.config.ts
import { revalidateFrontendJob } from './jobs/revalidateFrontend'
import { syncSearchIndexJob } from './jobs/syncSearchIndex'
import { generateSitemapJob } from './jobs/generateSitemap'
import { cleanupVersionsJob } from './jobs/cleanupVersions'
import { webhookDeliveryJob } from './jobs/webhookDelivery'

export default buildConfig({
  // ... existing config
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        if (req.user) return true
        const secret = process.env.CRON_SECRET
        if (!secret) return false
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [
      revalidateFrontendJob,
      syncSearchIndexJob,
      generateSitemapJob,
      cleanupVersionsJob,
      webhookDeliveryJob,
    ],
  },
})
```

#### 3.2.2 Task: revalidateFrontend

```typescript
// backend/src/jobs/revalidateFrontend.ts
import type { JobTask } from 'payload'

export const revalidateFrontendJob: JobTask = {
  slug: 'revalidateFrontend',
  inputSchema: [
    { name: 'path', type: 'text', required: true },
    { name: 'collection', type: 'text', required: false },
    { name: 'locale', type: 'text', required: false, defaultValue: 'es' },
  ],
  handler: async ({ job, req }) => {
    const { path, collection, locale } = job.input
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4321'
    const secret = process.env.REVALIDATE_SECRET || process.env.PREVIEW_SECRET
    
    if (!secret) {
      throw new Error('REVALIDATE_SECRET not configured')
    }

    const paths = Array.isArray(path) ? path : [path]
    
    const results = await Promise.allSettled(
      paths.map(async (p) => {
        const url = new URL('/api/revalidate', frontendUrl)
        url.searchParams.set('secret', secret)
        url.searchParams.set('path', p)
        if (locale) url.searchParams.set('locale', locale)
        
        const response = await fetch(url.toString(), { method: 'POST' })
        if (!response.ok) {
          throw new Error(`Revalidation failed for ${p}: ${response.statusText}`)
        }
        return { path: p, status: 'success' }
      })
    )

    const failed = results.filter(r => r.status === 'rejected')
    if (failed.length > 0) {
      throw new Error(`Revalidation failed for ${failed.length} paths`)
    }

    return { output: { revalidated: paths } }
  },
}
```

#### 3.2.3 Task: syncSearchIndex

```typescript
// backend/src/jobs/syncSearchIndex.ts
import type { JobTask } from 'payload'
import { MeiliSearch } from 'meilisearch'

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_API_KEY,
})

const COLLECTION_INDEX_MAP: Record<string, string> = {
  posts: 'posts',
  projects: 'projects',
  services: 'services',
  pages: 'pages',
}

function transformDoc(doc: any, collection: string) {
  const base = {
    id: doc.id,
    slug: doc.slug,
    title: doc.title,
    _status: doc._status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }

  switch (collection) {
    case 'posts':
      return { ...base, excerpt: doc.excerpt, publishedAt: doc.publishedAt, tags: doc.tags?.map(t => t.name), categories: doc.categories?.map(c => c.title) }
    case 'projects':
      return { ...base, description: doc.description, client: doc.client, year: doc.year, tags: doc.tags?.map(t => t.name) }
    case 'services':
      return { ...base, shortDescription: doc.shortDescription, parent: doc.parent }
    case 'pages':
      return { ...base, layout: doc.layout?.map(b => b.blockType) }
    default:
      return base
  }
}

export const syncSearchIndexJob: JobTask = {
  slug: 'syncSearchIndex',
  inputSchema: [
    { name: 'collection', type: 'text', required: true },
    { name: 'operation', type: 'select', required: true, options: ['create', 'update', 'delete'] },
    { name: 'docId', type: 'text', required: true },
    { name: 'doc', type: 'json', required: false },
  ],
  handler: async ({ job, req }) => {
    const { collection, operation, docId, doc } = job.input
    const indexName = COLLECTION_INDEX_MAP[collection]
    
    if (!indexName) {
      job.logger.info(`No search index for collection ${collection}`)
      return { output: { skipped: true } }
    }

    const index = client.index(indexName)

    switch (operation) {
      case 'create':
      case 'update':
        if (!doc) {
          // Fetch fresh if not provided
          const fetched = await req.payload.findByID({ collection, id: docId, depth: 2 })
          if (!fetched) throw new Error(`Document ${docId} not found`)
          await index.addDocuments([transformDoc(fetched, collection)])
        } else {
          await index.addDocuments([transformDoc(doc, collection)])
        }
        break
      case 'delete':
        await index.deleteDocument(docId)
        break
    }

    return { output: { collection, operation, docId } }
  },
}
```

#### 3.2.4 Task: generateSitemap

```typescript
// backend/src/jobs/generateSitemap.ts
import type { JobTask } from 'payload'

export const generateSitemapJob: JobTask = {
  slug: 'generateSitemap',
  inputSchema: [
    { name: 'trigger', type: 'select', options: ['manual', 'scheduled', 'webhook'], defaultValue: 'scheduled' },
  ],
  handler: async ({ job, req }) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4321'
    const secret = process.env.SITEMAP_WEBHOOK_SECRET || process.env.PREVIEW_SECRET
    
    const response = await fetch(`${frontendUrl}/api/sitemap`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${secret}` },
    })
    
    if (!response.ok) {
      throw new Error(`Sitemap generation failed: ${response.statusText}`)
    }
    
    return { output: { triggered: true } }
  },
}
```

#### 3.2.5 Task: cleanupVersions

```typescript
// backend/src/jobs/cleanupVersions.ts
import type { JobTask } from 'payload'

export const cleanupVersionsJob: JobTask = {
  slug: 'cleanupVersions',
  inputSchema: [
    { name: 'maxAgeDays', type: 'number', defaultValue: 90 },
    { name: 'dryRun', type: 'checkbox', defaultValue: false },
  ],
  handler: async ({ job, req }) => {
    const { maxAgeDays, dryRun } = job.input
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - maxAgeDays)
    
    const collections = ['pages', 'posts', 'projects', 'services']
    let totalDeleted = 0
    
    for (const collection of collections) {
      const versions = await req.payload.db.drizzle
        .select({ id: req.payload.db.tables[`${collection}_versions`].id })
        .from(req.payload.db.tables[`${collection}_versions`])
        .where(eq(req.payload.db.tables[`${collection}_versions`].createdAt, cutoff))
      
      if (!dryRun && versions.length > 0) {
        await req.payload.db.drizzle
          .delete(req.payload.db.tables[`${collection}_versions`])
          .where(inArray(req.payload.db.tables[`${collection}_versions`].id, versions.map(v => v.id)))
      }
      totalDeleted += versions.length
    }
    
    return { output: { collections, deleted: totalDeleted, dryRun } }
  },
}
```

### 3.3 Cloud Storage - Cloudflare R2 (Fase 4)

```typescript
// backend/src/payload.config.ts
import { r2Storage } from '@payloadcms/storage-r2'

export default buildConfig({
  // ... existing config
  plugins: [
    // ... existing plugins
    r2Storage({
      collections: {
        media: true,
      },
      bucket: process.env.R2_BUCKET!,
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID!,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        },
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      },
      // Optional: custom URL for public access
      // publicUrl: process.env.R2_PUBLIC_URL,
    }),
  ],
})
```

### 3.4 Search - Meilisearch Plugin (Fase 5)

```typescript
// backend/src/payload.config.ts
import { searchPlugin } from '@payloadcms/plugin-search'

export default buildConfig({
  // ... existing config
  plugins: [
    // ... existing plugins
    searchPlugin({
      collections: ['posts', 'projects', 'services', 'pages'],
      defaultSortableFields: ['publishedAt', 'createdAt', 'title'],
      defaultFilterableFields: ['_status', 'categories', 'tags', 'postType'],
      defaultSearchableFields: ['title', 'excerpt', 'description', 'content'],
      beforeSync: async ({ doc, collection }) => {
        // Transform before indexing
        return doc
      },
    }),
  ],
})
```

### 3.5 Observabilidad - Sentry (Fase 5)

```typescript
// backend/src/payload.config.ts
import { sentryPlugin } from '@payloadcms/plugin-sentry'

export default buildConfig({
  // ... existing config
  plugins: [
    // ... existing plugins
    sentryPlugin({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 0.1,
      profilesSampleRate: 0.1,
      // Capture user info
      beforeSend: (event) => {
        if (event.user) {
          event.user = { id: event.user.id, email: event.user.email }
        }
        return event
      },
    }),
  ],
})
```

### 3.6 Health Check Endpoint (Fase 5)

```typescript
// backend/src/app/(payload)/api/health.ts
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  const start = Date.now()
  const checks = {
    database: false,
    payload: false,
    search: false,
    storage: false,
  }

  try {
    const payload = await getPayload({ config })
    
    // Check Payload
    await payload.find({ collection: 'users', limit: 1 })
    checks.payload = true
    
    // Check Database (via Payload)
    checks.database = true
    
    // Check Search (Meilisearch)
    try {
      const { MeiliSearch } = await import('meilisearch')
      const client = new MeiliSearch({
        host: process.env.MEILISEARCH_HOST,
        apiKey: process.env.MEILISEARCH_API_KEY,
      })
      await client.getIndexes()
      checks.search = true
    } catch {
      checks.search = false
    }
    
    // Check Storage (R2)
    try {
      const { S3Client, HeadBucketCommand } = await import('@aws-sdk/client-s3')
      const s3 = new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID!,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        },
      })
      await s3.send(new HeadBucketCommand({ Bucket: process.env.R2_BUCKET! }))
      checks.storage = true
    } catch {
      checks.storage = false
    }
    
    await payload.destroy()
  } catch (error) {
    console.error('Health check failed:', error)
  }

  const healthy = Object.values(checks).every(v => v)
  const latency = Date.now() - start

  return NextResponse.json(
    { status: healthy ? 'healthy' : 'degraded', checks, latency },
    { status: healthy ? 200 : 503 }
  )
}
```

### 3.7 Rich Text Enhancements (Fase 6)

```typescript
// backend/src/fields/defaultLexical.ts
import {
  BoldFeature,
  ItalicFeature,
  UnderlineFeature,
  ParagraphFeature,
  LinkFeature,
  HeadingFeature,
  IndentFeature,
  UploadFeature,
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
  EXPERIMENTAL_TableFeature,
} from '@payloadcms/richtext-lexical'

export const defaultLexical = lexicalEditor({
  features: ({ rootFeatures }) => {
    return [
      ...rootFeatures,
      HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
      BoldFeature(),
      ItalicFeature(),
      UnderlineFeature(),
      ParagraphFeature(),
      IndentFeature(),
      FixedToolbarFeature(),
      InlineToolbarFeature(),
      LinkFeature({
        enabledCollections: ['pages', 'posts', 'projects', 'services'],
        fields: ({ defaultFields }) => {
          const defaultFieldsWithoutUrl = defaultFields.filter(
            (field) => !('name' in field && field.name === 'url')
          )
          return [
            ...defaultFieldsWithoutUrl,
            {
              name: 'url',
              type: 'text',
              admin: {
                condition: (_data, siblingData) => siblingData?.linkType !== 'internal',
              },
              label: ({ t }) => t('fields:enterURL'),
              required: true,
            },
          ]
        },
      }),
      UploadFeature({
        collections: ['media'],
        fields: ({ defaultFields }) => defaultFields,
      }),
      // EXPERIMENTAL_TableFeature: opt-in via FEATURE_RICH_TEXT_TABLES env var.
      // Sigue marcado como EXPERIMENTAL en Payload 3.86 — no habilitar en producción
      // sin validar contra el contenido existente. Ver Fase 4 del plan.
      ...(process.env.FEATURE_RICH_TEXT_TABLES === 'true'
        ? [EXPERIMENTAL_TableFeature()]
        : []),
    ]
  },
})
```

### 3.8 Dashboard Widget: My Drafts (Fase 6)

```tsx
// backend/src/components/DashboardWidgets/MyDraftsWidget.tsx
'use client'
import { useEffect, useState } from 'react'
import { useConfig, useTranslate } from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'

export const MyDraftsWidget = () => {
  const { config } = useConfig()
  const t = useTranslate()
  const [drafts, setDrafts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const url = formatAdminURL({
          apiRoute: config.routes.api,
          path: '/posts',
        })
        const params = new URLSearchParams({
          where: JSON.stringify({
            _status: { equals: 'draft' },
            'author': { equals: 'me' }, // Would need custom where
          }),
          limit: '5',
          sort: '-updatedAt',
        })
        const res = await fetch(`${url}?${params}`)
        const data = await res.json()
        setDrafts(data.docs || [])
      } catch (e) {
        console.error('Failed to fetch drafts', e)
      } finally {
        setLoading(false)
      }
    }
    fetchDrafts()
  }, [config])

  if (loading) return <div className="p-4">Cargando borradores...</div>
  if (!drafts.length) return <div className="p-4 text-muted-foreground">Sin borradores recientes</div>

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">{t('dashboard:myDrafts')}</h3>
      <ul className="space-y-1">
        {drafts.map((draft) => (
          <li key={draft.id}>
            <a href={`${config.routes.admin}/collections/posts/${draft.id}`} className="text-sm hover:underline">
              {draft.title}
            </a>
            <span className="text-xs text-muted-foreground">
              Actualizado {new Date(draft.updatedAt).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### 3.9 Query Presets (Fase 7)

```typescript
// backend/src/collections/Posts/index.ts - admin section
admin: {
  defaultColumns: ['title', 'postType', 'categories', '_status', 'updatedAt'],
  listSearchableFields: ['title', 'slug', 'excerpt'],
  queryPresets: [
    {
      label: 'Publicados',
      where: { _status: { equals: 'published' } },
    },
    {
      label: 'Borradores',
      where: { _status: { equals: 'draft' } },
    },
    {
      label: 'Programados',
      where: { _status: { equals: 'published' }, publishDate: { greater_than: new Date().toISOString() } },
    },
    {
      label: 'Mis posts',
      where: { author: { equals: '{{user.id}}' } }, // Would need custom token
    },
  ],
}
```

---

## 4. Configuración de Feature Flags

```typescript
// backend/src/payload.config.ts
const features = {
  roles: process.env.FEATURE_ROLES === 'true',
  jobs: process.env.FEATURE_JOBS === 'true',
  search: process.env.FEATURE_SEARCH === 'true',
  cloudStorage: process.env.FEATURE_R2 === 'true',
  sentry: process.env.FEATURE_SENTRY === 'true',
  richTextTables: process.env.FEATURE_RICH_TEXT_TABLES === 'true',
  dashboardWidgets: process.env.FEATURE_DASHBOARD_WIDGETS === 'true',
  queryPresets: process.env.FEATURE_QUERY_PRESETS === 'true',
}

// Conditional plugin registration
const plugins = [
  // ... always-on plugins
  ...(features.cloudStorage ? [r2Storage({...})] : []),
  ...(features.search ? [searchPlugin({...})] : []),
  ...(features.sentry ? [sentryPlugin({...})] : []),
]
```

---

## 5. Testing Specification

### 5.1 Unit Tests (Vitest)

```typescript
// backend/tests/access/roleBased.test.ts
import { createRoleBasedAccess } from '@/access/roleBased'

describe('createRoleBasedAccess', () => {
  it('allows admin when role matches', () => {
    const access = createRoleBasedAccess('admin')
    const req = { user: { roles: ['admin'] } } as any
    expect(access({ req })).toBe(true)
  })

  it('denies when role missing', () => {
    const access = createRoleBasedAccess('admin')
    const req = { user: { roles: ['editor'] } } as any
    expect(access({ req })).toBe(false)
  })

  it('denies when no user', () => {
    const access = createRoleBasedAccess('admin')
    const req = { user: null } as any
    expect(access({ req })).toBe(false)
  })
})
```

### 5.2 Integration Tests (Vitest)

```typescript
// backend/tests/int/jobs.int.spec.ts
import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import { getPayload } from 'payload'
import config from '@payload-config'

describe('Jobs Queue', () => {
  let payload: any
  
  beforeAll(async () => {
    payload = await getPayload({ config })
  })
  
  afterAll(async () => {
    await payload.destroy()
  })

  test('revalidateFrontend job executes', async () => {
    const job = await payload.jobs.queue({
      task: 'revalidateFrontend',
      input: { path: '/test-page', locale: 'es' },
    })
    
    expect(job).toBeDefined()
    // Wait for completion
    await new Promise(r => setTimeout(r, 2000))
    
    const completed = await payload.jobs.findByID({ id: job.id })
    expect(completed.status).toBe('succeeded')
  })
})
```

### 5.3 E2E Tests (Playwright)

```typescript
// backend/tests/e2e/admin-flows.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Admin - Roles & Access', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin')
    await page.fill('input[name="email"]', 'admin@viptel.com')
    await page.fill('input[name="password"]', 'password')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/.*\/admin/)
  })

  test('editor can create post but not delete user', async ({ page }) => {
    // Login as editor
    // Navigate to Posts
    // Create post - should succeed
    // Navigate to Users
    // Try delete - should be disabled/hidden
  })
})
```

---

## 6. Migración de Datos

### 6.1 Media Migration Script (Fase 4)

```typescript
// backend/src/scripts/migrate-media-to-r2.ts
import { getPayload } from 'payload'
import config from '@payload-config'
import fs from 'fs/promises'
import path from 'path'

async function migrateMedia() {
  const payload = await getPayload({ config })
  const localMediaPath = path.resolve(process.cwd(), 'public/media')
  
  const media = await payload.find({ collection: 'media', limit: 1000, depth: 0 })
  
  for (const doc of media.docs) {
    if (doc.url?.startsWith('/media/')) {
      // Already migrated or external
      continue
    }
    
    // File is local, R2 plugin will handle on next access
    // Or force re-upload via payload.update
    console.log(`Migrating: ${doc.filename}`)
  }
  
  await payload.destroy()
}

migrateMedia().catch(console.error)
```

### 6.2 Users Migration - Add Roles (Fase 1)

**No se escribe SQL a mano.** Payload genera la migración automáticamente comparando el schema actual contra la DB.

**Workflow**:

1. Modificar `backend/src/collections/Users/index.ts` (añadir `roles`, `lastLogin`)
2. Ejecutar `pnpm --filter backend payload migrate:create`
3. Payload diffs schema vs DB y genera archivo TS en `backend/src/migrations/`
4. Revisar el diff generado (DDL via `sql` template literal de `@payloadcms/db-postgres`, mismo estilo que `20260825_205151_initial.ts` existente)
5. Commitear el archivo generado
6. Aplicar con `pnpm --filter backend payload migrate`

**Ejemplo de output esperado** (generado, no escrito a mano):

```typescript
// backend/src/migrations/20260826_add_user_roles.ts
import { MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "roles" jsonb DEFAULT '["editor"]'::jsonb;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_login" timestamp with time zone;
    CREATE INDEX IF NOT EXISTS "users_roles_idx" ON "users" USING GIN ("roles");
  `)
}

export async function down({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "users_roles_idx";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "last_login";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "roles";
  `)
}
```

**Nota**: El `IF NOT EXISTS` / `IF EXISTS` en down no es generado por Payload — el archivo generado puede requerir edición manual para idempotencia. Revisar siempre.

---

## 7. Rollback Procedures

| Componente | Rollback |
|------------|----------|
| **Roles en Users** | `git revert` + remove `roles` column via migration |
| **Jobs Queue** | Set `FEATURE_JOBS=false`, remove tasks array |
| **R2 Storage** | Revert plugin, `MEDIA_PATH` back to local, re-sync files |
| **Search Plugin** | Set `FEATURE_SEARCH=false`, remove plugin |
| **Sentry** | Set `FEATURE_SENTRY=false`, remove plugin |

---

## 8. Documentación Asociada

| Documento | Ubicación |
|-----------|-----------|
| Plan de implementación | `docs/superpowers/plans/2026-08-24-payload-cms-features-implementation.md` |
| Project Knowledge | `project-knowledge/SKILL.md` |
| Backend AGENTS | `backend/AGENTS.md` |
| Payload Skill Reference | `backend/.agents/skills/payload/reference/` |
| Website AGENTS | `website/AGENTS.md` |

---

## 9. Aprobación

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| Tech Lead | | | |
| Backend Developer | | | |
| DevOps | | | |
| Product Owner | | | |

---

*Fin de la especificación de diseño*