import { describe, it, expect } from 'vitest';
import { computeProjectSidebarData } from '@/lib/projects';
import type { Project, ProjectCategory, ProjectType } from '@/lib/payload-types';

const typeA = {
  id: 1,
  title: 'Telecomunicaciones',
  slug: 'telecomunicaciones',
  icon: 'phone',
  position: 0,
} as ProjectType;
const typeB = { id: 2, title: 'Web', slug: 'desarrollo-web', icon: 'globe', position: 1 } as ProjectType;

const root1 = { id: 10, title: 'Redes', slug: 'redes' } as ProjectCategory;
const root2 = { id: 11, title: 'Web', slug: 'web' } as ProjectCategory;
const sub1 = { id: 20, title: 'E-commerce', slug: 'e-commerce', parent: 10 } as ProjectCategory;

const project = (id: number, type: ProjectType, cat?: ProjectCategory, tags: string[] = []) =>
  ({
    id,
    title: `Project ${id}`,
    slug: `project-${id}`,
    projectType: type,
    categories: cat,
    tags: tags.map((t) => ({ id: Math.random(), name: t, slug: t })),
  }) as unknown as Project;

describe('project sidebar helpers', () => {
  it('computeProjectSidebarData groups roots and counts projects per type', () => {
    const projects = [
      project(1, typeA, root1, ['VoIP']),
      project(2, typeA, sub1, ['LAN']),
      project(3, typeB, root2),
    ];
    const data = computeProjectSidebarData([typeA, typeB], [root1, root2, sub1], projects);
    const tA = data.types.find((t) => t.type.slug === 'telecomunicaciones')!;
    expect(tA.count).toBe(2);
    expect(tA.categories[0].category.slug).toBe('redes');
    expect(tA.categories[0].count).toBe(2);
    expect(tA.categories[0].subcategories[0].category.slug).toBe('e-commerce');
    expect(tA.categories[0].subcategories[0].count).toBe(1);
    expect(data.types.find((t) => t.type.slug === 'desarrollo-web')!.categories[0].category.slug).toBe(
      'web'
    );
  });

  it('computeProjectSidebarData aggregates tags with counts, sorted by count desc', () => {
    const projects = [project(1, typeA, root1, ['VoIP', 'LAN']), project(2, typeA, root1, ['VoIP'])];
    const data = computeProjectSidebarData([typeA], [root1], projects);
    expect(data.tags).toEqual([
      { name: 'VoIP', slug: 'voip', count: 2 },
      { name: 'LAN', slug: 'lan', count: 1 },
    ]);
  });

  it('ignores projects whose type is not in the list', () => {
    const projects = [project(1, typeA, root1)];
    const data = computeProjectSidebarData([typeB], [root1], projects);
    expect(data.types).toEqual([]);
  });
});