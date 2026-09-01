import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const timestamp = new Date().toISOString();
  const payloadUrl = import.meta.env.PAYLOAD_URL || 'http://localhost:3000';

  let payload = 'ok';
  try {
    const response = await fetch(`${payloadUrl}/api/health`, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) payload = 'error';
  } catch {
    payload = 'unreachable';
  }

  const healthy = payload === 'ok';

  return new Response(
    JSON.stringify({
      status: healthy ? 'ok' : 'degraded',
      timestamp,
      services: { payload },
      host: url.hostname,
    }),
    {
      status: healthy ? 200 : 503,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};