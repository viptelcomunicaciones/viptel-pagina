import type { APIContext } from 'astro';
import siteConfig from '@/config/site.config';
import { getAllPosts } from '@/lib/payload';
import { defaultLocale } from '@/i18n';
import type { Post } from '@/lib/payload-types';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatRfc822Date(date: Date): string {
  return date.toUTCString();
}

export async function GET(context: APIContext) {
  const posts = await getAllPosts(defaultLocale).catch(() => [] as Post[]);

  const site = context.site?.toString() ?? siteConfig.url;
  const siteUrl = site.endsWith('/') ? site.slice(0, -1) : site;

  const items = posts
    .map((post) => {
      const link = `${siteUrl}/blog/${post.slug}/`;
      const categories = (post.tags ?? [])
        .map((t) => `<category>${escapeXml(t.tag)}</category>`)
        .join('\n        ');

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <description>${escapeXml(post.excerpt || '')}</description>
      <pubDate>${formatRfc822Date(new Date(post.publishedAt))}</pubDate>
      ${categories}
    </item>`;
    })
    .join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <description>${escapeXml(siteConfig.description)}</description>
    <link>${siteUrl}</link>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>${defaultLocale}</language>
    <lastBuildDate>${formatRfc822Date(new Date())}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
