/**
 * ContentHelpers — shared utilities for tag counting, pagination,
 * and secondary locale resolution. Used by blog.ts and projects.ts.
 */
import { defaultLocale, isEnabled, getLocales } from '@/i18n';
import { tagToSlug, findTagBySlug } from '@/lib/tags';

export { tagToSlug, findTagBySlug };

/**
 * Returns all secondary (non-default) locales when i18n is enabled.
 */
export function getSecondaryLocales(): string[] {
  if (!isEnabled()) return [];
  return getLocales().filter((locale) => locale !== defaultLocale);
}

/**
 * A tag as it appears on a content item: either a resolved Tag object
 * (depth ≥ 1) or a raw relationship id (depth 0).
 */
export type TagRef = number | { name?: string | null } | null;

/**
 * Extract a tag's display name, tolerating an unresolved relationship id.
 */
export function getTagName(tag: TagRef): string {
  if (tag && typeof tag === 'object') return tag.name ?? '';
  return '';
}

/**
 * Collect unique tags from content items.
 * Items must have `tags?: TagRef[]`.
 */
export function collectTags<T extends { tags?: TagRef[] | null }>(items: T[]): string[] {
  return [...new Set(items.flatMap((item) => (item.tags ?? []).map((t) => getTagName(t))))].sort();
}

/**
 * Collect tags with occurrence counts, sorted by count descending then alphabetically.
 */
export function collectTagsWithCounts<T extends { tags?: TagRef[] | null }>(
  items: T[]
): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const t of item.tags ?? []) {
      counts.set(getTagName(t), (counts.get(getTagName(t)) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/**
 * Collect only the top-N tags by frequency.
 * A `limit` of 0 or less returns every tag (unlimited).
 */
export function collectTopTags<T extends { tags?: TagRef[] | null }>(
  items: T[],
  limit: number
): string[] {
  const counts = collectTagsWithCounts(items);
  const top = limit > 0 ? counts.slice(0, limit) : counts;
  return top.map((t) => t.tag ?? '');
}

/**
 * Build a paginated URL for a given base path.
 */
export function getPageUrl(
  baseFn: (locale: string) => string,
  page: number,
  locale: string
): string {
  if (page <= 1) return baseFn(locale);
  return `/${locale === defaultLocale ? '' : locale + '/'}${page > 1 ? `page/${page}` : ''}`;
}
