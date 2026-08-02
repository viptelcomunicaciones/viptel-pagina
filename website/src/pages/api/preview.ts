import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const path = url.searchParams.get('path');
  const secret = url.searchParams.get('secret');

  if (secret !== process.env.PREVIEW_SECRET) {
    return new Response('Invalid preview secret', { status: 401 });
  }

  if (!path) {
    return new Response('Missing path parameter', { status: 400 });
  }

  cookies.set('__prv', 'true', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60, // 1 hour
  });

  return redirect(path);
};
