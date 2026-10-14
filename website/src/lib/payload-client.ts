/**
 * PayloadClient — SOLID REST client for Payload CMS.
 *
 * Usage:
 *   import { payload } from '@/lib/payload-client'
 *   const home = await payload.pages().getBySlug('home', 'es')
 */
import type {
  Category,
  Page,
  Post,
  PostType,
  Project,
  ProjectCategory,
  ProjectType,
  Redirect,
  Service,
} from './payload-types';
import { defaultLocale } from '@/i18n';

// ── Constants ────────────────────────────────────────────

const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_DEPTH = 2;
const MAX_DOCS_PER_PAGE = 100;

// ── Types ───────────────────────────────────────────────

export interface DocsResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
}

export interface FetchOptions {
  locale?: string;
  draft?: boolean;
}

export interface PayloadClientConfig {
  url: string;
  key?: string;
  timeout?: number;
}

// ── Base Client ──────────────────────────────────────────

export class PayloadClient {
  readonly url: string;
  readonly key: string;
  readonly timeout: number;

  constructor(config: PayloadClientConfig) {
    this.url = config.url;
    this.key = config.key ?? '';
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
  }

  async fetchAPI<T = unknown>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const locale = options.locale ?? defaultLocale;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const params = new URLSearchParams();
      params.set('locale', locale);
      params.set('depth', String(DEFAULT_DEPTH));
      if (options.draft) params.set('draft', 'true');

      const separator = endpoint.includes('?') ? '&' : '?';
      const url = `${this.url}/api/${endpoint}${separator}${params.toString()}`;

      const headers: Record<string, string> = {};
      if (options.draft && this.key) {
        headers['Authorization'] = `users API-Key ${this.key}`;
      }

      const res = await fetch(url, { signal: controller.signal, headers });
      if (!res.ok) {
        console.error(`[Payload] ${endpoint}: ${res.status} ${res.statusText}`);
        throw new Error(`Payload API error: ${res.status}`);
      }
      return res.json();
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        console.error(`[Payload] timeout fetching ${endpoint}`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  resolveMediaUrl(mediaUrl?: string | null): string {
    if (!mediaUrl) return '';
    if (mediaUrl.startsWith('http')) return mediaUrl;
    const publicUrl = process.env.PAYLOAD_URL || this.url;
    return `${publicUrl}${mediaUrl}`;
  }

  pages(): PageQueries {
    return new PageQueries(this);
  }

  posts(): PostQueries {
    return new PostQueries(this);
  }

  postTypes(): PostTypeQueries {
    return new PostTypeQueries(this);
  }

  categories(): CategoryQueries {
    return new CategoryQueries(this);
  }

  projects(): ProjectQueries {
    return new ProjectQueries(this);
  }

  services(): ServiceQueries {
    return new ServiceQueries(this);
  }

  redirects(): RedirectQueries {
    return new RedirectQueries(this);
  }

  projectTypes(): ProjectTypeQueries {
    return new ProjectTypeQueries(this);
  }

  projectCategories(): ProjectCategoryQueries {
    return new ProjectCategoryQueries(this);
  }
}

// ── Base Query Class ─────────────────────────────────────

class QueryBase<T> {
  constructor(
    protected client: PayloadClient,
    private slug: string
  ) {}

  async getBySlug(slug: string, locale = defaultLocale, draft = false): Promise<T | null> {
    const data = await this.client.fetchAPI<DocsResponse<T>>(
      `${this.slug}?where[slug][equals]=${encodeURIComponent(slug)}`,
      { locale, draft }
    );
    return data.docs?.[0] ?? null;
  }

  async getAll(locale = defaultLocale): Promise<T[]> {
    const data = await this.client.fetchAPI<DocsResponse<T>>(
      `${this.slug}?limit=${MAX_DOCS_PER_PAGE}&where[_status][equals]=published`,
      { locale }
    );
    return data.docs ?? [];
  }
}

// ── Collection Query Classes ─────────────────────────────

class PageQueries extends QueryBase<Page> {
  constructor(client: PayloadClient) {
    super(client, 'pages');
  }

