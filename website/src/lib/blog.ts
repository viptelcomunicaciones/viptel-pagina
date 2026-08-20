/**
 * Blog helpers — post listing, pagination, tag URLs.
 * Data comes from Payload CMS via the REST API.
 */
import siteConfig from '@/config/site.config'
import { defaultLocale, localizedPath } from '@/i18n'
import { payload } from '@/lib/payload-client'
import type { Category, Post, PostType } from '@/lib/payload-types'
import { collectTagsWithCounts, collectTopTags, getSecondaryLocales, getTagName, tagToSlug, findTagBySlug } from '@/lib/content-helpers'

export const BLOG_POSTS_PER_PAGE = siteConfig.blog?.postsPerPage ?? 12
export const BLOG_TAG_CLOUD_LIMIT = siteConfig.blog?.tagCloudLimit ?? 10

export { tagToSlug, findTagBySlug, getTagName, collectTagsWithCounts, collectTopTags, getSecondaryLocales }

export function getPostSlug(post: Post): string {
  return post.slug
}

export function getPostUrl(postOrSlug: Post | string, locale = defaultLocale): string {
  const slug = typeof postOrSlug === 'string' ? postOrSlug : postOrSlug.slug
  return localizedPath(`/blog/${slug}`, locale)
}

export function getBlogBaseUrl(locale = defaultLocale): string {
  return localizedPath('/blog', locale)
}

export function getBlogPageUrl(page: number, locale = defaultLocale): string {
  return page <= 1 ? getBlogBaseUrl(locale) : localizedPath(`/blog/page/${page}`, locale)
}

export function getTagUrl(tag: string, locale = defaultLocale): string {
  return localizedPath(`/blog/tag/${tagToSlug(tag)}`, locale)
}

/**
 * Archivo de tipo: `/blog/<tipo>`.
 */
export function getPostTypeUrl(postTypeSlug: string, locale = defaultLocale): string {
  return localizedPath(`/blog/${postTypeSlug}`, locale)
}

/**
 * Archivo de categoría raíz: `/blog/<tipo>/<categoria>`.
 */
export function getCategoryArchiveUrl(postTypeSlug: string, category: Category, locale = defaultLocale): string {
  return localizedPath(`/blog/${postTypeSlug}/${category.slug}`, locale)
}

/**
 * Archivo de subcategoría: `/blog/<tipo>/<categoria>/<subcategoria>`.
 */
export function getSubcategoryArchiveUrl(
  postTypeSlug: string,
  rootSlug: string,
  subcategory: Category,
  locale = defaultLocale,
): string {
  return localizedPath(`/blog/${postTypeSlug}/${rootSlug}/${subcategory.slug}`, locale)
}

/** Nombre del tipo de un post (o vacío si la relación no viene poblada). */
export function getPostTypeName(post: Post): string {
  return typeof post.postType === 'object' && post.postType ? post.postType.title : ''
}

/** Icono del tipo de un post. */
export function getPostTypeIcon(post: Post): string {
  return typeof post.postType === 'object' && post.postType ? post.postType.icon || 'file-text' : 'file-text'
}

/** Categoría asignada a un post, si viene poblada. */
export function getPostCategory(post: Post): Category | null {
  return typeof post.categories === 'object' && post.categories ? post.categories : null
}

export interface BlogArchive {
  kind: 'post' | 'type' | 'category' | 'subcategory' | 'not-found'
  post?: Post | null
  postType?: PostType | null
  category?: Category | null
  subcategory?: Category | null
  posts?: Post[]
  totalDocs?: number
  totalPages?: number
}

function isChildOf(candidate: Category | null | undefined, parentId: number | undefined): boolean {
  if (!candidate?.parent) return false
  return typeof candidate.parent === 'object'
    ? candidate.parent.id === parentId
    : candidate.parent === parentId
}

/**
 * Resuelve la ruta del blog: un post plano (`/blog/<slug>`) o un archivo
 * jerárquico de tipo/categoría/subcategoría. Los posts siempre ganan frente a
 * un tipo cuando el segmento coincide (URLs planas estables).
 */
