/**
 * PayloadClient — SOLID REST client for Payload CMS.
 *
 * Principles:
 * - Single Responsibility: one query class per collection
 * - Open/Closed: extend via new query classes, base client untouched
 * - Interface Segregation: each query class exposes only relevant methods
 * - Dependency Inversion: components depend on this client, not raw fetch
 *
 * Usage:
 *   import { payload } from '@/lib/payload-client'
 *   const home = await payload.pages().getBySlug('home', 'es')
 *   const posts = await payload.posts().getLatest(4, 'es')
 */
import type { Page, Post, Project, Redirect, Service } from './payload-types'
import { defaultLocale } from '@/i18n'

// ── Types ───────────────────────────────────────────────

export interface DocsResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
}

export interface FetchOptions {
  locale?: string
  draft?: boolean
}

export interface PayloadClientConfig {
  url: string
  key?: string
  timeout?: number
}

// ── Base Client ──────────────────────────────────────────

export class PayloadClient {
  readonly url: string
  readonly key: string
  readonly timeout: number

  constructor(config: PayloadClientConfig) {
    this.url = config.url
    this.key = config.key ?? ''
    this.timeout = config.timeout ?? 15_000
  }

  /** Low-level fetch with timeout, error handling, and auth headers. */
  async fetchAPI<T = unknown>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const locale = options.locale ?? defaultLocale
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeout)

    try {
      const params = new URLSearchParams()
      params.set('locale', locale)
      params.set('depth', '2')
      if (options.draft) params.set('draft', 'true')

      const separator = endpoint.includes('?') ? '&' : '?'
      const finalUrl = `${this.url}/api/${endpoint}${separator}${params.toString()}`

      const headers: Record<string, string> = {}
      if (options.draft && this.key) {
        headers['Authorization'] = `users API-Key ${this.key}`
      }

      const res = await fetch(finalUrl, { signal: controller.signal, headers })

      if (!res.ok) {
        console.error(`[Payload] ${endpoint}: ${res.status} ${res.statusText}`)
        throw new Error(`Payload API error: ${res.status}`)
      }

      return res.json()
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        console.error(`[Payload] timeout fetching ${endpoint}`)
      }
      throw err
    } finally {
      clearTimeout(timer)
    }
  }

  /** Resolve relative Payload media URLs to absolute URLs. */
  resolveMediaUrl(mediaUrl?: string | null): string {
    if (!mediaUrl) return ''
    if (mediaUrl.startsWith('http')) return mediaUrl
    return `${this.url}${mediaUrl}`
  }

  // ── Collection accessors ───────────────────────────────

  pages(): PageQueries {
    return new PageQueries(this)
  }

  posts(): PostQueries {
    return new PostQueries(this)
  }

  projects(): ProjectQueries {
    return new ProjectQueries(this)
  }

  services(): ServiceQueries {
    return new ServiceQueries(this)
  }

  redirects(): RedirectQueries {
    return new RedirectQueries(this)
  }
}

// ── Collection Query Classes ─────────────────────────────

class PageQueries {
  constructor(private client: PayloadClient) {}

  async getBySlug(slug: string, locale = defaultLocale, draft = false): Promise<Page | null> {
    const data = await this.client.fetchAPI<DocsResponse<Page>>(
      `pages?where[slug][equals]=${encodeURIComponent(slug)}`,
      { locale, draft },
    )
    return data.docs?.[0] ?? null
  }

  async getAll(locale = defaultLocale): Promise<Page[]> {
    const data = await this.client.fetchAPI<DocsResponse<Page>>('pages', { locale })
    return data.docs ?? []
  }
}

class PostQueries {
  constructor(private client: PayloadClient) {}

  async getBySlug(slug: string, locale = defaultLocale, draft = false): Promise<Post | null> {
    const data = await this.client.fetchAPI<DocsResponse<Post>>(
      `posts?where[slug][equals]=${encodeURIComponent(slug)}`,
      { locale, draft },
    )
    return data.docs?.[0] ?? null
  }

