import { describe, it, expect } from 'vitest';
import { rankRelatedPosts } from '@/lib/blog';
import type { Post, Tag } from '@/lib/payload-types';

function makeTag(id: number, name: string): Tag {
  return { id, name, generateSlug: false, slug: name, updatedAt: '2026-01-01T00:00:00.000Z', createdAt: '2026-01-01T00:00:00.000Z' };
}

function makePost(partial: Partial<Post> & { slug: string }): Post {
  return { id: 1, title: partial.slug, publishedAt: '2026-01-01T00:00:00.000Z', tags: [], ...partial } as Post;
}

const a = makePost({ slug: 'a', tags: [makeTag(1, 'voip')], publishedAt: '2026-01-02T00:00:00.000Z' });
const b = makePost({ slug: 'b', tags: [makeTag(1, 'voip'), makeTag(2, 'redes')], publishedAt: '2026-01-03T00:00:00.000Z' });
const c = makePost({ slug: 'c', tags: [makeTag(2, 'redes')], publishedAt: '2026-01-01T00:00:00.000Z' });
const current = makePost({ slug: 'current', tags: [makeTag(1, 'voip')] });

describe('rankRelatedPosts', () => {
  it('excludes the current post', () => {
    const result = rankRelatedPosts([a, current, b], 'current', ['voip']);
    expect(result.map((p) => p.slug)).toEqual(['b', 'a']);
  });

  it('orders by number of shared tags first, then by publishedAt desc', () => {
    const result = rankRelatedPosts([a, c, b], 'x', ['voip', 'redes']);
    expect(result.map((p) => p.slug)).toEqual(['b', 'a', 'c']);
  });

  it('drops posts with no shared tags', () => {
    const unrelated = makePost({ slug: 'z', tags: [makeTag(3, 'seo')] });
    const result = rankRelatedPosts([a, unrelated], 'x', ['voip']);
    expect(result.map((p) => p.slug)).toEqual(['a']);
  });

  it('returns an empty array when tags is empty', () => {
    expect(rankRelatedPosts([a, b], 'x', [])).toEqual([]);
  });
});