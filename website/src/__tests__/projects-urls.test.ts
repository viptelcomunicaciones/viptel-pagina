import { describe, it, expect } from 'vitest';

import {
  getProjectSlug,
  getProjectUrl,
  getProjectsBaseUrl,
  getProjectsPageUrl,
  getProjectTagUrl,
  getProjectTypeUrl,
  getProjectCategoryArchiveUrl,
  getProjectSubcategoryArchiveUrl,
  getSecondaryLocales,
} from '@/lib/projects';
import type { Project, ProjectCategory } from '@/lib/payload-types';

const mockProject = { title: 'Test', slug: 'hello-world', id: 1 } as Project;
const cat = { id: 10, title: 'Web', slug: 'web' } as ProjectCategory;
const sub = { id: 20, title: 'E-commerce', slug: 'e-commerce', parent: 10 } as ProjectCategory;

describe('project URL helpers', () => {
  it('gets slug from project object', () => {
    expect(getProjectSlug(mockProject)).toBe('hello-world');
  });

  it('builds project URL from project object', () => {
    expect(getProjectUrl(mockProject)).toBe('/projects/hello-world');
    expect(getProjectUrl(mockProject, 'en')).toBe('/en/projects/hello-world');
  });

  it('builds the projects index base URL', () => {
    expect(getProjectsBaseUrl()).toBe('/projects');
    expect(getProjectsBaseUrl('en')).toBe('/en/projects');
  });

  it('maps page 1 to root and pages 2+ to /page/N', () => {
    expect(getProjectsPageUrl(1)).toBe('/projects');
    expect(getProjectsPageUrl(2)).toBe('/projects/page/2');
  });

  it('builds a tag URL from the slugified tag', () => {
    expect(getProjectTagUrl('astro')).toBe('/projects/tag/astro');
  });

  it('builds hierarchical archive URLs', () => {
    expect(getProjectTypeUrl('telecomunicaciones')).toBe('/projects/telecomunicaciones');
    expect(getProjectCategoryArchiveUrl('telecomunicaciones', cat)).toBe('/projects/telecomunicaciones/web');
    expect(getProjectSubcategoryArchiveUrl('telecomunicaciones', 'web', sub)).toBe(
      '/projects/telecomunicaciones/web/e-commerce'
    );
    expect(getProjectTypeUrl('telecomunicaciones', 'en')).toBe('/en/projects/telecomunicaciones');
  });

  it('exposes only non-default locale when i18n is on', () => {
    expect(getSecondaryLocales()).toEqual(['en']);
  });
});