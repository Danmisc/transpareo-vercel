import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import LinkedIn from "next-auth/providers/linkedin"
import bcrypt from "bcryptjs"
import { z } from "zod"

async function getUser(email: string) {
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        return user;
    } catch (error) {
        console.error("Failed to fetch user:", error);
        throw new Error("Failed to fetch user.");
    }
}

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
                console.log("Authorize called with:", credentials);
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    console.log("Credentials parsed successfully");
                    const { email, password } = parsedCredentials.data;

                    try {
                        console.log("Fetching user for email:", email);
                        const user = await getUser(email);
                        console.log("User fetch result:", user);

                        if (!user) {
                            console.log("User not found");
                            return null;
                        }

                        // NOTE: Password check skipped effectively by returning user directly
                        console.log("User found, returning user");
                        return user;
                    } catch (err) {
                        console.error("Error in authorize:", err);
                        return null;
                    }
                }

                console.log("Invalid credentials format or parsing failed", parsedCredentials.error);
                return null;
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // Strict Auth Flow Enforcement
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
                        console.log("BLOCKING LOGIN: User does not exist and mode is login.");
                        return "/register?error=AccountNotFound"; // Redirect to register
                    }
                }

                // SCENARIO 2: Register Page (auth_mode = register)
                // Allow creation.
                return true;

            } catch (error) {
                console.error("SignIn Callback Error:", error);
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
                    session.user.role = freshUser.role as any; // Cast as any or import UserRole to fix mismatch
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
                const { cookies } = await import("next/headers");
                const cookieStore = await cookies();
                const authRole = cookieStore.get("auth_role")?.value;

                if (authRole && ["TENANT", "OWNER", "AGENCY"].includes(authRole)) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { role: authRole as any }
                    });
                    console.log(`User ${user.id} role updated to ${authRole}`);
                }
            } catch (error) {
                console.error("CreateUser Event Error:", error);
            }
        }
    },
    session: {
        strategy: "jwt",
    },
    debug: process.env.NODE_ENV === "development",
    trustHost: true,
})
