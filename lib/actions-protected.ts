"use server";

// ========================================
// PROTECTED ACTION WRAPPER
// Unified auth + rate limiting for server actions
// ========================================

import { getCurrentUser } from "@/lib/session";
import { rateLimitService, RATE_LIMITS } from "@/lib/services/rate-limit.service";
import { logSecurityEvent } from "@/lib/security";

// --- TYPES ---
type ActionResult<T> =
    | { success: true; data: T }
    | { success: false; error: string; code?: string };

interface ProtectedActionOptions {
    rateLimit?: keyof typeof RATE_LIMITS;
    requireAuth?: boolean;
    logAction?: string;
}

// --- WRAPPER ---

/**
 * Create a protected server action with auth and rate limiting
 * 
 * Usage:
 * export const likePost = protectedAction(
 *     async (userId, postId: string) => {
 *         // Your logic here
 *         return { liked: true };
 *     },
 *     { rateLimit: "LIKE", logAction: "LIKE_POST" }
 * );
 */
export function protectedAction<TArgs extends any[], TResult>(
    handler: (userId: string, ...args: TArgs) => Promise<TResult>,
    options: ProtectedActionOptions = {}
): (...args: TArgs) => Promise<ActionResult<TResult>> {
    const { rateLimit, requireAuth = true, logAction } = options;

    return async (...args: TArgs): Promise<ActionResult<TResult>> => {
        try {
            // 1. Auth Check
            const user = await getCurrentUser();

            if (requireAuth && !user) {
                return {
                    success: false,
                    error: "Authentification requise",
                    code: "UNAUTHORIZED"
                };
            }

            const userId = user?.id || "anonymous";

            // 2. Rate Limit Check
            if (rateLimit) {
                const { allowed, remaining, resetIn } = await rateLimitService.checkUserAction(
                    userId,
                    rateLimit
                );

                if (!allowed) {
                    await logSecurityEvent(userId, "RATE_LIMITED", "BLOCKED", {
                        action: rateLimit,
                        resetIn
                    });

                    return {
                        success: false,
                        error: `Trop de requêtes. Réessayez dans ${resetIn} secondes.`,
                        code: "RATE_LIMITED"
                    };
                }
            }

            // 3. Execute Handler
            const result = await handler(userId, ...args);

            // 4. Log if configured
            if (logAction && user) {
                await logSecurityEvent(userId, logAction as any, "SUCCESS", {
                    args: JSON.stringify(args).slice(0, 500) // Truncate large payloads
                });
            }

            return { success: true, data: result };

        } catch (error) {
            console.error("[ProtectedAction] Error:", error);

            return {
                success: false,
                error: error instanceof Error ? error.message : "Une erreur est survenue",
                code: "INTERNAL_ERROR"
            };
        }
    };
}

/**
 * Simpler wrapper for actions that just need auth
 */
export async function withAuth<T>(
    handler: (userId: string) => Promise<T>
): Promise<ActionResult<T>> {
    const user = await getCurrentUser();

    if (!user) {
        return {
            success: false,
            error: "Authentification requise",
            code: "UNAUTHORIZED"
        };
    }

    try {
        const result = await handler(user.id);
        return { success: true, data: result };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur interne",
            code: "INTERNAL_ERROR"
        };
    }
}

/**
 * Rate limit check only (for use in existing actions)
 */
export async function checkRateLimit(
    userId: string,
    action: keyof typeof RATE_LIMITS
): Promise<{ allowed: boolean; error?: string }> {
    const { allowed, resetIn } = await rateLimitService.checkUserAction(userId, action);

    if (!allowed) {
        return {
            allowed: false,
            error: `Trop de requêtes. Réessayez dans ${resetIn} secondes.`
        };
    }

    return { allowed: true };
}
