# Services CMS + Dropdown Nav + Tienda Externa — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build a Services CMS collection with category/sub-service hierarchy, dropdown nav in the Header, and an external "Tienda" nav link.

**Architecture:** New `services` collection in Payload with self-referential `parent` field for 2-level hierarchy. Astro routes at `/services` (overview) and `/services/[...slug]` (category or detail) consume Payload REST API. Header gains dropdown support via `children` field in `NavItem`. No changes to existing Pages, Posts, Projects, or static About/Contact.

**Tech Stack:** Payload CMS 3.86, Astro 7.1, Tailwind CSS v4, TypeScript

## Global Constraints

- Backend uses postgresAdapter, i18n es/en (es default), fallback true
- All collections use `authenticatedOrPublished` for read, `authenticated` for write
- Drafts with autosave (100ms interval) + schedulePublish, maxPerDoc 50
- SEO plugin active with `generateTitle: "Viptel — {title}"`, `generateURL: FRONTEND_URL/services/{slug}`
- Website SSR (`output: 'server'`), all Payload fetch with `depth=2`, timeout 15s
- i18n: `es` default, `en` secondary. No locale prefix for default
- Existing files renamed with `.bak` extension, never deleted
- Run `pnpm build` from root after all tasks to verify
- Must not touch: Pages, Posts, Projects, Categories, About, Contact, site.config.ts

---

## File Structure Map

```
backend/
├── src/collections/Services/index.ts    (NEW) — Services collection config
├── src/payload.config.ts                (MODIFY) — register Services, update SEO
├── src/plugins/index.ts                 (MODIFY) — add Service to SEO types, services URLs
├── src/fields/link.ts                   (MODIFY) — relationTo += 'services'
├── src/scripts/seed.ts                  (MODIFY) — add service seeding
└── src/payload-types.ts                 (REGENERATE) — auto-generated

website/
├── src/lib/payload-types.ts             (COPY) — from backend
├── src/lib/payload.ts                   (MODIFY) — add 4 service functions
├── src/components/services/             (NEW directory, 8 files)
│   ├── ServiceCard.astro
│   ├── ServiceGrid.astro
│   ├── ServiceFeatures.astro
│   ├── ServicePricing.astro
│   ├── ServiceFAQ.astro
│   ├── ServiceGallery.astro
│   ├── ServiceBreadcrumb.astro
│   └── ServiceDetailLayout.astro
├── src/components/pages/views/
│   ├── ServicesView.astro               (RENAME -> .bak)
│   ├── ServicesOverviewView.astro       (NEW)
│   └── ServiceView.astro                (NEW)
├── src/pages/
│   ├── services.astro                   (RENAME -> .bak, then NEW)
│   └── services/[...slug].astro         (NEW)
├── src/pages/[locale]/
│   ├── services.astro                   (RENAME -> .bak, then NEW)
│   └── services/[...slug].astro         (NEW)
├── src/components/layout/Header.astro   (MODIFY) — dropdown support
├── src/config/nav.config.ts             (MODIFY) — children + shop item
└── src/i18n/es.json + en.json           (MODIFY) — service + shop keys
```

---

### Task 1: Backend — Services collection

**Files:**
- Create: `backend/src/collections/Services/index.ts`

**Interfaces:**
- Consumes: `authenticatedOrPublished`, `authenticated`, `seoTab`, `generatePreviewPath`, `populatePublishedAt`, block configs (CallToAction, Content, FAQ, Gallery, Pricing, Cards, MediaContent)
- Produces: `Services` collection config exported as named export

- [ ] **Step 1: Create `backend/src/collections/Services/index.ts`**

```ts
import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Cards } from '../../blocks/Cards/config'
import { Content } from '../../blocks/Content/config'
import { FAQ } from '../../blocks/FAQ/config'
import { Gallery } from '../../blocks/Gallery/config'
import { MediaContent } from '../../blocks/MediaContent/config'
import { Pricing } from '../../blocks/Pricing/config'
import { seoTab } from '../../fields/seoTab'
import { slugField } from 'payload'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'

export const Services: CollectionConfig<'services'> = {
  slug: 'services',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'parent', '_status'],
    group: 'Content',
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug as string,
          collection: 'services',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'services',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'services',
      admin: {
        position: 'sidebar',
        description: 'Dejar vacío si es una categoría. Seleccionar un servicio padre si es un sub-servicio.',
      },
    },
    slugField(),
    {
      name: 'shortDescription',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'description',
              type: 'richText',
              localized: true,
            },
            {
              name: 'features',
              type: 'array',
              localized: true,
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  localized: true,
                  required: true,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  localized: true,
                },
                {
                  name: 'icon',
                  type: 'upload',
                  relationTo: 'media',
                },
              ],
            },
            {
              name: 'pricing',
              type: 'array',
              localized: true,
              fields: [
                {
                  name: 'planName',
                  type: 'text',
                  localized: true,
                  required: true,
                },
                {
                  name: 'price',
                  type: 'number',
                  required: true,
                },
                {
                  name: 'currency',
                  type: 'text',
                  defaultValue: 'COP',
                },
                {
                  name: 'period',
                  type: 'text',
                  defaultValue: '/mes',
                },
                {
                  name: 'features',
                  type: 'array',
                  localized: true,
                  fields: [
                    {
                      name: 'feature',
                      type: 'text',
                      localized: true,
                    },
                  ],
                },
                {
                  name: 'highlighted',
                  type: 'checkbox',
                  defaultValue: false,
                },
                {
                  name: 'ctaLabel',
                  type: 'text',
                  localized: true,
                },
              ],
            },
            {
              name: 'faq',
              type: 'array',
              localized: true,
              fields: [
                {
                  name: 'question',
                  type: 'text',
                  localized: true,
                  required: true,
                },
                {
                  name: 'answer',
                  type: 'richText',
                  localized: true,
                  required: true,
                },
              ],
            },
            {
              name: 'gallery',
              type: 'array',
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                },
                {
                  name: 'alt',
                  type: 'text',
                },
              ],
            },
            {
              name: 'layout',
              type: 'blocks',
              localized: true,
              blocks: [
                CallToAction,
                Content,
                FAQ,
                Gallery,
                Pricing,
                Cards,
                MediaContent,
              ],
            },
          ],
        },
        seoTab,
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [populatePublishedAt],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/collections/Services/index.ts
git commit -m "feat: add Services collection with parent/child hierarchy and structured fields"
```

---

### Task 2: Backend — Register collection, update plugins and link field

**Files:**
- Modify: `backend/src/payload.config.ts:11,63`
- Modify: `backend/src/plugins/index.ts:7,11,15,23,49`
- Modify: `backend/src/fields/link.ts:78`

**Interfaces:**
- Consumes: `Services` collection from Task 1
- Produces: Registered collection in Payload config, SEO URL for services, link support for services

- [ ] **Step 1: Update `payload.config.ts`**

Add import after Projects import:
```ts
import { Services } from './collections/Services'
```

Change line 63 from:
```ts
collections: [Pages, Posts, Projects, Media, Categories, Users],
```
to:
```ts
collections: [Pages, Posts, Projects, Services, Media, Categories, Users],
```

- [ ] **Step 2: Update `plugins/index.ts`**

Change line 7 type import:
```ts
import type { Page, Post, Project, Service } from '@/payload-types'
```

Change line 11 generateTitle:
```ts
const generateTitle: GenerateTitle<Post | Page | Project | Service> = ({ doc }) => {
```

