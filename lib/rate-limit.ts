export type RateLimitConfig = {
  limit: number;
  windowMs: number;
};

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

export const RATE_LIMIT_MESSAGE =
  "Zbyt wiele prób. Spróbuj ponownie za chwilę.";

export const RATE_LIMITS = {
  login: { limit: 10, windowMs: 15 * 60 * 1000 },
  register: { limit: 5, windowMs: 60 * 60 * 1000 },
  inviteCodeLookup: { limit: 20, windowMs: 15 * 60 * 1000 },
} as const satisfies Record<string, RateLimitConfig>;

type Bucket = { count: number; resetAt: number };

const stores = new Map<string, Map<string, Bucket>>();

function getStore(namespace: string): Map<string, Bucket> {
  let store = stores.get(namespace);
  if (!store) {
    store = new Map();
    stores.set(namespace, store);
  }
  return store;
}

function pruneStore(store: Map<string, Bucket>, now: number): void {
  if (store.size < 500) {
    return;
  }

  for (const [key, bucket] of store) {
    if (now >= bucket.resetAt) {
      store.delete(key);
    }
  }
}

export function checkRateLimit(
  namespace: string,
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();
  const store = getStore(namespace);
  pruneStore(store, now);

  const bucket = store.get(key);

  if (!bucket || now >= bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true };
  }

  if (bucket.count >= config.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((bucket.resetAt - now) / 1000),
      ),
    };
  }

  bucket.count += 1;
  return { allowed: true };
}

export function getRateLimitMessage(result: Extract<RateLimitResult, { allowed: false }>): string {
  if (result.retryAfterSeconds >= 60) {
    const minutes = Math.ceil(result.retryAfterSeconds / 60);
    return `Zbyt wiele prób. Spróbuj ponownie za ok. ${minutes} min.`;
  }

  return RATE_LIMIT_MESSAGE;
}

/** Tylko testy — czyści pamięć limitera między przypadkami. */
export function clearRateLimitStoresForTests(): void {
  stores.clear();
}
