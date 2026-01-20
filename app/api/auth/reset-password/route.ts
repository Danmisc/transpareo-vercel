import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordChangedEmail } from "@/lib/email";
import { secureCompare } from "@/lib/crypto";
import bcrypt from "bcryptjs";

const PASSWORD_MIN_LENGTH = 8;
const BCRYPT_SALT_ROUNDS = 12;

export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json();

        // Validate input
        if (!token || typeof token !== "string") {
            return NextResponse.json(
                { error: "Token invalide." },
                { status: 400 }
            );
        }

        if (!password || password.length < PASSWORD_MIN_LENGTH) {
            return NextResponse.json(
                { error: `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.` },
                { status: 400 }
            );
        }

        // Find the token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token }
        });

        if (!resetToken) {
            return NextResponse.json(
                { error: "Lien invalide ou expiré.", expired: true },
                { status: 400 }
            );
        }

        // Check if token is expired
        if (new Date() > resetToken.expiresAt) {
            // Delete expired token
            await prisma.passwordResetToken.delete({
                where: { id: resetToken.id }
            });

            return NextResponse.json(
                { error: "Ce lien a expiré. Veuillez faire une nouvelle demande.", expired: true },
                { status: 400 }
            );
        }

        // Check if already used
        if (resetToken.usedAt) {
            return NextResponse.json(
                { error: "Ce lien a déjà été utilisé.", expired: true },
                { status: 400 }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: resetToken.email },
            select: { id: true, email: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: "Compte non trouvé." },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

        // Update password and mark token as used (in transaction)
        await prisma.$transaction([
            // Update password
            prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword }
            }),

            // Mark token as used
            prisma.passwordResetToken.update({
                where: { id: resetToken.id },
                data: { usedAt: new Date() }
            }),

            // Delete all other tokens for this email (cleanup)
            prisma.passwordResetToken.deleteMany({
                where: {
                    email: resetToken.email,
                    id: { not: resetToken.id }
                }
            }),

            // Log security event
            prisma.securityLog.create({
                data: {
                    userId: user.id,
                    action: "PASSWORD_RESET_SUCCESS",
                    status: "SUCCESS",
                    metadata: JSON.stringify({ timestamp: new Date().toISOString() }),
                    ipAddress: req.headers.get("x-forwarded-for") || "unknown",
                    userAgent: req.headers.get("user-agent") || "unknown"
                }
            })
        ]);

        // TODO: Invalidate all existing sessions for this user
        // This would require session storage (database sessions or Redis)
        // For JWT strategy, sessions auto-expire, but we could track revoked tokens

        // Send confirmation email
        await sendPasswordChangedEmail(user.email);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[Auth] Reset password error:", error);
        return NextResponse.json(
            { error: "Une erreur est survenue. Veuillez réessayer." },
            { status: 500 }
        );
    }
}
