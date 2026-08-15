/**
 * Blog helpers — post listing, pagination, tag URLs.
 * Data comes from Payload CMS via the REST API.
 */
import siteConfig from '@/config/site.config'
import { defaultLocale, localizedPath } from '@/i18n'
import { payload } from '@/lib/payload-client'
import type { Post } from '@/lib/payload-types'
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
    const allPosts = await payload.posts().getAll(locale)
    return rankRelatedPosts(allPosts, currentSlug, tags).slice(0, max)
  } catch {
    return []
  }
}
