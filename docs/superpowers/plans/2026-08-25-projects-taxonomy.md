# Proyectos — Taxonomía tipo → categoría → etiquetas (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Organizar la sección de proyectos del website con la taxonomía del blog (tipo → categoría → subcategoría → etiquetas), con sidebar, archivos jerárquicos y detalle mejorado.

**Architecture:** Se añaden dos colecciones nuevas al backend (`project-types`, `project-categories`) y dos campos a `projects`. El website replica el patrón del blog: cliente API con queries de tipo/categoría, `resolveProjectArchive` en un catch-all, `ProjectsListLayout` con sidebar, y `ProjectLayout` reescrito usando `ProjectHero`/`ProjectGallery` adaptados a URLs remotas de Payload.

**Tech Stack:** Payload CMS 3.86 (PostgreSQL + Drizzle), Astro 7.2 SSR, Tailwind v4, TypeScript 5.7, Vitest.

## Global Constraints

- **Backend**: consultar `backend/.agents/skills/payload/SKILL.md` y `backend/.agents/skills/payload/reference/` (especialmente `MIGRATIONS.md`, `COLLECTIONS.md`). Usar el MCP de Payload (`http://localhost:3000/api/mcp`) cuando esté disponible para verificar colecciones. Usar Context7 para docs de Payload si hace falta.
- **Migración obligatoria**: tras cambiar colecciones, ejecutar `pnpm payload migrate:create` y `pnpm payload migrate` en `backend/` (la DB no se actualiza sola).
- **Regenerar tipos**: `pnpm generate:types` en `backend/` y luego `pnpm generate:types` en `website/` (copia `payload-types.ts`).
- **i18n**: `es` (default) y `en` activos; `nl` existe pero desactivado. Todo texto visible en `website/src/i18n/*.json`. Los tres archivos se mantienen en paso.
- **Sin eliminar código**: `ProjectHero`, `ProjectShowcase`, `ProjectCarousel`, `ProjectGallery` se adaptan; `ProjectShowcase` queda sin usar (se mantiene el CTA actual).
- **Convenciones**: componentes nuevos espejan los del blog (`Blog*` → `Projects*`). Sin JS salvo que sea necesario. `prefers-reduced-motion` respetado. Imágenes vía `astro:assets`.
- **Verificación final**: `pnpm build` desde la raíz (ambos paquetes).

---

### Task 1: Backend — Colección `project-types`

**Files:**
- Create: `backend/src/collections/ProjectTypes.ts`
- Modify: `backend/src/payload.config.ts`

**Interfaces:**
- Consumes: `iconField` (`backend/src/fields/iconField.ts`), `slugify` (exportado de `backend/src/collections/Tags.ts`), access `anyone`/`authenticated`.
- Produces: colección `project-types` (slug), usada por Task 3 (campo `projectType`) y Task 5 (seed).

- [ ] **Step 1: Crear `backend/src/collections/ProjectTypes.ts`**

```typescript
import type { CollectionConfig } from 'payload'

import { slugField } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { iconField } from '../fields/iconField'
import { slugify } from './Tags'

export const ProjectTypes: CollectionConfig = {
  slug: 'project-types',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  labels: {
    singular: 'Tipo de proyecto',
    plural: 'Tipos de proyecto',
  },
  admin: {
    defaultColumns: ['title', 'slug', 'position'],
    description:
      'Formato del proyecto (web, telecomunicaciones, marketing…). Es un eje aparte de la categoría.',
    group: 'Content',
    useAsTitle: 'title',
  },
  hooks: {
    beforeDelete: [
      async ({ id, req }) => {
        const { totalDocs } = await req.payload.count({
          collection: 'projects',
          where: {
            projectType: { equals: id },
          },
        })
        if (totalDocs > 0) {
          throw new Error(
            `No se puede eliminar este tipo de proyecto: tiene ${totalDocs} proyecto(s) asignado(s).`,
          )
        }
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    slugField({
      position: undefined,
      useAsSlug: 'title',
      slugify: ({ valueToSlugify }) => slugify(String(valueToSlugify ?? '')),
    }),
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    iconField(),
    {
      name: 'position',
      type: 'number',
      admin: {
        description: 'Orden en el que aparece en las pestañas y la sidebar de proyectos.',
      },
      defaultValue: 0,
    },
  ],
}
```

- [ ] **Step 2: Registrar en `backend/src/payload.config.ts`**

Añadir el import junto a los otros imports de colecciones (línea ~15):

```typescript
import { ProjectTypes } from './collections/ProjectTypes'
```

Y añadir `ProjectTypes` al array `collections` (línea 73):

```typescript
collections: [Pages, Posts, Projects, Services, Media, Categories, Tags, PostTypes, ProjectTypes, Users],
```

- [ ] **Step 3: Verificar compilación**

Run (en `backend/`): `pnpm build`
Expected: compila sin errores.

- [ ] **Step 4: Commit**

```bash
git add backend/src/collections/ProjectTypes.ts backend/src/payload.config.ts
git commit -m "feat(backend): add project-types collection"
```

---

### Task 2: Backend — Colección `project-categories`

**Files:**
- Create: `backend/src/collections/ProjectCategories.ts`
- Modify: `backend/src/payload.config.ts`

**Interfaces:**
- Consumes: access `anyone`/`authenticated`, `slugField`.
- Produces: colección `project-categories` (slug), usada por Task 3 (campo `categories`) y Task 5 (seed).

- [ ] **Step 1: Crear `backend/src/collections/ProjectCategories.ts`**

```typescript
import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'

export const ProjectCategories: CollectionConfig = {
  slug: 'project-categories',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  labels: {
    singular: 'Categoría de proyecto',
    plural: 'Categorías de proyecto',
  },
  admin: {
    description:
      'Jerarquía de dos niveles: categoría raíz y subcategoría. Crear una subcategoría solo si agrupa 10+ proyectos (regla de volumen).',
    useAsTitle: 'title',
    group: 'Content',
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
      relationTo: 'project-categories',
      admin: {
        description:
          'Dejar vacío si es una categoría raíz. Seleccionar un padre para crear una subcategoría.',
        position: 'sidebar',
      },
    },
    slugField({
      position: undefined,
    }),
  ],
}
```

- [ ] **Step 2: Registrar en `backend/src/payload.config.ts`**

Añadir el import:

```typescript
import { ProjectCategories } from './collections/ProjectCategories'
```

Y añadir `ProjectCategories` al array `collections`:

```typescript
collections: [Pages, Posts, Projects, Services, Media, Categories, Tags, PostTypes, ProjectTypes, ProjectCategories, Users],
```

- [ ] **Step 3: Verificar compilación**

Run (en `backend/`): `pnpm build`
Expected: compila sin errores.

- [ ] **Step 4: Commit**

```bash
git add backend/src/collections/ProjectCategories.ts backend/src/payload.config.ts
git commit -m "feat(backend): add project-categories collection"
```

---

### Task 3: Backend — Campos `projectType` y `categories` en `projects`

**Files:**
- Modify: `backend/src/collections/Projects/index.ts` (defaultPopulate líneas 32-35; pestaña Meta líneas 112-155)

**Interfaces:**
- Consumes: colecciones `project-types` y `project-categories` (Tasks 1-2).
- Produces: campos `projectType` (requerido) y `categories` (única) en el tipo `Project` generado; usados por Task 4 (migración), Task 5 (seed) y Tasks 6+ (website).

- [ ] **Step 1: Ampliar `defaultPopulate`**

En `backend/src/collections/Projects/index.ts`, reemplazar:

```typescript
  defaultPopulate: {
    title: true,
    slug: true,
  },
```

por:

```typescript
  defaultPopulate: {
    title: true,
    slug: true,
    projectType: true,
    categories: true,
    meta: {
      image: true,
      description: true,
    },
  },
```

- [ ] **Step 2: Añadir los campos en la pestaña "Meta"**

En el bloque `{ label: 'Meta', fields: [...] }`, justo después del campo `year` (que termina en la línea ~128), añadir:

```typescript
            {
              name: 'projectType',
              type: 'relationship',
              admin: {
                description: 'Formato del proyecto. Es un eje aparte de la categoría.',
                position: 'sidebar',
              },
              relationTo: 'project-types',
              required: true,
            },
            {
              name: 'categories',
              type: 'relationship',
              admin: {
                description: 'Categoría raíz o subcategoría (una sola por proyecto).',
                position: 'sidebar',
              },
              relationTo: 'project-categories',
            },
```

- [ ] **Step 3: Verificar compilación**

Run (en `backend/`): `pnpm build`
Expected: compila sin errores.

- [ ] **Step 4: Commit**

```bash
git add backend/src/collections/Projects/index.ts
git commit -m "feat(backend): add projectType and categories fields to projects"
```

---

### Task 4: Backend — Migración + regeneración de tipos

**Files:**
- Create: `backend/src/migrations/20260825_*.ts` + `.json` (generados)
- Modify: `backend/src/migrations/index.ts` (registro)
- Modify: `backend/src/payload-types.ts` (regenerado)
- Modify: `website/src/lib/payload-types.ts` (copiado)

**Interfaces:**
- Consumes: Tasks 1-3 (nuevas colecciones/campos).
- Produces: tablas `project_types`, `project_categories` (y `_locales`, `_rels`) en PostgreSQL; interfaces `ProjectType` y `ProjectCategory` en `payload-types.ts`; campo `projectType`/`categories` en `Project`.

- [ ] **Step 1: Crear la migración**

Run (en `backend/`): `pnpm payload migrate:create`
Expected: genera `src/migrations/20260825_*.ts` y `.json` con las nuevas tablas, y lo registra en `src/migrations/index.ts`.

- [ ] **Step 2: Aplicar la migración**

Run (en `backend/`): `pnpm payload migrate`
Expected: las tablas `project_types`, `project_categories`, `project_types_locales`, `project_categories_locales`, `project_categories_rels` y las columnas `project_type_id`/`categories_id` en `projects_rels` aparecen en PostgreSQL.

- [ ] **Step 3: Regenerar tipos del backend**

Run (en `backend/`): `pnpm generate:types`
Expected: `backend/src/payload-types.ts` contiene `export interface ProjectType` y `export interface ProjectCategory`, y `Project` tiene `projectType` y `categories`.

- [ ] **Step 4: Copiar tipos al website**

Run (en `website/`): `pnpm generate:types`
Expected: `website/src/lib/payload-types.ts` refleja los nuevos tipos. `Project` incluye `projectType: number | ProjectType` y `categories?: (number | null) | ProjectCategory`.

- [ ] **Step 5: Commit**

```bash
git add backend/src/migrations backend/src/payload-types.ts website/src/lib/payload-types.ts
git commit -m "feat(backend): migration for project types and categories"
```

---

### Task 5: Backend — Seed de tipos/categorías de proyecto y asignación

**Files:**
- Modify: `backend/src/scripts/seed.ts`

**Interfaces:**
- Consumes: colecciones `project-types`/`project-categories` (Tasks 1-2), campos en `projects` (Task 3).
- Produces: tipos/categorías de proyecto sembrados y asignados a los 20 proyectos existentes.

- [ ] **Step 1: Registrar las colecciones nuevas en el array `collections` del seed**

En `backend/src/scripts/seed.ts`, el array `collections` (líneas ~22-33) define qué se limpia al sembrar. Añadir las dos colecciones nuevas para que un re-seed no deje huérfanos:

```typescript
const collections: CollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'posts',
  'post-types',
  'project-categories',
  'project-types',
  'projects',
  'redirects',
  'services',
  'tags',
  'users',
]
```

- [ ] **Step 2: Añadir tipos de proyecto al seed**

Tras el bloque "Seeding post types" (después de la línea ~252), añadir:

```typescript
  payload.logger.info(`- Seeding project types...`)

  type ProjectTypeSeed = { es: string; en: string; slug: string; icon: string; position: number }

  const projectTypesData: ProjectTypeSeed[] = [
    { es: 'Desarrollo Web', en: 'Web Development', slug: 'desarrollo-web', icon: 'globe', position: 1 },
    { es: 'Telecomunicaciones', en: 'Telecommunications', slug: 'telecomunicaciones', icon: 'phone', position: 2 },
    { es: 'Software Empresarial', en: 'Enterprise Software', slug: 'software-empresarial', icon: 'code', position: 3 },
    { es: 'Marketing Digital', en: 'Digital Marketing', slug: 'marketing-digital', icon: 'trending-up', position: 4 },
  ]

  const projectTypeIdBySlug = new Map<string, number>()
  for (const type of projectTypesData) {
    const doc = await payload.create({
      collection: 'project-types',
      locale: 'es',
      data: { title: type.es, slug: type.slug, icon: type.icon, position: type.position },
    })
    await payload.update({
      collection: 'project-types',
      id: doc.id,
      locale: 'en',
      data: { title: type.en },
    })
    projectTypeIdBySlug.set(type.slug, doc.id as number)
  }
```

- [ ] **Step 3: Añadir categorías de proyecto al seed**

Tras el bloque de "Seeding categories" (después de la línea ~318), añadir:

```typescript
  payload.logger.info(`- Seeding project categories...`)

  type ProjectSubcategorySeed = { es: string; en: string; slug: string }
  type ProjectCategorySeed = { es: string; en: string; slug: string; subcategories: ProjectSubcategorySeed[] }

  const projectCategoryData: ProjectCategorySeed[] = [
    {
      es: 'Telecomunicaciones',
      en: 'Telecommunications',
      slug: 'telecomunicaciones',
      subcategories: [
        { es: 'PBX y VoIP', en: 'PBX & VoIP', slug: 'pbx-voip' },
        { es: 'Redes y conectividad', en: 'Networking & connectivity', slug: 'redes-conectividad' },
      ],
    },
    {
      es: 'Desarrollo Web',
      en: 'Web Development',
      slug: 'desarrollo-web',
      subcategories: [
        { es: 'E-commerce', en: 'E-commerce', slug: 'e-commerce' },
        { es: 'Aplicaciones web', en: 'Web applications', slug: 'aplicaciones-web' },
      ],
    },
    {
      es: 'Software Empresarial',
      en: 'Enterprise Software',
      slug: 'software-empresarial',
      subcategories: [
        { es: 'ERP', en: 'ERP', slug: 'erp' },
        { es: 'CRM', en: 'CRM', slug: 'crm' },
      ],
    },
    {
      es: 'Marketing Digital',
      en: 'Digital Marketing',
      slug: 'marketing-digital',
      subcategories: [
        { es: 'SEO', en: 'SEO', slug: 'seo' },
        { es: 'Publicidad digital', en: 'Digital advertising', slug: 'publicidad-digital' },
      ],
    },
  ]

  const projectCategoryIdBySlug = new Map<string, number>()
  for (const cat of projectCategoryData) {
    const doc = await payload.create({
      collection: 'project-categories',
      locale: 'es',
      data: { title: cat.es, slug: cat.slug },
    })
    await payload.update({
      collection: 'project-categories',
      id: doc.id,
      locale: 'en',
      data: { title: cat.en },
    })
    projectCategoryIdBySlug.set(cat.slug, doc.id as number)
    for (const sub of cat.subcategories) {
      const subDoc = await payload.create({
        collection: 'project-categories',
        locale: 'es',
        data: { title: sub.es, slug: sub.slug, parent: doc.id as number },
      })
      await payload.update({
        collection: 'project-categories',
        id: subDoc.id,
        locale: 'en',
        data: { title: sub.en },
      })
      projectCategoryIdBySlug.set(sub.slug, subDoc.id as number)
    }
  }
```

