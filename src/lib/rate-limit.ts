// In-memory sliding window rate limiter
// Simple and sufficient for development. Use Redis in production for multi-instance deployments.

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

export const RATE_LIMITS = {
  auth: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  api: { limit: 100, windowMs: 60 * 1000 }, // 100 requests per minute
} as const;

export function checkRateLimit(
  key: string,
  config: RateLimitConfig = RATE_LIMITS.auth
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = store.get(key) || { timestamps: [] };

  // Remove expired timestamps
  entry.timestamps = entry.timestamps.filter(
    (ts) => now - ts < config.windowMs
  );

  if (entry.timestamps.length >= config.limit) {
    const oldestInWindow = entry.timestamps[0];
    const resetIn = config.windowMs - (now - oldestInWindow);
    store.set(key, entry);
    return {
      allowed: false,
      remaining: 0,
      resetIn,
    };
  }

  entry.timestamps.push(now);
  store.set(key, entry);

  return {
    allowed: true,
    remaining: config.limit - entry.timestamps.length,
    resetIn: 0,
  };
}

// Cleanup stale entries periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const maxWindow = Math.max(
      ...Object.values(RATE_LIMITS).map((r) => r.windowMs)
    );
    store.forEach((entry, key) => {
      entry.timestamps = entry.timestamps.filter(
        (ts) => now - ts < maxWindow
      );
      if (entry.timestamps.length === 0) {
        store.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}

// Export for testing
export function _resetStore() {
  store.clear();
}
