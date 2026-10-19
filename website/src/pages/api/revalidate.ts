import type { APIRoute } from 'astro';
import { ssrCache } from '@/lib/cache';

export const prerender = false;

type RevalidateBody = {
  paths?: unknown;
  collection?: unknown;
  locale?: unknown;
};

export const POST: APIRoute = async ({ request, url }) => {
  const secret = url.searchParams.get('secret');
  const expected = import.meta.env.REVALIDATE_SECRET || import.meta.env.PREVIEW_SECRET;

  if (!expected || secret !== expected) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid secret' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await request.json()) as RevalidateBody;
    const paths = Array.isArray(body?.paths)
      ? body.paths.filter((p): p is string => typeof p === 'string')
      : [];
    const collection = typeof body?.collection === 'string' ? body.collection : null;

    if (paths.length === 0 && !collection) {
      return new Response(JSON.stringify({ success: false, error: 'No paths or collection provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let purgedEntries = 0;
    if (collection) {
      purgedEntries += ssrCache.invalidateByCollection(collection);
    }
    if (paths.length > 0) {
      purgedEntries += ssrCache.invalidateByPaths(paths);
    }

    return new Response(
      JSON.stringify({
        success: true,
        revalidated: paths,
        collection,
        locale: body?.locale ?? null,
        purgedEntries,
        cacheStats: ssrCache.getStats(),
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};