import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Middleware for route protection
 * Using getToken instead of auth() wrapper to avoid session conflicts
 */

// Routes that require authentication
const protectedPatterns = [
    "/settings",
    "/messages",
    "/notifications",
    "/p2p",
    "/profile/edit",
    "/dossier",
    "/marketplace/favoris",
];

// Routes that are always public
const publicPatterns = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/pricing",
    "/about",
    "/contact",
    "/faq",
    "/api/auth",
    "/api/webhooks",
];

// Static assets and API routes to skip
const skipPatterns = [
    "/_next",
    "/favicon.ico",
    "/avatars",
    "/images",
    "/api/search",
    "/api/feed",
    "/api/post",
];

function matchesPattern(pathname: string, patterns: string[]): boolean {
    return patterns.some(pattern => {
        if (pattern.endsWith("*")) {
            return pathname.startsWith(pattern.slice(0, -1));
        }
        return pathname === pattern || pathname.startsWith(pattern + "/");
    });
}

export async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    // Skip static assets and certain API routes
    if (matchesPattern(pathname, skipPatterns)) {
        return NextResponse.next();
    }

    // Skip auth API routes entirely to avoid interference
    if (pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    // Get JWT token without using auth() wrapper
    const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
    });

    const isAuthenticated = !!token;

    // Check if route is protected
    const isProtectedRoute = matchesPattern(pathname, protectedPatterns);

    // If protected route and no session, redirect to login
    if (isProtectedRoute && !isAuthenticated) {
        const loginUrl = new URL("/login", req.nextUrl.origin);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If user is logged in and tries to access auth pages, redirect to home
    if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
        return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    }

    return NextResponse.next();
}

// Matcher configuration
export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
