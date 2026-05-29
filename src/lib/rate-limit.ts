import { redis } from "./redis";

interface RateLimitConfig {
  requests: number;
  window: number; // seconds
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  retryAfter: number;
}

export async function rateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const redisKey = `rate_limit:${key}`;

  try {
    const pipeline = redis.pipeline();
    pipeline.incr(redisKey);
    pipeline.ttl(redisKey);

    const results = await pipeline.exec();

    if (!results) {
      return { success: true, remaining: config.requests, retryAfter: 0 };
    }

    const count = results[0][1] as number;
    const ttl = results[1][1] as number;

    // Set expiry on first request
    if (count === 1) {
      await redis.expire(redisKey, config.window);
    }

    const remaining = Math.max(0, config.requests - count);
    const retryAfter = ttl > 0 ? ttl : config.window;

    if (count > config.requests) {
      return { success: false, remaining: 0, retryAfter };
    }

    return { success: true, remaining, retryAfter: 0 };
  } catch {
    // Fail open — do not block requests on Redis errors
    return { success: true, remaining: config.requests, retryAfter: 0 };
  }
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  vote: { requests: 10, window: 60 },
  search: { requests: 60, window: 60 },
  auth: { requests: 5, window: 300 },
  adminCreate: { requests: 20, window: 60 },
};
