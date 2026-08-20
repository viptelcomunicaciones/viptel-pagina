import type { APIContext } from 'astro';
import siteConfig from '@/config/site.config';
import { payload } from '@/lib/payload-client';
import { defaultLocale, isValidLocale } from '@/i18n';
import type { Post } from '@/lib/payload-types';
import { buildRssFeed } from '@/lib/rss';

export async function GET(context: APIContext) {
  const { locale = defaultLocale } = context.params;

  if (!isValidLocale(locale)) {
    return new Response('Not Found', { status: 404 });
  }

  const posts = await payload
    .posts()
    .getAll(locale)
    .catch(() => [] as Post[]);

  const site = context.site?.toString() ?? siteConfig.url;
  const siteUrl = site.endsWith('/') ? site.slice(0, -1) : site;

  const rss = buildRssFeed(posts, siteUrl, locale, siteConfig.blog?.rssMaxItems ?? 20);

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
