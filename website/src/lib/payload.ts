import type { Page, Post, Project, Redirect, Service } from './payload-types'
import { defaultLocale } from '@/i18n'

const API_URL = process.env.PAYLOAD_URL || 'http://localhost:3000'
const FETCH_TIMEOUT = 15_000
const API_KEY = process.env.PAYLOAD_API_KEY || ''

interface DocsResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
}

interface FetchOptions {
  locale?: string
  draft?: boolean
}

function draftHeaders(): Record<string, string> {
  return API_KEY ? { Authorization: `users API-Key ${API_KEY}` } : {}
}

async function fetchAPI<T = unknown>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const locale = options.locale ?? defaultLocale
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

  try {
    const params = new URLSearchParams()
    params.set('locale', locale)
    params.set('depth', '2')
    if (options.draft) params.set('draft', 'true')

    const separator = endpoint.includes('?') ? '&' : '?'
    const url = `${API_URL}/api/${endpoint}${separator}${params.toString()}`
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        ...(options.draft ? draftHeaders() : {}),
      },
    })

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
    clearTimeout(timeout)
  }
}

// ── Pages ──────────────────────────────────────────────

export async function getPageBySlug(
  slug: string,
  locale = defaultLocale,
  draft = false,
): Promise<Page | null> {
  const data = await fetchAPI<DocsResponse<Page>>(
    `pages?where[slug][equals]=${encodeURIComponent(slug)}`,
    { locale, draft },
  )
  return data.docs?.[0] ?? null
}

export async function getPages(locale = defaultLocale): Promise<Page[]> {
  const data = await fetchAPI<DocsResponse<Page>>('pages', { locale })
  return data.docs ?? []
}

// ── Posts ──────────────────────────────────────────────

export async function getPostBySlug(
  slug: string,
  locale = defaultLocale,
  draft = false,
): Promise<Post | null> {
  const data = await fetchAPI<DocsResponse<Post>>(
    `posts?where[slug][equals]=${encodeURIComponent(slug)}`,
    { locale, draft },
  )
  return data.docs?.[0] ?? null
}

export async function getPosts(
  locale = defaultLocale,
  page = 1,
  limit = 20,
  draft = false,
): Promise<DocsResponse<Post>> {
  return fetchAPI<DocsResponse<Post>>(
    `posts?sort=-publishedAt&limit=${limit}&page=${page}&where[_status][equals]=published`,
    { locale, draft },
  )
}

export async function getAllPosts(locale = defaultLocale): Promise<Post[]> {
  const data = await fetchAPI<DocsResponse<Post>>(
    `posts?sort=-publishedAt&limit=100&where[_status][equals]=published`,
    { locale },
  )
  return data.docs ?? []
}

export async function getPostsByTag(
  tag: string,
  locale = defaultLocale,
  page = 1,
  limit = 20,
): Promise<DocsResponse<Post>> {
  return fetchAPI<DocsResponse<Post>>(
    `posts?sort=-publishedAt&limit=${limit}&page=${page}&where[tags.tag][equals]=${encodeURIComponent(tag)}&where[_status][equals]=published`,
    { locale },
  )
}

// ── Projects ───────────────────────────────────────────

export async function getProjectBySlug(
  slug: string,
  locale = defaultLocale,
  draft = false,
): Promise<Project | null> {
  const data = await fetchAPI<DocsResponse<Project>>(
    `projects?where[slug][equals]=${encodeURIComponent(slug)}`,
    { locale, draft },
  )
  return data.docs?.[0] ?? null
}

export async function getProjects(
  locale = defaultLocale,
  page = 1,
  limit = 20,
): Promise<DocsResponse<Project>> {
  return fetchAPI<DocsResponse<Project>>(
    `projects?sort=-year&limit=${limit}&page=${page}&where[_status][equals]=published`,
    { locale },
  )
}

export async function getAllProjects(locale = defaultLocale): Promise<Project[]> {
  const data = await fetchAPI<DocsResponse<Project>>(
    `projects?sort=-year&limit=100&where[_status][equals]=published`,
    { locale },
  )
  return data.docs ?? []
}

export async function getProjectsByTag(
  tag: string,
  locale = defaultLocale,
  page = 1,
  limit = 20,
): Promise<DocsResponse<Project>> {
  return fetchAPI<DocsResponse<Project>>(
    `projects?sort=-year&limit=${limit}&page=${page}&where[tags.tag][equals]=${encodeURIComponent(tag)}&where[_status][equals]=published`,
    { locale },
  )
}

// ── Services ───────────────────────────────────────────

export async function getServiceCategories(
  locale = defaultLocale,
): Promise<Service[]> {
  const data = await fetchAPI<DocsResponse<Service>>(
    `services?where[parent][exists]=false&where[_status][equals]=published`,
    { locale },
  )
  return data.docs ?? []
}

export async function getServicesByParent(
  parentId: string,
  locale = defaultLocale,
): Promise<Service[]> {
  const data = await fetchAPI<DocsResponse<Service>>(
    `services?where[parent][equals]=${encodeURIComponent(parentId)}&where[_status][equals]=published`,
    { locale },
  )
  return data.docs ?? []
}

export async function getServiceBySlug(
  slug: string,
  locale = defaultLocale,
  draft = false,
): Promise<Service | null> {
  const data = await fetchAPI<DocsResponse<Service>>(
    `services?where[slug][equals]=${encodeURIComponent(slug)}`,
    { locale, draft },
  )
  return data.docs?.[0] ?? null
}

export async function getAllServices(
  locale = defaultLocale,
): Promise<Service[]> {
  const data = await fetchAPI<DocsResponse<Service>>(
    `services?limit=100&where[_status][equals]=published`,
    { locale },
  )
  return data.docs ?? []
}

// ── Redirects ──────────────────────────────────────────

export async function getRedirect(from: string): Promise<Redirect | null> {
  try {
    const data = await fetchAPI<DocsResponse<Redirect>>(
      `redirects?where[from][equals]=${encodeURIComponent(from)}`,
    )
    return data.docs?.[0] ?? null
  } catch {
    return null
  }
}

export function resolveMediaUrl(url?: string | null): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${API_URL}${url}`
}

export type { DocsResponse, Page, Post, Project, Service }