  async getAll(locale = defaultLocale): Promise<Page[]> {
    const data = await this.client.fetchAPI<DocsResponse<Page>>('pages', { locale });
    return data.docs ?? [];
  }
}

class PostQueries extends QueryBase<Post> {
  constructor(client: PayloadClient) {
    super(client, 'posts');
  }

  async getAll(locale = defaultLocale): Promise<Post[]> {
    const data = await this.client.fetchAPI<DocsResponse<Post>>(
      `posts?sort=-publishedAt&limit=${MAX_DOCS_PER_PAGE}&where[_status][equals]=published`,
      { locale }
    );
    return data.docs ?? [];
  }

  async getPaginated(
    locale = defaultLocale,
    page = 1,
    limit = 20,
    draft = false
  ): Promise<DocsResponse<Post>> {
    return this.client.fetchAPI<DocsResponse<Post>>(
      `posts?sort=-publishedAt&limit=${limit}&page=${page}&where[_status][equals]=published`,
      { locale, draft }
    );
  }

  async getByTag(
    tag: string,
    locale = defaultLocale,
    page = 1,
    limit = 20
  ): Promise<DocsResponse<Post>> {
    return this.client.fetchAPI<DocsResponse<Post>>(
      `posts?sort=-publishedAt&limit=${limit}&page=${page}&where[tags.name][equals]=${encodeURIComponent(tag)}&where[_status][equals]=published`,
      { locale }
    );
  }

  async getByPostType(
    postTypeId: number | string,
    locale = defaultLocale,
    page = 1,
    limit = 20
  ): Promise<DocsResponse<Post>> {
    return this.client.fetchAPI<DocsResponse<Post>>(
      `posts?sort=-publishedAt&limit=${limit}&page=${page}&where[postType][equals]=${encodeURIComponent(String(postTypeId))}&where[_status][equals]=published`,
      { locale }
    );
  }

  async getByCategory(
    categoryId: number | string,
    locale = defaultLocale,
    page = 1,
    limit = 20
  ): Promise<DocsResponse<Post>> {
    return this.client.fetchAPI<DocsResponse<Post>>(
      `posts?sort=-publishedAt&limit=${limit}&page=${page}&where[categories][equals]=${encodeURIComponent(String(categoryId))}&where[_status][equals]=published`,
      { locale }
    );
  }

  async getByPostTypeAndCategory(
    postTypeId: number | string,
    categoryId: number | string,
    locale = defaultLocale,
    page = 1,
    limit = 20
  ): Promise<DocsResponse<Post>> {
    return this.client.fetchAPI<DocsResponse<Post>>(
      `posts?sort=-publishedAt&limit=${limit}&page=${page}&where[postType][equals]=${encodeURIComponent(String(postTypeId))}&where[categories][equals]=${encodeURIComponent(String(categoryId))}&where[_status][equals]=published`,
      { locale }
    );
  }

  /**
   * Posts de un tipo cuyo `categories` sea cualquiera de los ids dados
   * (categoría + subcategorías). Usa el operador `in` de Payload: el valor se
   * divide por comas en el lado servidor.
   */
  async getByPostTypeAndCategories(
    postTypeId: number | string,
    categoryIds: Array<number | string>,
    locale = defaultLocale,
    page = 1,
    limit = 20
  ): Promise<DocsResponse<Post>> {
    const ids = categoryIds.map((id) => encodeURIComponent(String(id))).join(',');
    return this.client.fetchAPI<DocsResponse<Post>>(
      `posts?sort=-publishedAt&limit=${limit}&page=${page}&where[postType][equals]=${encodeURIComponent(String(postTypeId))}&where[categories][in]=${ids}&where[_status][equals]=published`,
      { locale }
    );
  }
}

class PostTypeQueries extends QueryBase<PostType> {
  constructor(client: PayloadClient) {
    super(client, 'post-types');
  }