Change line 15 generateURL:
```ts
const generateURL: GenerateURL<Post | Page | Project | Service> = ({ doc, collection }) => {
  const url = getFrontendURL()
  if (collection === 'services') return doc?.slug ? `${url}/services/${doc.slug}` : url
  return doc?.slug ? `${url}/${doc.slug}` : url
}
```

Change line 23 redirectsPlugin collections:
```ts
collections: ['pages', 'posts'],
```
(No change needed — redirects only for pages/posts)

Change line 23 seoPlugin (after nestedDocsPlugin):
(No change needed — seoPlugin applies to all collections with meta tab automatically)

- [ ] **Step 3: Update `fields/link.ts`**

Change line 78 from:
```ts
relationTo: ['pages', 'posts'],
```
to:
```ts
relationTo: ['pages', 'posts', 'services'],
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/payload.config.ts backend/src/plugins/index.ts backend/src/fields/link.ts
git commit -m "feat: register Services collection, update SEO URLs and link relations"
```

---

### Task 3: Backend — Regenerate payload-types and create migration

**Files:**
- Modify: `backend/src/payload-types.ts` (regenerated)
- Create: `backend/src/migrations/*.ts` (auto-generated)

- [ ] **Step 1: Regenerate types and create migration**

```bash
cd backend && pnpm payload generate:types && pnpm payload migrate:create
```

Expected: `payload-types.ts` updated with `Service` type. Migration file created in `migrations/`.

- [ ] **Step 2: Run migration**

```bash
cd backend && pnpm payload migrate
```

Expected: Migration applied successfully, `services` table created in PostgreSQL.

- [ ] **Step 3: Commit**

```bash
git add backend/src/payload-types.ts backend/src/migrations/
git commit -m "feat: regenerate payload-types and create services migration"
```

---

### Task 4: Backend — Update seed script with services

**Files:**
- Modify: `backend/src/scripts/seed.ts`

**Interfaces:**
- Consumes: `Services` collection now registered
- Produces: Seeded service data (5 categories + 14 sub-services es/en)

- [ ] **Step 1: Add `'services'` to collections and `'redirects'` to clearing list**

Change line 21-29 to add `'services'`:
```ts
const collections: CollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'posts',
  'projects',
  'services',
  'redirects',
  'users',
]
```

- [ ] **Step 2: Add services seed block before "Seeding globals" section**

Insert after the projects seed loop (before line 367 `payload.logger.info('- Seeding globals...')`):

```ts
  payload.logger.info(`- Seeding services...`)

  // Categories (parent=null) created first so sub-services can reference them
  type ServiceSeed = {
    slug: string
    es: { title: string; shortDescription: string }
    en: { title: string; shortDescription: string }
    features?: { es: { title: string; description: string }[]; en: { title: string; description: string }[] }
    children: {
      slug: string
      es: { title: string; shortDescription: string }
      en: { title: string; shortDescription: string }
      features?: { es: { title: string; description: string }[]; en: { title: string; description: string }[] }
    }[]
  }

  const serviceCategories: ServiceSeed[] = [
    {
      slug: 'viptel-pbx',
      es: { title: 'Viptel-PBX', shortDescription: 'Centrales telefónicas virtuales para empresas. Comunicación unificada sin hardware costoso.' },
      en: { title: 'Viptel-PBX', shortDescription: 'Virtual phone systems for businesses. Unified communication without expensive hardware.' },
      children: [
        { slug: 'basica', es: { title: 'PBX Básica', shortDescription: 'Hasta 10 extensiones. Ideal para pequeñas empresas y startups.' }, en: { title: 'Basic PBX', shortDescription: 'Up to 10 extensions. Ideal for small businesses and startups.' } },
        { slug: 'avanzada', es: { title: 'PBX Avanzada', shortDescription: 'Extensiones ilimitadas, IVR, grabación de llamadas y reportes.' }, en: { title: 'Advanced PBX', shortDescription: 'Unlimited extensions, IVR, call recording and reports.' } },
      ],
    },
    {
      slug: 'viptel-voip',
      es: { title: 'Viptel-VoIP', shortDescription: 'Telefonía IP de alta calidad. Minutos a todo destino y números DID locales e internacionales.' },
      en: { title: 'Viptel-VoIP', shortDescription: 'High-quality IP telephony. Minutes to all destinations and local/international DID numbers.' },
      children: [
        { slug: 'minutos', es: { title: 'Minutos VoIP', shortDescription: 'Terminación de llamadas nacionales e internacionales con la mejor tarifa.' }, en: { title: 'VoIP Minutes', shortDescription: 'National and international call termination at the best rate.' } },
        { slug: 'did', es: { title: 'Números DID', shortDescription: 'Números virtuales locales en Colombia y más de 50 países.' }, en: { title: 'DID Numbers', shortDescription: 'Local virtual numbers in Colombia and 50+ countries.' } },
      ],
    },
    {
      slug: 'viptel-web',
      es: { title: 'Viptel-Web', shortDescription: 'Desarrollo web profesional. Desde sitios informativos hasta tiendas en línea avanzadas.' },
      en: { title: 'Viptel-Web', shortDescription: 'Professional web development. From informational sites to advanced online stores.' },
      children: [
        { slug: 'sitio-informativo', es: { title: 'Sitio Informativo', shortDescription: 'Página web de una sola página con información de tu negocio y formulario de contacto.' }, en: { title: 'Informational Site', shortDescription: 'Single-page website with your business info and contact form.' } },
        { slug: 'sitio-corporativo', es: { title: 'Sitio Corporativo', shortDescription: 'Sitio web multi-página con blog, portafolio y diseño personalizado.' }, en: { title: 'Corporate Site', shortDescription: 'Multi-page website with blog, portfolio and custom design.' } },
        { slug: 'tienda-basica', es: { title: 'Tienda Básica', shortDescription: 'E-commerce con hasta 50 productos, pasarela de pagos y panel de administración.' }, en: { title: 'Basic Store', shortDescription: 'E-commerce with up to 50 products, payment gateway and admin panel.' } },
        { slug: 'tienda-avanzada', es: { title: 'Tienda Avanzada', shortDescription: 'E-commerce escalable con productos ilimitados, multi-idioma y funcionalidades avanzadas.' }, en: { title: 'Advanced Store', shortDescription: 'Scalable e-commerce with unlimited products, multi-language and advanced features.' } },
      ],
    },
    {
      slug: 'viptel-marketing',
      es: { title: 'Viptel-Marketing', shortDescription: 'Marketing digital multicanal. Email, WhatsApp, SMS y audio masivo para llegar a tu audiencia.' },
      en: { title: 'Viptel-Marketing', shortDescription: 'Multi-channel digital marketing. Email, WhatsApp, SMS and bulk audio to reach your audience.' },
      children: [
        { slug: 'email-masivo', es: { title: 'Email Masivo', shortDescription: 'Campañas de email marketing con segmentación, automatización y analítica.' }, en: { title: 'Bulk Email', shortDescription: 'Email marketing campaigns with segmentation, automation and analytics.' } },
        { slug: 'whatsapp-masivo', es: { title: 'WhatsApp Masivo', shortDescription: 'Mensajería masiva por WhatsApp Business API con plantillas aprobadas.' }, en: { title: 'Bulk WhatsApp', shortDescription: 'Bulk messaging via WhatsApp Business API with approved templates.' } },
        { slug: 'sms-masivo', es: { title: 'SMS Masivo', shortDescription: 'Envío de SMS transaccionales y promocionales a nivel nacional.' }, en: { title: 'Bulk SMS', shortDescription: 'Transactional and promotional SMS delivery nationwide.' } },
        { slug: 'audio-masivo', es: { title: 'Audio Masivo', shortDescription: 'Campañas de audio masivo con IVR para notificaciones y marketing telefónico.' }, en: { title: 'Bulk Audio', shortDescription: 'Bulk audio campaigns with IVR for notifications and phone marketing.' } },
      ],
    },
    {
      slug: 'viptel-software',
      es: { title: 'Viptel-Software', shortDescription: 'Software empresarial a la medida. Soluciones ERP y CRM adaptadas a tu negocio.' },
      en: { title: 'Viptel-Software', shortDescription: 'Custom enterprise software. ERP and CRM solutions tailored to your business.' },
      children: [
        { slug: 'erp', es: { title: 'ERP', shortDescription: 'Sistema de planificación de recursos empresariales. Facturación, inventario, contabilidad y más.' }, en: { title: 'ERP', shortDescription: 'Enterprise resource planning system. Invoicing, inventory, accounting and more.' } },
        { slug: 'crm', es: { title: 'CRM', shortDescription: 'Gestión de relaciones con clientes. Seguimiento de oportunidades, pipeline y automatización.' }, en: { title: 'CRM', shortDescription: 'Customer relationship management. Opportunity tracking, pipeline and automation.' } },
      ],
    },
  ]

  for (const cat of serviceCategories) {
    const parentDoc = await payload.create({
      collection: 'services',
      locale: 'es',
      depth: 0,
      data: {
        title: cat.es.title,
        slug: cat.slug,
        shortDescription: cat.es.shortDescription,
        _status: 'published',
      },
    })
    await payload.update({
      collection: 'services',
      id: parentDoc.id,
      locale: 'en',
      data: {
        title: cat.en.title,
        shortDescription: cat.en.shortDescription,
      },
    })

    for (const child of cat.children) {
      const childDoc = await payload.create({
        collection: 'services',
        locale: 'es',
        depth: 0,
        data: {
          title: child.es.title,
          slug: child.slug,
          shortDescription: child.es.shortDescription,
          parent: parentDoc.id,
          _status: 'published',
        },
      })
      await payload.update({
        collection: 'services',
        id: childDoc.id,
        locale: 'en',
        data: {
          title: child.en.title,
          shortDescription: child.en.shortDescription,
        },
      })
    }
  }
```

