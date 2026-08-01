export interface MediaType {
  id: number
  url: string
  alt?: string
  width?: number
  height?: number
  mimeType?: string
  filename?: string
  filesize?: number
}

export interface CardItem {
  id: string
  icon?: string
  title: string
  description?: string
  linkUrl?: string
}

export interface FAQItem {
  id: string
  question: string
  answer?: any
}

export interface GalleryImage {
  id: string
  image: MediaType
  alt?: string
  caption?: string
}

export interface Breadcrumb {
  label: string
  url: string
}

export interface PageHero {
  type?: 'highImpact' | 'mediumImpact' | 'lowImpact'
  title?: string
  description?: string
  links?: { id: string; label: string; url: string }[]
  image?: MediaType
}

export interface BannerBlock {
  id?: string
  blockType: 'banner'
  style?: 'info' | 'warning' | 'error' | 'success'
  content: any
}

export interface CodeBlock {
  id?: string
  blockType: 'code'
  language?: string
  code?: string
}

export interface ArchiveBlock {
  id?: string
  blockType: 'archive'
  introContent?: any
  populateBy?: 'collection' | 'selection'
  relationTo?: string
  categories?: number[]
  limit?: number
  selectedDocs?: number[]
}

export interface ContentBlock {
  id?: string
  blockType: 'content'
  body: any
}

export interface MediaContentBlock {
  id?: string
  blockType: 'media-content'
  heading?: string
  body?: any
  image: MediaType
  imagePosition: 'left' | 'right'
}

export interface CardsBlock {
  id?: string
  blockType: 'cards'
  heading?: string
  cards: CardItem[]
}

export interface PricingBlock {
  id?: string
  blockType: 'pricing'
  name: string
  price?: number
  currency: string
  interval?: 'one-time' | 'monthly'
  features?: { id: string; feature?: string; included?: boolean }[]
  linkText?: string
  linkUrl?: string
}

export interface CTABlock {
  id?: string
  blockType: 'cta'
  heading: string
  description?: string
  linkText?: string
  linkUrl?: string
}

export interface FAQBlock {
  id?: string
  blockType: 'faq'
  heading?: string
  items: FAQItem[]
}

export interface GalleryBlock {
  id?: string
  blockType: 'gallery'
  heading?: string
  images: GalleryImage[]
}

export type PageBlock = ContentBlock | MediaContentBlock | CardsBlock | PricingBlock | CTABlock | FAQBlock | GalleryBlock | ArchiveBlock

export interface SEO {
  title?: string
  description?: string
  image?: string | MediaType
}

export interface Page {
  id: number
  title: string
  description?: string
  slug: string
  hero?: PageHero
  layout: PageBlock[]
  breadcrumbs?: Breadcrumb[]
  parent?: number | Page | null
  meta?: SEO
  publishedAt?: string
  updatedAt: string
  createdAt: string
  _status?: string
}

export interface Post {
  id: number
  title: string
  slug: string
  content: any
  excerpt?: string
  meta?: SEO
  coverImage?: MediaType
  author?: number | { id: number; name?: string; email?: string }
  categories?: number[] | { id: number; name?: string; slug?: string }[]
  tags?: { id: string; tag: string }[]
  publishedAt?: string
  updatedAt: string
  createdAt: string
  _status?: string
}

export interface Project {
  id: number
  title: string
  slug: string
  description?: string
  content?: any
  meta?: SEO
  coverImage?: MediaType
  gallery?: { id: string; image?: MediaType; alt?: string }[]
  client?: string
  year?: number
  tags?: { id: string; tag: string }[]
  updatedAt: string
  createdAt: string
  _status?: string
}

export interface DocsResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}
