import { describe, it, expect, beforeEach } from 'vitest';
import { HybridSSRCache } from '../lib/cache';
import { rateLimit, getClientIp } from '../lib/rate-limit';

describe('HybridSSRCache (L1 LRU + SWR + selective invalidation)', () => {
  let cache: HybridSSRCache;

  beforeEach(() => {
    cache = new HybridSSRCache(3);
  });

  it('caches values and returns cached hit without calling fetcher again', async () => {
    let calls = 0;
    const fetcher = async () => {
      calls++;
      return { value: calls };
    };

    const first = await cache.getOrFetch('pages?locale=es', fetcher, {
      tags: ['collection:pages'],
    });
    const second = await cache.getOrFetch('pages?locale=es', fetcher, {
      tags: ['collection:pages'],
    });

    expect(first).toEqual({ value: 1 });
    expect(second).toEqual({ value: 1 });
    expect(calls).toBe(1);
  });

  it('bypasses cache when bypass=true (draft preview mode)', async () => {
    let calls = 0;
    const fetcher = async () => ({ call: ++calls });

    await cache.getOrFetch('pages?locale=es', fetcher);
    const bypassed = await cache.getOrFetch('pages?locale=es', fetcher, { bypass: true });

    expect(bypassed).toEqual({ call: 2 });
    expect(calls).toBe(2);
  });

  it('evicts oldest entry when maxEntries is exceeded (LRU)', async () => {
    let calls = 0;
    const fetcher = (id: string) => async () => {
      calls++;
      return id;
    };

    await cache.getOrFetch('k1', fetcher('v1'));
    await cache.getOrFetch('k2', fetcher('v2'));
    await cache.getOrFetch('k3', fetcher('v3'));
    // Access k1 to make k2 the least-recently-used
    await cache.getOrFetch('k1', fetcher('v1-new'));
    // Insert k4 -> should evict k2
    await cache.getOrFetch('k4', fetcher('v4'));

    const stats = cache.getStats();
    expect(stats.size).toBe(3);

    // k1 should still be cached (no new fetch)
    const beforeCalls = calls;
    await cache.getOrFetch('k1', fetcher('v1-new'));
    expect(calls).toBe(beforeCalls);

    // k2 was evicted so fetching it increments calls
    await cache.getOrFetch('k2', fetcher('v2-refetched'));
    expect(calls).toBe(beforeCalls + 1);
  });

  it('selectively invalidates by collection and by paths', async () => {
    let pageCalls = 0;
    let postCalls = 0;

    await cache.getOrFetch('pages?slug=about', async () => ++pageCalls, {
      tags: ['collection:pages', 'slug:about'],
    });
    await cache.getOrFetch('posts?slug=news', async () => ++postCalls, {
      tags: ['collection:posts', 'slug:news'],
    });

    const removed = cache.invalidateByCollection('pages');
    expect(removed).toBeGreaterThan(0);

    // Pages entry was invalidated, posts entry remains cached
    await cache.getOrFetch('pages?slug=about', async () => ++pageCalls, {
      tags: ['collection:pages', 'slug:about'],
    });
    await cache.getOrFetch('posts?slug=news', async () => ++postCalls, {
      tags: ['collection:posts', 'slug:news'],
    });

    expect(pageCalls).toBe(2);
    expect(postCalls).toBe(1);

    // Now invalidate by path
    const removedByPath = cache.invalidateByPaths(['/blog/news']);
    expect(removedByPath).toBeGreaterThan(0);
  });

  it('serves stale entry immediately and revalidates in the background (SWR)', async () => {
    let calls = 0;
    const fetcher = async () => ({ version: ++calls });

    // Set ttlMs=1 and staleMs=60000 so the entry enters the stale-while-revalidate window after 5ms
    const initial = await cache.getOrFetch('swr-key', fetcher, {
      ttlMs: 1,
      staleMs: 60_000,
    });
    expect(initial).toEqual({ version: 1 });

    // Wait 10ms so age > ttlMs
    await new Promise((r) => setTimeout(r, 10));

    const staleHit = await cache.getOrFetch('swr-key', fetcher, {
      ttlMs: 1,
      staleMs: 60_000,
    });
    // Should return stale value immediately
    expect(staleHit).toEqual({ version: 1 });

    // Wait for background revalidation to finish
    await new Promise((r) => setTimeout(r, 20));
    expect(calls).toBe(2);
  });

  it('handles offline or unreachable REDIS_URL gracefully with L1 fallback', async () => {
    const originalRedisUrl = process.env.REDIS_URL;
    process.env.REDIS_URL = 'redis://127.0.0.1:65534'; // non-existent port

    try {
      const redisFallbackCache = new HybridSSRCache(10);
      let fetchCount = 0;
      const fetcher = async () => ({ value: ++fetchCount });

      const res1 = await redisFallbackCache.getOrFetch('resilient-key', fetcher);
      expect(res1).toEqual({ value: 1 });

      const res2 = await redisFallbackCache.getOrFetch('resilient-key', fetcher);
      expect(res2).toEqual({ value: 1 });
      expect(fetchCount).toBe(1); // Served from L1 cache without crash
    } finally {
      if (originalRedisUrl !== undefined) {
        process.env.REDIS_URL = originalRedisUrl;
      } else {
        delete process.env.REDIS_URL;
      }
    }
  });
});

describe('Rate limit & Client IP extraction', () => {
  it('extracts client IP from x-forwarded-for, x-real-ip, or cf-connecting-ip', () => {
    const req1 = new Request('https://viptel.com/api/contact', {
      headers: { 'x-forwarded-for': '203.0.113.10, 10.0.0.1' },
    });
    expect(getClientIp(req1)).toBe('203.0.113.10');

    const req2 = new Request('https://viptel.com/api/contact', {
      headers: { 'cf-connecting-ip': '198.51.100.7' },
    });
    expect(getClientIp(req2)).toBe('198.51.100.7');
  });

  it('allows up to 10 requests per window and blocks the 11th request', () => {
    const testIp = `test-ip-${Date.now()}`;
    for (let i = 0; i < 10; i++) {
      expect(rateLimit(testIp)).toBe(false);
    }
    expect(rateLimit(testIp)).toBe(true);
  });
});