- [ ] **Step 2: Run seed to verify**

```bash
cd backend && pnpm seed
```

Expected: Seeds successfully, logs service data created.

- [ ] **Step 3: Commit**

```bash
git add backend/src/scripts/seed.ts
git commit -m "feat: seed services with 5 categories and 14 sub-services"
```

---

### Task 5: Website — Copy payload-types

**Files:**
- Copy: `backend/src/payload-types.ts` → `website/src/lib/payload-types.ts`

**Interfaces:**
- Consumes: Regenerated payload-types from Task 3
- Produces: Updated types in website with `Service` interface

- [ ] **Step 1: Copy the file**

```bash
cp backend/src/payload-types.ts website/src/lib/payload-types.ts
```

- [ ] **Step 2: Commit**

```bash
git add website/src/lib/payload-types.ts
git commit -m "feat: update website payload-types with Service interface"
```

---

### Task 6: Website — Service data functions in payload.ts

**Files:**
- Modify: `website/src/lib/payload.ts`

**Interfaces:**
- Consumes: `Service` type from payload-types (Task 5)
- Produces: `getServiceCategories`, `getServicesByParent`, `getServiceBySlug`, `getAllServices`

- [ ] **Step 1: Add Service import and functions**

Add import:
```ts
import type { Page, Post, Project, Redirect, Service } from './payload-types'
```

Add after the `// ── Projects ──` section (before `// ── Redirects ──`):

```ts
// ── Services ───────────────────────────────────────────

export async function getServiceCategories(
  locale = defaultLocale,
): Promise<Service[]> {
  const data = await fetchAPI<DocsResponse<Service>>(
    `services?where[parent][exists]=false&where[_status][equals]=published`,
    { locale },
  )
  return data.docs ?? []
}

export async function getServicesByParent(
  parentId: string,
  locale = defaultLocale,
): Promise<Service[]> {
  const data = await fetchAPI<DocsResponse<Service>>(
    `services?where[parent][equals]=${encodeURIComponent(parentId)}&where[_status][equals]=published`,
    { locale },
  )
  return data.docs ?? []
}

export async function getServiceBySlug(
  slug: string,
  locale = defaultLocale,
  draft = false,
): Promise<Service | null> {
  const data = await fetchAPI<DocsResponse<Service>>(
    `services?where[slug][equals]=${encodeURIComponent(slug)}`,
    { locale, draft },
  )
  return data.docs?.[0] ?? null
}

export async function getAllServices(
  locale = defaultLocale,
): Promise<Service[]> {
  const data = await fetchAPI<DocsResponse<Service>>(
    `services?limit=100&where[_status][equals]=published`,
    { locale },
  )
  return data.docs ?? []
}
```

Update the export line:
```ts
export type { DocsResponse, Page, Post, Project, Service }
```

- [ ] **Step 2: Commit**

```bash
git add website/src/lib/payload.ts
git commit -m "feat: add service data functions (categories, by-parent, by-slug, all)"
```

---

### Task 7: Website — ServiceCard component

**Files:**
- Create: `website/src/components/services/ServiceCard.astro`

**Interfaces:**
- Consumes: `Service` type (title, slug, shortDescription, icon)
- Produces: Card component with icon, title, description, link

- [ ] **Step 1: Create ServiceCard.astro**

```astro
---
import type { Service } from '@/lib/payload-types'
import Icon from '@/components/ui/primitives/Icon/Icon.astro'
import { cn } from '@/lib/cn'

interface Props {
  service: Service
  href: string
  class?: string
}

const { service, href, class: className } = Astro.props
---

<a
  href={href}
  class={cn(
    'group flex flex-col gap-3 rounded-xl border border-border bg-background p-6 transition-all',
    'hover:border-brand-500 hover:shadow-md',
    className,
  )}
>
  <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
    <Icon name={service.icon ? 'image' : 'sparkles'} size="md" />
  </div>
  <div class="flex flex-col gap-1">
    <h3 class="text-base font-semibold text-foreground group-hover:text-brand-600 transition-colors">
      {service.title}
    </h3>
    {service.shortDescription && (
      <p class="text-sm text-foreground-muted line-clamp-2">
        {service.shortDescription}
      </p>
    )}
  </div>
</a>
```

- [ ] **Step 2: Commit**

```bash
git add website/src/components/services/ServiceCard.astro
git commit -m "feat: add ServiceCard component"
```

---

### Task 8: Website — ServiceGrid component

**Files:**
- Create: `website/src/components/services/ServiceGrid.astro`

**Interfaces:**
- Consumes: `ServiceCard`, `Service` type array
- Produces: Responsive grid of service cards (2-3 columns)

- [ ] **Step 1: Create ServiceGrid.astro**

