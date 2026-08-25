import { describe, it, expect } from 'vitest';
import { getProjectTypeName, getProjectTypeIcon, getProjectCategory } from '@/lib/projects';
import type { Project, ProjectCategory, ProjectType } from '@/lib/payload-types';

const typeWeb = { id: 1, title: 'Desarrollo Web', slug: 'desarrollo-web', icon: 'globe' } as ProjectType;
const catWeb = { id: 10, title: 'Web', slug: 'web' } as ProjectCategory;

describe('project taxonomy helpers', () => {
  it('getProjectTypeName resolves populated relationship', () => {
    const p = { id: 1, title: 'X', slug: 'x', projectType: typeWeb } as unknown as Project;
    expect(getProjectTypeName(p)).toBe('Desarrollo Web');
  });

  it('getProjectTypeName returns empty for unresolved relationship', () => {
    const p = { id: 1, title: 'X', slug: 'x', projectType: 5 } as unknown as Project;
    expect(getProjectTypeName(p)).toBe('');
  });

  it('getProjectTypeIcon falls back to layers', () => {
    const p = { id: 1, title: 'X', slug: 'x', projectType: typeWeb } as unknown as Project;
    expect(getProjectTypeIcon(p)).toBe('globe');
    const p2 = { id: 2, title: 'Y', slug: 'y', projectType: 5 } as unknown as Project;
    expect(getProjectTypeIcon(p2)).toBe('layers');
  });

  it('getProjectCategory resolves populated relationship', () => {
    const p = { id: 1, title: 'X', slug: 'x', categories: catWeb } as unknown as Project;
    expect(getProjectCategory(p)?.slug).toBe('web');
  });
});