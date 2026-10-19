/**
 * PayloadClient — SOLID REST client for Payload CMS.
 *
 * Usage:
 *   import { payload } from '@/lib/payload-client'
 *   const home = await payload.pages().getBySlug('home', 'es')
 */
import type {
  Category,
  Footer,
  Form,
  Header,
  Page,
  Post,
  PostType,
  Project,
  ProjectCategory,
  ProjectType,
  Redirect,
  Search,
  Service,
} from './payload-types';
import { defaultLocale } from '@/i18n';
import { ssrCache } from './cache';

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
  cache?: boolean;
  ttlMs?: number;
  tags?: string[];
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
    const params = new URLSearchParams();
    params.set('locale', locale);
    params.set('depth', String(DEFAULT_DEPTH));
    if (options.draft) params.set('draft', 'true');

    const separator = endpoint.includes('?') ? '&' : '?';
    const cacheKey = `${endpoint}${separator}${params.toString()}`;
    const collectionSlug = endpoint.startsWith('globals/')
      ? `global:${endpoint.split('/')[1]?.split('?')[0] ?? ''}`
      : endpoint.split('?')[0].split('/')[0];

    const tags = [`collection:${collectionSlug}`, ...(options.tags ?? [])];
    const bypassCache = Boolean(options.draft) || options.cache === false;

    return ssrCache.getOrFetch<T>(
      cacheKey,
      async () => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeout);

        try {
          const url = `${this.url}/api/${cacheKey}`;
          const headers: Record<string, string> = {};
          if (options.draft && this.key) {
            headers['Authorization'] = `users API-Key ${this.key}`;
          }

          const res = await fetch(url, { signal: controller.signal, headers });
          if (!res.ok) {
            console.error(`[Payload] ${endpoint}: ${res.status} ${res.statusText}`);
            throw new Error(`Payload API error: ${res.status}`);
          }
          return res.json() as Promise<T>;
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') {
            console.error(`[Payload] timeout fetching ${endpoint}`);
          }
          throw err;
        } finally {
          clearTimeout(timer);
        }
      },
      {
        bypass: bypassCache,
        ttlMs: options.ttlMs,
        tags,
      }
    );
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

  globals(): GlobalQueries {
    return new GlobalQueries(this);
  }

  forms(): FormQueries {
    return new FormQueries(this);
  }

  async search(query: string, locale = defaultLocale, limit = 15): Promise<Search[]> {
    const q = query.trim();
    if (!q) return [];
    const encoded = encodeURIComponent(q);
    const data = await this.fetchAPI<DocsResponse<Search>>(
      `search?where[or][0][title][like]=${encoded}&where[or][1][excerpt][like]=${encoded}&where[or][2][slug][like]=${encoded}&limit=${limit}`,
      { locale, ttlMs: 15_000 }
    );
    return data.docs ?? [];
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

class GlobalQueries {
  constructor(private client: PayloadClient) {}

  async getHeader(locale = defaultLocale): Promise<Header | null> {
    try {
      return await this.client.fetchAPI<Header>('globals/header', {
        locale,
        tags: ['collection:global:header'],
      });
    } catch {
      return null;
    }
  }

  async getFooter(locale = defaultLocale): Promise<Footer | null> {
    try {
      return await this.client.fetchAPI<Footer>('globals/footer', {
        locale,
        tags: ['collection:global:footer'],
      });
    } catch {
      return null;
    }
  }
}

class FormQueries {
  constructor(private client: PayloadClient) {}

  async getById(id: number | string, locale = defaultLocale): Promise<Form | null> {
    try {
      return await this.client.fetchAPI<Form>(`forms/${encodeURIComponent(String(id))}`, {
        locale,
        tags: ['collection:forms'],
      });
    } catch {
      return null;
    }
  }

  async getByTitle(title: string, locale = defaultLocale): Promise<Form | null> {
    try {
      const data = await this.client.fetchAPI<DocsResponse<Form>>(
        `forms?where[title][equals]=${encodeURIComponent(title)}&limit=1`,
        { locale, tags: ['collection:forms'] }
      );
      return data.docs?.[0] ?? null;
    } catch {
      return null;
    }
  }

  async getFirst(locale = defaultLocale): Promise<Form | null> {
    try {
      const data = await this.client.fetchAPI<DocsResponse<Form>>('forms?limit=1', {
        locale,
        tags: ['collection:forms'],
      });
      return data.docs?.[0] ?? null;
    } catch {
      return null;
    }
  }

  async submit(
    formId: number | string,
    submissionData: Array<{ field: string; value: string }>
  ): Promise<boolean> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.client.timeout);
    try {
      const res = await fetch(`${this.client.url}/api/form-submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: Number.isNaN(Number(formId)) ? formId : Number(formId),
          submissionData,
        }),
        signal: controller.signal,
      });
      return res.ok;
    } catch (err) {
      console.error('[Payload] form submission failed:', err);
      return false;
    } finally {
      clearTimeout(timer);
    }
  }
}

// The redirects collection is created without a `type` field (the plugin only
// adds it when `redirectTypes` is configured), so a missing/invalid type means
// the redirect is permanent (301).
export function redirectTarget(redirect: Redirect): { target: string; status: number } {
  const toVal = redirect.to as unknown as { slug?: string } | string | undefined;
  const target = typeof toVal === 'string' ? toVal : `/${toVal?.slug || ''}`;
  const rawType = Number((redirect as unknown as { type?: number | string }).type);
  const status = [301, 302, 303, 307, 308].includes(rawType) ? rawType : 301;
  return { target, status };
}

// ── Singleton ────────────────────────────────────────────

export const payload = new PayloadClient({
  url: process.env.INTERNAL_PAYLOAD_URL || process.env.PAYLOAD_URL || 'http://localhost:3000',
  key: process.env.PAYLOAD_API_KEY || '',
});
