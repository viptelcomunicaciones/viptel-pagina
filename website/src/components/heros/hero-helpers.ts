/**
 * Pure helpers that translate the Payload hero schema into presentation-ready
 * values. Kept free of any template/JSX code so they can be unit-tested and
 * reused by every hero variant.
 */
import type { PageHero } from '@/lib/block-types'
import { localizedPath } from '@/i18n'

export type HeroLinkItem = NonNullable<NonNullable<PageHero['links']>[number]>

export interface ResolvedHeroLink {
  href: string
  label: string
  newTab: boolean
  appearance: 'default' | 'outline'
}

// Payload reference collections mapped to their public route prefixes.
// Pages live at the root, so they get an empty prefix.
const COLLECTION_PATHS = {
  pages: '',
  posts: '/blog',
  services: '/services',
} as const

interface RichTextNode {
  type?: string
  tag?: string
  children?: RichTextNode[]
  text?: string
}

interface RichTextData {
  root?: {
    children?: RichTextNode[]
  }
}

function collectText(nodes: RichTextNode[]): string {
  return nodes
    .map((node) => node.text ?? (node.children ? collectText(node.children) : ''))
    .join('')
}

/**
 * Extract the text of the first heading node from a Lexical rich text tree.
 * Used for the hero <h1> — the remaining content is rendered separately.
 */
export function extractHeroTitle(richText: unknown): string {
  const root = (richText as RichTextData | null | undefined)?.root
  const heading = root?.children?.find((node) => node?.type === 'heading')
  if (!heading?.children) return ''
  return collectText(heading.children).replace(/\s+/g, ' ').trim()
}

/**
 * Resolve a Payload hero link into a renderable URL.
 * Reference links get their collection prefix plus the locale prefix (the
 * default locale stays at the root); custom links are used as-is.
 */
export function resolveHeroLink(item: HeroLinkItem, locale?: string): ResolvedHeroLink {
  const link = item.link
  const label = link.label || ''
  const newTab = Boolean(link.newTab)
  const appearance: ResolvedHeroLink['appearance'] = link.appearance === 'outline' ? 'outline' : 'default'

  if (link.type === 'reference' && link.reference?.value) {
    const relationTo = link.reference.relationTo
    const doc = link.reference.value
    const slug = typeof doc === 'object' && doc !== null && 'slug' in doc ? String(doc.slug) : ''
    const prefix = COLLECTION_PATHS[relationTo] ?? ''
    if (slug) {
      return { href: localizedPath(`${prefix}/${slug}`, locale), label, newTab, appearance }
    }
  }

  return { href: link.url || '#', label, newTab, appearance }
}