  async getPaginated(
    locale = defaultLocale,
    page = 1,
    limit = 20,
    draft = false,
  ): Promise<DocsResponse<Post>> {
    return this.client.fetchAPI<DocsResponse<Post>>(
      `posts?sort=-publishedAt&limit=${limit}&page=${page}&where[_status][equals]=published`,
      { locale, draft },
    )
  }

  async getAll(locale = defaultLocale): Promise<Post[]> {
    const data = await this.client.fetchAPI<DocsResponse<Post>>(
      `posts?sort=-publishedAt&limit=100&where[_status][equals]=published`,
      { locale },
    )
    return data.docs ?? []
  }

  async getByTag(
    tag: string,
    locale = defaultLocale,
    page = 1,
    limit = 20,
  ): Promise<DocsResponse<Post>> {
    return this.client.fetchAPI<DocsResponse<Post>>(
      `posts?sort=-publishedAt&limit=${limit}&page=${page}&where[tags.tag][equals]=${encodeURIComponent(tag)}&where[_status][equals]=published`,
      { locale },
    )
  }
}

class ProjectQueries {
  constructor(private client: PayloadClient) {}

  async getBySlug(slug: string, locale = defaultLocale, draft = false): Promise<Project | null> {
    const data = await this.client.fetchAPI<DocsResponse<Project>>(
      `projects?where[slug][equals]=${encodeURIComponent(slug)}`,
      { locale, draft },
    )
    return data.docs?.[0] ?? null
  }

  async getPaginated(locale = defaultLocale, page = 1, limit = 20): Promise<DocsResponse<Project>> {
    return this.client.fetchAPI<DocsResponse<Project>>(
      `projects?sort=-year&limit=${limit}&page=${page}&where[_status][equals]=published`,
      { locale },
    )
  }

  async getAll(locale = defaultLocale): Promise<Project[]> {
    const data = await this.client.fetchAPI<DocsResponse<Project>>(
      `projects?sort=-year&limit=100&where[_status][equals]=published`,
      { locale },
    )
    return data.docs ?? []
  }

  async getByTag(
    tag: string,
    locale = defaultLocale,
    page = 1,
    limit = 20,
  ): Promise<DocsResponse<Project>> {
    return this.client.fetchAPI<DocsResponse<Project>>(
      `projects?sort=-year&limit=${limit}&page=${page}&where[tags.tag][equals]=${encodeURIComponent(tag)}&where[_status][equals]=published`,
      { locale },
    )
  }
}

class ServiceQueries {
  constructor(private client: PayloadClient) {}

  async getCategories(locale = defaultLocale): Promise<Service[]> {
    const data = await this.client.fetchAPI<DocsResponse<Service>>(
      `services?where[parent][exists]=false&where[_status][equals]=published`,
      { locale },
    )
    return data.docs ?? []
  }

  async getByParent(parentId: string, locale = defaultLocale): Promise<Service[]> {
    const data = await this.client.fetchAPI<DocsResponse<Service>>(
      `services?where[parent][equals]=${encodeURIComponent(parentId)}&where[_status][equals]=published`,
      { locale },
    )
    return data.docs ?? []
  }

  async getBySlug(slug: string, locale = defaultLocale, draft = false): Promise<Service | null> {
    const data = await this.client.fetchAPI<DocsResponse<Service>>(
      `services?where[slug][equals]=${encodeURIComponent(slug)}`,
      { locale, draft },
    )
    return data.docs?.[0] ?? null
  }

  async getAll(locale = defaultLocale): Promise<Service[]> {
    const data = await this.client.fetchAPI<DocsResponse<Service>>(
      `services?limit=100&where[_status][equals]=published`,
      { locale },
    )
    return data.docs ?? []
  }
}

class RedirectQueries {
  constructor(private client: PayloadClient) {}

  async get(from: string): Promise<Redirect | null> {
    try {
      const data = await this.client.fetchAPI<DocsResponse<Redirect>>(
        `redirects?where[from][equals]=${encodeURIComponent(from)}`,
      )
      return data.docs?.[0] ?? null
    } catch {
      return null
    }
  }
}

// ── Singleton ────────────────────────────────────────────

export const payload = new PayloadClient({
  url: process.env.PAYLOAD_URL || 'http://localhost:3000',
  key: process.env.PAYLOAD_API_KEY || '',
})
