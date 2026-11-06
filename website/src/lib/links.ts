import { defaultLocale, localizedPath, swapLocaleInPath } from '@/i18n';
import { isExternalOrAnchorHref } from '@/config/nav.config';

export interface ResolvedLink {
  label: string;
  href: string;
  external?: boolean;
}

export function getServiceUrl(slug: string, locale = defaultLocale): string {
  return localizedPath(`/services/${slug}`, locale);
}

export function resolvePayloadLink(
  link: unknown,
  currentLocale: string = defaultLocale
): ResolvedLink | null {
  if (!link || typeof link !== 'object') return null;

  const linkData = link as {
    type?: 'reference' | 'custom' | string | null;
    newTab?: boolean | null;
    url?: string | null;
    label?: string | null;
    reference?: {
      relationTo?: string | null;
      value?: unknown;
    } | null;
  };

  let rawHref = linkData.url || '/';
  let docTitle: string | undefined;

  if (
    linkData.type === 'reference' &&
    linkData.reference?.value &&
    typeof linkData.reference.value === 'object'
  ) {
    const doc = linkData.reference.value as {
      title?: string | null;
      slug?: string | null;
      breadcrumbs?: Array<{ url?: string | null }> | null;
    };
    const slug = doc.slug || '';
    docTitle = doc.title || undefined;

    const relationTo = linkData.reference.relationTo;

    if (relationTo === 'pages') {
      const lastCrumb = doc.breadcrumbs?.[doc.breadcrumbs.length - 1]?.url;
      rawHref = slug === 'home' ? '/' : lastCrumb || `/${slug}`;
    } else if (relationTo === 'posts') {
      rawHref = `/blog/${slug}`;
    } else if (relationTo === 'projects') {
      rawHref = `/projects/${slug}`;
    } else if (relationTo === 'services') {
      const lastCrumb = doc.breadcrumbs?.[doc.breadcrumbs.length - 1]?.url;
      rawHref = lastCrumb ? `/services${lastCrumb}` : `/services/${slug}`;
    }
  }

  const label = linkData.label?.trim() || docTitle || '';
  if (!label && !linkData.url && !linkData.reference?.value) {
    return null;
  }

  const isExternal = Boolean(linkData.newTab) || isExternalOrAnchorHref(rawHref);
  const href = isExternal ? rawHref : swapLocaleInPath(rawHref, currentLocale);

  return {
    label: label || href,
    href,
    external: Boolean(linkData.newTab) || isExternalOrAnchorHref(href),
  };
}
