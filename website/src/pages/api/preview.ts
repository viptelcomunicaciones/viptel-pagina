import { timingSafeEqual } from 'node:crypto';
import type { APIRoute } from 'astro';
import { PREVIEW_SECRET } from 'astro:env/server';

function isValidSecret(provided: string | null | undefined, expected: string | undefined): boolean {
  if (!provided || !expected) return false;
  const bufA = Buffer.from(provided);
  const bufB = Buffer.from(expected);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export const GET: APIRoute = async ({ request, url, cookies, redirect }) => {
  const path = url.searchParams.get('path');
  const secret = request.headers.get('x-preview-secret') || url.searchParams.get('secret');

  const expectedSecret = PREVIEW_SECRET || process.env.PREVIEW_SECRET;

  if (!isValidSecret(secret, expectedSecret)) {
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
