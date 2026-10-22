import { describe, it, expect } from 'vitest';
import { computeSidebarData, getCategoryChildren, getCategorySubtreeIds } from '@/lib/blog';
import type { Category, Post, PostType } from '@/lib/payload-types';

const typeA = {
  id: 1,
  title: 'Noticias',
  slug: 'noticias',
  icon: 'newspaper',
  position: 0,
} as PostType;
const typeB = { id: 2, title: 'Guías', slug: 'guias', icon: 'book-open', position: 1 } as PostType;

const root1 = { id: 10, title: 'Redes', slug: 'redes' } as Category;
const root2 = { id: 11, title: 'Web', slug: 'web' } as Category;
const sub1 = { id: 20, title: 'LAN', slug: 'lan', parent: 10 } as Category;

const post = (id: number, type: PostType, cat?: Category, tags: string[] = []) =>
  ({
    id,
    title: `Post ${id}`,
    slug: `post-${id}`,
    postType: type,
    categories: cat,
    tags: tags.map((t) => ({ id: Math.random(), name: t, slug: t })),
  }) as unknown as Post;

describe('blog sidebar helpers', () => {
  it('getCategoryChildren returns direct children of a root', () => {
    const cats = [root1, root2, sub1];
    const children = getCategoryChildren(10, cats);
    expect(children).toEqual([sub1]);
    expect(getCategoryChildren(11, cats)).toEqual([]);
  });

  it('getCategorySubtreeIds returns the root id plus all descendant ids', () => {
    const grandchild = { id: 30, title: 'Switch', slug: 'switch', parent: 20 } as Category;
    const cats = [root1, root2, sub1, grandchild];
    expect(getCategorySubtreeIds(10, cats)).toEqual([10, 20, 30]);
    expect(getCategorySubtreeIds(11, cats)).toEqual([11]);
    expect(getCategorySubtreeIds(20, cats)).toEqual([20, 30]);
  });

  it('computeSidebarData groups roots and counts posts per type', () => {
    const posts = [
      post(1, typeA, root1, ['VoIP']),
      post(2, typeA, sub1, ['LAN']),
      post(3, typeB, root2),
    ];
    const data = computeSidebarData([typeA, typeB], [root1, root2, sub1], posts);
    const tA = data.types.find((t) => t.type.slug === 'noticias')!;
    expect(tA.count).toBe(2);
    expect(tA.categories[0].category.slug).toBe('redes');
    expect(tA.categories[0].count).toBe(2);
    expect(tA.categories[0].subcategories[0].category.slug).toBe('lan');
    expect(tA.categories[0].subcategories[0].count).toBe(1);
    expect(data.types.find((t) => t.type.slug === 'guias')!.categories[0].category.slug).toBe(
      'web'
    );
  });

  it('computeSidebarData aggregates tags with counts, sorted by count desc', () => {
    const posts = [post(1, typeA, root1, ['VoIP', 'LAN']), post(2, typeA, root1, ['VoIP'])];
    const data = computeSidebarData([typeA], [root1], posts);
    expect(data.tags).toEqual([
      { name: 'VoIP', slug: 'voip', count: 2 },
      { name: 'LAN', slug: 'lan', count: 1 },
    ]);
  });

  it('shows root categories with parent: null (Payload REST shape)', () => {
    const movil = {
      id: 12,
      title: 'Desarrollo Móvil',
      slug: 'desarrollo-movil',
      parent: null,
    } as unknown as Category;
    const data = computeSidebarData([typeB], [root2, movil], [post(1, typeB, movil)]);
    const cats = data.types[0].categories;
    expect(cats.map((c) => c.category.slug)).toContain('desarrollo-movil');
    expect(cats.find((c) => c.category.slug === 'desarrollo-movil')!.count).toBe(1);
  });

  it('ignores posts whose type is not in the list', () => {
    const posts = [post(1, typeA, root1)];
    const data = computeSidebarData([typeB], [root1], posts);
    expect(data.types).toEqual([]);
  });
});
