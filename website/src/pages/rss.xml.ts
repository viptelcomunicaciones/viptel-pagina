import type { APIContext } from 'astro';
import siteConfig from '@/config/site.config';
import { getResolvedSiteConfig } from '@/lib/site-config';
import { payload } from '@/lib/payload-client';
import { defaultLocale } from '@/i18n';
import type { Post } from '@/lib/payload-types';
import { buildRssFeed } from '@/lib/rss';

export async function GET(context: APIContext) {
  const [posts, resolvedConfig] = await Promise.all([
    payload
      .posts()
      .getAll(defaultLocale)
      .catch(() => [] as Post[]),
    getResolvedSiteConfig(defaultLocale),
  ]);

  const site = context.site?.toString() ?? resolvedConfig.url ?? siteConfig.url;
  const siteUrl = site.endsWith('/') ? site.slice(0, -1) : site;
  const maxItems = resolvedConfig.blog?.rssMaxItems ?? siteConfig.blog?.rssMaxItems ?? 20;

  const rss = buildRssFeed(posts, siteUrl, defaultLocale, maxItems);

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
