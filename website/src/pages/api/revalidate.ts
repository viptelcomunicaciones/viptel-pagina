import type { APIRoute } from 'astro';

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
    const paths = Array.isArray(body?.paths) ? body.paths.filter((p): p is string => typeof p === 'string') : [];

    if (paths.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'No paths provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        revalidated: paths,
        collection: body?.collection ?? null,
        locale: body?.locale ?? null,
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