export async function resolveBlogArchive(
  segments: string[],
  locale = defaultLocale,
  page = 1,
): Promise<BlogArchive> {
  if (segments.length === 1) {
    const [s] = segments
    const post = await payload.posts().getBySlug(s, locale)
    if (post) return { kind: 'post', post }

    const postType = await payload.postTypes().getBySlug(s, locale)
    if (postType) {
      const res = await payload.posts().getByPostType(postType.id, locale, page, BLOG_POSTS_PER_PAGE)
      return { kind: 'type', postType, posts: res.docs, totalDocs: res.totalDocs, totalPages: res.totalPages }
    }
    return { kind: 'not-found' }
  }

  if (segments.length === 2) {
    const postType = await payload.postTypes().getBySlug(segments[0], locale)
    const category = await payload.categories().getBySlug(segments[1], locale)
    if (postType && category && !category.parent) {
      const res = await payload.posts().getByPostTypeAndCategory(postType.id, category.id, locale, page, BLOG_POSTS_PER_PAGE)
      return { kind: 'category', postType, category, posts: res.docs, totalDocs: res.totalDocs, totalPages: res.totalPages }
    }
    return { kind: 'not-found' }
  }

  if (segments.length === 3) {
    const postType = await payload.postTypes().getBySlug(segments[0], locale)
    const category = await payload.categories().getBySlug(segments[1], locale)
    const subcategory = await payload.categories().getBySlug(segments[2], locale)
    if (postType && category && isChildOf(subcategory, category.id)) {
      const res = await payload.posts().getByPostTypeAndCategory(postType.id, subcategory!.id, locale, page, BLOG_POSTS_PER_PAGE)
      return { kind: 'subcategory', postType, category, subcategory, posts: res.docs, totalDocs: res.totalDocs, totalPages: res.totalPages }
    }
    return { kind: 'not-found' }
  }

  return { kind: 'not-found' }
}

export async function getPublishedPosts(locale = defaultLocale): Promise<Post[]> {
  return payload.posts().getAll(locale)
}

export function collectTags(posts: Post[]): string[] {
  return [...new Set(posts.flatMap((p) => (p.tags ?? []).map((t) => getTagName(t))))].sort()
}

export function rankRelatedPosts(posts: Post[], currentSlug: string, tags: string[]): Post[] {
  if (!tags.length) return []
  return posts
    .filter((post) => post.slug !== currentSlug)
    .filter((post) => (post.tags ?? []).some((t) => tags.includes(getTagName(t))))
    .slice()
    .sort((a, b) => {
      const aMatches = (a.tags ?? []).filter((t) => tags.includes(getTagName(t))).length
      const bMatches = (b.tags ?? []).filter((t) => tags.includes(getTagName(t))).length
      if (bMatches !== aMatches) return bMatches - aMatches
      return (
        (b.publishedAt ? new Date(b.publishedAt).getTime() : 0) -
        (a.publishedAt ? new Date(a.publishedAt).getTime() : 0)
      )
    })
}

export async function getRelatedByTags(
  currentSlug: string,
  tags: string[],
  locale = defaultLocale,
  max = 3,
): Promise<Post[]> {
  if (!tags.length) return []
  try {
    const allPosts = await getPublishedPosts(locale)
    return rankRelatedPosts(allPosts, currentSlug, tags).slice(0, max)
  } catch {
    return []
  }
}

// ── Sidebar data ──────────────────────────────────────────

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

/**
 * Construye el árbol de tipos → categorías → subcategorías con conteos y la
 * lista de etiquetas con contador, todo calculado en memoria desde los posts
 * publicados. Las categorías raíz de un tipo son las que usan sus posts (la
 * relación tipo↔categoría no existe en el esquema, se deriva del contenido).
 */
export function computeSidebarData(
  postTypes: PostType[],
  categories: Category[],
  posts: Post[],
): BlogSidebarData {
  const roots = categories.filter((c) => !c.parent)

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
    .filter((t) => t.count > 0)

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