```astro
---
import type { Service } from '@/lib/payload-types'
import ServiceCard from './ServiceCard.astro'
import { localizedPath } from '@/i18n'
import { cn } from '@/lib/cn'

interface Props {
  services: Service[]
  /** Base href prefix, e.g. "/services" or "/en/services" */
  hrefPrefix?: string
  class?: string
}

const { services, hrefPrefix = '/services', class: className } = Astro.props
---

<div class={cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}>
  {services.map((service) => (
    <ServiceCard
      service={service}
      href={`${hrefPrefix}/${service.slug}`}
    />
  ))}
</div>
```

- [ ] **Step 2: Commit**

```bash
git add website/src/components/services/ServiceGrid.astro
git commit -m "feat: add ServiceGrid component"
```

---

### Task 9: Website — ServiceFeatures component

**Files:**
- Create: `website/src/components/services/ServiceFeatures.astro`

**Interfaces:**
- Consumes: `features` array from `Service` (title, description, icon)
- Produces: List of feature items with icon + title + description

- [ ] **Step 1: Create ServiceFeatures.astro**

```astro
---
import Icon from '@/components/ui/primitives/Icon/Icon.astro'
import { t } from '@/i18n'
import { cn } from '@/lib/cn'

interface Feature {
  id?: string | null
  title: string
  description?: string | null
  icon?: string | { url?: string | null } | null
}

interface Props {
  features: Feature[]
  locale?: string
  class?: string
}

const { features, locale = 'es', class: className } = Astro.props
---

<section class={cn('py-16', className)}>
  <div class="mx-auto max-w-6xl px-4">
    <h2 class="mb-10 text-center text-2xl font-bold text-foreground">
      {t('services.detail.features', locale)}
    </h2>
    <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature, idx) => (
        <div class="flex flex-col items-center gap-3 rounded-xl border border-border bg-background p-6 text-center">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            <Icon name="check-circle" size="md" />
          </div>
          <h3 class="text-base font-semibold text-foreground">{feature.title}</h3>
          {feature.description && (
            <p class="text-sm text-foreground-muted">{feature.description}</p>
          )}
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add website/src/components/services/ServiceFeatures.astro
git commit -m "feat: add ServiceFeatures component"
```

---

### Task 10: Website — ServicePricing component

**Files:**
- Create: `website/src/components/services/ServicePricing.astro`

**Interfaces:**
- Consumes: `pricing` array from `Service` (planName, price, currency, period, features, highlighted, ctaLabel)
- Produces: Pricing table/cards with highlighted recommended plan

- [ ] **Step 1: Create ServicePricing.astro**

```astro
---
import Button from '@/components/ui/form/Button/Button.astro'
import Icon from '@/components/ui/primitives/Icon/Icon.astro'
import { t } from '@/i18n'
import { cn } from '@/lib/cn'

interface PriceFeature {
  id?: string | null
  feature: string
}

interface PricePlan {
  id?: string | null
  planName: string
  price: number
  currency?: string | null
  period?: string | null
  features?: PriceFeature[] | null
  highlighted?: boolean | null
  ctaLabel?: string | null
}

interface Props {
  plans: PricePlan[]
  locale?: string
  class?: string
}

const { plans, locale = 'es', class: className } = Astro.props
---

<section class={cn('py-16', className)}>
  <div class="mx-auto max-w-6xl px-4">
    <h2 class="mb-10 text-center text-2xl font-bold text-foreground">
      {t('services.detail.pricing', locale)}
    </h2>
    <div class="grid gap-6 lg:grid-cols-3">
      {plans.map((plan) => (
        <div
          class={cn(
            'flex flex-col rounded-xl border p-6',
            plan.highlighted
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 ring-2 ring-brand-500'
              : 'border-border bg-background',
          )}
        >
          {plan.highlighted && (
            <span class="mb-3 self-start rounded-full bg-brand-600 px-3 py-1 text-xs font-medium text-white">
              {t('services.pricing.highlighted', locale)}
            </span>
          )}
          <h3 class="text-lg font-semibold text-foreground">{plan.planName}</h3>
          <div class="mt-4 flex items-baseline gap-1">
            <span class="text-3xl font-bold text-foreground">
              {plan.currency || '$'}{plan.price.toLocaleString()}
            </span>
            <span class="text-sm text-foreground-muted">{plan.period || t('services.pricing.period', locale)}</span>
          </div>
          {plan.features && plan.features.length > 0 && (
            <ul class="mt-6 flex flex-col gap-2">
              {plan.features.map((f) => (
                <li class="flex items-center gap-2 text-sm text-foreground-muted">
                  <Icon name="check" size="sm" class="text-brand-600 shrink-0" />
                  {f.feature}
                </li>
              ))}
            </ul>
          )}
          <div class="mt-auto pt-6">
            <Button
              fullWidth
              variant={plan.highlighted ? 'default' : 'outline'}
              href="/contact"
            >
              {plan.ctaLabel || t('services.pricing.cta', locale)}
            </Button>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add website/src/components/services/ServicePricing.astro
git commit -m "feat: add ServicePricing component"
```

---

### Task 11: Website — ServiceFAQ component

**Files:**
- Create: `website/src/components/services/ServiceFAQ.astro`

**Interfaces:**
- Consumes: `faq` array from `Service` (question, answer richText)
- Produces: Accordion FAQ section

- [ ] **Step 1: Create ServiceFAQ.astro**

```astro
---
import { t } from '@/i18n'
import { cn } from '@/lib/cn'

interface FaqItem {
  id?: string | null
  question: string
  answer?: any
}

interface Props {
  faq: FaqItem[]
  locale?: string
  class?: string
}

const { faq, locale = 'es', class: className } = Astro.props

function extractPlainText(richText: any): string {
  try {
    const root = richText?.root
    if (!root || !Array.isArray(root.children)) return ''
    return root.children
      .filter((c: any) => c.type === 'paragraph' || c.type === 'heading')
      .map((c: any) => c.children?.map((t: any) => t.text || '').join('') || '')
      .join(' ')
  } catch {
    return ''
  }
}
---

<section class={cn('py-16', className)}>
  <div class="mx-auto max-w-3xl px-4">
    <h2 class="mb-10 text-center text-2xl font-bold text-foreground">
      {t('services.detail.faq', locale)}
    </h2>
    <div class="flex flex-col gap-3">
      {faq.map((item) => (
        <details class="group rounded-xl border border-border bg-background">
          <summary class="flex cursor-pointer items-center justify-between p-5 text-base font-medium text-foreground marker:hidden">
            {item.question}
            <span class="shrink-0 text-foreground-muted transition-transform group-open:rotate-180">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </span>
          </summary>
          <div class="px-5 pb-5 text-sm text-foreground-muted leading-relaxed">
            {extractPlainText(item.answer) || '—'}
          </div>
        </details>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add website/src/components/services/ServiceFAQ.astro
git commit -m "feat: add ServiceFAQ accordion component"
```

---

### Task 12: Website — ServiceGallery component

**Files:**
- Create: `website/src/components/services/ServiceGallery.astro`

**Interfaces:**
- Consumes: `gallery` array from `Service` (image, alt)
- Produces: Responsive image gallery grid

- [ ] **Step 1: Create ServiceGallery.astro**