- [ ] **Step 4: Añadir `projectType` y `category` al tipo `ProjectSeed`**

En la definición del tipo `ProjectSeed` (línea ~1077), añadir dos campos:

```typescript
    projectType: string
    category: string
```

- [ ] **Step 5: Asignar tipo y categoría a cada proyecto**

Añadir `projectType` y `category` a cada entrada de `projectsData` según esta tabla (slug → projectType → category):

| slug | projectType | category |
|---|---|---|
| `pbx-nube-clinica` | `telecomunicaciones` | `pbx-voip` |
| `red-vpn-firma-legal` | `telecomunicaciones` | `redes-conectividad` |
| `ecommerce-moda` | `desarrollo-web` | `e-commerce` |
| `reservas-hotel-boutique` | `desarrollo-web` | `aplicaciones-web` |
| `erp-inventario-distribuidora` | `software-empresarial` | `erp` |
| `seguimiento-flota-gps` | `software-empresarial` | `aplicaciones-web` |
| `migracion-nube-cooperativa` | `telecomunicaciones` | `redes-conectividad` |
| `sitio-corporativo-multilingue` | `desarrollo-web` | `aplicaciones-web` |
| `wifi-campus-universitario` | `telecomunicaciones` | `redes-conectividad` |
| `crm-agencia-marketing` | `software-empresarial` | `crm` |
| `plataforma-lms` | `desarrollo-web` | `aplicaciones-web` |
| `pasarela-pagos-local` | `desarrollo-web` | `e-commerce` |
| `centro-contacto-omnicanal` | `telecomunicaciones` | `pbx-voip` |
| `dashboard-analitica-retail` | `software-empresarial` | `erp` |
| `facturacion-electronica-dian` | `software-empresarial` | `erp` |
| `telemedicina-app` | `desarrollo-web` | `aplicaciones-web` |
| `portal-proveedores-sso` | `software-empresarial` | `crm` |
| `campana-marketing-multicanal` | `marketing-digital` | `seo` |
| `migracion-voip-analogica` | `telecomunicaciones` | `pbx-voip` |
| `plataforma-inmobiliaria-mapas` | `desarrollo-web` | `aplicaciones-web` |

Ejemplo del primer proyecto (tras añadir las dos líneas):

```typescript
      client: 'Clínica Salud Plus',
      year: 2026,
      coverImage: image1.id as number,
      projectType: 'telecomunicaciones',
      category: 'pbx-voip',
      tags: ['PBX', 'VoIP', 'Nube'],
```

- [ ] **Step 6: Usar los ids en el `payload.create` de cada proyecto**

En el bucle `for (const project of projectsData)` (línea ~1811), dentro del `data` del `payload.create`, añadir:

```typescript
        projectType: projectTypeIdBySlug.get(project.projectType) as number,
        categories: projectCategoryIdBySlug.get(project.category) as number,
```

Justo después de la línea `coverImage: project.coverImage,`.

- [ ] **Step 7: Ejecutar el seed y verificar**

Run (en `backend/`): `pnpm seed`
Expected: crea los tipos/categorías de proyecto y asigna a los 20 proyectos. No hay errores.

- [ ] **Step 8: Commit**

```bash
git add backend/src/scripts/seed.ts
git commit -m "feat(backend): seed project types and categories"
```

---

### Task 6: Website — Cliente API `payload-client.ts`

**Files:**
- Modify: `website/src/lib/payload-client.ts`

**Interfaces:**
- Consumes: tipos `ProjectType`, `ProjectCategory` (Task 4), `QueryBase` existente.
- Produces: `payload.projectTypes().getAll(locale)`, `payload.projectCategories().getAll(locale)`, `payload.projectCategories().getRoots(locale)`, y en `ProjectQueries`: `getByType`, `getByCategory`, `getByTypeAndCategory`, `getByTypeAndCategories`. Usado por Tasks 8-11.

- [ ] **Step 1: Añadir los tipos al import**

En `website/src/lib/payload-client.ts` línea 8, reemplazar:

```typescript
import type { Category, Page, Post, PostType, Project, Redirect, Service } from './payload-types';
```

por:

```typescript
import type {
  Category,
  Page,
  Post,
  PostType,
  Project,
  ProjectCategory,
  ProjectType,
  Redirect,
  Service,
} from './payload-types';
```

- [ ] **Step 2: Añadir `projectTypes()` y `projectCategories()` al `PayloadClient`**

En la clase `PayloadClient`, tras el método `redirects()` (línea ~118), añadir:

```typescript
  projectTypes(): ProjectTypeQueries {
    return new ProjectTypeQueries(this);
  }

  projectCategories(): ProjectCategoryQueries {
    return new ProjectCategoryQueries(this);
  }
```

- [ ] **Step 3: Añadir las clases de queries**

Tras la clase `ProjectQueries` (que termina en la línea ~320), añadir:

```typescript
class ProjectTypeQueries extends QueryBase<ProjectType> {
  constructor(client: PayloadClient) {
    super(client, 'project-types');
  }

  async getAll(locale = defaultLocale): Promise<ProjectType[]> {
    const data = await this.client.fetchAPI<DocsResponse<ProjectType>>(
      `project-types?sort=position&limit=${MAX_DOCS_PER_PAGE}`,
      { locale }
    );
    return data.docs ?? [];
  }
}

class ProjectCategoryQueries extends QueryBase<ProjectCategory> {
  constructor(client: PayloadClient) {
    super(client, 'project-categories');
  }

  async getAll(locale = defaultLocale): Promise<ProjectCategory[]> {
    const data = await this.client.fetchAPI<DocsResponse<ProjectCategory>>(
      `project-categories?limit=${MAX_DOCS_PER_PAGE}`,
      { locale }
    );
    return data.docs ?? [];
  }

  async getRoots(locale = defaultLocale): Promise<ProjectCategory[]> {
    const data = await this.client.fetchAPI<DocsResponse<ProjectCategory>>(
      `project-categories?limit=${MAX_DOCS_PER_PAGE}&where[parent][exists]=false`,
      { locale }
    );
    return data.docs ?? [];
  }
}
```

- [ ] **Step 4: Añadir los métodos de filtrado a `ProjectQueries`**

Dentro de la clase `ProjectQueries`, tras `getByTag` (línea ~320), añadir:

```typescript
  async getByType(
    projectTypeId: number | string,
    locale = defaultLocale,
    page = 1,
    limit = 20
  ): Promise<DocsResponse<Project>> {
    return this.client.fetchAPI<DocsResponse<Project>>(
      `projects?sort=-year&limit=${limit}&page=${page}&where[projectType][equals]=${encodeURIComponent(String(projectTypeId))}&where[_status][equals]=published`,
      { locale }
    );
  }

  async getByCategory(
    categoryId: number | string,
    locale = defaultLocale,
    page = 1,
    limit = 20
  ): Promise<DocsResponse<Project>> {
    return this.client.fetchAPI<DocsResponse<Project>>(
      `projects?sort=-year&limit=${limit}&page=${page}&where[categories][equals]=${encodeURIComponent(String(categoryId))}&where[_status][equals]=published`,
      { locale }
    );
  }

  async getByTypeAndCategory(
    projectTypeId: number | string,
    categoryId: number | string,
    locale = defaultLocale,
    page = 1,
    limit = 20
  ): Promise<DocsResponse<Project>> {
    return this.client.fetchAPI<DocsResponse<Project>>(
      `projects?sort=-year&limit=${limit}&page=${page}&where[projectType][equals]=${encodeURIComponent(String(projectTypeId))}&where[categories][equals]=${encodeURIComponent(String(categoryId))}&where[_status][equals]=published`,
      { locale }
    );
  }

  async getByTypeAndCategories(
    projectTypeId: number | string,
    categoryIds: Array<number | string>,
    locale = defaultLocale,
    page = 1,
    limit = 20
  ): Promise<DocsResponse<Project>> {
    const ids = categoryIds.map((id) => encodeURIComponent(String(id))).join(',');
    return this.client.fetchAPI<DocsResponse<Project>>(
      `projects?sort=-year&limit=${limit}&page=${page}&where[projectType][equals]=${encodeURIComponent(String(projectTypeId))}&where[categories][in]=${ids}&where[_status][equals]=published`,
      { locale }
    );
  }
```

- [ ] **Step 5: Verificar compilación**

Run (en `website/`): `pnpm check`
Expected: pasa sin errores de tipos.

- [ ] **Step 6: Commit**

```bash
git add website/src/lib/payload-client.ts
git commit -m "feat(website): project type/category queries in payload client"
```

---

### Task 7: Website — `lib/gallery.ts` (slides remotos + `projectToSlides`)

**Files:**
- Modify: `website/src/lib/gallery.ts`

**Interfaces:**
- Consumes: tipo `Project` (con `coverImage` y `gallery`), `payload.resolveMediaUrl`.
- Produces: `GalleryRemoteImageSlide { src: string; alt: string }`, `GalleryRemoteVideoSlide { video: string; poster: string; alt: string }`, `GalleryRemoteSlide` (unión), `isRemoteVideoSlide`, `projectToSlides(project): GalleryRemoteSlide[]`. Usado por Tasks 14-16.

- [ ] **Step 1: Añadir los tipos remotos y el helper**

Reemplazar el contenido de `website/src/lib/gallery.ts` por:

```typescript
/**
 * Shared types for project gallery slides.
 *
 * A slide is either an image or a self-hosted video. Video slides require a
 * poster image so the carousel can render a real frame without downloading a
 * single video byte (`preload="none"` everywhere) — this is what keeps video
 * slides Lighthouse-neutral.
 *
 * Slides can be local (theme assets, `ImageMetadata`) or remote (Payload CMS
 * media URLs). Remote slides are resolved through `payload.resolveMediaUrl`
 * and rendered with `<Image inferSize>`.
 */
import type { ImageMetadata } from 'astro';
import { payload } from '@/lib/payload-client';
import type { Project } from '@/lib/payload-types';

export interface GalleryImageSlide {
  src: ImageMetadata;
  alt: string;
}

export interface GalleryVideoSlide {
  /** Root-relative path to a video file in `public/`, e.g. `/videos/demo.mp4`. */
  video: string;
  /** Poster frame shown before playback — required, it doubles as the slide's visual. */
  poster: ImageMetadata;
  alt: string;
}

export interface GalleryRemoteImageSlide {
  /** Absolute URL (resolved via payload.resolveMediaUrl). */
  src: string;
  alt: string;
}

export interface GalleryRemoteVideoSlide {
  /** Absolute URL to a video file. */
  video: string;
  /** Absolute URL to the poster frame. */
  poster: string;
  alt: string;
}

export type GallerySlide =
  | GalleryImageSlide
  | GalleryVideoSlide
  | GalleryRemoteImageSlide
  | GalleryRemoteVideoSlide;

export function isVideoSlide(slide: GallerySlide): slide is GalleryVideoSlide | GalleryRemoteVideoSlide {
  return 'video' in slide;
}

export function isRemoteSlide(
  slide: GallerySlide
): slide is GalleryRemoteImageSlide | GalleryRemoteVideoSlide {
  return typeof (slide as GalleryRemoteImageSlide).src === 'string' || isVideoSlide(slide);
}

/**
 * Build carousel/gallery slides from a Payload project: the cover image first,
 * then each gallery image. Only slides with a resolvable URL are included.
 */
export function projectToSlides(project: Project): GallerySlide[] {
  const slides: GallerySlide[] = [];

  const cover =
    project.coverImage && typeof project.coverImage !== 'number' ? project.coverImage : null;
  if (cover?.url) {
    slides.push({ src: payload.resolveMediaUrl(cover.url), alt: cover.alt || project.title });
  }

  for (const item of project.gallery ?? []) {
    const img = item.image && typeof item.image !== 'number' ? item.image : null;
    if (img?.url) {
      slides.push({
        src: payload.resolveMediaUrl(img.url),
        alt: item.alt || img.alt || project.title,
      });
    }
  }

  return slides;
}
```

- [ ] **Step 2: Verificar compilación**

Run (en `website/`): `pnpm check`
Expected: pasa sin errores de tipos.

- [ ] **Step 3: Commit**

```bash
git add website/src/lib/gallery.ts
git commit -m "feat(website): remote gallery slides and projectToSlides helper"
```

---

### Task 8: Website — `lib/projects.ts` (URLs, archivo, sidebar, relacionados) + tests

**Files:**
- Modify: `website/src/lib/projects.ts`
- Test: `website/src/__tests__/projects-archive.test.ts`, `website/src/__tests__/projects-sidebar.test.ts`, `website/src/__tests__/projects-urls.test.ts`, `website/src/__tests__/projects-related.test.ts`

**Interfaces:**
- Consumes: `payload.projectTypes()/projectCategories()/projects()` (Task 6), `getCategoryChildren`/`getCategorySubtreeIds` (de `@/lib/blog`), `getTagName`/`tagToSlug` (content-helpers), `PROJECTS_PER_PAGE`.
- Produces: `getProjectTypeUrl`, `getProjectCategoryArchiveUrl`, `getProjectSubcategoryArchiveUrl`, `ProjectArchive`, `resolveProjectArchive`, `getProjectTypeName`, `getProjectTypeIcon`, `getProjectCategory`, `ProjectSidebarData`, `computeProjectSidebarData`, `getProjectSidebarData`, `rankRelatedProjects`, `getRelatedByTopic`. Usado por Tasks 9-16.