  async getAll(locale = defaultLocale): Promise<PostType[]> {
    const data = await this.client.fetchAPI<DocsResponse<PostType>>(
      `post-types?sort=position&limit=${MAX_DOCS_PER_PAGE}`,
      { locale }
    );
    return data.docs ?? [];
  }
}

class CategoryQueries extends QueryBase<Category> {
  constructor(client: PayloadClient) {
    super(client, 'categories');
  }

  async getAll(locale = defaultLocale): Promise<Category[]> {
    const data = await this.client.fetchAPI<DocsResponse<Category>>(
      `categories?limit=${MAX_DOCS_PER_PAGE}`,
      { locale }
    );
    return data.docs ?? [];
  }

  async getRoots(locale = defaultLocale): Promise<Category[]> {
    const data = await this.client.fetchAPI<DocsResponse<Category>>(
      `categories?limit=${MAX_DOCS_PER_PAGE}&where[parent][exists]=false`,
      { locale }
    );
    return data.docs ?? [];
  }
}

class ProjectQueries extends QueryBase<Project> {
  constructor(client: PayloadClient) {
    super(client, 'projects');
  }

  async getAll(locale = defaultLocale): Promise<Project[]> {
    const data = await this.client.fetchAPI<DocsResponse<Project>>(
      `projects?sort=-year&limit=${MAX_DOCS_PER_PAGE}&where[_status][equals]=published`,
      { locale }
    );
    return data.docs ?? [];
  }

  async getPaginated(locale = defaultLocale, page = 1, limit = 20): Promise<DocsResponse<Project>> {
    return this.client.fetchAPI<DocsResponse<Project>>(
      `projects?sort=-year&limit=${limit}&page=${page}&where[_status][equals]=published`,
      { locale }
    );
  }

  async getByTag(
    tag: string,
    locale = defaultLocale,
    page = 1,
    limit = 20
  ): Promise<DocsResponse<Project>> {
    return this.client.fetchAPI<DocsResponse<Project>>(
      `projects?sort=-year&limit=${limit}&page=${page}&where[tags.name][equals]=${encodeURIComponent(tag)}&where[_status][equals]=published`,
      { locale }
    );
  }

  async getByType(
    projectTypeId: number | string,
    locale = defaultLocale,
    page = 1,
    limit = 20
  ): Promise<DocsResponse<Project>> {
    return this.client.fetchAPI<DocsResponse<Project>>(
      `projects?sort=-year&limit=${limit}&page=${page}&where[projectType][equals]=${encodeURIComponent(String(projectTypeId))}&where[_status][equals]=published`,
      { locale }
    );
  }

  async getByCategory(
    categoryId: number | string,
    locale = defaultLocale,
    page = 1,
    limit = 20
  ): Promise<DocsResponse<Project>> {
    return this.client.fetchAPI<DocsResponse<Project>>(
      `projects?sort=-year&limit=${limit}&page=${page}&where[categories][equals]=${encodeURIComponent(String(categoryId))}&where[_status][equals]=published`,
      { locale }
    );
  }

  async getByTypeAndCategory(
    projectTypeId: number | string,
    categoryId: number | string,
    locale = defaultLocale,
    page = 1,
    limit = 20
  ): Promise<DocsResponse<Project>> {
    return this.client.fetchAPI<DocsResponse<Project>>(
      `projects?sort=-year&limit=${limit}&page=${page}&where[projectType][equals]=${encodeURIComponent(String(projectTypeId))}&where[categories][equals]=${encodeURIComponent(String(categoryId))}&where[_status][equals]=published`,
      { locale }
    );
  }

