# Proyectos — Taxonomía tipo → categoría → etiquetas (Design Spec)

**Fecha**: 2026-08-25
**Versión**: 1.0
**Estado**: Diseño aprobado para implementación
**Referencia**: Patrón del blog (`docs/superpowers/specs/2026-08-20-blog-navigation-and-features-design.md`)

---

## 1. Alcance y Objetivos

### 1.1 Propósito
Adaptar la sección de proyectos del website al patrón de organización del blog: **tipo de proyecto → categoría de proyecto (con subcategorías) → etiquetas de proyecto**. Esto incluye cambios en el backend (colecciones y campos), en el cliente API del website, en el routing, en las vistas de listado y en la página de detalle.

### 1.2 Objetivos
- Organizar el portafolio con una taxonomía jerárquica de 3 ejes (tipo, categoría, etiqueta) idéntica a la del blog.
- Navegación lateral (sidebar) en los listados de proyectos, espejo de la del blog.
- Archivos jerárquicos por tipo/categoría/subcategoría con URLs limpias.
- Detalle de proyecto mejorado: hero visual con carrusel, galería con lightbox, breadcrumb jerárquico, badges de tipo/categoría, relacionados por tema.
- Reutilizar los componentes heredados del tema (`ProjectHero`, `ProjectCarousel`, `ProjectGallery`) adaptándolos a datos remotos de Payload. **No se elimina código.**

### 1.3 Fuera de Alcance
- El plan de mejora enterprise del CMS (`2026-08-24-payload-cms-features`).
- Cambios en los bloques del backend (Gallery, MediaBlock, MediaContent…). Los datos del detalle ya existen como campos directos en `projects`.
- `ProjectShowcase` (se mantiene el CTA de cierre actual).
- Rediseño de otras secciones (blog, services, home).

---

## 2. Arquitectura de Solución

### 2.1 Diagrama

```
Backend (Payload CMS)
├── project-types        🆕 colección (título, slug, descripción, icono, posición)
├── project-categories   🆕 colección (título, slug, parent → jerarquía 2 niveles)
└── projects             modificada (+ projectType, + categories; tags ya existe)

Website (Astro SSR)
├── payload-client.ts    + ProjectTypeQueries, ProjectCategoryQueries
│                        + getByType/getByCategory/getByTypeAndCategory/getByTypeAndCategories
├── lib/projects.ts      + resolveProjectArchive, computeProjectSidebarData,
│                        + URL helpers jerárquicos, rankRelatedProjects
├── lib/gallery.ts       + slide remoto { src: string; alt: string }
├── routing              /projects/[...slug] (catch-all) + /[locale]/projects/[...slug]
├── components           + ProjectsListLayout, ProjectsSidebar, ProjectsTypeTabs,
│                        + ProjectsArchiveView
│                        ~ ProjectHero, ProjectCarousel, ProjectGallery (adaptados a URLs remotas)
│                        ~ ProjectsIndexView, ProjectsPageView, ProjectsTagView (con sidebar)
└── layouts              ~ ProjectLayout (breadcrumb jerárquico, badges, relacionados por tema)
```

### 2.2 Flujo de datos

```
Editor crea Tipo de proyecto (p. ej. "Web") y Categorías (p. ej. "E-commerce" ← "Tiendas")
Editor crea/edita un Proyecto → asigna projectType + categories + tags
        │
        ▼
Payload REST API (depth 2) → website
        │
        ▼
/projects/<slug>                          → detalle (ProjectLayout)
/projects/<tipo>                          → archivo de tipo (ProjectsArchiveView)
/projects/<tipo>/<categoria>              → archivo de categoría (incluye subcategorías)
/projects/<tipo>/<categoria>/<subcategoria> → archivo de subcategoría
/projects/tag/<tag>                       → archivo de etiqueta (existente)
/projects/page/N                          → paginación (existente)
```

---

## 3. Especificación por Componente

### 3.1 Backend — Colección `project-types`

