// ========================================
// RATE LIMITING SERVICE
// In-memory for development, Redis-ready for production
// ========================================

// --- TYPES ---
interface RateLimitEntry {
    count: number;
    resetAt: number;
}

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetIn: number; // seconds
}

interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

// --- IN-MEMORY STORE (Development) ---
// Replace with Redis in production
const store = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
if (typeof setInterval !== "undefined") {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of store.entries()) {
            if (entry.resetAt < now) {
                store.delete(key);
            }
        }
    }, 60 * 1000); // Clean every minute
}

// --- PRESETS ---
export const RATE_LIMITS = {
    // Authentication
    LOGIN_ATTEMPT: { maxRequests: 5, windowMs: 15 * 60 * 1000 },       // 5 per 15min
    REGISTER: { maxRequests: 3, windowMs: 60 * 60 * 1000 },           // 3 per hour
    PASSWORD_RESET: { maxRequests: 3, windowMs: 60 * 60 * 1000 },     // 3 per hour

    // API General
    API_READ: { maxRequests: 100, windowMs: 60 * 1000 },              // 100 per minute
    API_WRITE: { maxRequests: 30, windowMs: 60 * 1000 },              // 30 per minute

    // Social Actions
    LIKE: { maxRequests: 60, windowMs: 60 * 1000 },                   // 60 per minute
    COMMENT: { maxRequests: 20, windowMs: 60 * 1000 },                // 20 per minute
    POST: { maxRequests: 10, windowMs: 60 * 60 * 1000 },              // 10 per hour
    MESSAGE: { maxRequests: 50, windowMs: 60 * 1000 },                // 50 per minute
    FOLLOW: { maxRequests: 30, windowMs: 60 * 1000 },                 // 30 per minute

    // Sensitive
    REPORT: { maxRequests: 10, windowMs: 60 * 60 * 1000 },            // 10 per hour
    INVESTMENT: { maxRequests: 5, windowMs: 60 * 60 * 1000 },         // 5 per hour
    EXPORT_DATA: { maxRequests: 1, windowMs: 24 * 60 * 60 * 1000 },   // 1 per day
    DELETE_ACCOUNT: { maxRequests: 1, windowMs: 24 * 60 * 60 * 1000 } // 1 per day
};

// --- SERVICE ---
export const rateLimitService = {
    /**
     * Check if request is allowed under rate limit
     */
    check: async (
        key: string,
        config: RateLimitConfig
    ): Promise<RateLimitResult> => {
        const now = Date.now();
        const entry = store.get(key);

        // No existing entry or expired
        if (!entry || entry.resetAt < now) {
            store.set(key, { count: 1, resetAt: now + config.windowMs });
            return {
                allowed: true,
                remaining: config.maxRequests - 1,
                resetIn: Math.ceil(config.windowMs / 1000)
            };
        }

        // Entry exists and valid
        if (entry.count < config.maxRequests) {
            entry.count++;
            return {
                allowed: true,
                remaining: config.maxRequests - entry.count,
                resetIn: Math.ceil((entry.resetAt - now) / 1000)
            };
        }

        // Rate limited
        return {
            allowed: false,
            remaining: 0,
            resetIn: Math.ceil((entry.resetAt - now) / 1000)
        };
    },

    /**
     * Check rate limit for user action
     */
    checkUserAction: async (
        userId: string,
        action: keyof typeof RATE_LIMITS
    ): Promise<RateLimitResult> => {
        const config = RATE_LIMITS[action];
        const key = `ratelimit:${action}:${userId}`;
        return rateLimitService.check(key, config);
    },

    /**
     * Check rate limit by IP (for anonymous actions)
     */
    checkIpAction: async (
        ip: string,
        action: keyof typeof RATE_LIMITS
    ): Promise<RateLimitResult> => {
        const config = RATE_LIMITS[action];
        const key = `ratelimit:${action}:ip:${ip}`;
        return rateLimitService.check(key, config);
    },

    /**
     * Reset rate limit for a key (e.g., after successful action)
     */
    reset: (key: string): void => {
        store.delete(key);
    },

    /**
     * Get current state for monitoring
     */
    getStats: (): { totalKeys: number; keys: string[] } => {
        return {
            totalKeys: store.size,
            keys: Array.from(store.keys())
        };
    }
};

// --- REDIS UPGRADE PATH ---
// When deploying to production, replace the store with Redis:
//
// import Redis from 'ioredis';
// const redis = new Redis(process.env.REDIS_URL);
//
// check: async (key, config) => {
//     const current = await redis.incr(key);
//     if (current === 1) {
//         await redis.expire(key, Math.ceil(config.windowMs / 1000));
//     }
//     const ttl = await redis.ttl(key);
//     return {
//         allowed: current <= config.maxRequests,
//         remaining: Math.max(0, config.maxRequests - current),
//         resetIn: ttl
//     };
// }
