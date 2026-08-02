import { describe, it, expect } from 'vitest';

import {
  getPostUrl,
  getBlogBaseUrl,
  getBlogPageUrl,
  getTagUrl,
  getSecondaryLocales,
} from '@/lib/blog';

// Vipert config: es default, en secondary
describe('blog URL helpers (i18n enabled — es default, en secondary)', () => {
  it('keeps default-locale post URLs at the site root', () => {
    expect(getPostUrl('hello-world')).toBe('/blog/hello-world');
    expect(getPostUrl('hello-world', 'es')).toBe('/blog/hello-world');
  });

  it('prefixes secondary-locale post URLs with the locale', () => {
    expect(getPostUrl('hello-world', 'en')).toBe('/en/blog/hello-world');
  });

  it('prefixes the blog index base URL for the secondary locale only', () => {
    expect(getBlogBaseUrl()).toBe('/blog');
    expect(getBlogBaseUrl('es')).toBe('/blog');
    expect(getBlogBaseUrl('en')).toBe('/en/blog');
  });

  it('prefixes paginated URLs for the secondary locale', () => {
    expect(getBlogPageUrl(1, 'en')).toBe('/en/blog');
    expect(getBlogPageUrl(2, 'en')).toBe('/en/blog/page/2');
    expect(getBlogPageUrl(2)).toBe('/blog/page/2');
  });

  it('prefixes tag URLs for the secondary locale', () => {
    expect(getTagUrl('astro', 'en')).toBe('/en/blog/tag/astro');
    expect(getTagUrl('Web')).toBe('/blog/tag/web');
  });

  it('lists non-default locales as secondary', () => {
    expect(getSecondaryLocales()).toEqual(['en']);
  });
});
