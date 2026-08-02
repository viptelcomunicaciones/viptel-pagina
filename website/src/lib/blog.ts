/**
 * Shared helpers for the blog listing pages (index, paginated, tag archives).
 *
 * Data comes exclusively from Payload CMS via the REST API — no local MDX collections.
 */
import siteConfig from '@/config/site.config';
import { defaultLocale, localizedPath, isEnabled, getLocales } from '@/i18n';
import { tagToSlug, findTagBySlug } from '@/lib/tags';
import type { Post } from '@/lib/payload-types';
import { getAllPosts, getPosts, getPostsByTag } from '@/lib/payload';

export const BLOG_POSTS_PER_PAGE = siteConfig.blog?.postsPerPage ?? 12;
export const BLOG_TAG_CLOUD_LIMIT = siteConfig.blog?.tagCloudLimit ?? 10;

export { tagToSlug, findTagBySlug };

export function getPostSlug(post: Post): string {
  return post.slug;
}

export function getPostUrl(postOrSlug: Post | string, locale: string = defaultLocale): string {
  const slug = typeof postOrSlug === 'string' ? postOrSlug : postOrSlug.slug;
  return localizedPath(`/blog/${slug}`, locale);
}

export function getBlogBaseUrl(locale: string = defaultLocale): string {
  return localizedPath('/blog', locale);
}

export function getBlogPageUrl(page: number, locale: string = defaultLocale): string {
  return page <= 1 ? getBlogBaseUrl(locale) : localizedPath(`/blog/page/${page}`, locale);
}

export function getTagUrl(tag: string, locale: string = defaultLocale): string {
  return localizedPath(`/blog/tag/${tagToSlug(tag)}`, locale);
}

export function getSecondaryLocales(): string[] {
  if (!isEnabled()) return [];
  return getLocales().filter((locale) => locale !== defaultLocale);
}

export async function getPublishedPosts(locale: string = defaultLocale): Promise<Post[]> {
  return getAllPosts(locale);
}

export async function getBlogPageCount(locale: string = defaultLocale): Promise<number> {
  try {
    const { totalPages } = await getPosts(locale, 1, BLOG_POSTS_PER_PAGE);
    return totalPages ?? 1;
  } catch {
    return 1;
  }
}

export function collectTags(posts: Post[]): string[] {
  return [...new Set(posts.flatMap((p) => (p.tags ?? []).map((t) => t.tag)))].sort();
}

export function collectTagsWithCounts(
  posts: Post[],
): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.tags ?? []) {
      counts.set(t.tag, (counts.get(t.tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function collectTopTags(posts: Post[], limit: number): string[] {
  return collectTagsWithCounts(posts)
    .slice(0, limit)
    .map((t) => t.tag);
}
