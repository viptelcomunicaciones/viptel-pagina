import type { APIRoute } from 'astro';
import { getResolvedSiteConfig } from '@/lib/site-config';
import { renderFaviconIco } from '@/lib/favicon';

export const prerender = false;

const CACHE_CONTROL = 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800';

export const GET: APIRoute = async () => {
  const site = await getResolvedSiteConfig();
  const letter = site.name.charAt(0).toUpperCase();
  const color = site.branding.colors.themeColor;

  const ico = await renderFaviconIco(letter, color);

  return new Response(new Uint8Array(ico), {
    headers: {
      'Content-Type': 'image/x-icon',
      'Cache-Control': CACHE_CONTROL,
    },
  });
};
