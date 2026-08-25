/**
 * Project helpers — project listing, pagination, tag URLs.
 * Data comes from Payload CMS via the REST API.
 */
import siteConfig from '@/config/site.config';
import { defaultLocale, localizedPath } from '@/i18n';
import { getCategoryChildren, getCategorySubtreeIds } from '@/lib/blog';
import { payload } from '@/lib/payload-client';
import type { Project, ProjectCategory, ProjectType } from '@/lib/payload-types';
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

export function getProjectTypeUrl(projectTypeSlug: string, locale = defaultLocale): string {
  return localizedPath(`/projects/${projectTypeSlug}`, locale);
}

export function getProjectCategoryArchiveUrl(
  projectTypeSlug: string,
  category: ProjectCategory,
  locale = defaultLocale
): string {
  return localizedPath(`/projects/${projectTypeSlug}/${category.slug}`, locale);
}

export function getProjectSubcategoryArchiveUrl(
  projectTypeSlug: string,
  rootSlug: string,
  subcategory: ProjectCategory,
  locale = defaultLocale
): string {
  return localizedPath(`/projects/${projectTypeSlug}/${rootSlug}/${subcategory.slug}`, locale);
}

export function getProjectTypeName(project: Project): string {
  return typeof project.projectType === 'object' && project.projectType
    ? project.projectType.title
    : '';
}

export function getProjectTypeIcon(project: Project): string {
  return typeof project.projectType === 'object' && project.projectType
    ? project.projectType.icon || 'layers'
    : 'layers';
}

export function getProjectCategory(project: Project): ProjectCategory | null {
  return typeof project.categories === 'object' && project.categories
    ? project.categories
    : null;
}

export async function getVisibleProjects(locale = defaultLocale): Promise<Project[]> {
  return payload.projects().getAll(locale);
}

export function collectProjectTags(projects: Project[]): string[] {
  return [...new Set(projects.flatMap((p) => (p.tags ?? []).map((t) => getTagName(t))))].sort();
}

export interface ProjectArchive {
  kind: 'project' | 'type' | 'category' | 'subcategory' | 'not-found';
  project?: Project | null;
  projectType?: ProjectType | null;
  category?: ProjectCategory | null;
  subcategory?: ProjectCategory | null;
  projects?: Project[];
  totalDocs?: number;
  totalPages?: number;
}

function projectTypeSlugOf(project: Project): string {
  return typeof project.projectType === 'object' && project.projectType
    ? project.projectType.slug
    : '';
}

function projectCategoryOf(project: Project): ProjectCategory | null {
  return typeof project.categories === 'object' && project.categories
    ? project.categories
    : null;
}

function isChildOf(
  candidate: ProjectCategory | null | undefined,
  parentId: number | undefined
): boolean {
  if (!candidate?.parent) return false;
  return typeof candidate.parent === 'object'
    ? candidate.parent.id === parentId
    : candidate.parent === parentId;
}

/**
 * Resuelve la ruta de proyectos: un proyecto plano (`/projects/<slug>`) o un
 * archivo jerárquico de tipo/categoría/subcategoría. Los proyectos siempre
 * ganan frente a un tipo cuando el segmento coincide (URLs planas estables).
 */
export async function resolveProjectArchive(
  segments: string[],
  locale = defaultLocale,
  page = 1
): Promise<ProjectArchive> {
  if (segments.length === 1) {
    const [s] = segments;
    const project = await payload.projects().getBySlug(s, locale);
    if (project) return { kind: 'project', project };

    const projectType = await payload.projectTypes().getBySlug(s, locale);
    if (projectType) {
      const res = await payload
        .projects()
        .getByType(projectType.id, locale, page, PROJECTS_PER_PAGE);
      return {
        kind: 'type',
        projectType,
        projects: res.docs,
        totalDocs: res.totalDocs,
        totalPages: res.totalPages,
      };
    }
    return { kind: 'not-found' };
  }

  if (segments.length === 2) {
    const projectType = await payload.projectTypes().getBySlug(segments[0], locale);
    const category = await payload.projectCategories().getBySlug(segments[1], locale);
    if (projectType && category && !category.parent) {
      const allCategories = await payload.projectCategories().getAll(locale);
      const categoryIds = getCategorySubtreeIds(category.id, allCategories);
      const res = await payload
        .projects()
        .getByTypeAndCategories(projectType.id, categoryIds, locale, page, PROJECTS_PER_PAGE);
      return {
        kind: 'category',
        projectType,
        category,
        projects: res.docs,
        totalDocs: res.totalDocs,
        totalPages: res.totalPages,
      };
    }
    return { kind: 'not-found' };
  }

  if (segments.length === 3) {
    const projectType = await payload.projectTypes().getBySlug(segments[0], locale);
    const category = await payload.projectCategories().getBySlug(segments[1], locale);
    const subcategory = await payload.projectCategories().getBySlug(segments[2], locale);
    if (projectType && category && isChildOf(subcategory, category.id)) {
      const res = await payload
        .projects()
        .getByTypeAndCategory(projectType.id, subcategory!.id, locale, page, PROJECTS_PER_PAGE);
      return {
        kind: 'subcategory',
        projectType,
        category,
        subcategory,
        projects: res.docs,
        totalDocs: res.totalDocs,
        totalPages: res.totalPages,
      };
    }
    return { kind: 'not-found' };
  }

  return { kind: 'not-found' };
}

