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
