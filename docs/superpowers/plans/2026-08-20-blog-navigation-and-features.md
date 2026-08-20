# Blog: Navegación lateral + Funcionalidad + Sección Home — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganizar la navegación del blog con un menú lateral izquierdo, añadir redes de compartir, activar comentarios Giscus, mejorar el feed RSS y unificar las tarjetas del blog en el home — sin tocar el backend ni el esquema de Payload.

**Architecture:** Los listados del blog (landing, paginadas, archivos de tipo/categoría/subcategoría y tags) pasan a usar un layout compartido `BlogListLayout` que renderiza un `BlogSidebar` sticky a la izquierda (acordeones `<details>` + etiquetas con contador) y el contenido a la derecha. El sidebar se calcula en SSR desde `getPublishedPosts`, `postTypes().getAll` y `categories().getAll`. La interacción es 100% HTML nativa (sin JS) usando `<details>` y checkbox+label para el toggle móvil. El detalle del post conserva su layout actual.

**Tech Stack:** Astro 7 SSR, Tailwind CSS v4, Vitest (unit), Playwright (e2e), Payload CMS REST client.

## Global Constraints

- **NO tocar el backend ni el esquema de Payload** (colecciones, campos, bloques). Solo frontend `website/`.
- Textos visibles → `src/i18n/es.json` y `src/i18n/en.json` (ambos deben ir a la par; `nl.json` no existe en el repo).
- Usar componentes UI existentes (Badge, Icon, Button, CTA, BlogCard) y design tokens (nunca hex hardcodeado salvo los ya existentes).
- Interacción sin JS salvo que sea imprescindible; respetar `prefers-reduced-motion`.
- Verificación final: `pnpm build` en `website/` + `pnpm test` + `pnpm test:e2e` (Playwright).
- Enlaces localizados con `localizedPath` / helpers de `lib/blog` (default locale sin prefijo).

---

### Task 1: Helpers de sidebar en `lib/blog.ts`

**Files:**
- Modify: `website/src/lib/blog.ts` (añadir al final)
- Test: `website/src/__tests__/blog-sidebar.test.ts`

**Interfaces:**
- Produces (usadas por Tasks 2–4):
  - `export interface SidebarType { type: PostType; count: number; categories: SidebarCategory[] }`
  - `export interface SidebarCategory { category: Category; count: number; subcategories: SidebarSubcategory[] }`
  - `export interface SidebarSubcategory { category: Category; count: number }`
  - `export interface SidebarTag { name: string; slug: string; count: number }`
  - `export interface BlogSidebarData { types: SidebarType[]; tags: SidebarTag[] }`
  - `export function getCategoryChildren(categoryId: number, categories: Category[]): Category[]`
  - `export function computeSidebarData(postTypes: PostType[], categories: Category[], posts: Post[]): BlogSidebarData`
  - `export async function getBlogSidebarData(locale?: string): Promise<BlogSidebarData>`

**Reglas de conteo (documentadas en código):**
- `SidebarType.count` = nº de posts cuyo `postType` es ese tipo.
- Por cada tipo, `categories` = categorías raíz usadas por posts de ese tipo. `count` de una raíz = posts de ese tipo cuya categoría es la raíz **o** una subcategoría hija.
- `SidebarCategory.subcategories` = subcategorías (categorías con `parent` = raíz) usadas por posts de ese tipo. `count` = posts de ese tipo cuya categoría es esa subcategoría.
- `tags` = agregación de `getTagName(t)` por post; `slug = tagToSlug(name)`; ordenadas por `count` desc, luego nombre asc.

- [ ] **Step 1: Escribir test fallido**

