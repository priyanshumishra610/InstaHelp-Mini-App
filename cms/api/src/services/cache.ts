// Redis is optional — graceful degradation when unavailable
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let redis: any = null;
let redisAvailable = false;

export function getRedis() {
  if (!process.env.REDIS_URL) return null;
  if (!redis) {
    // Dynamic require avoids ESM/CJS interop issues with ioredis
    const IORedis = require("ioredis");
    redis = new IORedis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableOfflineQueue: false,
    });
    redis.on("connect", () => {
      redisAvailable = true;
    });
    redis.on("error", () => {
      redisAvailable = false;
    });
  }
  return redis;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedis();
  if (!client) return null;
  try {
    if (!redisAvailable) await client.connect().catch(() => null);
    const raw = await client.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds?: number,
): Promise<void> {
  const client = getRedis();
  if (!client) return;
  const ttl = ttlSeconds ?? Number(process.env.CACHE_TTL_SECONDS ?? 300);
  try {
    if (!redisAvailable) await client.connect().catch(() => null);
    await client.setex(key, ttl, JSON.stringify(value));
  } catch {
    // Redis unavailable — skip silently
  }
}

export async function cacheDel(pattern: string): Promise<void> {
  const client = getRedis();
  if (!client) return;
  try {
    if (!redisAvailable) await client.connect().catch(() => null);
    const keys = await client.keys(pattern);
    if (keys.length) await client.del(...keys);
  } catch {
    // skip
  }
}

export async function invalidateContentCache(): Promise<void> {
  await cacheDel("content:*");
}
