import siteConfig, { type SiteConfig } from '@/config/site.config';
import { defaultLocale } from '@/i18n';
import { payload } from '@/lib/payload-client';
import type { SiteSettings } from '@/lib/payload-types';

export interface ResolvedSiteConfig extends SiteConfig {
  defaultTheme?: string;
  defaultColorMode?: 'system' | 'light' | 'dark';
  enabledThemes?: string[];
  schemas?: {
    includeOrgSchema?: boolean | null;
    includePersonSchema?: boolean | null;
    includeProfessionalServiceSchema?: boolean | null;
  };
  analytics?: {
    gaMeasurementId?: string | null;
    gtmId?: string | null;
    umamiWebsiteId?: string | null;
    umamiSrc?: string | null;
  };
  consent?: {
    enabled?: boolean | null;
    privacyPolicyUrl?: string | null;
  };
}

export async function getResolvedSiteConfig(
  locale: string = defaultLocale
): Promise<ResolvedSiteConfig> {
  let cmsSettings: SiteSettings | null = null;
  try {
    cmsSettings = await payload.globals().getSiteSettings(locale);
  } catch {
    // Fall back cleanly to static siteConfig
  }

  const socialLinksFromCms = cmsSettings?.socialLinks
    ?.map((s) => s.url)
    .filter((url): url is string => Boolean(url));

  const resolvedLogoImage =
    cmsSettings?.logo?.image && typeof cmsSettings.logo.image === 'object' && cmsSettings.logo.image.url
      ? payload.resolveMediaUrl(cmsSettings.logo.image.url)
      : cmsSettings?.logo?.customSvgPath || siteConfig.branding.logo.image;

  const resolvedStructuredDataImage =
    cmsSettings?.logo?.structuredDataImage &&
    typeof cmsSettings.logo.structuredDataImage === 'object' &&
    cmsSettings.logo.structuredDataImage.url
      ? payload.resolveMediaUrl(cmsSettings.logo.structuredDataImage.url)
      : siteConfig.branding.logo.imageUrl;

  return {
    ...siteConfig,
    name: cmsSettings?.name || siteConfig.name,
    description: cmsSettings?.description || siteConfig.description,
    tagline: cmsSettings?.tagline || siteConfig.tagline,
    footerNote: cmsSettings?.footerNote || siteConfig.footerNote,
    url: cmsSettings?.url || siteConfig.url,
    email: cmsSettings?.email || siteConfig.email,
    phone: cmsSettings?.phone || siteConfig.phone,
    address: {
      street: cmsSettings?.address?.street || siteConfig.address?.street || '',
      city: cmsSettings?.address?.city || siteConfig.address?.city || 'Bogotá',
      state: cmsSettings?.address?.state || siteConfig.address?.state || '',
      zip: cmsSettings?.address?.zip || siteConfig.address?.zip || '',
      country: cmsSettings?.address?.country || siteConfig.address?.country || 'Colombia',
    },
    socialLinks: socialLinksFromCms && socialLinksFromCms.length > 0 ? socialLinksFromCms : siteConfig.socialLinks,
    twitter: {
      site: cmsSettings?.twitterSite || siteConfig.twitter?.site || '@viptel',
      creator: siteConfig.twitter?.creator || '@viptel',
    },
    branding: {
      logo: {
        alt: cmsSettings?.logo?.alt || siteConfig.branding.logo.alt,
        image: resolvedLogoImage,
        imageUrl: resolvedStructuredDataImage,
      },
      favicon: {
        svg: cmsSettings?.favicon?.customSvgPath || siteConfig.branding.favicon.svg,
      },
      colors: {
        themeColor: cmsSettings?.colors?.themeColor || siteConfig.branding.colors.themeColor,
        backgroundColor: cmsSettings?.colors?.backgroundColor || siteConfig.branding.colors.backgroundColor,
      },
    },
    defaultTheme: cmsSettings?.defaultTheme || 'blue',
    defaultColorMode: cmsSettings?.defaultColorMode || 'system',
    enabledThemes: (cmsSettings?.enabledThemes as string[] | undefined) || undefined,
    blogImageOverlay: cmsSettings?.blogImageOverlay ?? siteConfig.blogImageOverlay ?? true,
    effects: {
      cursorTrail: cmsSettings?.cursorTrail ?? siteConfig.effects?.cursorTrail ?? true,
    },
    articleFeatures: {
      toc: {
        enabled: cmsSettings?.toc?.enabled ?? siteConfig.articleFeatures?.toc?.enabled ?? true,
        layout: (cmsSettings?.toc?.layout as 'auto' | 'inline' | 'sidebar') ?? siteConfig.articleFeatures?.toc?.layout ?? 'auto',
        sidebarPosition: (cmsSettings?.toc?.sidebarPosition as 'left' | 'right') ?? siteConfig.articleFeatures?.toc?.sidebarPosition ?? 'right',
        minHeadings: cmsSettings?.toc?.minHeadings ?? siteConfig.articleFeatures?.toc?.minHeadings ?? 3,
        maxDepth: ((Number(cmsSettings?.toc?.maxDepth) as 2 | 3 | 4) || siteConfig.articleFeatures?.toc?.maxDepth || 3),
      },
      comments: {
        enabled: cmsSettings?.comments?.enabled ?? siteConfig.articleFeatures?.comments?.enabled ?? false,
        provider: (cmsSettings?.comments?.provider as 'giscus' | 'cusdis' | 'artalk') ?? siteConfig.articleFeatures?.comments?.provider ?? 'giscus',
        giscus: cmsSettings?.comments?.giscus
          ? { ...siteConfig.articleFeatures?.comments?.giscus, ...cmsSettings.comments.giscus } as any
          : siteConfig.articleFeatures?.comments?.giscus,
        cusdis: cmsSettings?.comments?.cusdis
          ? { ...siteConfig.articleFeatures?.comments?.cusdis, ...cmsSettings.comments.cusdis } as any
          : siteConfig.articleFeatures?.comments?.cusdis,
        artalk: cmsSettings?.comments?.artalk
          ? { ...siteConfig.articleFeatures?.comments?.artalk, ...cmsSettings.comments.artalk } as any
          : siteConfig.articleFeatures?.comments?.artalk,
      },
    },
    blog: {
      postsPerPage: cmsSettings?.blog?.postsPerPage ?? siteConfig.blog?.postsPerPage ?? 12,
      tagCloudLimit: cmsSettings?.blog?.tagCloudLimit ?? siteConfig.blog?.tagCloudLimit ?? 10,
      rssMaxItems: cmsSettings?.blog?.rssMaxItems ?? siteConfig.blog?.rssMaxItems ?? 20,
    },
    projects: {
      perPage: cmsSettings?.projects?.perPage ?? siteConfig.projects?.perPage ?? 12,
      tagCloudLimit: cmsSettings?.projects?.tagCloudLimit ?? siteConfig.projects?.tagCloudLimit ?? 10,
    },
    verification: {
      google: cmsSettings?.verification?.google || siteConfig.verification?.google,
      bing: cmsSettings?.verification?.bing || siteConfig.verification?.bing,
    },
    schemas: cmsSettings?.schemas ?? undefined,
    analytics: cmsSettings?.analytics ?? undefined,
    consent: cmsSettings?.consent ?? undefined,
  };
}