`website/src/__tests__/blog-sidebar.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { computeSidebarData, getCategoryChildren } from '@/lib/blog'
import type { Category, Post, PostType } from '@/lib/payload-types'

const typeA = { id: 1, title: 'Noticias', slug: 'noticias', icon: 'newspaper', position: 0 } as PostType
const typeB = { id: 2, title: 'Guías', slug: 'guias', icon: 'book-open', position: 1 } as PostType

const root1 = { id: 10, title: 'Redes', slug: 'redes' } as Category
const root2 = { id: 11, title: 'Web', slug: 'web' } as Category
const sub1 = { id: 20, title: 'LAN', slug: 'lan', parent: 10 } as Category

const post = (id: number, type: PostType, cat?: Category, tags: string[] = []) =>
  ({ id, title: `Post ${id}`, slug: `post-${id}`, postType: type, categories: cat, tags: tags.map((t) => ({ id: Math.random(), name: t, slug: t })) }) as unknown as Post

describe('blog sidebar helpers', () => {
  it('getCategoryChildren returns direct children of a root', () => {
    const cats = [root1, root2, sub1]
    const children = getCategoryChildren(10, cats)
    expect(children).toEqual([sub1])
    expect(getCategoryChildren(11, cats)).toEqual([])
  })

  it('computeSidebarData groups roots and counts posts per type', () => {
    const posts = [
      post(1, typeA, root1, ['VoIP']),
      post(2, typeA, sub1, ['LAN']),
      post(3, typeB, root2),
    ]
    const data = computeSidebarData([typeA, typeB], [root1, root2, sub1], posts)
    const tA = data.types.find((t) => t.type.slug === 'noticias')!
    expect(tA.count).toBe(2)
    expect(tA.categories[0].category.slug).toBe('redes')
    expect(tA.categories[0].count).toBe(2)
    expect(tA.categories[0].subcategories[0].category.slug).toBe('lan')
    expect(tA.categories[0].subcategories[0].count).toBe(1)
    expect(data.types.find((t) => t.type.slug === 'guias')!.categories[0].category.slug).toBe('web')
  })

  it('computeSidebarData aggregates tags with counts, sorted by count desc', () => {
    const posts = [
      post(1, typeA, root1, ['VoIP', 'LAN']),
      post(2, typeA, root1, ['VoIP']),
    ]
    const data = computeSidebarData([typeA], [root1], posts)
    expect(data.tags).toEqual([
      { name: 'VoIP', slug: 'voip', count: 2 },
      { name: 'LAN', slug: 'lan', count: 1 },
    ])
  })

  it('ignores posts whose type is not in the list', () => {
    const posts = [post(1, typeA, root1)]
    const data = computeSidebarData([typeB], [root1], posts)
    expect(data.types).toEqual([])
  })
})
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `pnpm test blog-sidebar`
Expected: FAIL — `computeSidebarData` / `getCategoryChildren` no exportados.

- [ ] **Step 3: Implementar helpers**

Añadir a `website/src/lib/blog.ts` (al final, tras `getRelatedByTags`):

```ts
export interface SidebarType {
  type: PostType
  count: number
  categories: SidebarCategory[]
}
export interface SidebarCategory {
  category: Category
  count: number
  subcategories: SidebarSubcategory[]
}
export interface SidebarSubcategory {
  category: Category
  count: number
}
export interface SidebarTag {
  name: string
  slug: string
  count: number
}
export interface BlogSidebarData {
  types: SidebarType[]
  tags: SidebarTag[]
}

export function getCategoryChildren(categoryId: number, categories: Category[]): Category[] {
  return categories.filter((c) => {
    if (!c.parent) return false
    return typeof c.parent === 'object' ? c.parent.id === categoryId : c.parent === categoryId
  })
}

function postTypeSlugOf(post: Post): string {
  return typeof post.postType === 'object' && post.postType ? post.postType.slug : ''
}

function postCategoryOf(post: Post): Category | null {
  return typeof post.categories === 'object' && post.categories ? post.categories : null
}

