/**
 * ContentHelpers — shared utilities for tag counting, pagination,
 * and secondary locale resolution. Used by blog.ts and projects.ts.
 */
import { defaultLocale, localizedPath, isEnabled, getLocales } from '@/i18n'
import { tagToSlug, findTagBySlug } from '@/lib/tags'

export { tagToSlug, findTagBySlug }

/**
 * Returns all secondary (non-default) locales when i18n is enabled.
 */
export function getSecondaryLocales(): string[] {
  if (!isEnabled()) return []
  return getLocales().filter((locale) => locale !== defaultLocale)
}

/**
 * Collect unique tags from content items.
 * Items must have `tags?: { tag?: string | null }[]`.
 */
export function collectTags<T extends { tags?: { tag?: string | null }[] | null }>(items: T[]): string[] {
  return [...new Set(items.flatMap((item) => (item.tags ?? []).map((t) => t.tag ?? '')))].sort()
}

/**
 * Collect tags with occurrence counts, sorted by count descending then alphabetically.
 */
export function collectTagsWithCounts<T extends { tags?: { tag?: string | null }[] | null }>(
  items: T[],
): { tag: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const item of items) {
    for (const t of item.tags ?? []) {
      counts.set(t.tag, (counts.get(t.tag) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

/**
 * Collect only the top-N tags by frequency.
 */
export function collectTopTags<T extends { tags?: { tag?: string | null }[] | null }>(
  items: T[],
  limit: number,
): string[] {
  return collectTagsWithCounts(items)
    .slice(0, limit)
    .map((t) => t.tag ?? '')
}

/**
 * Build a paginated URL for a given base path.
 */
export function getPageUrl(baseFn: (locale: string) => string, page: number, locale: string): string {
  if (page <= 1) return baseFn(locale)
  return `/${locale === defaultLocale ? '' : locale + '/'}${page > 1 ? `page/${page}` : ''}`
}