  async getByTypeAndCategories(
    projectTypeId: number | string,
    categoryIds: Array<number | string>,
    locale = defaultLocale,
    page = 1,
    limit = 20
  ): Promise<DocsResponse<Project>> {
    const ids = categoryIds.map((id) => encodeURIComponent(String(id))).join(',');
    return this.client.fetchAPI<DocsResponse<Project>>(
      `projects?sort=-year&limit=${limit}&page=${page}&where[projectType][equals]=${encodeURIComponent(String(projectTypeId))}&where[categories][in]=${ids}&where[_status][equals]=published`,
      { locale }
    );
  }
}

class ProjectTypeQueries extends QueryBase<ProjectType> {
  constructor(client: PayloadClient) {
    super(client, 'project-types');
  }

  async getAll(locale = defaultLocale): Promise<ProjectType[]> {
    const data = await this.client.fetchAPI<DocsResponse<ProjectType>>(
      `project-types?sort=position&limit=${MAX_DOCS_PER_PAGE}`,
      { locale }
    );
    return data.docs ?? [];
  }
}

class ProjectCategoryQueries extends QueryBase<ProjectCategory> {
  constructor(client: PayloadClient) {
    super(client, 'project-categories');
  }

  async getAll(locale = defaultLocale): Promise<ProjectCategory[]> {
    const data = await this.client.fetchAPI<DocsResponse<ProjectCategory>>(
      `project-categories?limit=${MAX_DOCS_PER_PAGE}`,
      { locale }
    );
    return data.docs ?? [];
  }

  async getRoots(locale = defaultLocale): Promise<ProjectCategory[]> {
    const data = await this.client.fetchAPI<DocsResponse<ProjectCategory>>(
      `project-categories?limit=${MAX_DOCS_PER_PAGE}&where[parent][exists]=false`,
      { locale }
    );
    return data.docs ?? [];
  }
}

class ServiceQueries extends QueryBase<Service> {
  constructor(client: PayloadClient) {
    super(client, 'services');
  }

  async getAll(locale = defaultLocale): Promise<Service[]> {
    const data = await this.client.fetchAPI<DocsResponse<Service>>(
      `services?limit=${MAX_DOCS_PER_PAGE}&where[_status][equals]=published`,
      { locale }
    );
    return data.docs ?? [];
  }

  async getCategories(locale = defaultLocale): Promise<Service[]> {
    const data = await this.client.fetchAPI<DocsResponse<Service>>(
      `services?where[parent][exists]=false&where[_status][equals]=published`,
      { locale }
    );
    return data.docs ?? [];
  }

  async getByParent(parentId: string | number, locale = defaultLocale): Promise<Service[]> {
    const data = await this.client.fetchAPI<DocsResponse<Service>>(
      `services?where[parent][equals]=${encodeURIComponent(String(parentId))}&where[_status][equals]=published`,
      { locale }
    );
    return data.docs ?? [];
  }
}

class RedirectQueries {
  constructor(private client: PayloadClient) {}

  async get(from: string): Promise<Redirect | null> {
    try {
      const data = await this.client.fetchAPI<DocsResponse<Redirect>>(
        `redirects?where[from][equals]=${encodeURIComponent(from)}`
      );
      return data.docs?.[0] ?? null;
    } catch {
      return null;
    }
  }
}

// The redirects collection is created without a `type` field (the plugin only
// adds it when `redirectTypes` is configured), so a missing/invalid type means
// the redirect is permanent (301).
export function redirectTarget(redirect: Redirect): { target: string; status: number } {
  const target =
    typeof redirect.to === 'string' ? redirect.to : `/${(redirect.to as any)?.slug || ''}`;
  const status = [301, 302, 303, 307, 308].includes(Number((redirect as any).type))
    ? Number((redirect as any).type)
    : 301;
  return { target, status };
}

// ── Singleton ────────────────────────────────────────────

export const payload = new PayloadClient({
  url: process.env.INTERNAL_PAYLOAD_URL || process.env.PAYLOAD_URL || 'http://localhost:3000',
  key: process.env.PAYLOAD_API_KEY || '',
});