export function computeSidebarData(
  postTypes: PostType[],
  categories: Category[],
  posts: Post[],
): BlogSidebarData {
  const roots = categories.filter((c) => !c.parent)
  const typeSlugs = new Set(postTypes.map((t) => t.slug))

  const types = postTypes
    .map((type) => {
      const typePosts = posts.filter((p) => postTypeSlugOf(p) === type.slug)
      const categoryCounts = new Map<number, number>()
      const subcategoryCounts = new Map<number, number>()
      for (const p of typePosts) {
        const cat = postCategoryOf(p)
        if (!cat) continue
        const parentId =
          typeof cat.parent === 'object' && cat.parent ? cat.parent.id : (cat.parent as number | undefined)
        if (parentId !== undefined) {
          subcategoryCounts.set(cat.id, (subcategoryCounts.get(cat.id) ?? 0) + 1)
          categoryCounts.set(parentId, (categoryCounts.get(parentId) ?? 0) + 1)
        } else {
          categoryCounts.set(cat.id, (categoryCounts.get(cat.id) ?? 0) + 1)
        }
      }
      const categoriesForType = roots
        .filter((root) => categoryCounts.has(root.id))
        .map((root) => {
          const children = getCategoryChildren(root.id, categories).filter(
            (sub) => subcategoryCounts.has(sub.id) || typePosts.some((p) => postCategoryOf(p)?.id === sub.id),
          )
          return {
            category: root,
            count: categoryCounts.get(root.id) ?? 0,
            subcategories: children.map((sub) => ({
              category: sub,
              count: subcategoryCounts.get(sub.id) ?? 0,
            })),
          }
        })
        .sort((a, b) => a.category.title.localeCompare(b.category.title))
      return { type, count: typePosts.length, categories: categoriesForType }
    })
    .filter((t) => t.count > 0 || typeSlugs.has(t.type.slug))

  const tagCounts = new Map<string, { name: string; count: number }>()
  for (const p of posts) {
    for (const t of p.tags ?? []) {
      const name = getTagName(t)
      if (!name) continue
      const entry = tagCounts.get(name) ?? { name, count: 0 }
      entry.count += 1
      tagCounts.set(name, entry)
    }
  }
  const tags = [...tagCounts.values()]
    .map(({ name, count }) => ({ name, slug: tagToSlug(name), count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

  return { types, tags }
}

export async function getBlogSidebarData(locale = defaultLocale): Promise<BlogSidebarData> {
  const [postTypes, categories, posts] = await Promise.all([
    payload.postTypes().getAll(locale),
    payload.categories().getAll(locale),
    getPublishedPosts(locale),
  ])
  return computeSidebarData(postTypes, categories, posts)
}
```

- [ ] **Step 4: Ejecutar test y verificar que pasa**

Run: `pnpm test blog-sidebar`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add website/src/lib/blog.ts website/src/__tests__/blog-sidebar.test.ts
git commit -m "feat(blog): sidebar data helpers with type/category/tag counts"
```

---

### Task 2: Componente `BlogSidebar`

**Files:**
- Create: `website/src/components/blog/BlogSidebar.astro`

**Interfaces:**
- Consumes: `BlogSidebarData` (types/tags) de Task 1; `getPostTypeUrl`, `getCategoryArchiveUrl`, `getSubcategoryArchiveUrl`, `getTagUrl`, `getBlogBaseUrl` de `lib/blog`; `localizedPath`.
- Produces: usado por `BlogListLayout` (Task 3).

**Props:**
```ts
interface Props {
  locale?: string
  types: SidebarType[]
  tags: SidebarTag[]
  activeTypeSlug?: string
  activeCategorySlug?: string
  activeSubcategorySlug?: string
  activeTag?: string
}
```

- [ ] **Step 1: Crear componente**

`website/src/components/blog/BlogSidebar.astro` — estructura:

```
<aside class="blog-sidebar">  // CSS sticky en el layout
  <nav aria-label="Blog">
    // Enlace "Blog" (blog.title) → getBlogBaseUrl; activo si activeTypeSlug === '' (y sin tag)
    // Enlace "Todos los posts" (blog.allPosts) → getBlogBaseUrl
  </nav>

  // Tipos como acordeones
  <div class="blog-sidebar-section">
    <h2>Tipos</h2>
    {types.map((t) => (
      <details open={activeTypeSlug === t.type.slug}>
        <summary>
          <Icon name={t.type.icon || 'file-text'} size="sm" />
          <a href={getPostTypeUrl(t.type.slug, locale)}>{t.type.title}</a>
          <span class="count-badge">{t.count}</span>
          <chevron />
        </summary>
        <ul>
          {t.categories.map((cat) => (
            <li>
              <a href={getCategoryArchiveUrl(t.type.slug, cat.category, locale)} class:active>
                {cat.category.title} <span>{cat.count}</span>
              </a>
              {cat.subcategories.length > 0 && (
                <ul>
                  {cat.subcategories.map((sub) => (
                    <li><a href={getSubcategoryArchiveUrl(t.type.slug, cat.category.slug, sub.category, locale)}>{sub.category.title} <span>{sub.count}</span></a></li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </details>
    ))}
  </div>

  // Etiquetas con contador
  <div class="blog-sidebar-section">
    <h2>{t('blog.tagsLabel', locale)}</h2>
    {tags.length > 0 ? (
      <ul>
        {tags.map((tag) => (
          <li><a href={getTagUrl(tag.name, locale)} class:active>{#tag.name} <span>{tag.count}</span></a></li>
        ))}
      </ul>
    ) : null}
  </div>
</aside>
```

Detalles de implementación:
- Usar `activeTypeSlug`, `activeCategorySlug`, `activeSubcategorySlug`, `activeTag` para `aria-current="page"` y clase activa.
- El enlace "Blog" se marca activo solo en el landing (`activeTypeSlug === '' && !activeTag`); el enlace "Todos los posts" se marca activo en landing y paginadas (igual que "Blog").
- Estilos: columna `w-full` (el layout controla el ancho), secciones con `border`, `rounded-lg`, `bg-background`, lista de tags con `max-h` + scroll opcional. Sin hex hardcodeados: usar tokens (`--color-*` vía clases Tailwind existentes).
- `<details open>` para el tipo activo; el resto cerrado por defecto en móvil.
- Toggle móvil NO vive en este componente; lo gestiona `BlogListLayout`.

- [ ] **Step 2: `pnpm check`** — corregir errores de tipos si hay.
- [ ] **Step 3: Commit**

```bash
git add website/src/components/blog/BlogSidebar.astro
git commit -m "feat(blog): sidebar component with type accordions and tag counts"
```

---

### Task 3: Layout `BlogListLayout`

**Files:**
- Create: `website/src/layouts/BlogListLayout.astro`

**Interfaces:**
- Consumes: `getBlogSidebarData` (Task 1), `BlogSidebar` (Task 2), `PageLayout`.
- Produces: usado por las 4 vistas (Task 4).

**Props:**
```ts
interface Props {
  locale?: string
  title: string
  description: string
  activeTypeSlug?: string
  activeCategorySlug?: string
  activeSubcategorySlug?: string
  activeTag?: string
  showScrollProgress?: boolean
  eagerReveal?: boolean
  footerBackground?: string
}
```

- [ ] **Step 1: Crear layout**

`website/src/layouts/BlogListLayout.astro`:

```
---
const { locale = defaultLocale, title, description, activeTypeSlug, activeCategorySlug, activeSubcategorySlug, activeTag, showScrollProgress, eagerReveal, footerBackground } = Astro.props
const sidebarData = await getBlogSidebarData(locale)
---

<PageLayout title={title} description={description} showScrollProgress={showScrollProgress} eagerReveal={eagerReveal} footerBackground={footerBackground}>
  <slot name="hero" />

  <section class="bg-background-secondary py-[var(--space-section-md)] border-t border-border">
    <div class="mx-auto max-w-7xl px-6 grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
      {/* Móvil: toggle (checkbox + label) */}
      <input type="checkbox" id="blog-sidebar-toggle" class="peer sr-only" />
      <label for="blog-sidebar-toggle" class="lg:hidden inline-flex items-center gap-2 ...">
        <Icon name="menu" size="sm" /> {t('blog.sidebarToggle', locale)}
      </label>
      <div class="peer-checked:block hidden lg:block lg:sticky lg:top-24">
        <BlogSidebar
          locale={locale}
          types={sidebarData.types}
          tags={sidebarData.tags}
          activeTypeSlug={activeTypeSlug}
          activeCategorySlug={activeCategorySlug}
          activeSubcategorySlug={activeSubcategorySlug}
          activeTag={activeTag}
        />
      </div>
      <div class="min-w-0 flex flex-col gap-8">
        <slot />
      </div>
    </div>
  </section>

  <slot name="footer" />
</PageLayout>
```

Nota: `peer` requiere que el `<input>` y el contenedor compartan padre. Ajustar la estructura para que el `peer-checked` funcione (input y el div del sidebar deben ser hermanos). El slot de contenido no debe quedar oculto en móvil — siempre visible debajo del toggle.

- [ ] **Step 2: `pnpm check`**
- [ ] **Step 3: Commit**

```bash
git add website/src/layouts/BlogListLayout.astro
git commit -m "feat(blog): shared list layout with left sidebar"
```

---

### Task 4: Refactor de las 4 vistas de listado

**Files:**
- Modify: `website/src/components/blog/views/BlogIndexView.astro`
- Modify: `website/src/components/blog/views/BlogPageView.astro`
- Modify: `website/src/components/blog/views/BlogArchiveView.astro`
- Modify: `website/src/components/blog/views/BlogTagView.astro`

**Interfaces:**
- Consumes: `BlogListLayout` (Task 3).
- Produces: vistas con el menú lateral; se elimina el bloque de pestañas + nube de tags del top.

- [ ] **Step 1: `BlogIndexView`**

Reemplazar el `<PageLayout ...>` por `<BlogListLayout ...>` con:
- `slot="hero"`: el `Hero` actual (badge, título, descripción).
- default slot: solo el grid de `BlogCard` + `Pagination` (eliminar `BlogTypeTabs` + `TagList` del top, eliminar `getPublishedPosts`/`collectTopTags`/`BLOG_TAG_CLOUD_LIMIT` si quedan sin uso — el sidebar ya calcula tags).
- `slot="footer"`: el `CTA` + sección `LetterGlitchBand` actuales (sin cambios).
- Props del layout: `title`, `description`, `showScrollProgress`, `eagerReveal`, `footerBackground="secondary"`, `activeTypeSlug=""`.

- [ ] **Step 2: `BlogPageView`**

Igual que el anterior, con `activeTypeSlug=""` y `activeTag` vacío; conserva el enlace "Artículos recientes" (`blog.newestPosts`) sobre el grid. Eliminar el bloque `topTags` y `TagList` del top.

- [ ] **Step 3: `BlogArchiveView`**

- `<BlogListLayout>` con `activeTypeSlug={postType.slug}`, `activeCategorySlug={category?.slug}`, `activeSubcategorySlug={subcategory?.slug}`.
- `slot="hero"`: el `Hero` actual + el `nav` de breadcrumb (mover el breadcrumb dentro del hero o al inicio del slot contenido).
- default slot: el grid + paginación (eliminar `BlogTypeTabs` + `TagList` del top).
- `slot="footer"`: CTA + LetterGlitch.
- El sidebar se calcula dentro del layout (un solo fetch); la vista ya no necesita `getPublishedPosts`/`collectTopTags`/`BLOG_TAG_CLOUD_LIMIT`.

- [ ] **Step 4: `BlogTagView`**

- `<BlogListLayout>` con `activeTag={tag}`.
- default slot: grid + botón "Volver a todos los artículos" (conservar), eliminar `TagList` del top (el sidebar muestra el tag activo con su contador).
- `slot="footer"`: CTA + LetterGlitch.

- [ ] **Step 5: Limpieza**

Eliminar imports/consts sin uso en las 4 vistas. `BlogTypeTabs` y `TagList` quedan sin usar en listados (NO eliminar los archivos por si se reutilizan; solo dejar de importarlos). Verificar que `BLOG_TAG_CLOUD_LIMIT` sigue usándose en `src/pages/blog/tag/[tag].astro` y `src/pages/[locale]/blog/tag/[tag].astro` para `visibleTags` (los tags del sidebar los calcula el layout, pero `visibleTags` de la vista pasa a ser innecesario — simplificar a `tags` del sidebar; ver Task 4 Step 4).

- [ ] **Step 6: `pnpm check` + `pnpm test`** — deben pasar todos (incluye `blog-urls`, `blog-sidebar`).
- [ ] **Step 7: Commit**

```bash
git add website/src/components/blog/views/
git commit -m "refactor(blog): use shared sidebar layout in all listing views"
```

---

### Task 5: Botones de compartir (WhatsApp, Facebook, Telegram)

**Files:**
- Modify: `website/src/components/blog/ShareButtons.astro`

- [ ] **Step 1: Añadir redes**

En el objeto `shareLinks` y en el markup, añadir tras Bluesky (antes del botón de copiar):

```ts
whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
```

Añadir 3 `<a>` con el mismo estilo de botón circular (`bg-brand-500 text-white rounded-full h-9 w-9`), cada uno con `aria-label={t('blog.shareOn', locale, { platform: 'WhatsApp' })}` (y Facebook/Telegram) e iconos SVG inline:
- WhatsApp: SVG del logotipo (path estándar).
- Facebook: `M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z`
- Telegram: `M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z`

- [ ] **Step 2: `pnpm check`**
- [ ] **Step 3: Commit**

```bash
git add website/src/components/blog/ShareButtons.astro
git commit -m "feat(blog): add WhatsApp, Facebook and Telegram share buttons"
```

---

### Task 6: Activar comentarios Giscus

**Files:**
- Modify: `website/src/config/site.config.ts:286-288`

- [ ] **Step 1: Activar**

Cambiar `comments.enabled: false` → `true`. Mantener proveedor `giscus` y los placeholders (`repo: 'owner/repo'`, `repoId`, `categoryId`). El componente `CommentsGiscus` falla blando si la config está incompleta, así que no rompe mientras no haya IDs reales.

- [ ] **Step 2: Verificar** — `CommentsGiscus` se renderiza en `PostLayout`? Verificar dónde se monta y confirmar que al estar desconfigurado no pinta nada (isConfigured false → null). Si `PostLayout` no lo incluye, añadirlo tras el CTA con `<Comments />` (dispatcher). Revisar `Comments.astro` (dispatcher) y `PostLayout` antes de tocar.

- [ ] **Step 3: Commit**

```bash
git add website/src/config/site.config.ts
git commit -m "feat(blog): enable giscus comments provider"
```

---

### Task 7: Feed RSS mejorado + formulario de suscripción

**Files:**
- Create: `website/src/lib/rss.ts`
- Create: `website/src/pages/[locale]/rss.xml.ts`
- Modify: `website/src/pages/rss.xml.ts` (usar builder compartido)
- Create: `website/src/components/blog/EmailSubscribeForm.astro`
- Modify: `website/src/config/site.config.ts` (blog.rssMaxItems)
- Test: `website/src/__tests__/rss.test.ts`

**Interfaces:**
- `export function buildRssFeed(posts: Post[], siteUrl: string, locale?: string, maxItems?: number): string`
- `export function formatRfc822Date(date: Date): string`
- `export function escapeXml(text: string): string`
- Consumes: `payload.posts().getAll(locale)`, `getTagName`, `getPostTypeName`, `getPostCategory`, `payload.resolveMediaUrl`.

- [ ] **Step 1: Escribir test fallido** (`website/src/__tests__/rss.test.ts`)

```ts
import { describe, it, expect } from 'vitest'
import { buildRssFeed } from '@/lib/rss'
import type { Post, PostType, Category, Media } from '@/lib/payload-types'

const type = { id: 1, title: 'Noticias', slug: 'noticias' } as PostType
const cat = { id: 10, title: 'Redes', slug: 'redes' } as Category
const img = { id: 1, url: '/media/pic.png', alt: 'Pic' } as Media
const post = (id: number, extra: Partial<Post> = {}) =>
  ({ id, title: `Post ${id}`, slug: `post-${id}`, excerpt: 'Resumen', publishedAt: '2026-01-02T00:00:00Z', postType: type, categories: cat, tags: [{ id: 1, name: 'VoIP', slug: 'voip' }], ...extra }) as unknown as Post

describe('rss feed builder', () => {
  it('limits items to maxItems', () => {
    const posts = [post(1), post(2), post(3)]
    const xml = buildRssFeed(posts, 'https://viptel.com', 'es', 2)
    expect(xml.match(/<item>/g)!.length).toBe(2)
  })

  it('escapes xml special characters', () => {
    const xml = buildRssFeed([post(1, { title: 'A & B <C>' })], 'https://viptel.com')
    expect(xml).toContain('A &amp; B &lt;C&gt;')
  })

  it('includes category tags for postType, category and tags', () => {
    const xml = buildRssFeed([post(1)], 'https://viptel.com')
    expect(xml).toContain('<category>Noticias</category>')
    expect(xml).toContain('<category>Redes</category>')
    expect(xml).toContain('<category>VoIP</category>')
  })

  it('includes enclosure when the post has a hero image', () => {
    const withImage = post(1, { heroImage: img })
    const xml = buildRssFeed([withImage], 'https://viptel.com')
    expect(xml).toContain('<enclosure')
  })

  it('sets channel language to the locale', () => {
    const xml = buildRssFeed([], 'https://viptel.com', 'en')
    expect(xml).toContain('<language>en</language>')
  })
})
```

- [ ] **Step 2: Ejecutar y verificar fallo**
Run: `pnpm test rss` — Expected: FAIL (módulo no existe).

- [ ] **Step 3: Crear `website/src/lib/rss.ts`**

- Mover `escapeXml` y `formatRfc822Date` de `rss.xml.ts` a este módulo.
- `buildRssFeed(posts, siteUrl, locale = 'es', maxItems = 20)`:
  - Normalizar `siteUrl` sin `/` final.
  - `posts` ordenados (ya vienen) y `slice(0, maxItems)`.
  - Por item: `<title>`, `<link>` = `${siteUrl}/blog/${slug}/` (localizedPath para locales ≠ default: `/${locale}/blog/${slug}/`), `<guid>`, `<description>`, `<pubDate>`.
  - `<enclosure url="${siteUrl}${heroImage.url}" length="0" type="image/png"/>` cuando `heroImage` es objeto con `url` (resolver con `resolveMediaUrl` — importar payload para ello, o recibir la URL ya resuelta; mejor recibir el post y usar `payload.resolveMediaUrl`).
  - `<category>` para postType.title (si object), categoría (si object), y cada tag (`getTagName`).
  - `<channel>`: `<title>`, `<description>`, `<link>`, `<atom:link>`, `<language>${locale}</language>`, `<lastBuildDate>`.

- [ ] **Step 4: Refactor `rss.xml.ts`** — usar `buildRssFeed(await payload.posts().getAll(defaultLocale), siteUrl, defaultLocale, siteConfig.blog?.rssMaxItems ?? 20)`.

- [ ] **Step 5: Crear `[locale]/rss.xml.ts`** — misma lógica con el locale del segmento; validar con `isValidLocale`, redirect a `/404` si no.

- [ ] **Step 6: Config** — en `site.config.ts` sección `blog` añadir `rssMaxItems: 20` y actualizar el tipo `SiteConfig` si el objeto `blog` está tipado (verificar).

- [ ] **Step 7: Ejecutar test** — `pnpm test rss` PASS.

- [ ] **Step 8: `EmailSubscribeForm.astro`** — formulario: `<form data-newsletter-form>` con `<input type="email" required>` + botón `<Button type="submit">`, `preventDefault` en submit, muestra `<p class="newsletter-ok">` con `blog.newsletter.success`; honeypot oculto. Solo UI. Estilos con tokens.

- [ ] **Step 9: Integrar formulario** — en `BlogIndexView`, `BlogPageView`, `BlogArchiveView`, `BlogTagView` (slot footer CTA) y `PostLayout` CTA: añadir `<EmailSubscribeForm />` junto a los botones de RSS/social.

- [ ] **Step 10: i18n keys** — en `es.json` y `en.json` bajo `blog`:
```json
"sidebarToggle": "Categorías",
"newsletter": {
  "label": "Recibe los artículos por correo",
  "placeholder": "tu@correo.com",
  "button": "Suscribirme",
  "success": "¡Gracias! Revisa tu correo para confirmar la suscripción."
}
```
(en.json en inglés; `sidebarToggle` = "Categories", newsletter en inglés).

- [ ] **Step 11: `pnpm check` + `pnpm test`**
- [ ] **Step 12: Commit**

```bash
git add website/src/lib/rss.ts website/src/pages/rss.xml.ts website/src/pages/[locale]/rss.xml.ts website/src/components/blog/EmailSubscribeForm.astro website/src/config/site.config.ts website/src/__tests__/rss.test.ts website/src/i18n/es.json website/src/i18n/en.json
git commit -m "feat(blog): richer per-locale RSS feeds and email subscribe UI"
```

---

### Task 8: Sección blog del home con tarjetas del blog

**Files:**
- Modify: `website/src/components/blocks/ArchiveBlock.astro`

- [ ] **Step 1: Render BlogCard para posts**

En `ArchiveBlock`, cuando `block.relationTo === 'posts'` (y hay items de posts), renderizar el grid con `BlogCard` en vez del `<a>` simple:
- Importar `BlogCard`, `Icon` de blog helpers (`getPostTypeName`, `getPostTypeIcon`, `getTagName`), `payload.resolveMediaUrl`.
- Guardar los `Post` completos en una variable `postItems: Post[]` cuando `isProjects` es false y `populateBy`/`categories` no sean `services` (añadir rama específica). Reutilizar la lógica existente de selección (limit, categorías).
- Grid: `<BlogCard title description href={localizedPath(`/blog/${post.slug}`, locale)} publishedAt tags author imageUrl postTypeName postTypeIcon postCategoryName />`.
- Si hay items de proyectos o servicios, mantener el markup actual.

- [ ] **Step 2: Botón "Ver todos los artículos"**

Solo cuando `block.relationTo === 'posts'` y hay posts: tras la grilla, `<Button href={localizedPath('/blog', locale)} variant="brand-outline" size="sm"><Icon name="arrow-right" /> {t('home.blog.viewAll', locale)}</Button>` centrado. (Verificar que la clave `home.blog.viewAll` existe en es/en — está en `src/i18n/es.json:553` y en.json; si no existe en en, añadirla.)

- [ ] **Step 3: `pnpm check`**
- [ ] **Step 4: Commit**

```bash
git add website/src/components/blocks/ArchiveBlock.astro website/src/i18n/en.json
git commit -m "feat(home): use blog cards and view-all link in blog archive block"
```

---

### Task 9: Verificación completa

**Files:** ninguno (solo comandos)

- [ ] **Step 1: Unit tests** — `pnpm test` en `website/` (o `pnpm --filter website test`) — todos PASS.
- [ ] **Step 2: Typecheck + lint** — `pnpm check` y `pnpm lint` en `website/`.
- [ ] **Step 3: Build** — `pnpm build` en `website/` (astro check + schemas + links).
- [ ] **Step 4: Build raíz** — `pnpm build` desde la raíz del monorepo.
- [ ] **Step 5: Playwright** — levantar dev servers (backend opcional con mock o real) y verificar con Playwright:
  - `/blog` → sidebar visible en desktop; acordeón de tipos despliega categorías; etiquetas con contador; sin pestañas/tag cloud en top.
  - `/blog/<tipo>` → tipo activo en sidebar; breadcrumb.
  - `/blog/<tipo>/<categoria>/<subcategoria>` → subcategoría activa.
  - `/blog/tag/<tag>` → tag activo en sidebar con su contador.
  - `/blog/<slug>` → sin sidebar; layout de post intacto.
  - Móvil (viewport 375px) → sidebar colapsado, toggle funciona.
  - `/rss.xml` y `/en/rss.xml` → XML válido con límite y categorías.
  - Home → tarjetas estilo blog + botón "Ver todos los artículos" → `/blog`.
  - Detalle post → botones WhatsApp/Facebook/Telegram presentes con URLs correctas.
- [ ] **Step 6: Reportar** — resumen de lo verificado para que el usuario haga `git add` + `git commit` final.