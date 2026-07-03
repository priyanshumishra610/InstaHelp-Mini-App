import { getPublicEnv } from "@/config/env";

export const CMS_API_URL = getPublicEnv("EXPO_PUBLIC_CMS_API_URL");
export const CMS_IS_CONFIGURED = Boolean(CMS_API_URL);

const CACHE_TTL_MS = 5 * 60 * 1000;

type CacheEntry<T> = { data: T; fetchedAt: number };

const memoryCache = new Map<string, CacheEntry<unknown>>();

export type CmsFetchResult<T> = {
  data: T;
  source: "api" | "cache" | "fallback";
  error?: string;
};

export async function cmsFetch<T>(
  path: string,
  fallback: T,
  options?: { forceRefresh?: boolean },
): Promise<CmsFetchResult<T>> {
  const cacheKey = `cms:${path}`;

  if (!options?.forceRefresh) {
    const mem = memoryCache.get(cacheKey) as CacheEntry<T> | undefined;
    if (mem && Date.now() - mem.fetchedAt < CACHE_TTL_MS) {
      return { data: mem.data, source: "cache" };
    }
  }

  if (!CMS_IS_CONFIGURED) {
    return { data: fallback, source: "fallback", error: "CMS API not configured" };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${CMS_API_URL}${path}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = (await res.json()) as T;
    memoryCache.set(cacheKey, { data, fetchedAt: Date.now() });
    return { data, source: "api" };
  } catch (err) {
    const mem = memoryCache.get(cacheKey) as CacheEntry<T> | undefined;
    if (mem) {
      return {
        data: mem.data,
        source: "cache",
        error: err instanceof Error ? err.message : "fetch failed",
      };
    }
    return {
      data: fallback,
      source: "fallback",
      error: err instanceof Error ? err.message : "fetch failed",
    };
  }
}

export function invalidateCmsCache(prefix?: string): void {
  if (!prefix) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) memoryCache.delete(key);
  }
}

export async function trackCmsEvent(
  eventType: string,
  module: string,
  entityId?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  if (!CMS_IS_CONFIGURED) return;
  try {
    await fetch(`${CMS_API_URL}/api/content/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType, module, entityId, metadata }),
    });
  } catch {
    // Analytics must never block UX
  }
}
