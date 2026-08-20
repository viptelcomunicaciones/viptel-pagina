/**
 * RSS feed builder — shared by the default-locale feed (`/rss.xml`) and the
 * locale-prefixed feeds (`/<locale>/rss.xml`).
 *
 * Items include title, link, guid, description, publication date, an
 * `<enclosure>` with the post image when available, and `<category>` entries
 * for the post type, category and tags.
 */
import { localizedPath } from '@/i18n'
import siteConfig from '@/config/site.config'
import { payload } from './payload-client'
import { getPostCategory, getPostTypeName, getTagName } from './blog'
import type { Post } from './payload-types'

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function formatRfc822Date(date: Date): string {
  return date.toUTCString()
}

export function buildRssFeed(
  posts: Post[],
  siteUrl: string,
  locale = 'es',
  maxItems = 20,
): string {
  const base = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl

  const items = posts
    .slice(0, maxItems)
    .map((post) => {
      const link = `${base}${localizedPath(`/blog/${post.slug}`, locale)}/`

      const categories: string[] = []
      const postTypeName = getPostTypeName(post)
      if (postTypeName) categories.push(postTypeName)
      const postCat = getPostCategory(post)
      if (postCat?.title) categories.push(postCat.title)
      for (const tag of post.tags ?? []) {
        const name = getTagName(tag)
        if (name) categories.push(name)
      }

      const heroImage = post.heroImage && typeof post.heroImage !== 'number' ? post.heroImage : null
      const enclosure = heroImage?.url
        ? `      <enclosure url="${escapeXml(payload.resolveMediaUrl(heroImage.url))}" length="0" type="image/png" />\n`
        : ''

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <description>${escapeXml(post.excerpt || '')}</description>
      <pubDate>${formatRfc822Date(post.publishedAt ? new Date(post.publishedAt) : new Date())}</pubDate>
${enclosure}${categories.map((c) => `      <category>${escapeXml(c)}</category>`).join('\n')}
    </item>`
    })
    .join('\n')

  const feedHref = `${base}${localizedPath('/rss.xml', locale)}`

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <description>${escapeXml(siteConfig.description)}</description>
    <link>${base}</link>
    <atom:link href="${feedHref}" rel="self" type="application/rss+xml"/>
    <language>${locale}</language>
    <lastBuildDate>${formatRfc822Date(new Date())}</lastBuildDate>
${items}
  </channel>
</rss>`
}