```astro
---
import { Image } from 'astro:assets'
import { t } from '@/i18n'
import { cn } from '@/lib/cn'

interface GalleryImage {
  id?: string | null
  image?: string | { url?: string | null; alt?: string | null } | null
  alt?: string | null
}

interface Props {
  gallery: GalleryImage[]
  locale?: string
  class?: string
}

const { gallery, locale = 'es', class: className } = Astro.props

function getImageUrl(img: GalleryImage): string | null {
  if (typeof img.image === 'object' && img.image && 'url' in img.image && img.image.url) {
    return img.image.url as string
  }
  return null
}

function getImageAlt(img: GalleryImage): string {
  return img.alt || (typeof img.image === 'object' && img.image && 'alt' in img.image ? (img.image.alt as string) || '' : '')
}

const validImages = gallery.filter((img) => getImageUrl(img) !== null)
---

{validImages.length > 0 && (
  <section class={cn('py-16', className)}>
    <div class="mx-auto max-w-6xl px-4">
      <h2 class="mb-10 text-center text-2xl font-bold text-foreground">
        {t('services.detail.gallery', locale)}
      </h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {validImages.map((img) => {
          const url = getImageUrl(img)!
          const alt = getImageAlt(img)
          return (
            <div class="overflow-hidden rounded-xl border border-border bg-secondary">
              <img
                src={url}
                alt={alt}
                class="h-56 w-full object-cover transition-transform hover:scale-105"
                loading="lazy"
              />
            </div>
          )
        })}
      </div>
    </div>
  </section>
)}
```

- [ ] **Step 2: Commit**

```bash
git add website/src/components/services/ServiceGallery.astro
git commit -m "feat: add ServiceGallery component"
```

---

### Task 13: Website — ServiceBreadcrumb component

**Files:**
- Create: `website/src/components/services/ServiceBreadcrumb.astro`

**Interfaces:**
- Consumes: locale, parentService (optional), currentTitle
- Produces: Breadcrumb trail (Home > Servicios > [Category] > Service)

- [ ] **Step 1: Create ServiceBreadcrumb.astro**

```astro
---
import { t, localizedPath } from '@/i18n'
import { cn } from '@/lib/cn'

interface Props {
  locale?: string
  parentTitle?: string | null
  parentSlug?: string | null
  currentTitle: string
  class?: string
}

const { locale = 'es', parentTitle, parentSlug, currentTitle, class: className } = Astro.props

const servicesPath = localizedPath('/services', locale)
---

<nav class={cn('flex items-center gap-1 text-sm text-foreground-muted', className)} aria-label="Breadcrumb">
  <a href={localizedPath('/', locale)} class="transition-colors hover:text-foreground">
    {t('services.breadcrumb.home', locale)}
  </a>
  <span class="select-none">/</span>
  <a href={servicesPath} class="transition-colors hover:text-foreground">
    {t('services.breadcrumb.services', locale)}
  </a>
  {parentTitle && parentSlug && (
    <>
      <span class="select-none">/</span>
      <a href={`${servicesPath}/${parentSlug}`} class="transition-colors hover:text-foreground">
        {parentTitle}
      </a>
    </>
  )}
  <span class="select-none">/</span>
  <span class="text-foreground font-medium">{currentTitle}</span>
</nav>
```

- [ ] **Step 2: Commit**

```bash
git add website/src/components/services/ServiceBreadcrumb.astro
git commit -m "feat: add ServiceBreadcrumb component"
```

---

### Task 14: Website — ServiceDetailLayout component

**Files:**
- Create: `website/src/components/services/ServiceDetailLayout.astro`

**Interfaces:**
- Consumes: ServiceBreadcrumb, ServiceFeatures, ServicePricing, ServiceFAQ, ServiceGallery, ServiceGrid, BlockRenderer
- Produces: Wrapper layout that composes all service detail sections in order

- [ ] **Step 1: Create ServiceDetailLayout.astro**

```astro
---
/**
 * ServiceDetailLayout — renders a service category or sub-service page.
 * Composes breadcrumb, hero, features, pricing, FAQ, gallery, layout blocks,
 * and child services grid in a consistent order.
 */
import PageLayout from '@/layouts/PageLayout.astro'
import BlockRenderer from '@/components/blocks/BlockRenderer.astro'
import Button from '@/components/ui/form/Button/Button.astro'
import ServiceBreadcrumb from './ServiceBreadcrumb.astro'
import ServiceFeatures from './ServiceFeatures.astro'
import ServicePricing from './ServicePricing.astro'
import ServiceFAQ from './ServiceFAQ.astro'
import ServiceGallery from './ServiceGallery.astro'
import ServiceGrid from './ServiceGrid.astro'
import { t, localizedPath } from '@/i18n'
import { cn } from '@/lib/cn'
import type { Service, PageBlock } from '@/lib/payload-types'

interface Props {
  service: Service
  parentService?: Service | null
  childrenServices?: Service[]
  hrefPrefix?: string
  locale?: string
}

const { service, parentService, childrenServices = [], hrefPrefix = '/services', locale = 'es' } = Astro.props
const title = service.meta?.title || service.title
const description = service.meta?.description || service.shortDescription || service.title
---

<PageLayout title={title} description={description}>
  <section class="pb-12 pt-28">
    <div class="mx-auto max-w-6xl px-4">
      <ServiceBreadcrumb
        locale={locale}
        parentTitle={parentService?.title ?? null}
        parentSlug={parentService?.slug ?? null}
        currentTitle={service.title}
        class="mb-8"
      />

      <div class="mx-auto max-w-3xl text-center">
        <h1 class="text-3xl font-bold text-foreground sm:text-4xl">{service.title}</h1>
        {service.shortDescription && (
          <p class="mt-4 text-lg text-foreground-muted">{service.shortDescription}</p>
        )}
      </div>
    </div>
  </section>

  {service.features && service.features.length > 0 && (
    <ServiceFeatures features={service.features} locale={locale} />
  )}

  {service.pricing && service.pricing.length > 0 && (
    <ServicePricing plans={service.pricing} locale={locale} />
  )}

  {service.faq && service.faq.length > 0 && (
    <ServiceFAQ faq={service.faq} locale={locale} />
  )}

  {service.gallery && service.gallery.length > 0 && (
    <ServiceGallery gallery={service.gallery} locale={locale} />
  )}

  {service.layout && service.layout.length > 0 && (
    <BlockRenderer layout={service.layout as PageBlock[]} locale={locale} />
  )}

  {childrenServices.length > 0 && (
    <section class="py-16">
      <div class="mx-auto max-w-6xl px-4">
        <h2 class="mb-10 text-center text-2xl font-bold text-foreground">
          {t('services.detail.subServices', locale)}
        </h2>
        <ServiceGrid services={childrenServices} hrefPrefix={hrefPrefix} />
      </div>
    </section>
  )}

  <section class="bg-background-secondary py-16">
    <div class="mx-auto max-w-2xl px-4 text-center">
      <h2 class="text-2xl font-bold text-foreground">{t('services.overview.cta.title', locale)}</h2>
      <p class="mt-3 text-foreground-muted">{t('services.overview.cta.description', locale)}</p>
      <div class="mt-6">
        <Button href={localizedPath('/contact', locale)} size="lg">
          {t('services.detail.cta', locale)}
        </Button>
      </div>
    </div>
  </section>
</PageLayout>
```

- [ ] **Step 2: Commit**

```bash
git add website/src/components/services/ServiceDetailLayout.astro
git commit -m "feat: add ServiceDetailLayout component"
```

---

### Task 15: Website — ServicesOverviewView

**Files:**
- Create: `website/src/components/pages/views/ServicesOverviewView.astro`

**Interfaces:**
- Consumes: `ServiceDetailLayout`, `getServiceCategories`, `getServicesByParent`
- Produces: Overview page showing all categories with their sub-services

