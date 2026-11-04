import type { APIRoute } from 'astro';
import { PREVIEW_SECRET } from 'astro:env/server';

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const path = url.searchParams.get('path');
  const secret = url.searchParams.get('secret');

  const expectedSecret = PREVIEW_SECRET || process.env.PREVIEW_SECRET;

  if (!secret || secret !== expectedSecret) {
    console.warn(
      `[preview] Invalid preview secret. Received: "${secret ? '***' : ''}", expected configured: ${Boolean(expectedSecret)}`
    );
    return new Response('Invalid preview secret', { status: 401 });
  }

  // Normalize path if needed (e.g., if path starts with multiple slashes, clean to single leading slash)
  const normalizedPath = path?.replace(/^\/+/, '/');

  if (!normalizedPath || !normalizedPath.startsWith('/') || normalizedPath.includes('\\')) {
    return new Response('Invalid path parameter', { status: 400 });
  }

  cookies.set('__prv', 'true', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60, // 1 hour
  });

  return redirect(normalizedPath);
};
