import { describe, it, expect, vi } from 'vitest';
import { redirectTarget, type PayloadClient } from '@/lib/payload-client';
import type { Page, Redirect } from '@/lib/payload-types';
import {
  resolveCatchallRoute,
  applyCatchallResponseHeaders,
} from '@/lib/catchall';

describe('Catch-all dynamic route resilience (Alta 1)', () => {
  describe('redirectTarget', () => {
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
      expect(redirectTarget(docWithSlug).status).toBe(301);

      const customStatusDoc = {
        id: 3,
        from: '/temp',
        to: '/target',
        type: '302',
      } as unknown as Redirect;
      expect(redirectTarget(customStatusDoc).status).toBe(302);
    });
  });

  describe('applyCatchallResponseHeaders', () => {
    it('sets 503 status, Retry-After 30, and Cache-Control no-store on CMS failure', () => {
      const response = {
        status: 200,
        headers: new Headers(),
      };

      applyCatchallResponseHeaders(response, { isError: true, hasPage: false });

      expect(response.status).toBe(503);
      expect(response.headers.get('Retry-After')).toBe('30');
      expect(response.headers.get('Cache-Control')).toBe('no-store');
    });

    it('sets 404 status without 503 retry headers when page is cleanly not found', () => {
      const response = {
        status: 200,
        headers: new Headers(),
      };

      applyCatchallResponseHeaders(response, { isError: false, hasPage: false });

      expect(response.status).toBe(404);
      expect(response.headers.get('Retry-After')).toBeNull();
      expect(response.headers.get('Cache-Control')).toBeNull();
    });

    it('maintains status when page exists and no error occurred', () => {
      const response = {
        status: 200,
        headers: new Headers(),
      };

      applyCatchallResponseHeaders(response, { isError: false, hasPage: true });

      expect(response.status).toBe(200);
      expect(response.headers.get('Retry-After')).toBeNull();
      expect(response.headers.get('Cache-Control')).toBeNull();
    });
  });

  describe('resolveCatchallRoute', () => {
    it('returns 404 immediately without calling client when pageSlug is empty', async () => {
      const mockClient = {
        redirects: vi.fn(),
        pages: vi.fn(),
      } as unknown as PayloadClient;

      const result = await resolveCatchallRoute('/es/', '', 'es', mockClient);

      expect(result).toEqual({ page: null, isError: false, status: 404 });
      expect(mockClient.redirects).not.toHaveBeenCalled();
      expect(mockClient.pages).not.toHaveBeenCalled();
    });

    it('returns redirect when redirect exists in CMS', async () => {
      const mockClient = {
        redirects: () => ({
          get: vi.fn().mockResolvedValue({
            id: 10,
            from: '/old-path',
            to: '/new-path',
          }),
        }),
        pages: () => ({
          getBySlug: vi.fn(),
        }),
      } as unknown as PayloadClient;

      const result = await resolveCatchallRoute('/old-path', 'old-path', 'es', mockClient);

      expect(result.redirect).toEqual({ target: '/new-path', status: 301 });
      expect(result.isError).toBe(false);
      expect(result.page).toBeNull();
    });

    it('returns page doc when page is found in CMS', async () => {
      const mockPage = { id: 1, title: 'Terminos y Condiciones', slug: 'terminos' } as Page;
      const mockClient = {
        redirects: () => ({
          get: vi.fn().mockResolvedValue(null),
        }),
        pages: () => ({
          getBySlug: vi.fn().mockResolvedValue(mockPage),
        }),
      } as unknown as PayloadClient;

      const result = await resolveCatchallRoute('/terminos', 'terminos', 'es', mockClient);

      expect(result.page).toBe(mockPage);
      expect(result.isError).toBe(false);
      expect(result.status).toBe(200);
    });

    it('returns 404 cleanly when page is not found in CMS', async () => {
      const mockClient = {
        redirects: () => ({
          get: vi.fn().mockResolvedValue(null),
        }),
        pages: () => ({
          getBySlug: vi.fn().mockResolvedValue(null),
        }),
      } as unknown as PayloadClient;

      const result = await resolveCatchallRoute('/no-page', 'no-page', 'es', mockClient);

      expect(result.page).toBeNull();
      expect(result.isError).toBe(false);
      expect(result.status).toBe(404);
    });

    it('catches redirects query failure and returns status 503 without throwing', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockClient = {
        redirects: () => ({
          get: vi.fn().mockRejectedValue(new Error('Connection refused to CMS')),
        }),
        pages: () => ({
          getBySlug: vi.fn(),
        }),
      } as unknown as PayloadClient;

      const result = await resolveCatchallRoute('/contacto', 'contacto', 'es', mockClient);

      expect(result.page).toBeNull();
      expect(result.isError).toBe(true);
      expect(result.status).toBe(503);
      consoleSpy.mockRestore();
    });

    it('catches pages query failure and returns status 503 without throwing', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockClient = {
        redirects: () => ({
          get: vi.fn().mockResolvedValue(null),
        }),
        pages: () => ({
          getBySlug: vi.fn().mockRejectedValue(new Error('ETIMEDOUT: Payload backend unreachable')),
        }),
      } as unknown as PayloadClient;

      const result = await resolveCatchallRoute('/servicios', 'servicios', 'es', mockClient);

      expect(result.page).toBeNull();
      expect(result.isError).toBe(true);
      expect(result.status).toBe(503);
      consoleSpy.mockRestore();
    });
  });
});