- [ ] **Step 1: Create ServicesOverviewView.astro**

```astro
---
/**
 * ServicesOverviewView — the /services listing page.
 * Shows all service categories with their sub-services as cards.
 */
import PageLayout from '@/layouts/PageLayout.astro'
import Button from '@/components/ui/form/Button/Button.astro'
import Badge from '@/components/ui/data-display/Badge/Badge.astro'
import ServiceCard from '@/components/services/ServiceCard.astro'
import { t, localizedPath } from '@/i18n'
import { cn } from '@/lib/cn'
import type { Service } from '@/lib/payload-types'

interface Props {
  categories: Service[]
  childrenMap: Record<string, Service[]>
  hrefPrefix?: string
  locale?: string
}

const { categories, childrenMap, hrefPrefix = '/services', locale = 'es' } = Astro.props
---

<PageLayout
  title={t('services.overview.hero.title', locale)}
  description={t('services.overview.hero.description', locale)}
>
  <section class="pb-12 pt-28">
    <div class="mx-auto max-w-4xl px-4 text-center">
      <Badge>{t('services.overview.hero.badge', locale)}</Badge>
      <h1 class="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
        {t('services.overview.hero.title', locale)}
      </h1>
      <p class="mt-4 text-lg text-foreground-muted">
        {t('services.overview.hero.description', locale)}
      </p>
    </div>
  </section>

  <section class="py-16">
    <div class="mx-auto max-w-6xl px-4">
      <div class="flex flex-col gap-16">
        {categories.map((category) => {
          const subs = childrenMap[category.id] || []
          return (
            <div>
              <div class="mb-6 flex items-center gap-4">
                <h2 class="text-xl font-bold text-foreground">{category.title}</h2>
                <span class="text-sm text-foreground-muted">({subs.length} {locale === 'es' ? 'servicios' : 'services'})</span>
              </div>
              {category.shortDescription && (
                <p class="mb-6 text-foreground-muted">{category.shortDescription}</p>
              )}
              <div class="grid gap-4 sm:grid-cols-2">
                {subs.map((sub) => (
                  <ServiceCard
                    service={sub}
                    href={`${hrefPrefix}/${category.slug}${sub.slug ? '/' + sub.slug : ''}`}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  </section>

  <section class="bg-background-secondary py-16">
    <div class="mx-auto max-w-2xl px-4 text-center">
      <h2 class="text-2xl font-bold text-foreground">{t('services.overview.cta.title', locale)}</h2>
      <p class="mt-3 text-foreground-muted">{t('services.overview.cta.description', locale)}</p>
      <div class="mt-6">
        <Button href={localizedPath('/contact', locale)} size="lg">
          {t('services.overview.cta.button', locale)}
        </Button>
      </div>
    </div>
  </section>
</PageLayout>
```

- [ ] **Step 2: Commit**

```bash
git add website/src/components/pages/views/ServicesOverviewView.astro
git commit -m "feat: add ServicesOverviewView"
```

---

### Task 16: Website — ServiceView

**Files:**
- Create: `website/src/components/pages/views/ServiceView.astro`

**Interfaces:**
- Consumes: `ServiceDetailLayout`, `Service` type
- Produces: Renders category detail or sub-service detail depending on `parent`

- [ ] **Step 1: Create ServiceView.astro**

```astro
---
/**
 * ServiceView — routes to the correct detail layout.
 * If the service is a category (parent=null), shows its children.
 * If it's a sub-service (has parent), shows full detail with breadcrumb.
 */
import ServiceDetailLayout from '@/components/services/ServiceDetailLayout.astro'
import type { Service } from '@/lib/payload-types'

interface Props {
  service: Service
  parentService?: Service | null
  childrenServices?: Service[]
  hrefPrefix?: string
  locale?: string
}

const { service, parentService, childrenServices = [], hrefPrefix = '/services', locale = 'es' } = Astro.props
---

<ServiceDetailLayout
  service={service}
  parentService={parentService}
  childrenServices={childrenServices}
  hrefPrefix={hrefPrefix}
  locale={locale}
/>
```

- [ ] **Step 2: Commit**

```bash
git add website/src/components/pages/views/ServiceView.astro
git commit -m "feat: add ServiceView"
```

---

### Task 17: Website — Routes

**Files:**
- Rename: `website/src/pages/services.astro` → `website/src/pages/services.astro.bak`
- Rename: `website/src/pages/[locale]/services.astro` → `website/src/pages/[locale]/services.astro.bak`
- Create: `website/src/pages/services.astro` (new)
- Create: `website/src/pages/[locale]/services.astro` (new)
- Create: `website/src/pages/services/[...slug].astro`
- Create: `website/src/pages/[locale]/services/[...slug].astro`

**Interfaces:**
- Consumes: `getServiceCategories`, `getServicesByParent`, `getServiceBySlug` from payload.ts, `ServicesOverviewView`, `ServiceView`
- Produces: Working URLs `/services`, `/services/viptel-pbx`, `/services/viptel-pbx/basica`

- [ ] **Step 1: Rename old files**

```bash
mv website/src/pages/services.astro website/src/pages/services.astro.bak
mv "website/src/pages/[locale]/services.astro" "website/src/pages/[locale]/services.astro.bak"
```

- [ ] **Step 2: Create new `website/src/pages/services.astro` (default locale overview)**

```astro
---
import ServicesOverviewView from '@/components/pages/views/ServicesOverviewView.astro'
import { getServiceCategories, getServicesByParent } from '@/lib/payload'
import { defaultLocale } from '@/i18n'

const locale = defaultLocale
const categories = await getServiceCategories(locale)
const childrenMap: Record<string, any[]> = {}
for (const cat of categories) {
  childrenMap[cat.id] = await getServicesByParent(cat.id, locale)
}
---

<ServicesOverviewView categories={categories} childrenMap={childrenMap} locale={locale} />
```

- [ ] **Step 3: Create new `website/src/pages/[locale]/services.astro`**

```astro
---
import ServicesOverviewView from '@/components/pages/views/ServicesOverviewView.astro'
import { getServiceCategories, getServicesByParent } from '@/lib/payload'
import { getSecondaryLocales } from '@/i18n'

export function getStaticPaths() {
  return getSecondaryLocales().map((locale) => ({ params: { locale } }))
}

const { locale } = Astro.params
const categories = await getServiceCategories(locale)
const childrenMap: Record<string, any[]> = {}
for (const cat of categories) {
  childrenMap[cat.id] = await getServicesByParent(cat.id, locale)
}
---

<ServicesOverviewView categories={categories} childrenMap={childrenMap} hrefPrefix={`/${locale}/services`} locale={locale} />
```

- [ ] **Step 4: Create `website/src/pages/services/[...slug].astro` (default locale detail)**

```astro
---
import ServiceView from '@/components/pages/views/ServiceView.astro'
import { getServiceBySlug, getServicesByParent } from '@/lib/payload'
import { defaultLocale } from '@/i18n'

export const prerender = false

const { slug } = Astro.params
if (!slug) return Astro.redirect('/404')

const locale = defaultLocale
const service = await getServiceBySlug(slug, locale)
if (!service) return Astro.redirect('/404')

let parentService = null
let childrenServices: any[] = []

// If this service has a parent, it's a sub-service
if (service.parent) {
  const parentSlug = typeof service.parent === 'object' && service.parent !== null
    ? (service.parent as any).slug
    : null
  if (parentSlug) {
    parentService = await getServiceBySlug(parentSlug, locale)
  }
} else {
  // It's a category — fetch its children
  childrenServices = await getServicesByParent(service.id, locale)
}
---

<ServiceView
  service={service}
  parentService={parentService}
  childrenServices={childrenServices}
  locale={locale}
/>
```

