/**
 * @deprecated Use the PayloadClient class from '@/lib/payload-client' for new code.
 *   import { payload } from '@/lib/payload-client'
 *   const home = await payload.pages().getBySlug('home', 'es')
 *
 * This file remains for backward compatibility with existing consumers.
 */
import type { Page, Post, Project, Redirect, Service, DocsResponse } from './payload-client'
import { payload } from './payload-client'
import { defaultLocale } from '@/i18n'

// ── Pages ──────────────────────────────────────────────

export async function getPageBySlug(slug: string, locale = defaultLocale, draft = false): Promise<Page | null> {
  return payload.pages().getBySlug(slug, locale, draft)
}

export async function getPages(locale = defaultLocale): Promise<Page[]> {
  return payload.pages().getAll(locale)
}

// ── Posts ──────────────────────────────────────────────

export async function getPostBySlug(slug: string, locale = defaultLocale, draft = false): Promise<Post | null> {
  return payload.posts().getBySlug(slug, locale, draft)
}

export async function getPosts(locale = defaultLocale, page = 1, limit = 20, draft = false): Promise<DocsResponse<Post>> {
  return payload.posts().getPaginated(locale, page, limit, draft)
}

export async function getAllPosts(locale = defaultLocale): Promise<Post[]> {
  return payload.posts().getAll(locale)
}

export async function getPostsByTag(tag: string, locale = defaultLocale, page = 1, limit = 20): Promise<DocsResponse<Post>> {
  return payload.posts().getByTag(tag, locale, page, limit)
}

// ── Projects ───────────────────────────────────────────

export async function getProjectBySlug(slug: string, locale = defaultLocale, draft = false): Promise<Project | null> {
  return payload.projects().getBySlug(slug, locale, draft)
}

export async function getProjects(locale = defaultLocale, page = 1, limit = 20): Promise<DocsResponse<Project>> {
  return payload.projects().getPaginated(locale, page, limit)
}

export async function getAllProjects(locale = defaultLocale): Promise<Project[]> {
  return payload.projects().getAll(locale)
}

export async function getProjectsByTag(tag: string, locale = defaultLocale, page = 1, limit = 20): Promise<DocsResponse<Project>> {
  return payload.projects().getByTag(tag, locale, page, limit)
}

// ── Services ───────────────────────────────────────────

export async function getServiceCategories(locale = defaultLocale): Promise<Service[]> {
  return payload.services().getCategories(locale)
}

export async function getServicesByParent(parentId: string, locale = defaultLocale): Promise<Service[]> {
  return payload.services().getByParent(parentId, locale)
}

export async function getServiceBySlug(slug: string, locale = defaultLocale, draft = false): Promise<Service | null> {
  return payload.services().getBySlug(slug, locale, draft)
}

export async function getAllServices(locale = defaultLocale): Promise<Service[]> {
  return payload.services().getAll(locale)
}

// ── Redirects ──────────────────────────────────────────

export async function getRedirect(from: string): Promise<Redirect | null> {
  return payload.redirects().get(from)
}

// ── Media ──────────────────────────────────────────────

export function resolveMediaUrl(url?: string | null): string {
  return payload.resolveMediaUrl(url)
}

// Re-export types
export type { DocsResponse, Page, Post, Project, Service }
