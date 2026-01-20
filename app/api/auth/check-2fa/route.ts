import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Check if a user has 2FA enabled and if email is verified
 * This is called before credentials sign-in to prepare the UI
 */
export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email || typeof email !== "string") {
            return NextResponse.json({ error: "Email required" }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: {
                id: true,
                twoFactorEnabled: true,
                emailVerified: true
            }
        });

        if (!user) {
            // Don't reveal if user exists
            return NextResponse.json({
                twoFactorEnabled: false,
                requiresEmailVerification: false
            });
        }

        // Check if email is verified (for credentials users)
        // OAuth users have emailVerified set automatically
        const requiresEmailVerification = !user.emailVerified;

        return NextResponse.json({
            userId: user.id,
            twoFactorEnabled: user.twoFactorEnabled,
            requiresEmailVerification
        });

    } catch (error) {
        console.error("[Auth] Check 2FA error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
