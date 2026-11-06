import { describe, it, expect, vi } from 'vitest';
import { resolvePayloadLink } from '@/lib/links';
import { createPersonSchema, createOrganizationSchema } from '@/lib/schema';
import { getResolvedSiteConfig } from '@/lib/site-config';

describe('resolvePayloadLink', () => {
  it('returns null for empty or null link', () => {
    expect(resolvePayloadLink(null)).toBeNull();
    expect(resolvePayloadLink(undefined)).toBeNull();
    expect(resolvePayloadLink({})).toBeNull();
  });

  it('resolves custom internal and external links', () => {
    const internalLink = {
      type: 'custom',
      label: 'Contacto',
      url: '/contact',
      newTab: false,
    };
    expect(resolvePayloadLink(internalLink, 'es')).toEqual({
      label: 'Contacto',
      href: '/contact',
      external: false,
    });
    expect(resolvePayloadLink(internalLink, 'en')).toEqual({
      label: 'Contacto',
      href: '/en/contact',
      external: false,
    });

    const externalLink = {
      type: 'custom',
      label: 'GitHub',
      url: 'https://github.com/viptel',
      newTab: true,
    };
    expect(resolvePayloadLink(externalLink, 'es')).toEqual({
      label: 'GitHub',
      href: 'https://github.com/viptel',
      external: true,
    });
  });

  it('resolves reference links for pages, posts, projects and services', () => {
    const homePageLink = {
      type: 'reference',
      label: 'Inicio',
      reference: {
        relationTo: 'pages',
        value: { slug: 'home', title: 'Inicio' },
      },
    };
    expect(resolvePayloadLink(homePageLink, 'es')).toEqual({
      label: 'Inicio',
      href: '/',
      external: false,
    });
    expect(resolvePayloadLink(homePageLink, 'en')).toEqual({
      label: 'Inicio',
      href: '/en',
      external: false,
    });

    const pageWithCrumb = {
      type: 'reference',
      label: 'Subpágina',
      reference: {
        relationTo: 'pages',
        value: {
          slug: 'subpage',
          breadcrumbs: [{ url: '/parent/subpage' }],
        },
      },
    };
    expect(resolvePayloadLink(pageWithCrumb, 'es')?.href).toBe('/parent/subpage');

    const postLink = {
      type: 'reference',
      label: 'Noticia',
      reference: {
        relationTo: 'posts',
        value: { slug: 'lanzamiento-red-fibra', title: 'Lanzamiento' },
      },
    };
    expect(resolvePayloadLink(postLink, 'es')?.href).toBe('/blog/lanzamiento-red-fibra');
    expect(resolvePayloadLink(postLink, 'en')?.href).toBe('/en/blog/lanzamiento-red-fibra');

    const projectLink = {
      type: 'reference',
      reference: {
        relationTo: 'projects',
        value: { slug: 'datacenter-bogota', title: 'Datacenter Bogotá' },
      },
    };
    const resolvedProject = resolvePayloadLink(projectLink, 'es');
    expect(resolvedProject?.label).toBe('Datacenter Bogotá');
    expect(resolvedProject?.href).toBe('/projects/datacenter-bogota');

    const serviceLink = {
      type: 'reference',
      label: 'PBX Virtual',
      reference: {
        relationTo: 'services',
        value: { slug: 'pbx-virtual', breadcrumbs: [{ url: '/telefonia/pbx-virtual' }] },
      },
    };
    expect(resolvePayloadLink(serviceLink, 'es')?.href).toBe('/services/telefonia/pbx-virtual');
  });
});

describe('schema creators', () => {
  it('creates an authentic Person schema with @type Person', () => {
    const schema = createPersonSchema({
      name: 'Ing. Cesar Barrero',
      jobTitle: 'Lead Telecom Architect',
    });
    expect(schema['@type']).toBe('Person');
    expect(schema.name).toBe('Ing. Cesar Barrero');
  });

  it('creates an authentic Organization schema with @type Organization', () => {
    const schema = createOrganizationSchema();
    expect(schema['@type']).toBe('Organization');
    expect(schema.name).toBeDefined();
  });
});

describe('getResolvedSiteConfig', () => {
  it('falls back cleanly to siteConfig defaults when CMS is unavailable', async () => {
    const config = await getResolvedSiteConfig('es');
    expect(config.name).toBeDefined();
    expect(config.branding.colors.themeColor).toBeDefined();
    expect(config.defaultTheme).toBe('blue');
    expect(config.defaultColorMode).toBe('system');
  });
});
