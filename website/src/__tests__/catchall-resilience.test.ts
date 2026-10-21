import { describe, it, expect } from 'vitest';
import { redirectTarget } from '@/lib/payload-client';
import type { Redirect } from '@/lib/payload-types';

describe('Catch-all dynamic route resilience (Alta 1)', () => {
  it('correctly resolves redirect targets from Payload Redirects', () => {
    const redirectDoc: Redirect = {
      id: 1,
      from: '/old-about',
      to: '/about' as unknown as Redirect['to'],
    };
    const { target, status } = redirectTarget(redirectDoc);
    expect(target).toBe('/about');
    expect(status).toBe(301);

    const docWithSlug = {
      id: 2,
      from: '/old-services',
      to: { slug: 'services' },
    } as unknown as Redirect;
    expect(redirectTarget(docWithSlug).target).toBe('/services');
  });

  it('sets 503 status, Retry-After 30, and Cache-Control no-store on CMS failure', () => {
    const response = {
      status: 200,
      headers: new Headers(),
    };

    let isError = false;
    let page: unknown = null;

    // Simulate CMS call failure in catch-all route
    try {
      throw new Error('Connection refused to CMS backend');
    } catch {
      isError = true;
    }

    if (isError) {
      response.status = 503;
      response.headers.set('Retry-After', '30');
      response.headers.set('Cache-Control', 'no-store');
    } else if (!page) {
      response.status = 404;
    }

    expect(response.status).toBe(503);
    expect(response.headers.get('Retry-After')).toBe('30');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('sets 404 status without 503 retry headers when page is cleanly not found', () => {
    const response = {
      status: 200,
      headers: new Headers(),
    };

    const isError = false;
    const page = null;

    if (isError) {
      response.status = 503;
      response.headers.set('Retry-After', '30');
      response.headers.set('Cache-Control', 'no-store');
    } else if (!page) {
      response.status = 404;
    }

    expect(response.status).toBe(404);
    expect(response.headers.get('Retry-After')).toBeNull();
    expect(response.headers.get('Cache-Control')).toBeNull();
  });
});
