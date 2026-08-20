# Auditoría del sistema de blog — Viptel Comunicaciones

Fecha: 2026-08-16
Alcance: Backend (Payload CMS) + Website (Astro SSR) — todo lo relacionado con el blog.
Estado: Informe de análisis. Pendiente de decidir qué puntos se implementan.

> Nota: las correcciones 2 y 3 ya implementadas (tipo + categoría en hero del detalle
> y en tarjetas de relacionados) están fuera de este informe.

---

## 🔴 Críticos — cosas que hoy no funcionan o lastiman el SEO

| # | Problema | Evidencia |
|---|---|---|
| 1 | **Sitemap vacío para el blog** — todo es SSR (`prerender=false`) con `output:'server'`, y `@astrojs/sitemap()` solo emite rutas prerendered. Google no descubrirá posts vía sitemap. | `website/astro.config.mjs:109`, todas las rutas `[locale]/blog/*` |
| 2 | **Búsqueda (Pagefind) no indexa el blog** — el hook indexa el directorio de build, donde no existe HTML de rutas SSR. El botón de buscar del header no encontrará posts. | `website/astro.config.mjs:22-38`, `website/src/components/layout/SearchModal.astro` |
| 3 | **OG image de posts rota** — `og/blog/[slug].svg.ts` usa `getCollection('blog')` de una colección MDX que **no existe** (`src/content` solo tiene `pages/.gitkeep`). Todos los posts caen a `og-default.svg`. | `website/src/pages/og/blog/[slug].svg.ts:7` |
| 4 | **Preview de drafts no funciona** — `/api/preview.ts` setea la cookie `__prv` pero **nadie la lee**; ninguna ruta consulta con `draft=true` (el parámetro existe en `payload-client.ts:60` pero no se usa en blog). | `website/src/pages/api/preview.ts`, `website/src/pages/api/exit-preview.ts`, grep `__prv` |
| 5 | **URLs SEO del admin mal** — `generateURL` del seoPlugin genera `${url}/${slug}` sin prefijo `/blog` para posts (solo `services` tiene prefijo). | `backend/src/plugins/index.ts:15-19` |

---

## 🟠 SEO / i18n — mejoras de consistencia

- **hreflang riesgoso**: `SEO.astro` asume que el slug es idéntico es/en. Si falta una traducción, el `alternate` apunta a 404. El blog no pasa `localeAlternates`.
- **RSS solo en `es`**, con trailing slash en los links (`/blog/<slug>/`) y sin feed por idioma.
  - `website/src/pages/rss.xml.ts:22,29`
- **Aria-labels hardcodeadas en inglés** fuera de i18n:
  - `website/src/components/blog/BlogTypeTabs.astro:27` → "Browse by post type"
  - `website/src/components/blog/TagList.astro:27` → "Browse by tag"
- **Backend sin localizar**: labels de PostTypes en español fijo y mensaje del `beforeDelete` en español, mientras el resto del backend es es/en.
  - `backend/src/collections/PostTypes.ts:18-21` y `:39-41`

---

## 🟡 Rendimiento — llamadas REST redundantes

- **N+1 en el detalle**: `PostLayout` hace un `getBySlug` por cada `relatedPosts` manual + `getRelatedByTags` (que dispara un `getAll` completo). Son ~3-4 llamadas a Payload por visita.
  - `website/src/layouts/PostLayout.astro:92-107`
- **`BlogArchiveView` repite** `getPublishedPosts` + `postTypes.getAll`, aunque el catch-all ya los resolvió.
  - `website/src/components/blog/views/BlogArchiveView.astro`
- **Índice/páginas**: cada vista hace 3 llamadas (`getPaginated` + `getAll` para tags + `postTypes.getAll`).
  - `website/src/components/blog/views/BlogIndexView.astro`, `BlogPageView.astro`

---

## ⚪ Código muerto / legacy (limpieza segura)

- `BlogLayout.astro` (layout MDX legacy) sin importadores. Solo un comentario en `Comments.astro:9` lo menciona.
- Colección MDX `blog` huérfana en `content.config.ts` (schema completo, 0 archivos).
- `getPageUrl` en `website/src/lib/content-helpers.ts:73` sin ningún uso.
- Prop `featured` de `BlogCard` sin consumidor con el blog CMS.
- Comentario obsoleto sobre `getStaticPaths` en `BlogPageView.astro:6-8` (la ruta es SSR).
- `Comments.astro` (dispatcher Giscus/Cusdis/Artalk) no se renderiza en posts reales; `site.config.ts` tiene `articleFeatures.comments.enabled: false`.

---

## 🟢 Adaptaciones de producto (opcionales — decisión del cliente)

1. **Dos esquemas de paginación**: índice usa `/blog/page/N` (path), archivos usan `?page=N` (query). Unificarlos mejora UX y SEO.
   - `website/src/components/blog/Pagination.astro`, `BlogArchiveView.astro:164`, rutas `blog/page/[page].astro`
2. **`/blog/{categoria}` (categoría sin tipo)** hoy da 404 — se podría soportar listando posts de esa categoría a través de todos los tipos.
   - `resolveBlogArchive` en `website/src/lib/blog.ts:101-141` exige siempre un `postType`.
3. **Comentarios**: los componentes (Giscus/Cusdis/Artalk) existen pero no se renderizan en posts reales; está desactivado en `site.config.ts`.
4. **Newsletter/lead magnet**: hay RESEND + AUDIENCE_ID configurado, pero el CTA del blog (`followAlong`) solo ofrece RSS/social/mailto. Falta el formulario de captura.
   - `website/src/layouts/PostLayout.astro:229-259`, env `RESEND_*` en `astro.config.mjs`
5. **Filtros combinados** (tipo + categoría + tag simultáneos) y búsqueda visible si se arregla Pagefind.

---

## Referencias rápidas de arquitectura (contexto)

- **Rutas blog (SSR)**: `/blog`, `/blog/page/N`, `/blog/tag/<slug>`, y catch-all `/blog/[...slug]` que resuelve post vs archivo (tipo / categoría / subcategoría).
- **Resolución de archivos** (`website/src/lib/blog.ts`): 1 segmento → post gana → tipo → 404; 2 → tipo + categoría raíz; 3 → tipo + categoría + subcategoría hija; >3 → 404.
- **API**: `website/src/lib/payload-client.ts` (REST, depth=2, locale, sort `-publishedAt`, `_status=published`).
- **Backend**: colecciones `Posts`, `PostTypes`, `Categories` (jerarquía `parent`), `Tags`. Access `authenticatedOrPublished`. Seed: 20 posts, 4 tipos, 3 raíces + 7 subcategorías, ~26 tags.
- **Datos poblados en la API** (depth 2): `postType`, `categories` (con `parent`), `tags`, `heroImage`, `authors`.

---

## Ideas propias del cliente (pendiente)

> Espacio reservado para la lista de correcciones/adecuaciones que el cliente tiene en mente.

- _(pendiente)_