- [ ] **Step 1: Añadir imports**

En `website/src/lib/projects.ts`, añadir tras los imports existentes:

```typescript
import { getCategoryChildren, getCategorySubtreeIds } from '@/lib/blog';
import type { ProjectCategory, ProjectType } from '@/lib/payload-types';
```

- [ ] **Step 2: Añadir URL helpers jerárquicos**

Tras `getProjectTagUrl` (línea ~49), añadir:

```typescript
export function getProjectTypeUrl(projectTypeSlug: string, locale = defaultLocale): string {
  return localizedPath(`/projects/${projectTypeSlug}`, locale);
}

export function getProjectCategoryArchiveUrl(
  projectTypeSlug: string,
  category: ProjectCategory,
  locale = defaultLocale
): string {
  return localizedPath(`/projects/${projectTypeSlug}/${category.slug}`, locale);
}

export function getProjectSubcategoryArchiveUrl(
  projectTypeSlug: string,
  rootSlug: string,
  subcategory: ProjectCategory,
  locale = defaultLocale
): string {
  return localizedPath(`/projects/${projectTypeSlug}/${rootSlug}/${subcategory.slug}`, locale);
}

export function getProjectTypeName(project: Project): string {
  return typeof project.projectType === 'object' && project.projectType
    ? project.projectType.title
    : '';
}

export function getProjectTypeIcon(project: Project): string {
  return typeof project.projectType === 'object' && project.projectType
    ? project.projectType.icon || 'layers'
    : 'layers';
}

export function getProjectCategory(project: Project): ProjectCategory | null {
  return typeof project.categories === 'object' && project.categories
    ? project.categories
    : null;
}
```

- [ ] **Step 3: Añadir `ProjectArchive` y `resolveProjectArchive`**

Al final del archivo, añadir:

```typescript
export interface ProjectArchive {
  kind: 'project' | 'type' | 'category' | 'subcategory' | 'not-found';
  project?: Project | null;
  projectType?: ProjectType | null;
  category?: ProjectCategory | null;
  subcategory?: ProjectCategory | null;
  projects?: Project[];
  totalDocs?: number;
  totalPages?: number;
}

function projectTypeSlugOf(project: Project): string {
  return typeof project.projectType === 'object' && project.projectType
    ? project.projectType.slug
    : '';
}

function projectCategoryOf(project: Project): ProjectCategory | null {
  return typeof project.categories === 'object' && project.categories
    ? project.categories
    : null;
}

function isChildOf(
  candidate: ProjectCategory | null | undefined,
  parentId: number | undefined
): boolean {
  if (!candidate?.parent) return false;
  return typeof candidate.parent === 'object'
    ? candidate.parent.id === parentId
    : candidate.parent === parentId;
}

/**
 * Resuelve la ruta de proyectos: un proyecto plano (`/projects/<slug>`) o un
 * archivo jerárquico de tipo/categoría/subcategoría. Los proyectos siempre
 * ganan frente a un tipo cuando el segmento coincide (URLs planas estables).
 */
export async function resolveProjectArchive(
  segments: string[],
  locale = defaultLocale,
  page = 1
): Promise<ProjectArchive> {
  if (segments.length === 1) {
    const [s] = segments;
    const project = await payload.projects().getBySlug(s, locale);
    if (project) return { kind: 'project', project };

    const projectType = await payload.projectTypes().getBySlug(s, locale);
    if (projectType) {
      const res = await payload
        .projects()
        .getByType(projectType.id, locale, page, PROJECTS_PER_PAGE);
      return {
        kind: 'type',
        projectType,
        projects: res.docs,
        totalDocs: res.totalDocs,
        totalPages: res.totalPages,
      };
    }
    return { kind: 'not-found' };
  }

  if (segments.length === 2) {
    const projectType = await payload.projectTypes().getBySlug(segments[0], locale);
    const category = await payload.projectCategories().getBySlug(segments[1], locale);
    if (projectType && category && !category.parent) {
      const allCategories = await payload.projectCategories().getAll(locale);
      const categoryIds = getCategorySubtreeIds(category.id, allCategories);
      const res = await payload
        .projects()
        .getByTypeAndCategories(projectType.id, categoryIds, locale, page, PROJECTS_PER_PAGE);
      return {
        kind: 'category',
        projectType,
        category,
        projects: res.docs,
        totalDocs: res.totalDocs,
        totalPages: res.totalPages,
      };
    }
    return { kind: 'not-found' };
  }

  if (segments.length === 3) {
    const projectType = await payload.projectTypes().getBySlug(segments[0], locale);
    const category = await payload.projectCategories().getBySlug(segments[1], locale);
    const subcategory = await payload.projectCategories().getBySlug(segments[2], locale);
    if (projectType && category && isChildOf(subcategory, category.id)) {
      const res = await payload
        .projects()
        .getByTypeAndCategory(projectType.id, subcategory!.id, locale, page, PROJECTS_PER_PAGE);
      return {
        kind: 'subcategory',
        projectType,
        category,
        subcategory,
        projects: res.docs,
        totalDocs: res.totalDocs,
        totalPages: res.totalPages,
      };
    }
    return { kind: 'not-found' };
  }

  return { kind: 'not-found' };
}
```

- [ ] **Step 4: Añadir sidebar data**

Al final del archivo, añadir:

```typescript
export interface ProjectSidebarType {
  type: ProjectType;
  count: number;
  categories: ProjectSidebarCategory[];
}
export interface ProjectSidebarCategory {
  category: ProjectCategory;
  count: number;
  subcategories: ProjectSidebarSubcategory[];
}
export interface ProjectSidebarSubcategory {
  category: ProjectCategory;
  count: number;
}
export interface ProjectSidebarTag {
  name: string;
  slug: string;
  count: number;
}
export interface ProjectSidebarData {
  types: ProjectSidebarType[];
  tags: ProjectSidebarTag[];
}

/**
 * Construye el árbol de tipos → categorías → subcategorías con conteos y la
 * lista de etiquetas con contador, todo calculado en memoria desde los
 * proyectos publicados.
 */
export function computeProjectSidebarData(
  projectTypes: ProjectType[],
  categories: ProjectCategory[],
  projects: Project[]
): ProjectSidebarData {
  const roots = categories.filter((c) => !c.parent);

  const types = projectTypes
    .map((type) => {
      const typeProjects = projects.filter((p) => projectTypeSlugOf(p) === type.slug);
      const categoryCounts = new Map<number, number>();
      const subcategoryCounts = new Map<number, number>();
      for (const p of typeProjects) {
        const cat = projectCategoryOf(p);
        if (!cat) continue;
        const parentId =
          typeof cat.parent === 'object' && cat.parent
            ? cat.parent.id
            : (cat.parent as number | undefined);
        if (parentId !== undefined) {
          subcategoryCounts.set(cat.id, (subcategoryCounts.get(cat.id) ?? 0) + 1);
          categoryCounts.set(parentId, (categoryCounts.get(parentId) ?? 0) + 1);
        } else {
          categoryCounts.set(cat.id, (categoryCounts.get(cat.id) ?? 0) + 1);
        }
      }
      const categoriesForType = roots
        .filter((root) => categoryCounts.has(root.id))
        .map((root) => {
          const children = getCategoryChildren(root.id, categories).filter(
            (sub) =>
              subcategoryCounts.has(sub.id) ||
              typeProjects.some((p) => projectCategoryOf(p)?.id === sub.id)
          );
          return {
            category: root,
            count: categoryCounts.get(root.id) ?? 0,
            subcategories: children.map((sub) => ({
              category: sub,
              count: subcategoryCounts.get(sub.id) ?? 0,
            })),
          };
        })
        .sort((a, b) => a.category.title.localeCompare(b.category.title));
      return { type, count: typeProjects.length, categories: categoriesForType };
    })
    .filter((t) => t.count > 0);

  const tagCounts = new Map<string, { name: string; count: number }>();
  for (const p of projects) {
    for (const t of p.tags ?? []) {
      const name = getTagName(t);
      if (!name) continue;
      const entry = tagCounts.get(name) ?? { name, count: 0 };
      entry.count += 1;
      tagCounts.set(name, entry);
    }
  }
  const tags = [...tagCounts.values()]
    .map(({ name, count }) => ({ name, slug: tagToSlug(name), count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return { types, tags };
}

export async function getProjectSidebarData(locale = defaultLocale): Promise<ProjectSidebarData> {
  const [projectTypes, categories, projects] = await Promise.all([
    payload.projectTypes().getAll(locale),
    payload.projectCategories().getAll(locale),
    getVisibleProjects(locale),
  ]);
  return computeProjectSidebarData(projectTypes, categories, projects);
}
```

- [ ] **Step 5: Añadir relacionados por tema**

Al final del archivo, añadir:

```typescript
export function rankRelatedProjects(
  projects: Project[],
  currentSlug: string,
  typeSlug: string,
  categoryId: number | undefined,
  tags: string[]
): Project[] {
  if (!typeSlug && categoryId === undefined && !tags.length) return [];
  return projects
    .filter((p) => p.slug !== currentSlug)
    .map((p) => {
      let score = 0;
      if (projectTypeSlugOf(p) === typeSlug) score += 3;
      const cat = projectCategoryOf(p);
      if (categoryId !== undefined && cat) {
        const catId = typeof cat.parent === 'object' && cat.parent ? cat.parent.id : cat.id;
        if (cat.id === categoryId || catId === categoryId) score += 2;
      }
      const shared = (p.tags ?? []).filter((t) => tags.includes(getTagName(t))).length;
      score += shared;
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}

export async function getRelatedByTopic(
  currentSlug: string,
  locale = defaultLocale,
  max = 3
): Promise<Project[]> {
  const all = await getVisibleProjects(locale);
  const current = all.find((p) => p.slug === currentSlug);
  if (!current) return [];
  const typeSlug = projectTypeSlugOf(current);
  const cat = projectCategoryOf(current);
  const catId = cat ? cat.id : undefined;
  const tags = (current.tags ?? []).map(getTagName).filter(Boolean);
  return rankRelatedProjects(all, currentSlug, typeSlug, catId, tags).slice(0, max);
}
```

- [ ] **Step 6: Escribir los tests**

Crear `website/src/__tests__/projects-urls.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

import {
  getProjectSlug,
  getProjectUrl,
  getProjectsBaseUrl,
  getProjectsPageUrl,
  getProjectTagUrl,
  getProjectTypeUrl,
  getProjectCategoryArchiveUrl,
  getProjectSubcategoryArchiveUrl,
  getSecondaryLocales,
} from '@/lib/projects';
import type { Project, ProjectCategory } from '@/lib/payload-types';

const mockProject = { title: 'Test', slug: 'hello-world', id: 1 } as Project;
const cat = { id: 10, title: 'Web', slug: 'web' } as ProjectCategory;
const sub = { id: 20, title: 'E-commerce', slug: 'e-commerce', parent: 10 } as ProjectCategory;

describe('project URL helpers', () => {
  it('gets slug from project object', () => {
    expect(getProjectSlug(mockProject)).toBe('hello-world');
  });

  it('builds project URL from project object', () => {
    expect(getProjectUrl(mockProject)).toBe('/projects/hello-world');
    expect(getProjectUrl(mockProject, 'en')).toBe('/en/projects/hello-world');
  });

  it('builds the projects index base URL', () => {
    expect(getProjectsBaseUrl()).toBe('/projects');
    expect(getProjectsBaseUrl('en')).toBe('/en/projects');
  });

  it('maps page 1 to root and pages 2+ to /page/N', () => {
    expect(getProjectsPageUrl(1)).toBe('/projects');
    expect(getProjectsPageUrl(2)).toBe('/projects/page/2');
  });

  it('builds a tag URL from the slugified tag', () => {
    expect(getProjectTagUrl('astro')).toBe('/projects/tag/astro');
  });

  it('builds hierarchical archive URLs', () => {
    expect(getProjectTypeUrl('telecomunicaciones')).toBe('/projects/telecomunicaciones');
    expect(getProjectCategoryArchiveUrl('telecomunicaciones', cat)).toBe('/projects/telecomunicaciones/web');
    expect(getProjectSubcategoryArchiveUrl('telecomunicaciones', 'web', sub)).toBe(
      '/projects/telecomunicaciones/web/e-commerce'
    );
    expect(getProjectTypeUrl('telecomunicaciones', 'en')).toBe('/en/projects/telecomunicaciones');
  });

  it('exposes only non-default locale when i18n is on', () => {
    expect(getSecondaryLocales()).toEqual(['en']);
  });
});
```

Crear `website/src/__tests__/projects-sidebar.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { computeProjectSidebarData } from '@/lib/projects';
import type { Project, ProjectCategory, ProjectType } from '@/lib/payload-types';

const typeA = {
  id: 1,
  title: 'Telecomunicaciones',
  slug: 'telecomunicaciones',
  icon: 'phone',
  position: 0,
} as ProjectType;
const typeB = { id: 2, title: 'Web', slug: 'desarrollo-web', icon: 'globe', position: 1 } as ProjectType;

const root1 = { id: 10, title: 'Redes', slug: 'redes' } as ProjectCategory;
const root2 = { id: 11, title: 'Web', slug: 'web' } as ProjectCategory;
const sub1 = { id: 20, title: 'E-commerce', slug: 'e-commerce', parent: 10 } as ProjectCategory;

const project = (id: number, type: ProjectType, cat?: ProjectCategory, tags: string[] = []) =>
  ({
    id,
    title: `Project ${id}`,
    slug: `project-${id}`,
    projectType: type,
    categories: cat,
    tags: tags.map((t) => ({ id: Math.random(), name: t, slug: t })),
  }) as unknown as Project;

describe('project sidebar helpers', () => {
  it('computeProjectSidebarData groups roots and counts projects per type', () => {
    const projects = [
      project(1, typeA, root1, ['VoIP']),
      project(2, typeA, sub1, ['LAN']),
      project(3, typeB, root2),
    ];
    const data = computeProjectSidebarData([typeA, typeB], [root1, root2, sub1], projects);
    const tA = data.types.find((t) => t.type.slug === 'telecomunicaciones')!;
    expect(tA.count).toBe(2);
    expect(tA.categories[0].category.slug).toBe('redes');
    expect(tA.categories[0].count).toBe(2);
    expect(tA.categories[0].subcategories[0].category.slug).toBe('e-commerce');
    expect(tA.categories[0].subcategories[0].count).toBe(1);
    expect(data.types.find((t) => t.type.slug === 'desarrollo-web')!.categories[0].category.slug).toBe(
      'web'
    );
  });

  it('computeProjectSidebarData aggregates tags with counts, sorted by count desc', () => {
    const projects = [project(1, typeA, root1, ['VoIP', 'LAN']), project(2, typeA, root1, ['VoIP'])];
    const data = computeProjectSidebarData([typeA], [root1], projects);
    expect(data.tags).toEqual([
      { name: 'VoIP', slug: 'voip', count: 2 },
      { name: 'LAN', slug: 'lan', count: 1 },
    ]);
  });

  it('ignores projects whose type is not in the list', () => {
    const projects = [project(1, typeA, root1)];
    const data = computeProjectSidebarData([typeB], [root1], projects);
    expect(data.types).toEqual([]);
  });
});
```

