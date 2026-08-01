import type { DocsResponse, Page, Post, Project } from './payload-types'
import { defaultLocale } from '@/i18n'

const API_URL = process.env.PAYLOAD_URL || 'http://localhost:3000'
const FETCH_TIMEOUT = 10_000

export async function fetchAPI<T = unknown>(endpoint: string, locale = defaultLocale, query = ''): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

  try {
    const url = `${API_URL}/api/${endpoint}?locale=${locale}&depth=2${query ? `&${query}` : ''}`
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' },
    })
    if (!res.ok) throw new Error(`Payload API error: ${res.statusText} (${res.status})`)
    return res.json()
  } finally {
    clearTimeout(timeout)
  }
}

export async function getPageBySlug(slug: string, locale = defaultLocale): Promise<Page | null> {
  const all = await getPages(locale)
  return all.find((p) => p.slug === slug) ?? null
}

export async function getPages(locale = defaultLocale): Promise<Page[]> {
  const data = await fetchAPI<DocsResponse<Page>>('pages', locale, 'sort=createdAt&limit=100')
  return data.docs ?? []
}

export async function getPostBySlug(slug: string, locale = defaultLocale): Promise<Post | null> {
  const all = await getAllPosts(locale)
  return all.find((p) => p.slug === slug) ?? null
}

export async function getPosts(locale = defaultLocale, page = 1, limit = 20): Promise<DocsResponse<Post>> {
  return fetchAPI<DocsResponse<Post>>('posts', locale, `sort=-publishedAt&limit=${limit}&page=${page}&depth=2`)
}

export async function getAllPosts(locale = defaultLocale): Promise<Post[]> {
  const data = await fetchAPI<DocsResponse<Post>>('posts', locale, 'sort=-publishedAt&limit=100&depth=2')
  return data.docs ?? []
}

export async function getProjectBySlug(slug: string, locale = defaultLocale): Promise<Project | null> {
  const all = await getAllProjects(locale)
  return all.find((p) => p.slug === slug) ?? null
}

export async function getProjects(locale = defaultLocale, page = 1, limit = 20): Promise<DocsResponse<Project>> {
  return fetchAPI<DocsResponse<Project>>('projects', locale, `sort=-year&limit=${limit}&page=${page}`)
}

export async function getAllProjects(locale = defaultLocale): Promise<Project[]> {
  const data = await fetchAPI<DocsResponse<Project>>('projects', locale, 'sort=-year&limit=100')
  return data.docs ?? []
}
