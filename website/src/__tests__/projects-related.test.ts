import { describe, it, expect } from 'vitest';
import { rankRelatedProjects } from '@/lib/projects';
import type { Project, ProjectCategory, ProjectType } from '@/lib/payload-types';

const typeWeb = { id: 1, title: 'Web', slug: 'desarrollo-web' } as ProjectType;
const typeTel = { id: 2, title: 'Teleco', slug: 'telecomunicaciones' } as ProjectType;
const catWeb = { id: 10, title: 'Web', slug: 'web' } as ProjectCategory;

const project = (id: number, type: ProjectType, cat?: ProjectCategory, tags: string[] = []) =>
  ({
    id,
    title: `Project ${id}`,
    slug: `project-${id}`,
    projectType: type,
    categories: cat,
    tags: tags.map((t) => ({ id: Math.random(), name: t, slug: t })),
  }) as unknown as Project;

describe('rankRelatedProjects', () => {
  it('ranks shared type above shared tags', () => {
    const current = project(1, typeWeb, catWeb, ['Astro']);
    const sameType = project(2, typeWeb, undefined, []);
    const sameTag = project(3, typeTel, undefined, ['Astro']);
    const ranked = rankRelatedProjects([sameType, sameTag], 'project-1', 'desarrollo-web', 10, ['Astro']);
    expect(ranked[0].slug).toBe('project-2');
  });

  it('returns empty when nothing matches', () => {
    const other = project(2, typeTel, undefined, []);
    expect(rankRelatedProjects([other], 'project-1', 'desarrollo-web', 10, ['Astro'])).toEqual([]);
  });

  it('excludes the current project', () => {
    const current = project(1, typeWeb, catWeb, ['Astro']);
    const ranked = rankRelatedProjects([current], 'project-1', 'desarrollo-web', 10, ['Astro']);
    expect(ranked).toEqual([]);
  });
});