import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const q = url.searchParams.get('q') ?? '';

  // Stub: real Meilisearch proxy se implementa en el plan de infraestructura.
  return new Response(
    JSON.stringify({
      q,
      results: [],
      index: null,
      note: 'Search backend is pending — plan de infraestructura.',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};