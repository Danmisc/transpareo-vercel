import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Use Upstash Redis if env vars are present, otherwise Mock
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = (UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN)
    ? new Redis({
        url: UPSTASH_REDIS_REST_URL,
        token: UPSTASH_REDIS_REST_TOKEN,
    })
    : {
        // Mock Redis Implementation for development without keys
        get: async () => null,
        set: async () => "OK",
        del: async () => 1,
        incr: async () => 1,
        hget: async () => null,
        hset: async () => 1,
        sadd: async () => 1,
        smembers: async () => [],
    } as unknown as Redis;

// Create a global rate limiter instance
// blocked by missing redis keys in dev, but code structure is ready
export const ratelimit = (UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN)
    ? new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
        analytics: true,
        prefix: "@upstash/ratelimit",
    })
    : {
        limit: async () => ({ success: true, limit: 10, remaining: 10, reset: 0 }),
    } as unknown as Ratelimit;