- [ ] **Step 5: Create `website/src/pages/[locale]/services/[...slug].astro` (secondary locale detail)**

```astro
---
import ServiceView from '@/components/pages/views/ServiceView.astro'
import { getServiceBySlug, getServicesByParent } from '@/lib/payload'
import { getSecondaryLocales } from '@/i18n'

export const prerender = false

export function getStaticPaths() {
  return getSecondaryLocales().map((locale) => ({ params: { locale } }))
}

const { slug, locale } = Astro.params as { slug: string; locale: string }
if (!slug) return Astro.redirect('/404')

const service = await getServiceBySlug(slug, locale)
if (!service) return Astro.redirect('/404')

let parentService = null
let childrenServices: any[] = []

if (service.parent) {
  const parentSlug = typeof service.parent === 'object' && service.parent !== null
    ? (service.parent as any).slug
    : null
  if (parentSlug) {
    parentService = await getServiceBySlug(parentSlug, locale)
  }
} else {
  childrenServices = await getServicesByParent(service.id, locale)
}
---

<ServiceView
  service={service}
  parentService={parentService}
  childrenServices={childrenServices}
  hrefPrefix={`/${locale}/services`}
  locale={locale}
/>
```

- [ ] **Step 6: Rename old ServicesView.astro**

```bash
mv website/src/components/pages/views/ServicesView.astro website/src/components/pages/views/ServicesView.astro.bak
```

- [ ] **Step 7: Commit**

```bash
git add website/src/pages/services.astro.bak "website/src/pages/[locale]/services.astro.bak" website/src/pages/services.astro "website/src/pages/[locale]/services.astro" "website/src/pages/services/[...slug].astro" "website/src/pages/[locale]/services/[...slug].astro" "website/src/components/pages/views/ServicesView.astro.bak"
git commit -m "feat: add services routes (overview + category + detail) and backup old files"
```

---

### Task 18: Website — nav.config.ts and i18n keys

**Files:**
- Modify: `website/src/config/nav.config.ts`
- Modify: `website/src/i18n/es.json`
- Modify: `website/src/i18n/en.json`

**Interfaces:**
- Consumes: New dropdown + Tienda structure
- Produces: Updated nav with services dropdown and Tienda link, i18n keys for all service UI text

- [ ] **Step 1: Update `nav.config.ts`**

Add `children?: NavItem[]` to `NavItem` interface (after `labelKey?`):
```ts
export interface NavItem {
  label: string;
  href: string;
  order: number;
  external?: boolean;
  labelKey?: string;
  children?: NavItem[];
  locales?: Record<string, NavItemOverride>;
}
```

Replace `navItems` array:
```ts
export const navItems: NavItem[] = [
  { label: 'Inicio', href: '/', order: 0, labelKey: 'nav.items.home' },
  {
    label: 'Servicios', href: '/services', order: 1, labelKey: 'nav.items.services',
    children: [
      { label: 'Viptel-PBX', href: '/services/viptel-pbx', order: 0 },
      { label: 'Viptel-VoIP', href: '/services/viptel-voip', order: 1 },
      { label: 'Viptel-Web', href: '/services/viptel-web', order: 2 },
      { label: 'Viptel-Marketing', href: '/services/viptel-marketing', order: 3 },
      { label: 'Viptel-Software', href: '/services/viptel-software', order: 4 },
    ],
  },
  { label: 'Portafolio', href: '/projects', order: 2, labelKey: 'nav.items.projects' },
  { label: 'Blog', href: '/blog', order: 3, labelKey: 'nav.items.blog' },
  { label: 'Nosotros', href: '/about', order: 4, labelKey: 'nav.items.about' },
  { label: 'Contacto', href: '/contact', order: 5, labelKey: 'nav.items.contact' },
  { label: 'Tienda', href: 'https://tienda.viptelcomunicaciones.com', external: true, order: 6, labelKey: 'nav.items.shop' },
];
```

Update `footerNavItems` to include Tienda:
```ts
export const footerNavItems: NavItem[] = [
  { label: 'Inicio', href: '/', order: 0, labelKey: 'nav.items.home' },
  { label: 'Servicios', href: '/services', order: 1, labelKey: 'nav.items.services' },
  { label: 'Portafolio', href: '/projects', order: 2, labelKey: 'nav.items.projects' },
  { label: 'Blog', href: '/blog', order: 3, labelKey: 'nav.items.blog' },
  { label: 'Nosotros', href: '/about', order: 4, labelKey: 'nav.items.about' },
  { label: 'Contacto', href: '/contact', order: 5, labelKey: 'nav.items.contact' },
  { label: 'Tienda', href: 'https://tienda.viptelcomunicaciones.com', external: true, order: 6, labelKey: 'nav.items.shop' },
];
```

- [ ] **Step 2: Update `es.json`**

Add to `nav.items`:
```json
"shop": "Tienda"
```

Add new `services` section at top level:
```json
"services": {
  "breadcrumb": {
    "home": "Inicio",
    "services": "Servicios"
  },
  "overview": {
    "hero": {
      "badge": "Servicios",
      "title": "Soluciones empresariales",
      "description": "Telecomunicaciones, desarrollo web, marketing digital y software a la medida para tu empresa."
    },
    "cta": {
      "title": "¿Listo para empezar?",
      "description": "Cuéntanos tu proyecto y te ayudamos a encontrar la solución ideal.",
      "button": "Contáctanos"
    }
  },
  "detail": {
    "features": "Características",
    "pricing": "Planes y precios",
    "faq": "Preguntas frecuentes",
    "gallery": "Galería",
    "cta": "Solicitar cotización",
    "subServices": "Servicios incluidos"
  },
  "pricing": {
    "currency": "COP",
    "period": "/mes",
    "highlighted": "Recomendado",
    "cta": "Contratar"
  }
}
```

- [ ] **Step 3: Update `en.json`**

Add to `nav.items`:
```json
"shop": "Shop"
```

Add new `services` section at top level:
```json
"services": {
  "breadcrumb": {
    "home": "Home",
    "services": "Services"
  },
  "overview": {
    "hero": {
      "badge": "Services",
      "title": "Enterprise solutions",
      "description": "Telecommunications, web development, digital marketing and custom software for your business."
    },
    "cta": {
      "title": "Ready to get started?",
      "description": "Tell us about your project and we'll help you find the ideal solution.",
      "button": "Contact us"
    }
  },
  "detail": {
    "features": "Features",
    "pricing": "Plans and pricing",
    "faq": "Frequently asked questions",
    "gallery": "Gallery",
    "cta": "Request a quote",
    "subServices": "Included services"
  },
  "pricing": {
    "currency": "USD",
    "period": "/month",
    "highlighted": "Recommended",
    "cta": "Get started"
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add website/src/config/nav.config.ts website/src/i18n/es.json website/src/i18n/en.json
git commit -m "feat: add services dropdown nav, shop link, and i18n keys"
```

---

### Task 19: Website — Header dropdown support

**Files:**
- Modify: `website/src/components/layout/Header.astro`

**Interfaces:**
- Consumes: `NavItem` with optional `children` and `external` fields
- Produces: Desktop dropdown for Services, external link icon for Tienda