Crear `website/src/__tests__/projects-related.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { rankRelatedProjects } from '@/lib/projects';
import type { Project, ProjectCategory, ProjectType } from '@/lib/payload-types';

const typeWeb = { id: 1, title: 'Web', slug: 'desarrollo-web' } as ProjectType;
const typeTel = { id: 2, title: 'Teleco', slug: 'telecomunicaciones' } as ProjectType;
const catWeb = { id: 10, title: 'Web', slug: 'web' } as ProjectCategory;

const project = (id: number, type: ProjectType, cat?: ProjectCategory, tags: string[] = []) =>
  ({
    id,
    title: `Project ${id}`,
    slug: `project-${id}`,
    projectType: type,
    categories: cat,
    tags: tags.map((t) => ({ id: Math.random(), name: t, slug: t })),
  }) as unknown as Project;

describe('rankRelatedProjects', () => {
  it('ranks shared type above shared tags', () => {
    const current = project(1, typeWeb, catWeb, ['Astro']);
    const sameType = project(2, typeWeb, undefined, []);
    const sameTag = project(3, typeTel, undefined, ['Astro']);
    const ranked = rankRelatedProjects([sameType, sameTag], 'project-1', 'desarrollo-web', 10, ['Astro']);
    expect(ranked[0].slug).toBe('project-2');
  });

  it('returns empty when nothing matches', () => {
    const other = project(2, typeTel, undefined, []);
    expect(rankRelatedProjects([other], 'project-1', 'desarrollo-web', 10, ['Astro'])).toEqual([]);
  });

  it('excludes the current project', () => {
    const current = project(1, typeWeb, catWeb, ['Astro']);
    const ranked = rankRelatedProjects([current], 'project-1', 'desarrollo-web', 10, ['Astro']);
    expect(ranked).toEqual([]);
  });
});
```

Crear `website/src/__tests__/projects-archive.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { getProjectTypeName, getProjectTypeIcon, getProjectCategory } from '@/lib/projects';
import type { Project, ProjectCategory, ProjectType } from '@/lib/payload-types';

const typeWeb = { id: 1, title: 'Desarrollo Web', slug: 'desarrollo-web', icon: 'globe' } as ProjectType;
const catWeb = { id: 10, title: 'Web', slug: 'web' } as ProjectCategory;

describe('project taxonomy helpers', () => {
  it('getProjectTypeName resolves populated relationship', () => {
    const p = { id: 1, title: 'X', slug: 'x', projectType: typeWeb } as unknown as Project;
    expect(getProjectTypeName(p)).toBe('Desarrollo Web');
  });

  it('getProjectTypeName returns empty for unresolved relationship', () => {
    const p = { id: 1, title: 'X', slug: 'x', projectType: 5 } as unknown as Project;
    expect(getProjectTypeName(p)).toBe('');
  });

  it('getProjectTypeIcon falls back to layers', () => {
    const p = { id: 1, title: 'X', slug: 'x', projectType: typeWeb } as unknown as Project;
    expect(getProjectTypeIcon(p)).toBe('globe');
    const p2 = { id: 2, title: 'Y', slug: 'y', projectType: 5 } as unknown as Project;
    expect(getProjectTypeIcon(p2)).toBe('layers');
  });

  it('getProjectCategory resolves populated relationship', () => {
    const p = { id: 1, title: 'X', slug: 'x', categories: catWeb } as unknown as Project;
    expect(getProjectCategory(p)?.slug).toBe('web');
  });
});
```

- [ ] **Step 7: Ejecutar los tests**

Run (en `website/`): `pnpm test -- projects`
Expected: los 4 archivos de tests pasan.

- [ ] **Step 8: Commit**

```bash
git add website/src/lib/projects.ts website/src/__tests__/projects-*.test.ts
git commit -m "feat(website): project archive, sidebar and related helpers with tests"
```

---

### Task 9: Website — Routing catch-all de proyectos

**Files:**
- Delete: `website/src/pages/projects/[slug].astro`, `website/src/pages/[locale]/projects/[slug].astro`
- Create: `website/src/pages/projects/[...slug].astro`, `website/src/pages/[locale]/projects/[...slug].astro`

**Interfaces:**
- Consumes: `resolveProjectArchive` (Task 8), `ProjectLayout` (Task 16), `ProjectsArchiveView` (Task 11).
- Produces: rutas `/projects/...` y `/<locale>/projects/...` que resuelven proyecto plano o archivo jerárquico.

- [ ] **Step 1: Crear `website/src/pages/projects/[...slug].astro`**

```astro
---
import PageLayout from '@/layouts/PageLayout.astro';
import ProjectLayout from '@/layouts/ProjectLayout.astro';
import ProjectsArchiveView from '@/components/projects/views/ProjectsArchiveView.astro';
import { defaultLocale } from '@/i18n';
import { resolveProjectArchive } from '@/lib/projects';

export const prerender = false;

const { slug } = Astro.params;

if (!slug) {
  return Astro.redirect('/404');
}

const segments = slug.split('/').filter(Boolean);
const currentPage = Math.max(1, Number(Astro.url.searchParams.get('page')) || 1);
const archive = await resolveProjectArchive(segments, defaultLocale, currentPage);

if (archive.kind === 'not-found') {
  return Astro.redirect('/404');
}

const project = archive.kind === 'project' ? archive.project! : null;
---

{
  project ? (
    <PageLayout title={project.title} description={project.description || project.title}>
      <ProjectLayout project={project} locale={defaultLocale} />
    </PageLayout>
  ) : (
    <ProjectsArchiveView archive={archive} currentPage={currentPage} locale={defaultLocale} />
  )
}
```

- [ ] **Step 2: Crear `website/src/pages/[locale]/projects/[...slug].astro`**

```astro
---
import PageLayout from '@/layouts/PageLayout.astro';
import ProjectLayout from '@/layouts/ProjectLayout.astro';
import ProjectsArchiveView from '@/components/projects/views/ProjectsArchiveView.astro';
import { defaultLocale, isValidLocale } from '@/i18n';
import { resolveProjectArchive } from '@/lib/projects';

export const prerender = false;

const { locale = defaultLocale, slug } = Astro.params;

if (!isValidLocale(locale)) {
  return Astro.redirect('/404');
}

if (!slug) {
  return Astro.redirect('/404');
}

const segments = slug.split('/').filter(Boolean);
const currentPage = Math.max(1, Number(Astro.url.searchParams.get('page')) || 1);
const archive = await resolveProjectArchive(segments, locale, currentPage);

if (archive.kind === 'not-found') {
  return Astro.redirect('/404');
}

const project = archive.kind === 'project' ? archive.project! : null;
---

{
  project ? (
    <PageLayout title={project.title} description={project.description || project.title}>
      <ProjectLayout project={project} locale={locale} />
    </PageLayout>
  ) : (
    <ProjectsArchiveView archive={archive} currentPage={currentPage} locale={locale} />
  )
}
```

- [ ] **Step 3: Eliminar las rutas `[slug].astro` antiguas**

Run (en `website/`):
```bash
git rm src/pages/projects/[slug].astro src/pages/[locale]/projects/[slug].astro
```

- [ ] **Step 4: Verificar rutas**

Run (en `website/`): `pnpm check`
Expected: pasa. Las rutas estáticas `/projects/tag/<tag>` y `/projects/page/N` siguen ganando al catch-all.

- [ ] **Step 5: Commit**

```bash
git add website/src/pages
git commit -m "feat(website): catch-all routes for project archives"
```

---

### Task 10: Website — `ProjectsListLayout`, `ProjectsSidebar`, `ProjectsTypeTabs`

**Files:**
- Create: `website/src/components/projects/ProjectsListLayout.astro`, `website/src/components/projects/ProjectsSidebar.astro`, `website/src/components/projects/ProjectsTypeTabs.astro`

**Interfaces:**
- Consumes: `getProjectSidebarData` (Task 8), helpers de URL (Task 8), `t`/`defaultLocale` (i18n).
- Produces: layout de listado con sidebar (usado por Tasks 11-12), sidebar (con tipos/categorías/etiquetas), pestañas de tipos (usado por el index).

- [ ] **Step 1: Crear `ProjectsListLayout.astro`**

```astro
---
/**
 * ProjectsListLayout — layout compartido para las páginas de listado de
 * proyectos. Espejo de `BlogListLayout`: hero (slot `hero`), sidebar
 * `ProjectsSidebar` a la izquierda, contenido en el slot por defecto y zona
 * `footer` a ancho completo. El toggle móvil es checkbox + label (sin JS).
 */
import PageLayout from '@/layouts/PageLayout.astro';
import ProjectsSidebar from '@/components/projects/ProjectsSidebar.astro';
import Icon from '@/components/ui/primitives/Icon/Icon.astro';
import { t, defaultLocale } from '@/i18n';
import { getProjectSidebarData } from '@/lib/projects';

interface Props {
  locale?: string;
  title: string;
  description: string;
  activeTypeSlug?: string;
  activeCategorySlug?: string;
  activeSubcategorySlug?: string;
  activeTag?: string;
  eagerReveal?: boolean;
  footerBackground?: 'default' | 'secondary' | 'invert';
}

const {
  locale = defaultLocale,
  title,
  description,
  activeTypeSlug,
  activeCategorySlug,
  activeSubcategorySlug,
  activeTag,
  eagerReveal = false,
  footerBackground = 'default',
} = Astro.props;

const sidebarData = await getProjectSidebarData(locale);
---

<PageLayout
  title={title}
  description={description}
  eagerReveal={eagerReveal}
  footerBackground={footerBackground}
>
  <slot name="hero" />

  <section class="bg-background-secondary border-border border-t py-[var(--space-section-md)]">
    <div class="mx-auto max-w-7xl px-6">
      <div class="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
        <input type="checkbox" id="projects-sidebar-toggle" class="peer sr-only" />

        <label
          for="projects-sidebar-toggle"
          class="border-brand-500/40 bg-background text-brand-700 dark:text-brand-400 hover:border-brand-500/80 inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors lg:hidden"
        >
          <Icon name="menu" size="sm" />
          {t('projects.sidebarToggle', locale)}
        </label>

        <div class="hidden peer-checked:block lg:block">
          <ProjectsSidebar
            locale={locale}
            types={sidebarData.types}
            tags={sidebarData.tags}
            activeTypeSlug={activeTypeSlug}
            activeCategorySlug={activeCategorySlug}
            activeSubcategorySlug={activeSubcategorySlug}
            activeTag={activeTag}
          />
        </div>

        <div class="flex min-w-0 flex-col gap-8">
          <slot />
        </div>
      </div>
    </div>
  </section>

  <slot name="footer" />
</PageLayout>
```

- [ ] **Step 2: Crear `ProjectsSidebar.astro`**