Espejo de `post-types` (`backend/src/collections/PostTypes.ts`).

| Campo | Tipo | Notas |
|---|---|---|
| `title` | text, localized, required | |
| `slug` | slugField (auto desde title) | `useAsSlug: 'title'`, `slugify` igual que Tags |
| `description` | textarea, localized | |
| `icon` | iconField | Icono Lucide |
| `position` | number, default 0 | Orden en pestañas/sidebar |

- `slug: 'project-types'`
- Labels: singular "Tipo de proyecto", plural "Tipos de proyecto"
- `admin.group: 'Content'`, `useAsTitle: 'title'`
- Access: `create/update/delete: authenticated`, `read: anyone`
- Hook `beforeDelete`: bloquear borrado si hay proyectos asignados (espejo de PostTypes, contando en `projects` por `projectType`).
- `admin.description`: "Formato del proyecto (web, telecomunicaciones, marketing…). Es un eje aparte de la categoría."

### 3.2 Backend — Colección `project-categories`

Espejo de `categories` (`backend/src/collections/Categories.ts`).

| Campo | Tipo | Notas |
|---|---|---|
| `title` | text, localized, required | |
| `parent` | relationship → self | Vacío = raíz; con padre = subcategoría |
| `slug` | slugField | |

- `slug: 'project-categories'`
- Labels: singular "Categoría de proyecto", plural "Categorías de proyecto"
- `admin.group: 'Content'`, `useAsTitle: 'title'`
- Access: `create/update/delete: authenticated`, `read: anyone`
- `admin.description`: "Jerarquía de dos niveles: categoría raíz y subcategoría."

### 3.3 Backend — Colección `projects` (modificar)

Añadir dos campos en la pestaña "Meta" (sidebar):

| Campo | Tipo | Notas |
|---|---|---|
| `projectType` | relationship → `project-types`, **required** | Espejo de `postType` en posts |
| `categories` | relationship → `project-categories`, única | Espejo de `categories` en posts |

- `tags` se mantiene sin cambios.
- `defaultPopulate` ampliar para incluir `projectType` y `categories`.

### 3.4 Backend — Registro y Seed

- Registrar `ProjectTypes` y `ProjectCategories` en `payload.config.ts` (array `collections`).
- `src/scripts/seed.ts`: crear tipos/categorías de ejemplo (p. ej. Web, Telecomunicaciones, Marketing Digital) y asignar `projectType`/`categories` a los proyectos existentes cuando haya datos compatibles.

### 3.5 Website — `payload-client.ts`

- Nuevas clases `ProjectTypeQueries` y `ProjectCategoryQueries` (espejo de `PostTypeQueries`/`CategoryQueries`), con `getAll` (ordenados por `position` / con `parent`).
- Exponer `projectTypes()` y `projectCategories()` en `PayloadClient`.
- En `ProjectQueries` añadir (espejo de `PostQueries`):
  - `getByType(projectTypeId, locale, page, limit)`
  - `getByCategory(categoryId, locale, page, limit)`
  - `getByTypeAndCategory(projectTypeId, categoryId, locale, page, limit)`
  - `getByTypeAndCategories(projectTypeId, categoryIds[], locale, page, limit)` (operador `in` para incluir subcategorías)

### 3.6 Website — `lib/projects.ts`

Espejo de `lib/blog.ts`:

- URLs:
  - `getProjectTypeUrl(typeSlug, locale)` → `/projects/<tipo>`
  - `getProjectCategoryArchiveUrl(typeSlug, category, locale)` → `/projects/<tipo>/<categoria>`
  - `getProjectSubcategoryArchiveUrl(typeSlug, rootSlug, subcategory, locale)` → `/projects/<tipo>/<categoria>/<subcategoria>`
