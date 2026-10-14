import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const timestamp = new Date().toISOString();
  const payloadUrl =
    process.env.INTERNAL_PAYLOAD_URL ||
    process.env.PAYLOAD_URL ||
    import.meta.env.PAYLOAD_URL ||
    'http://localhost:3000';

  let payload = 'ok';
  try {
    const response = await fetch(`${payloadUrl}/api/health`, { signal: AbortSignal.timeout(4000) });
    if (!response.ok) payload = 'degraded';
  } catch {
    payload = 'unreachable';
  }

  return new Response(
    JSON.stringify({
      status: 'ok',
      backendStatus: payload,
      timestamp,
      host: url.hostname,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};