- [ ] **Step 1: Update Header NavItem interface and getNavIcon**

Replace Header's internal `NavItem` interface (line 39-42):
```ts
export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  external?: boolean;
}
```

Add to `getNavIcon` function (after line 201):
```ts
  if (href.startsWith('/services')) return 'sparkles';
  if (href.startsWith('https'))        return 'arrow-up-right';
```

- [ ] **Step 2: Replace desktop nav loop (lines 260-282)**

Replace:
```astro
            {navItems.map(({ label, href }) => (
```
with:
```astro
            {navItems.map((item) => {
              const { label, href } = item
              if (item.children && item.children.length > 0) {
                return (
                  <div class="relative group">
                    <a
                      href={href.startsWith('#') && !isLandingPage ? `/${href}` : href}
                      class={cn(
                        'nav-link inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm',
                        'transition-all duration-(--transition-fast)',
                        isFloating && 'hdr-invert-text',
                        isFloating
                          ? (isActive(href)
                              ? 'hdr-nav-active font-semibold'
                              : 'font-medium')
                          : (isActive(href)
                              ? 'nav-link-active font-semibold text-foreground bg-secondary'
                              : 'nav-link-inactive font-medium text-foreground-muted hover:text-foreground hover:bg-secondary/70')
                      )}
                      aria-current={isActive(href) ? 'page' : undefined}
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      {label}
                      <svg class="h-3 w-3 opacity-60" viewBox="0 0 12 12" fill="currentColor"><path d="M3 4.5L6 7.5L9 4.5"/></svg>
                    </a>
                    <div class="absolute left-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                      <div class="rounded-xl border border-border bg-background p-1.5 shadow-lg min-w-[180px]">
                        {item.children.sort((a, b) => a.order - b.order).map((child) => {
                          const childHref = child.external || isExternalOrAnchorHref(child.href)
                            ? child.href
                            : localizedPath(child.href, locale)
                          return (
                            <a
                              href={childHref}
                              target={child.external ? '_blank' : undefined}
                              rel={child.external ? 'noopener noreferrer' : undefined}
                              class={cn(
                                'block rounded-lg px-3 py-2 text-sm transition-colors',
                                isActive(child.href)
                                  ? 'bg-secondary font-medium text-foreground'
                                  : 'text-foreground-muted hover:bg-secondary hover:text-foreground'
                              )}
                            >
                              {child.label}
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <a
                  href={item.external || isExternalOrAnchorHref(href) ? href : (href.startsWith('#') && !isLandingPage ? `/${href}` : href)}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  class={cn(
                    'nav-link relative inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm',
                    'transition-all duration-(--transition-fast)',
                    isFloating && 'hdr-invert-text',
                    isFloating
                      ? (isActive(href)
                          ? 'hdr-nav-active font-semibold'
                          : 'font-medium')
                      : (isActive(href)
                          ? 'nav-link-active font-semibold text-foreground bg-secondary'
                          : 'nav-link-inactive font-medium text-foreground-muted hover:text-foreground hover:bg-secondary/70')
                  )}
                  aria-current={isActive(href) ? 'page' : undefined}
                >
                  {label}
                  {item.external && (
                    <svg class="h-3 w-3 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M7 7h10v10"/></svg>
                  )}
                </a>
              )
            })}
```

- [ ] **Step 3: Update mobile nav loop (lines 479-503)**

Replace:
```astro
                {navItems.map(({ label, href }, idx) => {
```
with:
```astro
                {navItems.map((item, idx) => {
                  const { label, href } = item
                  const active = isActive(href);
                  const resolvedHref = item.external || isExternalOrAnchorHref(href) ? href : (href.startsWith('#') && !isLandingPage ? `/${href}` : href);
                  if (item.children && item.children.length > 0) {
                    return (
                      <li>
                        <details class="group">
                          <summary class={cn(
                            'mobile-menu-row mobile-menu-stagger flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-base transition-colors list-none marker:hidden',
                            active ? 'mobile-menu-row-active' : 'mobile-menu-row-inactive'
                          )}
                            style={`--stagger-index: ${idx}`}
                          >
                            <span class="mobile-menu-tile">
                              <Icon name={getNavIcon(href)} size="sm" />
                            </span>
                            <span class="flex-1">{label}</span>
                            <svg class="h-4 w-4 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
                          </summary>
                          <div class="ml-10 mt-1 flex flex-col gap-0.5">
                            {item.children.sort((a, b) => a.order - b.order).map((child) => {
                              const childHref = child.external || isExternalOrAnchorHref(child.href) ? child.href : child.href
                              return (
                                <a href={childHref} target={child.external ? '_blank' : undefined} rel={child.external ? 'noopener noreferrer' : undefined}
                                  class="mobile-menu-row rounded-lg px-3 py-2 text-sm text-foreground-muted transition-colors hover:text-foreground hover:bg-secondary/50 flex items-center gap-2"
                                >
                                  {child.label}
                                  {child.external && <Icon name="arrow-up-right" size="sm" />}
                                </a>
                              )
                            })}
                          </div>
                        </details>
                      </li>
                    )
                  }
```

- [ ] **Step 4: Commit**

```bash
git add website/src/components/layout/Header.astro
git commit -m "feat: add dropdown support and external link icon to Header"
```

---

### Task 20: Verification

**Files:** All

- [ ] **Step 1: Run full build**

```bash
cd /path/to/project && pnpm build
```

Expected: Both backend and website build successfully, no errors.

- [ ] **Step 2: Run backend tests**

```bash
pnpm --filter ./backend run test:int
```

Expected: 5/5 tests pass.

- [ ] **Step 3: Run website tests**

```bash
pnpm --filter ./website run test
```

Expected: All tests pass.

- [ ] **Step 4: Run backend seed to populate services**

```bash
pnpm --filter ./backend run seed
```

Expected: Services seeded successfully.

- [ ] **Step 5: Start dev server and verify routes**

```bash
pnpm dev
```

Verify in browser:
- `http://localhost:4321/services` — services overview with 5 categories
- `http://localhost:4321/services/viptel-pbx` — PBX category with children
- `http://localhost:4321/services/viptel-pbx/basica` — Básica detail page
- `http://localhost:4321/en/services` — English overview
- `http://localhost:4321/en/services/viptel-pbx` — English PBX category
- Header dropdown shows 5 categories on hover
- "Tienda" link opens external URL in new tab
- Mobile menu shows expandable Services section

- [ ] **Step 6: Commit**

```bash
git commit -m "chore: verification — build, tests, and manual route check passed"
```

---

## Self-Review

| Check | Status |
|---|---|
| Spec coverage: Services collection, payload functions, 8 components, 2 views, routes, nav dropdown, i18n, seed, backup | ✅ All covered |
| Placeholder scan | ✅ No TBD, TODO, or vague steps |
| Type consistency | ✅ Service type used consistently across all tasks, payload functions match component props |
| Field names: `features.title`, `pricing.planName`, `gallery.image`, `parent` | ✅ Consistent across backend config, seed, and Astro components |
| `BlockRenderer` props: `layout as PageBlock[]`, `locale` | ✅ Matches existing usage |
| `localizedPath`, `t()` usage | ✅ Consistent with existing i18n patterns |
| Nav config `resolveNavItem` handles `children` | ✅ `children` is not localized, `resolveNavItem` operates on flat items; children rendering handles locale prefixing inline |
