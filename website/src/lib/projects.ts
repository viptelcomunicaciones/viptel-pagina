/**
 * Project helpers — project listing, pagination, tag URLs.
 * Data comes from Payload CMS via the REST API.
 */
import siteConfig from '@/config/site.config';
import { defaultLocale, localizedPath } from '@/i18n';
import { payload } from '@/lib/payload-client';
import type { Project } from '@/lib/payload-types';
import {
  collectTagsWithCounts,
  collectTopTags,
  getSecondaryLocales,
  getTagName,
  tagToSlug,
  findTagBySlug,
} from '@/lib/content-helpers';

export const PROJECTS_PER_PAGE = siteConfig.projects?.perPage ?? 12;
export const PROJECT_TAG_CLOUD_LIMIT = siteConfig.projects?.tagCloudLimit ?? 10;

export {
  tagToSlug,
  findTagBySlug,
  getTagName,
  collectTagsWithCounts as collectProjectTagsWithCounts,
  collectTopTags as collectTopProjectTags,
  getSecondaryLocales,
};

export function getProjectSlug(project: Project): string {
  return project.slug;
}

export function getProjectUrl(projectOrSlug: Project | string, locale = defaultLocale): string {
  const slug = typeof projectOrSlug === 'string' ? projectOrSlug : projectOrSlug.slug;
  return localizedPath(`/projects/${slug}`, locale);
}

export function getProjectsBaseUrl(locale = defaultLocale): string {
  return localizedPath('/projects', locale);
}

export function getProjectsPageUrl(page: number, locale = defaultLocale): string {
  return page <= 1 ? getProjectsBaseUrl(locale) : localizedPath(`/projects/page/${page}`, locale);
}

export function getProjectTagUrl(tag: string, locale = defaultLocale): string {
  return localizedPath(`/projects/tag/${tagToSlug(tag)}`, locale);
}

export async function getVisibleProjects(locale = defaultLocale): Promise<Project[]> {
  return payload.projects().getAll(locale);
}

export function collectProjectTags(projects: Project[]): string[] {
  return [...new Set(projects.flatMap((p) => (p.tags ?? []).map((t) => getTagName(t))))].sort();
}
