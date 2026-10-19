/**
 * Hybrid SSR Cache (L1 In-Memory LRU + Stale-While-Revalidate + Optional L2 Redis Adapter).
 *
 * Designed for Astro SSR consuming Payload CMS REST API:
 * - Serves fresh entries in <1ms from L1 memory.
 * - Serves stale entries immediately while revalidating in the background (SWR).
 * - Supports selective invalidation by collection, global, or URL path via `/api/revalidate`.
 * - Automatically connects to Redis (L2) if `REDIS_URL` is configured in the environment.
 */

export interface CacheOptions {
  ttlMs?: number;
  staleMs?: number;
  tags?: string[];
  bypass?: boolean;
}

interface CacheEntry<T = unknown> {
  value: T;
  createdAt: number;
  ttlMs: number;
  staleMs: number;
  tags: Set<string>;
  revalidating?: boolean;
}

interface RedisLikeClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: string, duration?: number): Promise<unknown>;
  del(...keys: string[]): Promise<unknown>;
  keys(pattern: string): Promise<string[]>;
  connect?(): Promise<unknown>;
}

const DEFAULT_TTL_MS = 60_000; // 60s fresh
const DEFAULT_STALE_MS = 300_000; // 5m stale-while-revalidate window
const MAX_ENTRIES = 500;
const REDIS_PREFIX = 'viptel:ssr:';

export class HybridSSRCache {
  private l1 = new Map<string, CacheEntry>();
  private hits = 0;
  private misses = 0;
  private staleHits = 0;
  private redisPromise: Promise<RedisLikeClient | null> | null = null;

  constructor(private maxEntries = MAX_ENTRIES) {}

  private getRedis(): Promise<RedisLikeClient | null> {
    const redisUrl = typeof process !== 'undefined' ? process.env.REDIS_URL : undefined;
    if (!redisUrl) return Promise.resolve(null);

    if (!this.redisPromise) {
      this.redisPromise = (async () => {
        try {
          const pkgName = 'ioredis';
          const mod = await import(/* @vite-ignore */ pkgName);
          const RedisCtor = mod.default || mod.Redis || mod;
          const client: RedisLikeClient = new RedisCtor(redisUrl, {
            maxRetriesPerRequest: 1,
            enableOfflineQueue: false,
            lazyConnect: true,
          });
          if (typeof client.connect === 'function') {
            await client.connect();
          }
          return client;
        } catch {
          return null;
        }
      })();
    }
    return this.redisPromise;
  }

  private evictIfNeeded(): void {
    while (this.l1.size >= this.maxEntries) {
      const oldestKey = this.l1.keys().next().value;
      if (oldestKey === undefined) break;
      this.l1.delete(oldestKey);
    }
  }

  private touch(key: string, entry: CacheEntry): void {
    this.l1.delete(key);
    this.l1.set(key, entry);
  }

  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    if (options.bypass) {
      return fetcher();
    }

    const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
    const staleMs = options.staleMs ?? DEFAULT_STALE_MS;
    const tags = new Set(options.tags ?? []);
    const now = Date.now();

    const existing = this.l1.get(key) as CacheEntry<T> | undefined;
    if (existing) {
      const age = now - existing.createdAt;

      if (age <= existing.ttlMs) {
        this.hits++;
        this.touch(key, existing);
        return existing.value;
      }

      if (age <= existing.ttlMs + existing.staleMs) {
        this.staleHits++;
        this.touch(key, existing);
        if (!existing.revalidating) {
          existing.revalidating = true;
          fetcher()
            .then((freshValue) => {
              this.set(key, freshValue, { ttlMs, staleMs, tags: Array.from(tags) });
            })
            .catch(() => {
              existing.revalidating = false;
            });
        }
        return existing.value;
      }

      this.l1.delete(key);
    }

