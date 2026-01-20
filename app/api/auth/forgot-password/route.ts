import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { generateSecureToken } from "@/lib/crypto";
import { ratelimit } from "@/lib/redis";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { error: "Email requis." },
                { status: 400 }
            );
        }

        // Rate limiting - prevent abuse
        const identifier = `forgot-password:${email}`;
        const { success: rateLimitOk } = await ratelimit.limit(identifier);

        if (!rateLimitOk) {
            // Return success even if rate limited (anti-enumeration)
            return NextResponse.json({ success: true });
        }

        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true, email: true, name: true }
        });

        // IMPORTANT: Return success even if user doesn't exist (anti-enumeration)
        if (!user) {
            console.log(`[Auth] Password reset requested for non-existent email: ${normalizedEmail}`);
            return NextResponse.json({ success: true });
        }

        // Delete any existing tokens for this email
        await prisma.passwordResetToken.deleteMany({
            where: { email: normalizedEmail }
        });

        // Generate secure token (64 bytes = 128 hex chars)
        const token = generateSecureToken(64);

        // Token expires in 1 hour
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        // Store token
        await prisma.passwordResetToken.create({
            data: {
                email: normalizedEmail,
                token,
                expiresAt
            }
        });

        // Send email
        const emailResult = await sendPasswordResetEmail(normalizedEmail, token);

        if (!emailResult.success) {
            console.error("[Auth] Failed to send password reset email:", emailResult.error);
            // Still return success for security
        }

        // Log security event
        await prisma.securityLog.create({
            data: {
                userId: user.id,
                action: "PASSWORD_RESET_REQUESTED",
                status: "SUCCESS",
                metadata: JSON.stringify({ timestamp: new Date().toISOString() }),
                ipAddress: req.headers.get("x-forwarded-for") || "unknown",
                userAgent: req.headers.get("user-agent") || "unknown"
            }
        }).catch(() => { }); // Silent fail

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[Auth] Forgot password error:", error);
        // Return success for security (don't reveal internal errors)
        return NextResponse.json({ success: true });
    }
}