export interface ProjectSidebarType {
  type: ProjectType;
  count: number;
  categories: ProjectSidebarCategory[];
}
export interface ProjectSidebarCategory {
  category: ProjectCategory;
  count: number;
  subcategories: ProjectSidebarSubcategory[];
}
export interface ProjectSidebarSubcategory {
  category: ProjectCategory;
  count: number;
}
export interface ProjectSidebarTag {
  name: string;
  slug: string;
  count: number;
}
export interface ProjectSidebarData {
  types: ProjectSidebarType[];
  tags: ProjectSidebarTag[];
}

/**
 * Construye el árbol de tipos → categorías → subcategorías con conteos y la
 * lista de etiquetas con contador, todo calculado en memoria desde los
 * proyectos publicados.
 */
export function computeProjectSidebarData(
  projectTypes: ProjectType[],
  categories: ProjectCategory[],
  projects: Project[]
): ProjectSidebarData {
  const roots = categories.filter((c) => !c.parent);

  const types = projectTypes
    .map((type) => {
      const typeProjects = projects.filter((p) => projectTypeSlugOf(p) === type.slug);
      const categoryCounts = new Map<number, number>();
      const subcategoryCounts = new Map<number, number>();
      for (const p of typeProjects) {
        const cat = projectCategoryOf(p);
        if (!cat) continue;
        const parentId =
          typeof cat.parent === 'object' && cat.parent
            ? cat.parent.id
            : (cat.parent as number | undefined);
        if (parentId !== undefined) {
          subcategoryCounts.set(cat.id, (subcategoryCounts.get(cat.id) ?? 0) + 1);
          categoryCounts.set(parentId, (categoryCounts.get(parentId) ?? 0) + 1);
        } else {
          categoryCounts.set(cat.id, (categoryCounts.get(cat.id) ?? 0) + 1);
        }
      }
      const categoriesForType = roots
        .filter((root) => categoryCounts.has(root.id))
        .map((root) => {
          const children = getCategoryChildren(root.id, categories).filter(
            (sub) =>
              subcategoryCounts.has(sub.id) ||
              typeProjects.some((p) => projectCategoryOf(p)?.id === sub.id)
          );
          return {
            category: root,
            count: categoryCounts.get(root.id) ?? 0,
            subcategories: children.map((sub) => ({
              category: sub,
              count: subcategoryCounts.get(sub.id) ?? 0,
            })),
          };
        })
        .sort((a, b) => a.category.title.localeCompare(b.category.title));
      return { type, count: typeProjects.length, categories: categoriesForType };
    })
    .filter((t) => t.count > 0);

  const tagCounts = new Map<string, { name: string; count: number }>();
  for (const p of projects) {
    for (const t of p.tags ?? []) {
      const name = getTagName(t);
      if (!name) continue;
      const entry = tagCounts.get(name) ?? { name, count: 0 };
      entry.count += 1;
      tagCounts.set(name, entry);
    }
  }
  const tags = [...tagCounts.values()]
    .map(({ name, count }) => ({ name, slug: tagToSlug(name), count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return { types, tags };
}

export async function getProjectSidebarData(locale = defaultLocale): Promise<ProjectSidebarData> {
  const [projectTypes, categories, projects] = await Promise.all([
    payload.projectTypes().getAll(locale),
    payload.projectCategories().getAll(locale),
    getVisibleProjects(locale),
  ]);
  return computeProjectSidebarData(projectTypes, categories, projects);
}

export function rankRelatedProjects(
  projects: Project[],
  currentSlug: string,
  typeSlug: string,
  categoryId: number | undefined,
  tags: string[]
): Project[] {
  if (!typeSlug && categoryId === undefined && !tags.length) return [];
  return projects
    .filter((p) => p.slug !== currentSlug)
    .map((p) => {
      let score = 0;
      if (projectTypeSlugOf(p) === typeSlug) score += 3;
      const cat = projectCategoryOf(p);
      if (categoryId !== undefined && cat) {
        const catId = typeof cat.parent === 'object' && cat.parent ? cat.parent.id : cat.id;
        if (cat.id === categoryId || catId === categoryId) score += 2;
      }
      const shared = (p.tags ?? []).filter((t) => tags.includes(getTagName(t))).length;
      score += shared;
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}

export async function getRelatedByTopic(
  currentSlug: string,
  locale = defaultLocale,
  max = 3
): Promise<Project[]> {
  const all = await getVisibleProjects(locale);
  const current = all.find((p) => p.slug === currentSlug);
  if (!current) return [];
  const typeSlug = projectTypeSlugOf(current);
  const cat = projectCategoryOf(current);
  const catId = cat ? cat.id : undefined;
  const tags = (current.tags ?? []).map(getTagName).filter(Boolean);
  return rankRelatedProjects(all, currentSlug, typeSlug, catId, tags).slice(0, max);
}