```astro
---
/**
 * ProjectsSidebar — menú lateral de proyectos. Espejo de `BlogSidebar`:
 * enlaces globales, tipos de proyecto como acordeones (`<details>`) con sus
 * categorías y subcategorías, y sección de etiquetas con contador.
 * Interacción 100% HTML nativa (sin JS).
 */
import Icon from '@/components/ui/primitives/Icon/Icon.astro';
import {
  getProjectsBaseUrl,
  getProjectCategoryArchiveUrl,
  getProjectTypeUrl,
  getProjectSubcategoryArchiveUrl,
  getProjectTagUrl,
  type ProjectSidebarCategory,
  type ProjectSidebarTag,
  type ProjectSidebarType,
} from '@/lib/projects';
import { t, defaultLocale } from '@/i18n';

interface Props {
  locale?: string;
  types: ProjectSidebarType[];
  tags: ProjectSidebarTag[];
  activeTypeSlug?: string;
  activeCategorySlug?: string;
  activeSubcategorySlug?: string;
  activeTag?: string;
  class?: string;
}

const {
  locale = defaultLocale,
  types,
  tags,
  activeTypeSlug = '',
  activeCategorySlug = '',
  activeSubcategorySlug = '',
  activeTag = '',
  class: extraClass,
} = Astro.props;

const isIndex = activeTypeSlug === '' && activeTag === '';
const projectsHref = getProjectsBaseUrl(locale);
---

<aside
  class:list={['projects-sidebar flex w-full flex-col gap-6', extraClass]}
  aria-label="Explorar proyectos"
>
  <nav aria-label="Proyectos">
    <ul class="flex flex-col gap-1">
      <li>
        <a
          href={projectsHref}
          class:list={[
            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isIndex
              ? 'bg-brand-500 text-white'
              : 'text-brand-700 dark:text-brand-400 hover:bg-brand-500/10',
          ]}
          aria-current={isIndex ? 'page' : undefined}
        >
          <Icon name="layers" size="sm" />
          {t('projects.title', locale)}
        </a>
      </li>
      <li>
        <a
          href={projectsHref}
          class="text-foreground-muted hover:bg-brand-500/10 hover:text-brand-700 dark:hover:text-brand-400 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
        >
          <Icon name="layout-grid" size="sm" />
          {t('projects.allProjects', locale)}
        </a>
      </li>
    </ul>
  </nav>

  {
    types.length > 0 && (
      <section class="projects-sidebar-section border-border bg-background rounded-xl border p-3">
        <h2 class="text-foreground-subtle mb-2 px-2 text-xs font-semibold tracking-wide uppercase">
          {t('projects.sidebarTypes', locale)}
        </h2>
        <ul class="flex flex-col gap-1">
          {types.map((entry) => {
            const isTypeActive = activeTypeSlug === entry.type.slug;
            return (
              <li>
                <details class="group" open={isTypeActive}>
                  <summary
                    class:list={[
                      'flex cursor-pointer list-none items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors [&::-webkit-details-marker]:hidden',
                      isTypeActive
                        ? 'bg-brand-500 text-white'
                        : 'text-foreground hover:bg-brand-500/10',
                    ]}
                  >
                    <Icon
                      name={entry.type.icon || 'layers'}
                      size="sm"
                      class:list={[
                        'shrink-0 transition-colors',
                        isTypeActive ? 'text-white' : 'text-brand-600 dark:text-brand-400',
                      ]}
                    />
                    <a
                      href={getProjectTypeUrl(entry.type.slug, locale)}
                      class:list={[
                        'min-w-0 flex-1 truncate transition-colors',
                        isTypeActive
                          ? 'text-white'
                          : 'text-foreground group-hover:text-brand-700 dark:group-hover:text-brand-400',
                      ]}
                      aria-current={isTypeActive ? 'page' : undefined}
                    >
                      {entry.type.title}
                    </a>
                    <span
                      class:list={[
                        'shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold transition-colors',
                        isTypeActive
                          ? 'bg-white/20 text-white'
                          : 'bg-brand-500/10 text-brand-700 dark:text-brand-400',
                      ]}
                    >
                      {entry.count}
                    </span>
                    <Icon
                      name="chevron-down"
                      size="xs"
                      class:list={[
                        'shrink-0 transition-transform duration-200 group-open:rotate-180',
                        isTypeActive ? 'text-white/70' : 'text-foreground-subtle',
                      ]}
                    />
                  </summary>

                  {entry.categories.length > 0 && (
                    <ul class="border-border mt-1 ml-3 flex flex-col gap-0.5 border-l pl-3">
                      {entry.categories.map((cat: ProjectSidebarCategory) => {
                        const isCatActive =
                          activeTypeSlug === entry.type.slug &&
                          activeCategorySlug === cat.category.slug;
                        return (
                          <li>
                            <a
                              href={getProjectCategoryArchiveUrl(entry.type.slug, cat.category, locale)}
                              class:list={[
                                'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                                isCatActive
                                  ? 'bg-brand-500 text-white'
                                  : 'text-foreground-muted hover:bg-brand-500/10 hover:text-brand-700 dark:hover:text-brand-400',
                              ]}
                              aria-current={isCatActive ? 'page' : undefined}
                            >
                              <span class="min-w-0 flex-1 truncate">{cat.category.title}</span>
                              <span
                                class:list={[
                                  'text-xs transition-colors',
                                  isCatActive ? 'text-white/70' : 'text-foreground-subtle',
                                ]}
                              >
                                {cat.count}
                              </span>
                            </a>

                            {cat.subcategories.length > 0 && (
                              <ul class="border-border ml-3 flex flex-col gap-0.5 border-l pl-2">
                                {cat.subcategories.map((sub) => {
                                  const isSubActive =
                                    activeTypeSlug === entry.type.slug &&
                                    activeSubcategorySlug === sub.category.slug;
                                  return (
                                    <li>
                                      <a
                                        href={getProjectSubcategoryArchiveUrl(
                                          entry.type.slug,
                                          cat.category.slug,
                                          sub.category,
                                          locale
                                        )}
                                        class:list={[
                                          'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                                          isSubActive
                                            ? 'bg-brand-500 text-white'
                                            : 'text-foreground-muted hover:bg-brand-500/10 hover:text-brand-700 dark:hover:text-brand-400',
                                        ]}
                                        aria-current={isSubActive ? 'page' : undefined}
                                      >
                                        <span class="min-w-0 flex-1 truncate">
                                          {sub.category.title}
                                        </span>
                                        <span
                                          class:list={[
                                            'text-xs transition-colors',
                                            isSubActive
                                              ? 'text-white/70'
                                              : 'text-foreground-subtle',
                                          ]}
                                        >
                                          {sub.count}
                                        </span>
                                      </a>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </details>
              </li>
            );
          })}
        </ul>
      </section>
    )
  }

  {
    tags.length > 0 && (
      <section class="projects-sidebar-section border-border bg-background rounded-xl border p-3">
        <h2 class="text-foreground-subtle mb-2 px-2 text-xs font-semibold tracking-wide uppercase">
          {t('blog.tagsLabel', locale)}
        </h2>
        <ul class="flex flex-col gap-1">
          {tags.map((tag: ProjectSidebarTag) => {
            const isActive = activeTag === tag.name;
            return (
              <li>
                <a
                  href={getProjectTagUrl(tag.name, locale)}
                  class:list={[
                    'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                    isActive
                      ? 'bg-brand-500 text-white'
                      : 'text-foreground-muted hover:bg-brand-500/10 hover:text-brand-700 dark:hover:text-brand-400',
                  ]}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    name="tag"
                    size="xs"
                    class:list={[
                      'shrink-0 transition-colors',
                      isActive ? 'text-white' : 'text-foreground-subtle',
                    ]}
                  />
                  <span class="min-w-0 flex-1 truncate">#{tag.name}</span>
                  <span
                    class:list={[
                      'text-xs transition-colors',
                      isActive ? 'text-white/70' : 'text-foreground-subtle',
                    ]}
                  >
                    {tag.count}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </section>
    )
  }
</aside>
```

- [ ] **Step 3: Crear `ProjectsTypeTabs.astro`**

```astro
---
/**
 * ProjectsTypeTabs — pestañas de tipos de proyecto. Muestra "Todos" seguido
 * de cada tipo (`project-types`) y enlaza a `/projects/<tipo>`. El tipo activo
 * se marca con estilo relleno de marca. Pure HTML — sin JS.
 */
import Icon from '@/components/ui/primitives/Icon/Icon.astro';
import { getProjectsBaseUrl, getProjectTypeUrl } from '@/lib/projects';
import { t, defaultLocale } from '@/i18n';
import type { ProjectType } from '@/lib/payload-types';

interface Props {
  projectTypes: ProjectType[];
  activeSlug?: string;
  locale?: string;
  class?: string;
}

const { projectTypes, activeSlug = '', locale = defaultLocale, class: extraClass } = Astro.props;
---

{
  projectTypes.length > 0 && (
    <ul
      class:list={['flex flex-wrap items-center justify-center gap-2', extraClass]}
      aria-label="Browse by project type"
    >
      <li>
        <a
          href={getProjectsBaseUrl(locale)}
          class:list={[
            'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors',
            activeSlug === ''
              ? 'border-brand-500 bg-brand-500 text-white'
              : 'border-brand-500/40 text-brand-700 dark:text-brand-400 hover:border-brand-500/80 bg-transparent',
          ]}
          aria-current={activeSlug === '' ? 'page' : undefined}
        >
          {t('projects.allProjects', locale)}
        </a>
      </li>

      {projectTypes.map((type) => {
        const isActive = activeSlug === type.slug;
        return (
          <li>
            <a
              href={getProjectTypeUrl(type.slug, locale)}
              class:list={[
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                isActive
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-brand-500/40 text-brand-700 dark:text-brand-400 hover:border-brand-500/80 bg-transparent',
              ]}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon name={type.icon || 'layers'} size="xs" />
              {type.title}
            </a>
          </li>
        );
      })}
    </ul>
  )
}
```

- [ ] **Step 4: Verificar compilación**

Run (en `website/`): `pnpm check`
Expected: pasa.

- [ ] **Step 5: Commit**

```bash
git add website/src/components/projects/ProjectsListLayout.astro website/src/components/projects/ProjectsSidebar.astro website/src/components/projects/ProjectsTypeTabs.astro
git commit -m "feat(website): projects list layout, sidebar and type tabs"
```

---

### Task 11: Website — `ProjectsArchiveView`

**Files:**
- Create: `website/src/components/projects/views/ProjectsArchiveView.astro`

**Interfaces:**
- Consumes: `ProjectArchive` (Task 8), URL helpers (Task 8), `ProjectCard` (Task 13), `ProjectsListLayout` (Task 10), i18n keys `projects.archive*`.
- Produces: vista de archivo jerárquico (tipo/categoría/subcategoría), usada por Task 9.

- [ ] **Step 1: Crear `ProjectsArchiveView.astro`**

```astro
---
/**
 * ProjectsArchiveView — archivo jerárquico de proyectos: tipo, categoría o
 * subcategoría. Espejo de `BlogArchiveView`. Renderiza dentro de
 * `ProjectsListLayout`, que provee la sidebar con el tipo/categoría activos.
 */
import ProjectsListLayout from '@/components/projects/ProjectsListLayout.astro';
import ProjectCard from '@/components/projects/ProjectCard.astro';
import Pagination from '@/components/blog/Pagination.astro';
import Badge from '@/components/ui/data-display/Badge/Badge.astro';
import Icon from '@/components/ui/primitives/Icon/Icon.astro';
import Button from '@/components/ui/form/Button/Button.astro';
import CTA from '@/components/ui/marketing/CTA/CTA.astro';
import LetterGlitchBand from '@/components/patterns/LetterGlitchBand.astro';
import { Hero } from '@/components/hero';
import { t, defaultLocale, localizedPath } from '@/i18n';
import {
  getProjectsBaseUrl,
  getProjectCategoryArchiveUrl,
  getProjectTypeUrl,
  getProjectSubcategoryArchiveUrl,
  PROJECTS_PER_PAGE,
} from '@/lib/projects';
import type { ProjectArchive } from '@/lib/projects';
import type { Project } from '@/lib/payload-types';

interface Props {
  locale?: string;
  archive: ProjectArchive;
  currentPage?: number;
}

const { locale = defaultLocale, archive, currentPage = 1 } = Astro.props;

if (archive.kind === 'not-found' || archive.kind === 'project' || !archive.projectType) {
  throw new Error('ProjectsArchiveView requires a type/category/subcategory archive');
}

const { projectType, category, subcategory } = archive;
const projects = (archive.projects ?? []) as Project[];
const totalDocs = archive.totalDocs ?? 0;
const totalPages = archive.totalPages ?? 1;

const heading = subcategory?.title ?? category?.title ?? projectType.title;
const archiveBaseUrl = subcategory
  ? getProjectSubcategoryArchiveUrl(projectType.slug, category!.slug, subcategory, locale)
  : category
    ? getProjectCategoryArchiveUrl(projectType.slug, category, locale)
    : getProjectTypeUrl(projectType.slug, locale);
const countKey = totalDocs === 1 ? 'projects.archiveCountOne' : 'projects.archiveCountOther';
const contactUrl = localizedPath('/contact', locale);
const aboutUrl = localizedPath('/about', locale);
---

<ProjectsListLayout
  title={`${heading} — ${t('projects.title', locale)}`}
  description={projectType.description || t('projects.metaDescription', locale)}
  locale={locale}
  eagerReveal
  activeTypeSlug={projectType.slug}
  activeCategorySlug={category?.slug}
  activeSubcategorySlug={subcategory?.slug}
>
  <Fragment slot="hero">
    <Hero layout="centered" size="sm">
      <Badge slot="badge" variant="brand" pill>
        <Icon name={projectType.icon || 'layers'} size="sm" />
        {projectType.title}
      </Badge>

      <h1
        slot="title"
        class="!text-4xl [overflow-wrap:anywhere] break-words sm:!text-5xl md:!text-6xl lg:!text-7xl"
      >
        {heading}
      </h1>

      <p slot="description">{projectType.description || t(countKey, locale, { count: totalDocs })}</p>
    </Hero>
  </Fragment>

  <nav
    aria-label="Breadcrumb"
    class="text-foreground-muted flex flex-wrap items-center gap-1.5 text-sm"
  >
    <a
      href={getProjectsBaseUrl(locale)}
      class="text-brand-700 dark:text-brand-400 font-medium hover:underline"
    >
      {t('projects.title', locale)}
    </a>
    <Icon name="chevron-right" size="xs" class="text-foreground-subtle" />
    <a
      href={getProjectTypeUrl(projectType.slug, locale)}
      class="text-brand-700 dark:text-brand-400 font-medium hover:underline"
    >
      {projectType.title}
    </a>
    {
      category && (
        <>
          <Icon name="chevron-right" size="xs" class="text-foreground-subtle" />
          <a
            href={getProjectCategoryArchiveUrl(projectType.slug, category, locale)}
            class="text-brand-700 dark:text-brand-400 font-medium hover:underline"
          >
            {category.title}
          </a>
        </>
      )
    }
    {
      subcategory && (
        <>
          <Icon name="chevron-right" size="xs" class="text-foreground-subtle" />
          <span class="text-foreground font-medium" aria-current="page">
            {subcategory.title}
          </span>
        </>
      )
    }
  </nav>

  {
    projects.length > 0 ? (
      <div class="grid gap-6 md:grid-cols-2">
        {projects.map((project, i) => (
          <ProjectCard project={project} index={i} locale={locale} />
        ))}
      </div>
    ) : (
      <div class="py-16 text-center">
        <div class="bg-background mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <Icon name="layers" size="lg" class="text-foreground-muted" />
        </div>
        <p class="text-foreground-muted text-lg">{t('projects.archiveEmpty', locale)}</p>
        <div class="mt-6">
          <Button href={getProjectsBaseUrl(locale)} variant="brand-outline" size="sm">
            <Icon name="arrow-left" size="sm" />
            {t('projects.allProjects', locale)}
          </Button>
        </div>
      </div>
    )
  }

  {
    projects.length > 0 && totalPages > 1 && (
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        href={(page) => (page <= 1 ? archiveBaseUrl : `${archiveBaseUrl}?page=${page}`)}
        totalDocs={totalDocs}
        pageSize={PROJECTS_PER_PAGE}
      />
    )
  }

  <Fragment slot="footer">
    <section class="bg-background relative z-10 py-[var(--space-section-md)]">
      <div class="glitch:hidden mx-auto max-w-2xl px-6 text-center" data-reveal>
        <Badge variant="brand" pill class="mb-6">
          <Icon name="message-circle" size="sm" />
          {t('projects.ctaBadge', locale)}
        </Badge>
        <h2 class="font-display text-foreground mb-4 text-4xl font-bold text-balance">
          {t('projects.ctaHeading', locale)}
        </h2>
        <p class="text-foreground-muted mb-8 text-lg text-balance">
          {t('projects.ctaLead', locale)}
        </p>
        <div class="flex flex-col justify-center gap-4 sm:flex-row">
          <Button size="lg" href={contactUrl} class="cta-btn-brand">
            {t('projects.ctaPrimary', locale)}
            <Icon name="arrow-right" size="sm" />
          </Button>
          <Button size="lg" variant="brand-outline" href={aboutUrl}>
            {t('projects.ctaSecondary', locale)}
            <Icon name="arrow-right" size="sm" />
          </Button>
        </div>
      </div>

      <LetterGlitchBand>
        <h2 class="font-display text-foreground mb-4 text-4xl font-bold text-balance">
          {t('projects.ctaHeading', locale)}
        </h2>
        <p class="text-foreground-muted mb-8 text-lg text-balance">
          {t('projects.ctaLead', locale)}
        </p>
        <div class="flex flex-col justify-center gap-4 sm:flex-row">
          <Button size="lg" href={contactUrl} class="hero-btn-brand">
            {t('projects.ctaPrimary', locale)}
            <Icon name="arrow-right" size="sm" />
          </Button>
          <Button size="lg" variant="outline" href={aboutUrl}>
            {t('projects.ctaSecondary', locale)}
            <Icon name="arrow-right" size="sm" />
          </Button>
        </div>
      </LetterGlitchBand>
    </section>
  </Fragment>
</ProjectsListLayout>
```

