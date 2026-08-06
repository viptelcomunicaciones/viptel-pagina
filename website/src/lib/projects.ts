/**
 * Shared helpers for the project listing and tag-archive pages.
 *
 * Data comes exclusively from Payload CMS via the REST API — no local MDX collections.
 */
import siteConfig from '@/config/site.config';
import { defaultLocale, localizedPath, isEnabled, getLocales } from '@/i18n';
import { tagToSlug, findTagBySlug } from '@/lib/tags';
import type { Project } from '@/lib/payload-types';
import { payload } from '@/lib/payload-client';

export { tagToSlug, findTagBySlug };

export const PROJECT_TAG_CLOUD_LIMIT = siteConfig.projects?.tagCloudLimit ?? 10;
export const PROJECTS_PER_PAGE = siteConfig.projects?.perPage ?? 12;

export function getProjectSlug(project: Project): string {
  return project.slug;
}

export function getProjectUrl(projectOrSlug: Project | string, locale: string = defaultLocale): string {
  const slug = typeof projectOrSlug === 'string' ? projectOrSlug : projectOrSlug.slug;
  return localizedPath(`/projects/${slug}`, locale);
}

export function getProjectsBaseUrl(locale: string = defaultLocale): string {
  return localizedPath('/projects', locale);
}

export function getProjectsPageUrl(page: number, locale: string = defaultLocale): string {
  return page <= 1 ? getProjectsBaseUrl(locale) : localizedPath(`/projects/page/${page}`, locale);
}

export function getProjectTagUrl(tag: string, locale: string = defaultLocale): string {
  return localizedPath(`/projects/tag/${tagToSlug(tag)}`, locale);
}

export function getSecondaryLocales(): string[] {
  if (!isEnabled()) return [];
  return getLocales().filter((locale) => locale !== defaultLocale);
}

export async function getVisibleProjects(locale: string = defaultLocale): Promise<Project[]> {
  return payload.projects().getAll(locale);
}

export async function getProjectPageCount(locale: string = defaultLocale): Promise<number> {
  try {
    const { totalPages } = await payload.projects().getPaginated(locale, 1, PROJECTS_PER_PAGE);
    return totalPages ?? 1;
  } catch {
    return 1;
  }
}

export function collectProjectTags(projects: Project[]): string[] {
  return [...new Set(projects.flatMap((p) => (p.tags ?? []).map((t) => t.tag ?? '')))].sort();
}

export function collectProjectTagsWithCounts(
  projects: Project[],
): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of projects) {
    for (const t of p.tags ?? []) {
      counts.set(t.tag, (counts.get(t.tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function collectTopProjectTags(projects: Project[], limit: number): string[] {
  return collectProjectTagsWithCounts(projects)
    .slice(0, limit)
    .map((t) => t.tag ?? '');
}
