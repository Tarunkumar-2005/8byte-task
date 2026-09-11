/**
 * Server-Side In-Memory Cache with TTL & Request Deduplication
 * 
 * Protects against upstream rate-limits, eliminates duplicate parallel requests,
 * and maintains performance across short 15-second refresh cycles.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private inflightRequests: Map<string, Promise<any>> = new Map();
  private defaultTTL: number;

  constructor() {
    const envTTL = process.env.MARKET_DATA_CACHE_TTL;
    this.defaultTTL = envTTL ? Math.max(5, parseInt(envTTL, 10)) : 15;
  }

  /**
   * Retrieves an item from cache if it hasn't expired.
   */
  get<T>(key: string): { data: T; ageSeconds: number } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    const ageSeconds = Math.floor((now - entry.timestamp) / 1000);
    return { data: entry.data as T, ageSeconds };
  }

  /**
   * Retrieves an item even if it has expired (stale fallback for error tolerance)
   */
  getStale<T>(key: string): { data: T; ageSeconds: number } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    const now = Date.now();
    const ageSeconds = Math.floor((now - entry.timestamp) / 1000);
    return { data: entry.data as T, ageSeconds };
  }

  /**
   * Stores an item with a given TTL in seconds.
   */
  set<T>(key: string, data: T, ttlSeconds?: number): void {
    const ttl = (ttlSeconds ?? this.defaultTTL) * 1000;
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }

  /**
   * Invalidates a key or clears all cache entries
   */
  invalidate(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Deduplicates concurrent fetch calls for the same key.
   * If a fetch is already in flight, subsequent calls wait for that same promise.
   */
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<{ data: T; isCached: boolean; ageSeconds: number }> {
    const cached = this.get<T>(key);
    if (cached) {
      return { data: cached.data, isCached: true, ageSeconds: cached.ageSeconds };
    }

    // Check if a request for this key is already in flight
    if (this.inflightRequests.has(key)) {
      const result = await this.inflightRequests.get(key);
      return { data: result, isCached: true, ageSeconds: 0 };
    }

    // Execute the fetch and store the promise
    const promise = (async () => {
      try {
        const freshData = await fetchFn();
        this.set(key, freshData, ttlSeconds);
        return freshData;
      } finally {
        this.inflightRequests.delete(key);
      }
    })();

    this.inflightRequests.set(key, promise);
    const data = await promise;
    return { data, isCached: false, ageSeconds: 0 };
  }

  /**
   * Returns configured default TTL in seconds
   */
  getDefaultTTL(): number {
    return this.defaultTTL;
  }
}

// Global singleton instance across Next.js API route invocations
export const marketCache = new MemoryCache();
