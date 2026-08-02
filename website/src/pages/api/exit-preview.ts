import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete('__prv', { path: '/' });
  return redirect('/');
};
