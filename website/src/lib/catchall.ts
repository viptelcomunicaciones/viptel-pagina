import type { Page, Redirect } from './payload-types';
import { payload, redirectTarget, type PayloadClient } from './payload-client';

export interface CatchallResolution {
  redirect?: { target: string; status: number };
  page: Page | null;
  isError: boolean;
  status: 200 | 404 | 503;
}

export interface CatchallResponseLike {
  status: number;
  headers: {
    set: (name: string, value: string) => void;
  };
}

/**
 * Resolves a dynamic catch-all route by first checking Payload redirects,
 * then querying the page by slug. If the CMS is down or fails, it catches
 * the error and marks isError: true with status 503 instead of crashing.
 */
export async function resolveCatchallRoute(
  redirectFrom: string,
  pageSlug: string,
  locale: string,
  client: PayloadClient = payload
): Promise<CatchallResolution> {
  const trimmedSlug = (pageSlug ?? '').trim();
  if (!trimmedSlug) {
    return { page: null, isError: false, status: 404 };
  }

  try {
    const redirect = await client.redirects().get(redirectFrom);
    if (redirect) {
      const { target, status } = redirectTarget(redirect);
      return { redirect: { target, status }, page: null, isError: false, status: status as 200 };
    }

    const page = await client.pages().getBySlug(trimmedSlug, locale);
    if (!page) {
      return { page: null, isError: false, status: 404 };
    }

    return { page, isError: false, status: 200 };
  } catch (err) {
    console.error(`[Astro catchall] Error fetching page "${trimmedSlug}":`, err);
    return { page: null, isError: true, status: 503 };
  }
}

/**
 * Applies resilient HTTP response headers and status:
 * - 503 with Retry-After: 30 and Cache-Control: no-store on CMS failure/error
 * - 404 when page is not found
 */
export function applyCatchallResponseHeaders(
  response: CatchallResponseLike,
  resolution: { isError: boolean; hasPage: boolean }
): void {
  if (resolution.isError) {
    response.status = 503;
    response.headers.set('Retry-After', '30');
    response.headers.set('Cache-Control', 'no-store');
  } else if (!resolution.hasPage) {
    response.status = 404;
  }
}