- `resolveProjectArchive(segments, locale, page)`:
  - 1 segmento: primero busca proyecto por slug → `{ kind: 'project', project }`; si no, tipo → `{ kind: 'type', ... }`; si no → `not-found`.
  - 2 segmentos: tipo + categoría raíz → `{ kind: 'category', ... }` (incluye posts del subárbol vía `getByTypeAndCategories`).
  - 3 segmentos: tipo + categoría + subcategoría (hija de la categoría) → `{ kind: 'subcategory', ... }`.
  - `ProjectArchive` interface (kind: 'project' | 'type' | 'category' | 'subcategory' | 'not-found').
- Sidebar: `computeProjectSidebarData(projectTypes, categories, projects)` + `getProjectSidebarData(locale)` (espejo de `computeSidebarData`/`getBlogSidebarData`; reutiliza `getCategoryChildren`, `getCategorySubtreeIds`).
- `getProjectTypeName`, `getProjectTypeIcon`, `getProjectCategory` (espejo de los de blog).
- `rankRelatedProjects(projects, currentSlug, typeSlug, categoryId, tags)` — ordena por coincidencias de tipo + categoría + etiquetas; `getRelatedByTopic(currentSlug, locale, max)`.
- Mantener los helpers existentes (`getProjectUrl`, `getProjectsPageUrl`, `getProjectTagUrl`, `collectProjectTags`, etc.).

### 3.7 Website — `lib/gallery.ts`

- Añadir `GalleryRemoteImageSlide { src: string; alt: string }` y `GalleryRemoteVideoSlide { video: string; poster: string; alt: string }`.
- Ampliar `GallerySlide` a la unión local + remota. `isVideoSlide` sigue funcionando.
- Helper `projectToSlides(project): GallerySlide[]` — construye slides desde `coverImage` + `gallery` de un `Project` de Payload (URLs resueltas con `payload.resolveMediaUrl`).

### 3.8 Website — Routing

- Reemplazar `/projects/[slug].astro` por `/projects/[...slug].astro` (catch-all), espejo de `/blog/[...slug].astro`:
  - `resolveProjectArchive(segments, defaultLocale, page)`.
  - Si `kind === 'project'` → `ProjectLayout`; si no → `ProjectsArchiveView`.
- Ídem `/[locale]/projects/[slug].astro` → `/[locale]/projects/[...slug].astro`.
- `/projects/tag/<tag>` y `/projects/page/N` (y sus variantes localizadas) se mantienen intactos: en Astro, las rutas estáticas ganan al catch-all.

### 3.9 Website — Componentes nuevos (espejo del blog)

**`ProjectsListLayout.astro`** (espejo de `BlogListLayout.astro`):
- Props: `locale`, `title`, `description`, `activeTypeSlug`, `activeCategorySlug`, `activeSubcategorySlug`, `activeTag`, `eagerReveal`, `footerBackground`.
- Renderiza slot `hero` + grid 2 columnas `lg:grid-cols-[16rem_minmax(0,1fr)]` con `ProjectsSidebar` a la izquierda y contenido en slot por defecto + toggle móvil (checkbox + label, sin JS) + slot `footer`.
- Obtiene datos con `getProjectSidebarData(locale)`.

**`ProjectsSidebar.astro`** (espejo de `BlogSidebar.astro`):
- Nav: enlace "Portafolio" (índice) + "Todos los proyectos".
- Sección tipos: acordeones `<details>` con icono + título + contador, categorías y subcategorías anidadas con contadores (enlaces a archivos jerárquicos).
- Sección etiquetas: lista con contador (enlaces a `/projects/tag/<tag>`).
- Estado activo con estilo `bg-brand-500 text-white`.

**`ProjectsTypeTabs.astro`** (espejo de `BlogTypeTabs.astro`):
- Pestañas "Todos" + tipos (icono + título), enlazan a `/projects/<tipo>`.

**`ProjectsArchiveView.astro`** (espejo de `BlogArchiveView.astro`):
- Hero centrado con badge de tipo (icono) o categoría, título = tipo/categoría/subcategoría, descripción = `type.description` o conteo.
- Breadcrumb: Portafolio → Tipo → Categoría → (Subcategoría).
- Grid de `ProjectCard`, paginación (query param `?page=`), estado vacío con botón "Todos los proyectos".
- Footer CTA (mantener el CTA de proyectos actual).

