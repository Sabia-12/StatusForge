import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { checkRateLimit, _resetStore } from '../src/lib/rate-limit';

describe('Rate Limiter', () => {
  beforeEach(() => {
    _resetStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should allow requests within limit boundaries', () => {
    const config = { limit: 3, windowMs: 1000 };
    const ip = '1.2.3.4';

    // First request
    let res = checkRateLimit(ip, config);
    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(2);

    // Second request
    res = checkRateLimit(ip, config);
    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(1);

    // Third request
    res = checkRateLimit(ip, config);
    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(0);
  });

  it('should block requests that exceed limit boundaries', () => {
    const config = { limit: 2, windowMs: 1000 };
    const ip = '1.2.3.4';

    checkRateLimit(ip, config);
    checkRateLimit(ip, config);

    // Third request (blocked)
    const res = checkRateLimit(ip, config);
    expect(res.allowed).toBe(false);
    expect(res.remaining).toBe(0);
    expect(res.resetIn).toBeGreaterThan(0);
  });

  it('should reset limits after window duration expires', () => {
    const config = { limit: 2, windowMs: 1000 };
    const ip = '1.2.3.4';

    checkRateLimit(ip, config);
    checkRateLimit(ip, config);

    // Verify blocked
    let res = checkRateLimit(ip, config);
    expect(res.allowed).toBe(false);

    // Fast-forward timers
    vi.advanceTimersByTime(1001);

    // Should allow again
    res = checkRateLimit(ip, config);
    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(1);
  });

  it('should track separate limits for different client IPs', () => {
    const config = { limit: 1, windowMs: 1000 };
    const ip1 = '1.1.1.1';
    const ip2 = '2.2.2.2';

    // Use up ip1 limit
    let res1 = checkRateLimit(ip1, config);
    expect(res1.allowed).toBe(true);

    // Verify ip1 blocked
    res1 = checkRateLimit(ip1, config);
    expect(res1.allowed).toBe(false);

    // ip2 should still be allowed
    const res2 = checkRateLimit(ip2, config);
    expect(res2.allowed).toBe(true);
  });
});
