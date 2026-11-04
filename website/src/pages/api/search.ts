import type { APIRoute } from 'astro';
import { payload } from '@/lib/payload-client';
import { localizedPath, resolveLocale } from '@/i18n';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

export const prerender = false;

export const GET: APIRoute = async ({ request, url, clientAddress }) => {
  const rawQuery = (url.searchParams.get('q') ?? '').trim();
  const q = rawQuery.slice(0, 100);
  const locale = resolveLocale(url.searchParams.get('locale') ?? undefined);

  if (!q || q.length < 2) {
    return new Response(JSON.stringify({ q, results: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ip = getClientIp(request, clientAddress);
  if (rateLimit(`search:${ip}`, 60)) {
    return new Response(JSON.stringify({ error: 'rate_limited', q, results: [] }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const docs = await payload.search(q, locale, 12);
    const results = docs.map((doc) => {
      const relationTo = doc.doc?.relationTo ?? 'pages';
      const slug = doc.slug || '';
      const rawUrl =
        doc.url ||
        (relationTo === 'posts'
          ? `/blog/${slug}`
          : relationTo === 'projects'
            ? `/projects/${slug}`
            : relationTo === 'services'
              ? `/services/${slug}`
              : slug === 'home'
                ? '/'
                : `/${slug}`);

      return {
        title: doc.title || slug,
        url: localizedPath(rawUrl, locale),
        excerpt: doc.excerpt || '',
        collection: relationTo,
      };
    });

    return new Response(JSON.stringify({ q, results }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=15, stale-while-revalidate=60',
      },
    });
  } catch (err) {
    console.error('[Search API] error:', err);
    return new Response(JSON.stringify({ error: 'search_unavailable', q, results: [] }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};