### 3.10 Website — Vistas modificadas

- `ProjectsIndexView`, `ProjectsPageView`, `ProjectsTagView` → usar `ProjectsListLayout` + `ProjectsSidebar`. El **tag cloud de arriba se elimina** (pasa a la sidebar). En el index se añade `ProjectsTypeTabs` sobre el grid.
- `ProjectCard` → alinearla a `BlogCard`:
  - Badge de **tipo** (icono + nombre) arriba-izquierda sobre la imagen.
  - Badge de **categoría** abajo-izquierda sobre la imagen.
  - Quitar la caja de icono genérico "layers".
  - Mantener cliente/año, descripción y etiquetas.

### 3.11 Website — `ProjectLayout` (detalle)

- **Breadcrumb jerárquico**: Home → Portafolio → Tipo → Categoría → (Subcategoría) → Título.
- **`ProjectHero` adaptado** reemplaza el header actual:
  - Alimentado con datos de Payload: `title`, `description`, `meta=[client, year]`, `url=websiteUrl`, `repo=sourceUrl`, `gallery` (cover + galería vía `projectToSlides`), `tags`.
  - Traducir botones hardcodeados ("View live site"/"View source") a i18n.
  - Badge de tipo/categoría bajo el título.
- **`ProjectGallery` adaptado** reemplaza la grilla 2-col actual de la galería: carrusel + lightbox con slides remotos.
- **Relacionados por tema**: `getRelatedByTopic` (tipo + categoría + etiquetas), no los 3 primeros.
- `ProjectShowcase` **no se usa**; se mantiene el CTA de cierre actual.

### 3.12 Website — `ProjectCarousel` y `ProjectGallery` (adaptación)

- `ProjectCarousel`: aceptar slides remotos (`src: string` + `inferSize` en `<Image>`); mantener soporte de video y el script existente.
- `ProjectGallery`: aceptar slides remotos; el lightbox ya usa `<img>` nativo con URLs, funciona sin cambios de script.

### 3.13 i18n

Nuevas claves en `es.json`, `en.json` y `nl.json` (los tres en paso):

```
projects.sidebarTypes      "Tipos de proyecto" / "Project types"
projects.sidebarToggle     "Explorar proyectos" / "Browse projects"
projects.archiveCountOne   "{count} proyecto en esta sección." / "{count} project in this section."
projects.archiveCountOther "{count} proyectos en esta sección." / "{count} projects in this section."
projects.archiveEmpty      "No se encontraron proyectos en esta sección." / "No projects found in this section."
projects.relatedProjects   "Proyectos relacionados" / "Related projects"
projects.typeBadge         (opcional, si el hero lo necesita)
projects.categoryBadge     (opcional)
```

### 3.14 Tests (Vitest)

Nuevos suites en `website/src/__tests__/` espejo del blog:
- `projects-archive.test.ts` — resolución de archivos (tipo/categoría/subcategoría, proyecto plano, not-found).
- `projects-sidebar.test.ts` — árbol de tipos→categorías→subcategorías con conteos y etiquetas.
- `projects-urls.test.ts` — URLs jerárquicas y localizadas.
- `projects-related.test.ts` — ranking de relacionados por tipo/categoría/etiquetas.

### 3.15 Registro

- Actualizar `website/component-registry.json` con los componentes nuevos.

---

## 4. Archivos Afectados

### Backend
| Archivo | Acción |
|---|---|
| `backend/src/collections/ProjectTypes.ts` | 🆕 Nuevo |
| `backend/src/collections/ProjectCategories.ts` | 🆕 Nuevo |
| `backend/src/collections/Projects/index.ts` | Modificar (projectType, categories, defaultPopulate) |
| `backend/src/payload.config.ts` | Modificar (registrar colecciones) |
| `backend/src/scripts/seed.ts` | Modificar (tipos/categorías de ejemplo + asignar) |