    // Check optional L2 Redis
    const redis = await this.getRedis();
    if (redis) {
      try {
        const raw = await redis.get(`${REDIS_PREFIX}${key}`);
        if (raw) {
          const parsed = JSON.parse(raw) as {
            value: T;
            createdAt: number;
            ttlMs: number;
            staleMs: number;
            tags: string[];
          };
          const entry: CacheEntry<T> = {
            value: parsed.value,
            createdAt: parsed.createdAt,
            ttlMs: parsed.ttlMs,
            staleMs: parsed.staleMs,
            tags: new Set(parsed.tags),
          };
          this.evictIfNeeded();
          this.l1.set(key, entry);
          this.hits++;
          return parsed.value;
        }
      } catch {
        // Ignore L2 read errors and fall through to fetcher
      }
    }

    this.misses++;
    const value = await fetcher();
    this.set(key, value, { ttlMs, staleMs, tags: Array.from(tags) });
    return value;
  }

  set<T>(key: string, value: T, options: CacheOptions = {}): void {
    const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
    const staleMs = options.staleMs ?? DEFAULT_STALE_MS;
    const tags = new Set(options.tags ?? []);

    this.evictIfNeeded();
    const entry: CacheEntry<T> = {
      value,
      createdAt: Date.now(),
      ttlMs,
      staleMs,
      tags,
    };
    this.l1.set(key, entry);

    void this.getRedis().then(async (redis) => {
      if (!redis) return;
      try {
        const payload = JSON.stringify({
          value,
          createdAt: entry.createdAt,
          ttlMs,
          staleMs,
          tags: Array.from(tags),
        });
        const totalSeconds = Math.ceil((ttlMs + staleMs) / 1000);
        await redis.set(`${REDIS_PREFIX}${key}`, payload, 'EX', totalSeconds);
      } catch {
        // Ignore L2 write errors
      }
    });
  }

  invalidateByCollection(collection: string): number {
    let removed = 0;
    const targetTag = `collection:${collection}`;

    for (const [key, entry] of this.l1.entries()) {
      if (
        entry.tags.has(targetTag) ||
        entry.tags.has(collection) ||
        key.startsWith(`${collection}?`) ||
        key.startsWith(`${collection}/`) ||
        key.startsWith(`globals/${collection.replace(/^global:/, '')}`)
      ) {
        this.l1.delete(key);
        removed++;
      }
    }

    // If a content collection changes, also invalidate search cache
    if (['pages', 'posts', 'projects', 'services'].includes(collection)) {
      for (const [key, entry] of this.l1.entries()) {
        if (entry.tags.has('collection:search') || key.startsWith('search?')) {
          this.l1.delete(key);
          removed++;
        }
      }
    }

    void this.getRedis().then(async (redis) => {
      if (!redis) return;
      try {
        const keys = await redis.keys(`${REDIS_PREFIX}*`);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } catch {
        // Ignore L2 purge errors
      }
    });

    return removed;
  }

  invalidateByPaths(paths: string[]): number {
    let removed = 0;
    const slugs = new Set<string>();

    for (const p of paths) {
      const clean = p.replace(/^\/(en\/)?/, '').replace(/\/$/, '');
      if (!clean) {
        slugs.add('home');
      } else {
        const parts = clean.split('/');
        slugs.add(parts[parts.length - 1]);
        slugs.add(clean);
      }
    }

    for (const [key, entry] of this.l1.entries()) {
      let shouldRemove = false;
      for (const slug of slugs) {
        if (
          entry.tags.has(`slug:${slug}`) ||
          key.includes(encodeURIComponent(slug)) ||
          key.includes(slug)
        ) {
          shouldRemove = true;
          break;
        }
      }
      // Also invalidate list queries when any path is revalidated
      if (shouldRemove || key.includes('limit=')) {
        this.l1.delete(key);
        removed++;
      }
    }

    return removed;
  }

  clearAll(): void {
    this.l1.clear();
    void this.getRedis().then(async (redis) => {
      if (!redis) return;
      try {
        const keys = await redis.keys(`${REDIS_PREFIX}*`);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } catch {
        // Ignore
      }
    });
  }

  getStats() {
    return {
      size: this.l1.size,
      maxEntries: MAX_ENTRIES,
      hits: this.hits,
      misses: this.misses,
      staleHits: this.staleHits,
    };
  }
}

export const ssrCache = new HybridSSRCache();
