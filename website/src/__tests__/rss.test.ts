import { describe, it, expect } from 'vitest'
import { buildRssFeed } from '@/lib/rss'
import type { Post, PostType, Category, Media } from '@/lib/payload-types'

const type = { id: 1, title: 'Noticias', slug: 'noticias' } as PostType
const cat = { id: 10, title: 'Redes', slug: 'redes' } as Category
const img = { id: 1, url: '/media/pic.png', alt: 'Pic' } as Media
const post = (id: number, extra: Partial<Post> = {}) =>
  ({
    id,
    title: `Post ${id}`,
    slug: `post-${id}`,
    excerpt: 'Resumen',
    publishedAt: '2026-01-02T00:00:00Z',
    postType: type,
    categories: cat,
    tags: [{ id: 1, name: 'VoIP', slug: 'voip' }],
    ...extra,
  }) as unknown as Post

describe('rss feed builder', () => {
  it('limits items to maxItems', () => {
    const posts = [post(1), post(2), post(3)]
    const xml = buildRssFeed(posts, 'https://viptel.com', 'es', 2)
    expect(xml.match(/<item>/g)!.length).toBe(2)
  })

  it('escapes xml special characters', () => {
    const xml = buildRssFeed([post(1, { title: 'A & B <C>' })], 'https://viptel.com')
    expect(xml).toContain('A &amp; B &lt;C&gt;')
  })

  it('includes category tags for postType, category and tags', () => {
    const xml = buildRssFeed([post(1)], 'https://viptel.com')
    expect(xml).toContain('<category>Noticias</category>')
    expect(xml).toContain('<category>Redes</category>')
    expect(xml).toContain('<category>VoIP</category>')
  })

  it('includes enclosure when the post has a hero image', () => {
    const withImage = post(1, { heroImage: img })
    const xml = buildRssFeed([withImage], 'https://viptel.com')
    expect(xml).toContain('<enclosure')
  })

  it('sets channel language to the locale', () => {
    const xml = buildRssFeed([], 'https://viptel.com', 'en')
    expect(xml).toContain('<language>en</language>')
  })
})