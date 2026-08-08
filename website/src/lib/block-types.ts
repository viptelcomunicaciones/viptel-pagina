import type { Page } from '@/lib/payload-types'

/**
 * Layout block types as defined inline on `Page.layout` in the CMS.
 * Extracted here so components can import named types without
 * duplicating the payload schema.
 */
export type PageBlock = NonNullable<Page['layout']>[number]

export type CardsBlock = Extract<PageBlock, { blockType: 'cards' }>
export type PricingBlock = Extract<PageBlock, { blockType: 'pricing' }>
export type FAQBlock = Extract<PageBlock, { blockType: 'faq' }>
export type GalleryBlock = Extract<PageBlock, { blockType: 'gallery' }>
export type MediaContentBlock = Extract<PageBlock, { blockType: 'media-content' }>
export type PageHero = Page['hero']