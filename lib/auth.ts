import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import LinkedIn from "next-auth/providers/linkedin"
import bcrypt from "bcryptjs"
import { z } from "zod"

// ========================================
// USER LOOKUP
// ========================================

async function getUser(email: string) {
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        return user;
    } catch (error) {
        console.error("[Auth] Failed to fetch user:", error);
        throw new Error("Failed to fetch user.");
    }
}

// ========================================
// BRUTE-FORCE PROTECTION (Simple)
// ========================================

const LOGIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_LOGIN_ATTEMPTS = 5;

/**
 * Check if user is rate limited for login attempts.
 * Uses SecurityLog table to track failed attempts.
 */
async function checkLoginRateLimit(email: string): Promise<boolean> {
    const windowStart = new Date(Date.now() - LOGIN_ATTEMPT_WINDOW_MS);

    const failedAttempts = await prisma.securityLog.count({
        where: {
            action: "LOGIN_FAILED",
            metadata: { contains: email }, // We store email in metadata
            createdAt: { gte: windowStart }
        }
    });

    return failedAttempts < MAX_LOGIN_ATTEMPTS;
}

/**
 * Log a failed login attempt for rate limiting
 */
async function logFailedLogin(email: string, reason: string) {
    try {
        // We don't have userId for failed logins, use placeholder
        await prisma.securityLog.create({
            data: {
                userId: "system", // Special system ID or create dedicated table
                action: "LOGIN_FAILED",
                status: "FAILED",
                metadata: JSON.stringify({ email, reason, timestamp: new Date().toISOString() }),
                ipAddress: "unknown", // In production, extract from headers
                userAgent: "unknown"
            }
        });
    } catch (error) {
        // Silent fail - logging should never break auth
    }
}

/**
 * Log successful login
 */
async function logSuccessfulLogin(userId: string, email: string) {
    try {
        await prisma.securityLog.create({
            data: {
                userId,
                action: "LOGIN",
                status: "SUCCESS",
                metadata: JSON.stringify({ email, timestamp: new Date().toISOString() }),
                ipAddress: "unknown",
                userAgent: "unknown"
            }
        });

        // Clear failed attempts tracking for this email
        // (Optional: Could implement in a separate cleanup job)
    } catch (error) {
        // Silent fail
    }
}

// ========================================
// NEXT AUTH CONFIGURATION
// ========================================

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    pages: {
        signIn: '/login',
        newUser: '/register',
    },
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
        LinkedIn({
            clientId: process.env.AUTH_LINKEDIN_ID,
            clientSecret: process.env.AUTH_LINKEDIN_SECRET,
        }),
        Credentials({
            async authorize(credentials) {
                // 1. Validate input format
                const parsedCredentials = z
                    .object({
                        email: z.string().email(),
                        password: z.string().min(6)
                    })
                    .safeParse(credentials);

                if (!parsedCredentials.success) {
                    return null; // Invalid format
                }

                const { email, password } = parsedCredentials.data;

                // 2. Check rate limit (brute-force protection)
                const canAttempt = await checkLoginRateLimit(email);
                if (!canAttempt) {
                    await logFailedLogin(email, "RATE_LIMITED");
                    return null; // Too many attempts
                }

                // 3. Fetch user
                const user = await getUser(email);

                if (!user) {
                    await logFailedLogin(email, "USER_NOT_FOUND");
                    return null;
                }

                // 4. Check if user has password (OAuth users don't)
                if (!user.password) {
                    await logFailedLogin(email, "NO_PASSWORD_SET");
                    return null; // User registered via OAuth, no password
                }

                // 5. *** CRITICAL: Verify password with bcrypt ***
                const passwordMatch = await bcrypt.compare(password, user.password);

                if (!passwordMatch) {
                    await logFailedLogin(email, "INVALID_PASSWORD");
                    return null; // Wrong password
                }

                // 6. Success - Log and return user
                await logSuccessfulLogin(user.id, email);

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.avatar,
                    role: user.role
                };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // Strict Auth Flow Enforcement for OAuth
            try {
                const { cookies } = await import("next/headers");
                const cookieStore = await cookies();
                const authMode = cookieStore.get("auth_mode")?.value;
                const email = user.email;

                if (!email) return true; // Safety

                // Check if user exists
                const existingUser = await prisma.user.findUnique({ where: { email } });

                // SCENARIO 1: Login Page (auth_mode = login)
                // BLOCKED if user does not exist.
                if (authMode === "login") {
                    if (!existingUser) {
                        return "/register?error=AccountNotFound";
                    }
                }

                // SCENARIO 2: Register Page (auth_mode = register)
                // Allow creation.
                return true;

            } catch (error) {
                console.error("[Auth] SignIn Callback Error:", error);
                return true; // Fallback to allow default behavior
            }
        },
        async session({ session, token }) {
            // In JWT strategy (default for Credentials), user is in token
            if (token.sub && session.user) {
                session.user.id = token.sub;

                // Fetch fresh data from DB to ensure updates are reflected immediately
                const freshUser = await prisma.user.findUnique({
                    where: { id: token.sub },
                    select: { name: true, avatar: true, email: true, role: true }
                });

                if (freshUser) {
                    session.user.name = freshUser.name;
                    session.user.image = freshUser.avatar;
                    session.user.email = freshUser.email;
                    session.user.role = freshUser.role as any;
                }
            }
            return session;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.sub = user.id;
                token.role = user.role; // Initial sign in
            }
            return token;
        }
    },
    events: {
        async createUser({ user }) {
            // Assign Role on Account Creation
            try {
                // Guard: user.id must exist
                if (!user.id) {
                    console.error("[Auth] CreateUser Event: No user ID");
                    return;
                }

                const { cookies } = await import("next/headers");
                const cookieStore = await cookies();
                const authRole = cookieStore.get("auth_role")?.value;

                if (authRole && ["TENANT", "OWNER", "AGENCY"].includes(authRole)) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { role: authRole as any }
                    });
                }

                // Log account creation
                await prisma.securityLog.create({
                    data: {
                        userId: user.id,
                        action: "ACCOUNT_CREATED",
                        status: "SUCCESS",
                        metadata: JSON.stringify({ role: authRole || "TENANT" }),
                        ipAddress: "unknown",
                        userAgent: "unknown"
                    }
                });
            } catch (error) {
                console.error("[Auth] CreateUser Event Error:", error);
            }
        }
    },
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60, // 7 days
    },
    jwt: {
        maxAge: 7 * 24 * 60 * 60, // 7 days
    },
    debug: false, // Disable in production
    trustHost: true,
})