- [ ] **Step 2: Verificar compilación**

Run (en `website/`): `pnpm check`
Expected: pasa.

- [ ] **Step 3: Commit**

```bash
git add website/src/components/projects/views/ProjectsArchiveView.astro
git commit -m "feat(website): hierarchical projects archive view"
```

---

### Task 12: Website — Vistas de listado con sidebar

**Files:**
- Modify: `website/src/components/projects/views/ProjectsIndexView.astro`, `website/src/components/projects/views/ProjectsPageView.astro`, `website/src/components/projects/views/ProjectsTagView.astro`

**Interfaces:**
- Consumes: `ProjectsListLayout`, `ProjectsTypeTabs`, `ProjectsSidebar` (Task 10), helpers (Task 8).
- Produces: listados con sidebar; el tag cloud superior se elimina.

- [ ] **Step 1: Reescribir `ProjectsIndexView.astro`**

Reemplazar el contenido por:

```astro
---
/**
 * ProjectsIndexView — the projects landing page (page 1).
 *
 * Renders inside `ProjectsListLayout` (sidebar + type tabs). The tag cloud
 * moved to the sidebar; the type tabs sit above the grid.
 */
import ProjectsListLayout from '@/components/projects/ProjectsListLayout.astro';
import ProjectsTypeTabs from '@/components/projects/ProjectsTypeTabs.astro';
import ProjectCard from '@/components/projects/ProjectCard.astro';
import Pagination from '@/components/blog/Pagination.astro';
import Badge from '@/components/ui/data-display/Badge/Badge.astro';
import Icon from '@/components/ui/primitives/Icon/Icon.astro';
import Button from '@/components/ui/form/Button/Button.astro';
import { Hero } from '@/components/hero';
import LetterGlitchBand from '@/components/patterns/LetterGlitchBand.astro';
import { t, defaultLocale, localizedPath } from '@/i18n';
import { payload } from '@/lib/payload-client';
import {
  getProjectsPageUrl,
  PROJECTS_PER_PAGE,
} from '@/lib/projects';

interface Props {
  locale?: string;
}

const { locale = defaultLocale } = Astro.props;

const { docs, totalDocs, totalPages } = await payload
  .projects()
  .getPaginated(locale, 1, PROJECTS_PER_PAGE);

const projectTypes = await payload.projectTypes().getAll(locale);

const pageProjects = docs;

const contactUrl = localizedPath('/contact', locale);
const aboutUrl = localizedPath('/about', locale);
---

<ProjectsListLayout
  title={t('projects.metaTitle', locale)}
  description={t('projects.metaDescription', locale)}
  locale={locale}
  eagerReveal
  footerBackground="secondary"
>
  <Fragment slot="hero">
    <Hero layout="centered" size="sm" class="isolate" showHeroHalo>
      <Badge slot="badge" variant="brand" pill>
        <Icon name="layers" size="sm" />
        {t('projects.heroBadge', locale)}
      </Badge>

      <h1 slot="title">{t('projects.title', locale)}</h1>

      <p slot="description">
        {t('projects.heroDescription', locale)}
      </p>
    </Hero>
  </Fragment>

  {
    pageProjects.length > 0 && (
      <>
        <ProjectsTypeTabs projectTypes={projectTypes} activeSlug="" locale={locale} class="justify-center" />

        <div class="grid gap-6 md:grid-cols-2">
          {pageProjects.map((project, i) => (
            <ProjectCard project={project} index={i} locale={locale} />
          ))}
        </div>

        <Pagination
          currentPage={1}
          totalPages={totalPages}
          href={(p) => getProjectsPageUrl(p, locale)}
          totalDocs={totalDocs}
          pageSize={PROJECTS_PER_PAGE}
        />
      </>
    )
  }

  <Fragment slot="footer">
    <section class="bg-background relative z-10 py-[var(--space-section-md)]">
      <div class="glitch:hidden mx-auto max-w-2xl px-6 text-center" data-reveal>
        <Badge variant="brand" pill class="mb-6">
          <Icon name="message-circle" size="sm" />
          {t('projects.ctaBadge', locale)}
        </Badge>
        <h2 class="font-display text-foreground mb-4 text-4xl font-bold text-balance">
          {t('projects.ctaHeading', locale)}
        </h2>
        <p class="text-foreground-muted mb-8 text-lg text-balance">
          {t('projects.ctaLead', locale)}
        </p>
        <div class="flex flex-col justify-center gap-4 sm:flex-row">
          <Button size="lg" href={contactUrl} class="cta-btn-brand">
            {t('projects.ctaPrimary', locale)}
            <Icon name="arrow-right" size="sm" />
          </Button>
          <Button size="lg" variant="brand-outline" href={aboutUrl}>
            {t('projects.ctaSecondary', locale)}
            <Icon name="arrow-right" size="sm" />
          </Button>
        </div>
      </div>

      <LetterGlitchBand>
        <h2 class="font-display text-foreground mb-4 text-4xl font-bold text-balance">
          {t('projects.ctaHeading', locale)}
        </h2>
        <p class="text-foreground-muted mb-8 text-lg text-balance">
          {t('projects.ctaLead', locale)}
        </p>
        <div class="flex flex-col justify-center gap-4 sm:flex-row">
          <Button size="lg" href={contactUrl} class="hero-btn-brand">
            {t('projects.ctaPrimary', locale)}
            <Icon name="arrow-right" size="sm" />
          </Button>
          <Button size="lg" variant="outline" href={aboutUrl}>
            {t('projects.ctaSecondary', locale)}
            <Icon name="arrow-right" size="sm" />
          </Button>
        </div>
      </LetterGlitchBand>
    </section>
  </Fragment>
</ProjectsListLayout>
```

- [ ] **Step 2: Reescribir `ProjectsPageView.astro`**

Reemplazar el contenido por:

```astro
---
/**
 * ProjectsPageView — a paginated projects index page (page 2..N).
 * Renders inside `ProjectsListLayout` (sidebar); the tag cloud moved to the
 * sidebar.
 */
import ProjectsListLayout from '@/components/projects/ProjectsListLayout.astro';
import ProjectCard from '@/components/projects/ProjectCard.astro';
import Pagination from '@/components/blog/Pagination.astro';
import Badge from '@/components/ui/data-display/Badge/Badge.astro';
import Icon from '@/components/ui/primitives/Icon/Icon.astro';
import Button from '@/components/ui/form/Button/Button.astro';
import { Hero } from '@/components/hero';
import LetterGlitchBand from '@/components/patterns/LetterGlitchBand.astro';
import { t, defaultLocale, localizedPath } from '@/i18n';
import { payload } from '@/lib/payload-client';
import { getProjectsPageUrl, PROJECTS_PER_PAGE } from '@/lib/projects';

interface Props {
  locale?: string;
  page: number;
}

const { locale = defaultLocale, page } = Astro.props;

const { docs, totalDocs, totalPages } = await payload
  .projects()
  .getPaginated(locale, page, PROJECTS_PER_PAGE);

const pageProjects = docs;

const contactUrl = localizedPath('/contact', locale);
const aboutUrl = localizedPath('/about', locale);
---

<ProjectsListLayout
  title={t('projects.pageMetaTitle', locale, { page })}
  description={t('projects.pageMetaDescription', locale, { page, total: totalPages })}
  locale={locale}
  eagerReveal
  footerBackground="secondary"
>
  <Fragment slot="hero">
    <Hero layout="centered" size="sm" class="isolate" showHeroHalo>
      <Badge slot="badge" variant="brand" pill>
        <Icon name="layers" size="sm" />
        {t('projects.pageBadge', locale, { page, total: totalPages })}
      </Badge>

      <h1 slot="title">{t('projects.title', locale)}</h1>

      <p slot="description">
        {t('projects.heroDescription', locale)}
      </p>
    </Hero>
  </Fragment>

  {
    pageProjects.length > 0 && (
      <>
        <div class="grid gap-6 md:grid-cols-2">
          {pageProjects.map((project, i) => (
            <ProjectCard project={project} index={i} locale={locale} />
          ))}
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          href={(p) => getProjectsPageUrl(p, locale)}
          totalDocs={totalDocs}
          pageSize={PROJECTS_PER_PAGE}
        />
      </>
    )
  }

  <Fragment slot="footer">
    <section class="bg-background relative z-10 py-[var(--space-section-md)]">
      <div class="glitch:hidden mx-auto max-w-2xl px-6 text-center" data-reveal>
        <Badge variant="brand" pill class="mb-6">
          <Icon name="message-circle" size="sm" />
          {t('projects.ctaBadge', locale)}
        </Badge>
        <h2 class="font-display text-foreground mb-4 text-4xl font-bold text-balance">
          {t('projects.ctaHeading', locale)}
        </h2>
        <p class="text-foreground-muted mb-8 text-lg text-balance">
          {t('projects.ctaLead', locale)}
        </p>
        <div class="flex flex-col justify-center gap-4 sm:flex-row">
          <Button size="lg" href={contactUrl} class="cta-btn-brand">
            {t('projects.ctaPrimary', locale)}
            <Icon name="arrow-right" size="sm" />
          </Button>
          <Button size="lg" variant="brand-outline" href={aboutUrl}>
            {t('projects.ctaSecondary', locale)}
            <Icon name="arrow-right" size="sm" />
          </Button>
        </div>
      </div>

      <LetterGlitchBand>
        <h2 class="font-display text-foreground mb-4 text-4xl font-bold text-balance">
          {t('projects.ctaHeading', locale)}
        </h2>
        <p class="text-foreground-muted mb-8 text-lg text-balance">
          {t('projects.ctaLead', locale)}
        </p>
        <div class="flex flex-col justify-center gap-4 sm:flex-row">
          <Button size="lg" href={contactUrl} class="hero-btn-brand">
            {t('projects.ctaPrimary', locale)}
            <Icon name="arrow-right" size="sm" />
          </Button>
          <Button size="lg" variant="outline" href={aboutUrl}>
            {t('projects.ctaSecondary', locale)}
            <Icon name="arrow-right" size="sm" />
          </Button>
        </div>
      </LetterGlitchBand>
    </section>
  </Fragment>
</ProjectsListLayout>
```

- [ ] **Step 3: Reescribir `ProjectsTagView.astro`**

Reemplazar el contenido por:

```astro
---
/**
 * ProjectsTagView — a project tag archive page. Renders inside
 * `ProjectsListLayout` (sidebar with the active tag highlighted).
 */
import ProjectsListLayout from '@/components/projects/ProjectsListLayout.astro';
import ProjectCard from '@/components/projects/ProjectCard.astro';
import Badge from '@/components/ui/data-display/Badge/Badge.astro';
import Icon from '@/components/ui/primitives/Icon/Icon.astro';
import Button from '@/components/ui/form/Button/Button.astro';
import { Hero } from '@/components/hero';
import { t, defaultLocale } from '@/i18n';
import { getProjectsBaseUrl } from '@/lib/projects';

interface Props {
  locale?: string;
  tag: string;
  projects: any[];
  visibleTags: string[];
}

const { locale = defaultLocale, tag, projects } = Astro.props;

const projectsHref = getProjectsBaseUrl(locale);
const countKey = projects.length === 1 ? 'projects.tagCountOne' : 'projects.tagCountOther';
---

<ProjectsListLayout
  title={t('projects.tagMetaTitle', locale, { tag })}
  description={t('projects.tagMetaDescription', locale, { tag })}
  locale={locale}
  eagerReveal
  footerBackground="secondary"
  activeTag={tag}
>
  <Fragment slot="hero">
    <Hero layout="centered" size="sm">
      <Badge slot="badge" variant="brand" pill>
        <Icon name="tag" size="sm" />
        {t('projects.tagBadge', locale)}
      </Badge>

      <h1
        slot="title"
        class="!text-4xl [overflow-wrap:anywhere] break-words sm:!text-5xl md:!text-6xl lg:!text-7xl"
      >
        #{tag}
      </h1>

      <p slot="description">
        {t(countKey, locale, { count: projects.length, tag })}
      </p>
    </Hero>
  </Fragment>

  <a
    href={projectsHref}
    class="group border-brand-500/40 text-brand-700 dark:text-brand-400 hover:border-brand-500/80 hover:bg-brand-500/10 inline-flex w-fit items-center gap-2 rounded-lg border bg-transparent px-4 py-2 text-sm font-medium transition-colors"
  >
    <Icon name="arrow-left" size="sm" />
    {t('projects.allProjects', locale)}
  </a>

  {
    projects.length > 0 ? (
      <div class="grid gap-6 md:grid-cols-2">
        {projects.map((project, i) => (
          <ProjectCard project={project} index={i} locale={locale} />
        ))}
      </div>
    ) : (
      <div class="py-16 text-center">
        <div class="bg-background mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <Icon name="layers" size="lg" class="text-foreground-muted" />
        </div>
        <p class="text-foreground-muted text-lg">{t('projects.tagEmpty', locale)}</p>
        <div class="mt-6">
          <Button href={projectsHref} variant="brand-outline" size="sm">
            <Icon name="arrow-left" size="sm" />
            {t('projects.tagBackToAll', locale)}
          </Button>
        </div>
      </div>
    )
  }

  <Fragment slot="footer">
    <section class="bg-background relative z-10 py-[var(--space-section-md)]">
      <div class="glitch:hidden mx-auto max-w-2xl px-6 text-center" data-reveal>
        <Badge variant="brand" pill class="mb-6">
          <Icon name="message-circle" size="sm" />
          {t('projects.ctaBadge', locale)}
        </Badge>
        <h2 class="font-display text-foreground mb-4 text-4xl font-bold text-balance">
          {t('projects.ctaHeading', locale)}
        </h2>
        <p class="text-foreground-muted mb-8 text-lg text-balance">
          {t('projects.ctaLead', locale)}
        </p>
        <div class="flex flex-col justify-center gap-4 sm:flex-row">
          <Button size="lg" href={localizedPath('/contact', locale)} class="cta-btn-brand">
            {t('projects.ctaPrimary', locale)}
            <Icon name="arrow-right" size="sm" />
          </Button>
          <Button size="lg" variant="brand-outline" href={localizedPath('/about', locale)}>
            {t('projects.ctaSecondary', locale)}
            <Icon name="arrow-right" size="sm" />
          </Button>
        </div>
      </div>
    </section>
  </Fragment>
</ProjectsListLayout>
```