### Website
| Archivo | Acción |
|---|---|
| `website/src/lib/payload-client.ts` | Modificar |
| `website/src/lib/projects.ts` | Modificar |
| `website/src/lib/gallery.ts` | Modificar |
| `website/src/lib/payload-types.ts` | Regenerar (`pnpm generate:types`) |
| `website/src/pages/projects/[slug].astro` → `[...slug].astro` | Renombrar + reescribir |
| `website/src/pages/[locale]/projects/[slug].astro` → `[...slug].astro` | Renombrar + reescribir |
| `website/src/components/projects/views/ProjectsIndexView.astro` | Modificar |
| `website/src/components/projects/views/ProjectsPageView.astro` | Modificar |
| `website/src/components/projects/views/ProjectsTagView.astro` | Modificar |
| `website/src/components/projects/views/ProjectsArchiveView.astro` | 🆕 Nuevo |
| `website/src/components/projects/ProjectCard.astro` | Modificar |
| `website/src/components/projects/ProjectHero.astro` | Modificar (datos remotos + i18n) |
| `website/src/components/projects/ProjectCarousel.astro` | Modificar (slides remotos) |
| `website/src/components/projects/ProjectGallery.astro` | Modificar (slides remotos) |
| `website/src/components/projects/ProjectsListLayout.astro` | 🆕 Nuevo |
| `website/src/components/projects/ProjectsSidebar.astro` | 🆕 Nuevo |
| `website/src/components/projects/ProjectsTypeTabs.astro` | 🆕 Nuevo |
| `website/src/layouts/ProjectLayout.astro` | Modificar |
| `website/src/i18n/es.json`, `en.json`, `nl.json` | Modificar |
| `website/src/__tests__/*` | 🆕 Nuevos tests |
| `website/component-registry.json` | Modificar |

---

## 5. Decisiones de Diseño (registradas)

| Decisión | Opción elegida | Motivo |
|---|---|---|
| Colecciones de taxonomía | **Nuevas dedicadas** (`project-types`, `project-categories`) | No mezclar datos con el blog; labels/descripciones propias |
| Forma de la taxonomía | **Espejo exacto del blog** (1 tipo obligatorio + 1 categoría 2 niveles + N etiquetas) | Consistencia y reutilización de patrones |
| Navegación de listados | **Sidebar completa** (tipos→categorías→subcategorías + etiquetas) | Consistencia con el blog |
| Detalle | **Breadcrumb + badges + relacionados por tema** | Mejora UX y SEO |
| Datos existentes | **Seed de tipos/categorías + asignar** | Demo rápida |
| Componentes heredados | **Adaptar, no eliminar** | Reutilizar el diseño del tema |
| `ProjectShowcase` | **No usar**; mantener CTA actual | Requería campos light/dark; opción 1 (repurpose) vs 2 (campos) → se eligió mantener CTA |

---

## 6. Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Proyectos sin `projectType` (required) rompen el detalle | Media | Alto | Seed asigna a los existentes; fallback en `getProjectTypeName`/`getProjectTypeIcon` si la relación no viene poblada |
| Colisión de URL proyecto vs tipo (1 segmento) | Baja | Medio | El catch-all resuelve proyecto primero (regla del blog) |
| Migración de tipos del blog a proyectos | N/A | — | Colecciones separadas, sin migración |
| Regenerar `payload-types.ts` desincroniza el website | Media | Medio | Ejecutar `pnpm generate:types` tras cambiar el backend |

---

## 7. Documentación Asociada

| Documento | Ubicación |
|---|---|
| Spec del blog (patrón base) | `docs/superpowers/specs/2026-08-20-blog-navigation-and-features-design.md` |
| Website AGENTS | `website/AGENTS.md` |
| Backend AGENTS | `backend/AGENTS.md` |

---

*Fin de la especificación de diseño*