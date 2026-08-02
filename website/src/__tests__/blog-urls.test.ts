import { describe, it, expect } from 'vitest';

import {
  getPostSlug,
  getPostUrl,
  getBlogBaseUrl,
  getBlogPageUrl,
  getTagUrl,
  getSecondaryLocales,
} from '@/lib/blog';
import type { Post } from '@/lib/payload-types';

const mockPost = { title: 'Test', slug: 'hello-world', id: 1 } as Post;

describe('blog URL helpers', () => {
  it('gets slug from post object', () => {
    expect(getPostSlug(mockPost)).toBe('hello-world');
  });

  it('builds post URL from post object', () => {
    expect(getPostUrl(mockPost)).toBe('/blog/hello-world');
    expect(getPostUrl(mockPost, 'es')).toBe('/blog/hello-world');
    expect(getPostUrl(mockPost, 'en')).toBe('/en/blog/hello-world');
  });

  it('builds post URL from plain slug string', () => {
    expect(getPostUrl('my-post')).toBe('/blog/my-post');
  });

  it('builds the blog index base URL', () => {
    expect(getBlogBaseUrl()).toBe('/blog');
    expect(getBlogBaseUrl('es')).toBe('/blog');
    expect(getBlogBaseUrl('en')).toBe('/en/blog');
  });

  it('maps page 1 to root and pages 2+ to /page/N', () => {
    expect(getBlogPageUrl(1)).toBe('/blog');
    expect(getBlogPageUrl(2)).toBe('/blog/page/2');
  });

  it('builds a tag URL from the slugified tag', () => {
    expect(getTagUrl('astro')).toBe('/blog/tag/astro');
  });

  it('exposes only non-default locale when i18n is on', () => {
    expect(getSecondaryLocales()).toEqual(['en']);
  });
});