> Nota: añadir `localizedPath` al import de `@/i18n` en ProjectsTagView.

- [ ] **Step 4: Verificar compilación**

Run (en `website/`): `pnpm check`
Expected: pasa.

- [ ] **Step 5: Commit**

```bash
git add website/src/components/projects/views/ProjectsIndexView.astro website/src/components/projects/views/ProjectsPageView.astro website/src/components/projects/views/ProjectsTagView.astro
git commit -m "feat(website): project listing views use the sidebar layout"
```

---

### Task 13: Website — `ProjectCard` con badges de tipo/categoría

**Files:**
- Modify: `website/src/components/projects/ProjectCard.astro`

**Interfaces:**
- Consumes: `getProjectTypeName`, `getProjectTypeIcon`, `getProjectCategory` (Task 8).
- Produces: tarjeta con badges de tipo (arriba-izquierda) y categoría (abajo-izquierda) sobre la imagen; se elimina la caja "layers".

- [ ] **Step 1: Reescribir `ProjectCard.astro`**

Reemplazar el contenido por:

```astro
---
/**
 * Project listing card. Extracted so the projects index, paginated pages,
 * and tag archives render identical cards from one source of truth.
 *
 * Shows a type badge (top-left) and category badge (bottom-left) over the
 * cover image, mirroring `BlogCard`.
 */
import Card from '@/components/ui/data-display/Card/Card.astro';
import Icon from '@/components/ui/primitives/Icon/Icon.astro';
import type { Project } from '@/lib/payload-types';
import { defaultLocale } from '@/i18n';
import {
  getProjectUrl,
  getTagName,
  getProjectTypeName,
  getProjectTypeIcon,
  getProjectCategory,
} from '@/lib/projects';
import { payload } from '@/lib/payload-client';
import { Image } from 'astro:assets';

interface Props {
  project: Project;
  index?: number;
  locale?: string;
}

const { project, index = 0, locale = defaultLocale } = Astro.props;

const typeName = getProjectTypeName(project);
const typeIcon = getProjectTypeIcon(project);
const category = getProjectCategory(project);
---

<Card
  variant="elevated"
  hover
  padding="none"
  href={getProjectUrl(project, locale)}
  class="group flex flex-col"
  data-reveal
  data-reveal-delay={index % 2 || undefined}
>
  <div class="flex flex-1 flex-col p-6">
    {
      project.coverImage && typeof project.coverImage !== 'number' && project.coverImage.url && (
        <div class="relative mb-4 overflow-hidden rounded-lg">
          {
            typeName && (
              <div class="bg-background/90 text-brand-700 dark:text-brand-400 ring-brand-500/40 absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 backdrop-blur-sm ring-inset">
                <Icon name={typeIcon} size="xs" />
                {typeName}
              </div>
            )
          }
          {
            category && (
              <div class="bg-background/90 text-foreground-muted ring-border/60 absolute bottom-3 left-3 z-10 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 backdrop-blur-sm ring-inset">
                {category.title}
              </div>
            )
          }
          <Image
            src={payload.resolveMediaUrl(project.coverImage.url)}
            alt={project.coverImage.alt || project.title}
            inferSize
            widths={[320, 640, 960]}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            class="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading={index < 2 ? 'eager' : 'lazy'}
          />
        </div>
      )
    }
    <div class="mb-2 flex items-baseline gap-2">
      <h3 class="font-display text-foreground text-lg font-bold">{project.title}</h3>
      {project.year && <span class="text-foreground-muted text-xs">{project.year}</span>}
    </div>
    <p class="text-foreground-muted mb-4 flex-1 text-sm leading-relaxed">
      {project.description || ''}
    </p>
    {
      (project.tags ?? []).length > 0 && (
        <div class="flex flex-wrap gap-1.5">
          {(project.tags ?? []).map((t) => (
            <span class="text-brand-700 dark:text-brand-400 ring-brand-500/40 group-hover:ring-brand-500/80 inline-flex items-center rounded-full bg-transparent px-2.5 py-0.5 text-xs font-medium ring-1 transition-colors ring-inset">
              #{getTagName(t)}
            </span>
          ))}
        </div>
      )
    }
  </div>
</Card>
```

- [ ] **Step 2: Verificar compilación**

Run (en `website/`): `pnpm check`
Expected: pasa.

- [ ] **Step 3: Commit**

```bash
git add website/src/components/projects/ProjectCard.astro
git commit -m "feat(website): project card type and category badges"
```

---

### Task 14: Website — `ProjectHero` adaptado a datos de Payload

**Files:**
- Modify: `website/src/components/projects/ProjectHero.astro`

**Interfaces:**
- Consumes: `projectToSlides` (Task 7), `getProjectTypeName`/`getProjectTypeIcon`/`getProjectCategory` (Task 8), `getTagName`, i18n `projects.viewLiveSite`/`projects.viewSource`.
- Produces: hero 2 columnas con carrusel de capturas, badges de tipo/categoría, botones traducidos. Usado por Task 16.

- [ ] **Step 1: Reescribir `ProjectHero.astro`**

Reemplazar el contenido por:

```astro
---
import type { Project } from '@/lib/payload-types';
import Button from '@/components/ui/form/Button/Button.astro';
import Icon from '@/components/ui/primitives/Icon/Icon.astro';
import ProjectCarousel from '@/components/projects/ProjectCarousel.astro';
import { projectToSlides, type GallerySlide } from '@/lib/gallery';
import HeroGrid from '@/components/effects/HeroGrid.astro';
import HeroBeam from '@/components/effects/HeroBeam.astro';
import { t, defaultLocale } from '@/i18n';
import {
  getProjectTypeIcon,
  getProjectTypeName,
  getProjectCategory,
} from '@/lib/projects';
import { getTagName } from '@/lib/content-helpers';

interface Props {
  project: Project;
  locale?: string;
}

const { project, locale = defaultLocale } = Astro.props;

const slides: GallerySlide[] = projectToSlides(project);
const hasMedia = slides.length > 0;
const tags = (project.tags ?? []).map((t) => getTagName(t)).filter(Boolean);
const meta = [project.client, project.year ? String(project.year) : ''].filter(Boolean);
const typeName = getProjectTypeName(project);
const typeIcon = getProjectTypeIcon(project);
const category = getProjectCategory(project);
---

<header
  class="relative isolate overflow-hidden pt-[var(--space-page-top-sm)] pb-[var(--space-section-md)]"
>
  <HeroGrid />
  <HeroBeam />

  <div class="relative z-10 mx-auto max-w-7xl px-6">
    <div
      class:list={[
        'grid items-center gap-10',
        'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14',
      ]}
    >
      <!-- Text column -->
      <div class="animate-hero-stagger min-w-0">
        {
          (typeName || category) && (
            <div class="mb-[var(--space-stack-sm)] flex flex-wrap items-center gap-2">
              {typeName && (
                <span class="border-brand-500/40 text-brand-700 dark:text-brand-400 ring-brand-500/40 inline-flex items-center gap-1.5 rounded-full border bg-transparent px-3 py-1 text-xs font-semibold ring-1 ring-inset">
                  <Icon name={typeIcon} size="xs" />
                  {typeName}
                </span>
              )}
              {category && (
                <span class="border-border text-foreground-muted inline-flex items-center rounded-full border bg-transparent px-3 py-1 text-xs font-medium ring-1 ring-inset">
                  {category.title}
                </span>
              )}
            </div>
          )
        }

        <h1
          class="font-display text-foreground mb-[var(--space-heading-gap)] text-4xl font-bold tracking-tight text-balance md:text-5xl lg:text-6xl"
        >
          {project.title}
        </h1>

        <p
          class="text-foreground-muted mb-[var(--space-stack-lg)] text-lg leading-relaxed md:text-xl"
        >
          {project.description}
        </p>

        {
          tags.length > 0 && (
            <div class="mb-[var(--space-stack-lg)] flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span class="text-brand-700 dark:text-brand-400 ring-brand-500/40 inline-flex items-center rounded-full bg-transparent px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset">
                  #{tag}
                </span>
              ))}
            </div>
          )
        }

        {
          meta.length > 0 && (
            <p class="text-foreground-muted mb-[var(--space-stack-lg)] flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              {meta.map((item, i) => (
                <>
                  {i > 0 && (
                    <span class="text-brand-500" aria-hidden="true">
                      ·
                    </span>
                  )}
                  <span>{item}</span>
                </>
              ))}
            </p>
          )
        }

        {
          (project.websiteUrl || project.sourceUrl) && (
            <div class="mb-[var(--space-stack-lg)] flex flex-wrap gap-3">
              {project.websiteUrl && (
                <Button
                  href={project.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="md"
                  class="project-live-btn"
                >
                  <Icon name="external-link" size="sm" />
                  {t('projects.viewLiveSite', locale)}
                </Button>
              )}
              {project.sourceUrl && (
                <Button
                  href={project.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="brand-outline"
                  size="md"
                >
                  <Icon name="github" size="sm" />
                  {t('projects.viewSource', locale)}
                </Button>
              )}
            </div>
          )
        }
      </div>

      <!-- Media column (carousel, single image, or branded placeholder) -->
      <div class="animate-hero-slide-up [animation-delay:300ms]">
        {
          hasMedia ? (
            <ProjectCarousel slides={slides} label={`${project.title} screenshots`} />
          ) : (
            <div
              class="border-border from-brand-500/20 via-brand-500/5 flex aspect-video w-full items-center justify-center rounded-xl border bg-gradient-to-br to-transparent shadow-lg"
              aria-hidden="true"
            >
              <Icon name="layers" size="lg" class="text-brand-500/60" />
            </div>
          )
        }
      </div>
    </div>
  </div>
</header>
```

- [ ] **Step 2: Verificar compilación**

Run (en `website/`): `pnpm check`
Expected: pasa.

- [ ] **Step 3: Commit**

```bash
git add website/src/components/projects/ProjectHero.astro
git commit -m "feat(website): ProjectHero consumes Payload project data"
```

---

### Task 15: Website — `ProjectCarousel` y `ProjectGallery` con slides remotos

**Files:**
- Modify: `website/src/components/projects/ProjectCarousel.astro`, `website/src/components/projects/ProjectGallery.astro`

**Interfaces:**
- Consumes: `GallerySlide` ampliado (Task 7).
- Produces: componentes que renderizan slides locales (`ImageMetadata`) y remotos (`string` + `inferSize`).

- [ ] **Step 1: Adaptar `ProjectCarousel.astro`**

En el bloque frontmatter, el cálculo de posters ya funciona con `getImage({ src: slide.poster, width: 1280 })` (acepta string remoto). Reemplazar el bloque de renderizado de imagen (líneas ~83-91) por:

```astro
            {isVideoSlide(slide) ? (
              <video
                class="aspect-video w-full object-cover"
                src={slide.video}
                poster={posters[i]?.src}
                controls
                playsinline
                preload="none"
                aria-label={slide.alt}
              />
            ) : typeof slide.src === 'string' ? (
              <Image
                src={slide.src}
                alt={slide.alt}
                inferSize
                widths={[640, 960, 1280]}
                sizes="(max-width: 1024px) 100vw, 640px"
                class={imageClass}
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            ) : (
              <Image
                src={slide.src}
                alt={slide.alt}
                widths={[640, 960, 1280]}
                sizes="(max-width: 1024px) 100vw, 640px"
                class={imageClass}
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            )}
```

- [ ] **Step 2: Adaptar `ProjectGallery.astro`**

En el frontmatter, reemplazar el mapeo `slideData` (líneas ~21-31) por:

```typescript
const slideData = images.map((item, i) =>
  isVideoSlide(item)
    ? {
        type: 'video',
        src: item.video,
        poster: posters[i]?.src ?? '',
        alt: item.alt,
        caption: item.caption ?? '',
      }
    : {
        type: 'image',
        src: typeof item.src === 'string' ? item.src : item.src.src,
        alt: item.alt,
        caption: item.caption ?? '',
      }
);
```

Y en el renderizado del track (líneas ~60-67), reemplazar el `<Image>` por:

```astro
              {typeof item.src === 'string' ? (
                <Image
                  src={item.src}
                  alt={item.alt}
                  inferSize
                  class="aspect-video w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <Image
                  src={item.src}
                  alt={item.alt}
                  class="aspect-video w-full object-cover"
                  loading="lazy"
                />
              )}
```

- [ ] **Step 3: Verificar compilación**

Run (en `website/`): `pnpm check`
Expected: pasa.

- [ ] **Step 4: Commit**

```bash
git add website/src/components/projects/ProjectCarousel.astro website/src/components/projects/ProjectGallery.astro
git commit -m "feat(website): carousel and gallery support remote Payload slides"
```

---

### Task 16: Website — `ProjectLayout` (breadcrumb jerárquico, hero, galería, relacionados)

**Files:**
- Modify: `website/src/layouts/ProjectLayout.astro`

**Interfaces:**
- Consumes: `ProjectHero` (Task 14), `ProjectGallery` (Task 15), `getRelatedByTopic` (Task 8), `getProjectTypeName`/`getProjectCategory` (Task 8), i18n `projects.relatedProjects`.
- Produces: detalle con hero visual, breadcrumb jerárquico, galería con lightbox, relacionados por tema y CTA actual.

- [ ] **Step 1: Reescribir `ProjectLayout.astro`**

Reemplazar el contenido por:

```astro
---
/**
 * ProjectLayout — article body for CMS-driven portfolio projects.
 *
 * Uses `ProjectHero` (2-column hero with a screenshot carousel), a
 * hierarchical breadcrumb (Portafolio → Tipo → Categoría → Subcategoría),
 * the content, `ProjectGallery` (carousel + lightbox), related projects by
 * topic, and the closing CTA.
 */
import siteConfig from '@/config/site.config';
import type { Project } from '@/lib/payload-types';
import { t, localizedPath } from '@/i18n';
import { extractHeadings } from '@/lib/headings';
import Breadcrumbs from '@/components/seo/Breadcrumbs.astro';
import TableOfContents from '@/components/blog/TableOfContents.astro';
import RichText from '@/components/blocks/RichText.astro';
import Button from '@/components/ui/form/Button/Button.astro';
import Icon from '@/components/ui/primitives/Icon/Icon.astro';
import CTA from '@/components/ui/marketing/CTA/CTA.astro';
import ProjectHero from '@/components/projects/ProjectHero.astro';
import ProjectGallery from '@/components/projects/ProjectGallery.astro';
import { projectToSlides } from '@/lib/gallery';
import {
  getProjectTypeName,
  getProjectTypeUrl,
  getProjectCategory,
  getProjectCategoryArchiveUrl,
  getProjectSubcategoryArchiveUrl,
  getRelatedByTopic,
} from '@/lib/projects';

interface Props {
  project: Project;
  locale?: string;
}

const { project, locale = 'es' } = Astro.props;

const tocConfig = siteConfig.articleFeatures?.toc;
const showToc = project.toc === 'enabled' || (!!tocConfig?.enabled && project.toc !== 'disabled');
const tocLayout = tocConfig?.layout ?? 'auto';
const sidebarActive = showToc && (tocLayout === 'sidebar' || tocLayout === 'auto');
const inlineActive = showToc && tocLayout === 'inline';
const sidebarOnLeft = (tocConfig?.sidebarPosition ?? 'right') === 'left';

const headings = extractHeadings(project.content);

const typeName = getProjectTypeName(project);
const category = getProjectCategory(project);

const breadcrumbs = [
  { label: t('common.home', locale), href: localizedPath('/', locale) },
  { label: t('projects.title', locale), href: localizedPath('/projects', locale) },
];
if (typeName && typeof project.projectType === 'object' && project.projectType) {
  breadcrumbs.push({
    label: typeName,
    href: getProjectTypeUrl(project.projectType.slug, locale),
  });
}
if (category && typeof project.projectType === 'object' && project.projectType) {
  if (category.parent && typeof category.parent === 'object') {
    breadcrumbs.push({
      label: category.parent.title,
      href: getProjectCategoryArchiveUrl(project.projectType.slug, category.parent, locale),
    });
    breadcrumbs.push({
      label: category.title,
      href: getProjectSubcategoryArchiveUrl(
        project.projectType.slug,
        category.parent.slug,
        category,
        locale
      ),
    });
  } else {
    breadcrumbs.push({
      label: category.title,
      href: getProjectCategoryArchiveUrl(project.projectType.slug, category, locale),
    });
  }
}
breadcrumbs.push({ label: project.title });

const gallerySlides = projectToSlides(project).filter((s) => !('video' in s));

const related = await getRelatedByTopic(project.slug, locale, 3);
---

<ProjectHero project={project} locale={locale} />

<article class="pt-8 pb-[var(--space-section-md)]">
  <div
    class:list={[
      'mx-auto max-w-7xl px-6',
      sidebarActive &&
        (sidebarOnLeft
          ? 'xl:grid xl:grid-cols-[15rem_minmax(0,1fr)] xl:gap-10'
          : 'xl:grid xl:grid-cols-[minmax(0,1fr)_15rem] xl:gap-10'),
    ]}
  >
    {
      sidebarActive && sidebarOnLeft && (
        <aside class="hidden xl:block" aria-label={t('blog.tableOfContents', locale)}>
          <TableOfContents
            headings={headings}
            maxDepth={tocConfig?.maxDepth ?? 3}
            minHeadings={tocConfig?.minHeadings ?? 3}
            sticky
          />
        </aside>
      )
    }

    <div class:list={['mx-auto w-full max-w-4xl min-w-0', sidebarActive && 'xl:mx-0']}>
      <Breadcrumbs items={breadcrumbs} class="mb-8" />

      {
        sidebarActive && (
          <div class="mb-10 xl:hidden">
            <TableOfContents
              headings={headings}
              maxDepth={tocConfig?.maxDepth ?? 3}
              minHeadings={tocConfig?.minHeadings ?? 3}
              collapsible
            />
          </div>
        )
      }

      {
        inlineActive && (
          <div class="border-border bg-background-secondary mb-10 rounded-xl border p-5">
            <TableOfContents
              headings={headings}
              maxDepth={tocConfig?.maxDepth ?? 3}
              minHeadings={tocConfig?.minHeadings ?? 3}
            />
          </div>
        )
      }

      {
        project.content && (
          <div class="sm:border-border sm:bg-card sm:rounded-xl sm:border sm:p-8 lg:p-10">
            <div class="prose prose-lg dark:prose-invert max-w-none">
              <RichText content={project.content} />
            </div>
          </div>
        )
      }

      {
        gallerySlides.length > 0 && (
          <div class="mt-10">
            <ProjectGallery images={gallerySlides} />
          </div>
        )
      }

      <footer class="border-border mt-12 flex justify-center border-t pt-8">
        <Button href={localizedPath('/projects', locale)} variant="brand-outline" size="sm">
          <Icon name="arrow-left" size="sm" />
          {t('projects.backToProjects', locale)}
        </Button>
      </footer>
    </div>

    {
      sidebarActive && !sidebarOnLeft && (
        <aside class="hidden xl:block" aria-label={t('blog.tableOfContents', locale)}>
          <TableOfContents
            headings={headings}
            maxDepth={tocConfig?.maxDepth ?? 3}
            minHeadings={tocConfig?.minHeadings ?? 3}
            sticky
          />
        </aside>
      )
    }
  </div>
</article>

{
  related.length > 0 && (
    <section class="bg-background-secondary border-border border-t py-[var(--space-section-md)]">
      <div class="mx-auto max-w-6xl px-6">
        <h2 class="font-display text-foreground mb-8 text-center text-2xl font-bold">
          {t('projects.relatedProjects', locale)}
        </h2>
        <div class="grid gap-6 md:grid-cols-3">
          {related.map((p) => (
            <a
              href={localizedPath(`/projects/${p.slug}`, locale)}
              class="group bg-background border-border hover:border-brand-500/40 rounded-xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              {p.year && <span class="text-foreground-muted text-xs font-semibold">{p.year}</span>}
              <h3 class="font-display text-foreground group-hover:text-brand-500 mt-1 font-bold transition-colors">
                {p.title}
              </h3>
              {p.description && <p class="text-foreground-muted mt-2 text-sm">{p.description}</p>}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

<CTA variant="default" size="md" maxWidth="lg" glow={false} data-reveal>
  <h2 slot="heading">{t('projects.ctaHeading', locale)}</h2>
  <p slot="description" class="text-balance">{t('projects.ctaLead', locale)}</p>
  <div slot="actions" class="flex flex-wrap items-center justify-center gap-3">
    <Button href={localizedPath('/contact', locale)} variant="primary" size="md">
      {t('projects.ctaPrimary', locale)}
    </Button>
    <Button href={localizedPath('/about', locale)} variant="brand-outline" size="md">
      {t('projects.ctaSecondary', locale)}
    </Button>
  </div>
</CTA>
```

> Nota: `ProjectGallery` recibe `images` como `GalleryItem[]`. `gallerySlides` ya es `(GalleryImageSlide | GalleryRemoteImageSlide)[]` (los slides de video se filtran), y `GalleryItem = GallerySlide & { caption?: string }` — asignable directamente (caption opcional).

- [ ] **Step 2: Verificar compilación**

Run (en `website/`): `pnpm check`
Expected: pasa.

- [ ] **Step 3: Commit**

```bash
git add website/src/layouts/ProjectLayout.astro
git commit -m "feat(website): ProjectLayout with hero, hierarchical breadcrumb, gallery and related by topic"
```

---

### Task 17: Website — i18n (es/en/nl)

**Files:**
- Modify: `website/src/i18n/es.json`, `website/src/i18n/en.json`, `website/src/i18n/nl.json`

**Interfaces:**
- Consumes: claves usadas por Tasks 10-16.
- Produces: claves `projects.sidebarTypes`, `projects.sidebarToggle`, `projects.archiveCountOne`, `projects.archiveCountOther`, `projects.archiveEmpty`, `projects.relatedProjects`.

- [ ] **Step 1: Añadir claves en `es.json`**

Dentro del objeto `projects` (tras `"tagBackToAll"`, línea ~144), añadir:

```json
    "sidebarTypes": "Tipos de proyecto",
    "sidebarToggle": "Explorar proyectos",
    "archiveCountOne": "{count} proyecto en esta sección.",
    "archiveCountOther": "{count} proyectos en esta sección.",
    "archiveEmpty": "No se encontraron proyectos en esta sección.",
    "relatedProjects": "Proyectos relacionados"
```

- [ ] **Step 2: Añadir claves en `en.json`**

Dentro del objeto `projects` (tras `"tagBackToAll"`, línea ~144), añadir:

```json
    "sidebarTypes": "Project types",
    "sidebarToggle": "Browse projects",
    "archiveCountOne": "{count} project in this section.",
    "archiveCountOther": "{count} projects in this section.",
    "archiveEmpty": "No projects found in this section.",
    "relatedProjects": "Related projects"
```

- [ ] **Step 3: Añadir claves en `nl.json`**

Dentro del objeto `projects`, añadir las mismas claves (el locale `nl` está desactivado pero los archivos se mantienen en paso):

```json
    "sidebarTypes": "Projecttypen",
    "sidebarToggle": "Projecten verkennen",
    "archiveCountOne": "{count} project in deze sectie.",
    "archiveCountOther": "{count} projecten in deze sectie.",
    "archiveEmpty": "Geen projecten gevonden in deze sectie.",
    "relatedProjects": "Gerelateerde projecten"
```

- [ ] **Step 4: Verificar**

Run (en `website/`): `pnpm check`
Expected: pasa (los tests de i18n validan que las claves existan en todos los locales).

- [ ] **Step 5: Commit**

```bash
git add website/src/i18n/es.json website/src/i18n/en.json website/src/i18n/nl.json
git commit -m "feat(website): i18n keys for projects taxonomy"
```

---

### Task 18: Website — `component-registry.json`

**Files:**
- Modify: `website/component-registry.json`

**Interfaces:**
- Consumes: componentes creados en Tasks 10-11.
- Produces: registro actualizado.

- [ ] **Step 1: Añadir los componentes nuevos**

Tras la entrada de `ProjectsTagView` (o donde agrupe los componentes de proyectos), añadir entradas para:

- `ProjectsListLayout` (layout de listado con sidebar)
- `ProjectsSidebar` (navegación lateral de proyectos)
- `ProjectsTypeTabs` (pestañas de tipos)
- `ProjectsArchiveView` (archivo jerárquico)

Sigue el formato JSON de las entradas existentes (categoría, propósito, props). Ejemplo:

```json
{
  "name": "ProjectsListLayout",
  "category": "projects",
  "description": "Layout de listado de proyectos con sidebar de navegación (tipos/categorías/etiquetas).",
  "props": ["locale", "title", "description", "activeTypeSlug", "activeCategorySlug", "activeSubcategorySlug", "activeTag", "eagerReveal", "footerBackground"]
}
```

- [ ] **Step 2: Commit**

```bash
git add website/component-registry.json
git commit -m "docs(website): register new projects components"
```

---

### Task 19: Verificación final — build completo

**Files:**
- N/A (verificación)

**Interfaces:**
- Consumes: todas las tareas anteriores.

- [ ] **Step 1: Build del monorepo**

Run (en la raíz): `pnpm build`
Expected: backend (Next.js + Payload) y website (Astro) compilan sin errores.

- [ ] **Step 2: Verificación manual en el navegador**

Con `pnpm dev` en la raíz (backend en :3000, website en :4321), comprobar:
- `/projects` muestra la sidebar con tipos/categorías/etiquetas y las pestañas de tipos.
- `/projects/desarrollo-web` muestra el archivo de tipo.
- `/projects/desarrollo-web/e-commerce` muestra el archivo de categoría.
- `/projects/desarrollo-web/e-commerce/tiendas` (si existe) muestra subcategoría.
- `/projects/pbx-nube-clinica` muestra el detalle con hero + carrusel + breadcrumb jerárquico + galería + relacionados por tema.
- `/projects/tag/voip` muestra el archivo de etiqueta con la sidebar.
- `/en/projects` y `/en/projects/desarrollo-web` funcionan.

- [ ] **Step 3: Commit final si hay ajustes**

```bash
git add -A
git commit -m "chore: final verification for projects taxonomy"
```

---

## Self-Review

**Cobertura de la spec:**
- Backend colecciones `project-types`/`project-categories` → Tasks 1-2 ✓
- Campos `projectType`/`categories` en `projects` + `defaultPopulate` → Task 3 ✓
- Migración + tipos regenerados → Task 4 ✓
- Seed con tipos/categorías y asignación → Task 5 ✓
- Cliente API (queries) → Task 6 ✓
- `lib/gallery.ts` remoto + `projectToSlides` → Task 7 ✓
- `lib/projects.ts` (URLs, archive, sidebar, related) + tests → Task 8 ✓
- Routing catch-all → Task 9 ✓
- `ProjectsListLayout`/`ProjectsSidebar`/`ProjectsTypeTabs` → Task 10 ✓
- `ProjectsArchiveView` → Task 11 ✓
- Vistas Index/Page/Tag con sidebar → Task 12 ✓
- `ProjectCard` badges → Task 13 ✓
- `ProjectHero` adaptado → Task 14 ✓
- `ProjectCarousel`/`ProjectGallery` remotos → Task 15 ✓
- `ProjectLayout` (breadcrumb, hero, galería, relacionados) → Task 16 ✓
- i18n es/en/nl → Task 17 ✓
- `component-registry.json` → Task 18 ✓
- Build final → Task 19 ✓

**Placeholders:** ninguno; cada paso incluye código concreto.

**Consistencia de tipos:** `ProjectType`/`ProjectCategory` (generados) se usan consistentemente en Tasks 6-8; `GallerySlide` ampliado en Task 7 se consume en Tasks 14-16; `getRelatedByTopic`/`rankRelatedProjects` firmas consistentes entre Tasks 8 y 16.