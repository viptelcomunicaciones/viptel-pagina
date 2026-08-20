import type { APIContext } from 'astro';
import siteConfig from '@/config/site.config';
import { payload } from '@/lib/payload-client';
import { defaultLocale } from '@/i18n';
import type { Post } from '@/lib/payload-types';
import { buildRssFeed } from '@/lib/rss';

export async function GET(context: APIContext) {
  const posts = await payload
    .posts()
    .getAll(defaultLocale)
    .catch(() => [] as Post[]);

  const site = context.site?.toString() ?? siteConfig.url;
  const siteUrl = site.endsWith('/') ? site.slice(0, -1) : site;

  const rss = buildRssFeed(posts, siteUrl, defaultLocale, siteConfig.blog?.rssMaxItems ?? 20);

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
