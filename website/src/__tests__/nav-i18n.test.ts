import { describe, it, expect, vi } from 'vitest';

vi.mock('@/config/i18n.config', () => ({
  default: {
    enabled: true,
    defaultLocale: 'es',
    locales: ['es', 'en'],
    localeNames: { es: 'Español', en: 'English' },
    detectBrowserLocale: false,
  },
}));

import { getNavItems, getLogoHref, resolveNavItem, type NavItem } from '@/config/nav.config';

describe('nav config — locale resolution (es default, en secondary)', () => {
  it('keeps default-locale hrefs at the site root', () => {
    const items = getNavItems('es');
    expect(items.find((i) => i.href === '/services')?.href).toBe('/services');
    expect(items.find((i) => i.href === '/blog')?.href).toBe('/blog');
  });

  it('prefixes secondary-locale hrefs with the locale', () => {
    const items = getNavItems('en');
    expect(items.map((i) => i.href)).toEqual([
      '/en',
      '/en/services',
      '/en/projects',
      '/en/blog',
      '/en/about',
      '/en/contact',
    ]);
  });

  it('translates labels via the dictionary (labelKey)', () => {
    const en = getNavItems('en');
    expect(en.length).toBeGreaterThan(0);
  });

  it('points the logo at the locale home', () => {
    expect(getLogoHref('es')).toBe('/');
    expect(getLogoHref('en')).toBe('/en');
  });

  it('never locale-prefixes external, mailto/tel, or anchor hrefs', () => {
    expect(
      resolveNavItem({ label: 'GitHub', href: 'https://github.com/x', order: 1, external: true }, 'en').href,
    ).toBe('https://github.com/x');
    expect(resolveNavItem({ label: 'Top', href: '#top', order: 1 }, 'en').href).toBe('#top');
    expect(resolveNavItem({ label: 'Mail', href: 'mailto:a@b.com', order: 1 }, 'en').href).toBe('mailto:a@b.com');
  });

  it('applies a per-locale override (label + path), still locale-prefixed', () => {
    const item: NavItem = {
      label: 'Contact',
      href: '/contact',
      order: 1,
      locales: { en: { label: 'Get in touch', href: '/contact-us' } },
    };
    expect(resolveNavItem(item, 'en')).toEqual({
      label: 'Get in touch',
      href: '/en/contact-us',
      external: undefined,
    });
    expect(resolveNavItem(item, 'es')).toEqual({
      label: 'Contact',
      href: '/contact',
      external: undefined,
    });
  });

  it('falls back to the literal label when no labelKey is set', () => {
    expect(resolveNavItem({ label: 'Docs', href: '/docs', order: 1 }, 'en').label).toBe('Docs');
  });
});
