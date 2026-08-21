import { Redis } from "@upstash/redis";
import { env } from "./env";
import { logger } from "./logger";

// Initialize Redis only if credentials exist (Fail-Open Support)
const redis = (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN })
  : null;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export class RateLimiterService {
  /**
   * Evaluates a rate limit using a fixed window algorithm in Upstash Redis.
   * Atomic evaluation using a Redis pipeline.
   * If Redis is unavailable, it fails open (allows the request).
   */
  static async check(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
    const now = Date.now();
    const windowId = Math.floor(now / (windowSeconds * 1000));
    const redisKey = `ratelimit:${key}:${windowId}`;
    const resetAt = (windowId + 1) * windowSeconds * 1000;

    // Fail-open: If Redis is not configured, allow all requests
    if (!redis) {
      return { allowed: true, remaining: limit - 1, resetAt };
    }

    try {
      // Atomic increment and expire using pipeline
      const p = redis.pipeline();
      p.incr(redisKey);
      // Give the key a little extra TTL to avoid race conditions with expiration
      p.expire(redisKey, windowSeconds + 30);
      const results = await p.exec();

      // results[0] is the result of incr
      const count = results[0] as number;
      const allowed = count <= limit;
      const remaining = Math.max(0, limit - count);

      return { allowed, remaining, resetAt };
    } catch (error) {
      // Fail-open: If Redis fails, log a warning and allow the request
      logger.warn({ err: error, key }, "Redis rate limiter failed, failing open.");
      return { allowed: true, remaining: 1, resetAt };
    }
  }
}
