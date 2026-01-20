import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTwoFactorToken } from "@/lib/otp";
import { decrypt } from "@/lib/crypto";
import { ratelimit } from "@/lib/redis";

/**
 * Verify 2FA code during login
 */
export async function POST(req: NextRequest) {
    try {
        const { userId, code } = await req.json();

        if (!userId || !code) {
            return NextResponse.json({ success: false, error: "Données manquantes" }, { status: 400 });
        }

        // Rate limiting for 2FA attempts
        const identifier = `2fa-verify:${userId}`;
        const { success: rateLimitOk, remaining } = await ratelimit.limit(identifier);

        if (!rateLimitOk) {
            return NextResponse.json({
                success: false,
                error: "Trop de tentatives. Réessayez dans quelques minutes."
            }, { status: 429 });
        }

        // Get user with 2FA secret
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                twoFactorEnabled: true,
                twoFactorSecret: true
            }
        });

        if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
            return NextResponse.json({
                success: false,
                error: "2FA non configuré"
            }, { status: 400 });
        }

        // Decrypt the stored secret
        const decryptedSecret = decrypt(user.twoFactorSecret);

        if (!decryptedSecret) {
            console.error("[2FA] Failed to decrypt secret for user:", userId);
            return NextResponse.json({
                success: false,
                error: "Erreur de configuration 2FA"
            }, { status: 500 });
        }

        // Verify the TOTP code
        const isValid = verifyTwoFactorToken(code, decryptedSecret);

        if (!isValid) {
            // Log failed attempt
            await prisma.securityLog.create({
                data: {
                    userId,
                    action: "2FA_LOGIN_FAILED",
                    status: "FAILED",
                    metadata: JSON.stringify({ attemptsRemaining: remaining }),
                    ipAddress: req.headers.get("x-forwarded-for") || "unknown",
                    userAgent: req.headers.get("user-agent") || "unknown"
                }
            }).catch(() => { });

            return NextResponse.json({
                success: false,
                error: "Code invalide. Vérifiez votre application."
            });
        }

        // Log successful 2FA verification
        await prisma.securityLog.create({
            data: {
                userId,
                action: "2FA_LOGIN_SUCCESS",
                status: "SUCCESS",
                metadata: JSON.stringify({ timestamp: new Date().toISOString() }),
                ipAddress: req.headers.get("x-forwarded-for") || "unknown",
                userAgent: req.headers.get("user-agent") || "unknown"
            }
        }).catch(() => { });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[Auth] Verify 2FA error:", error);
        return NextResponse.json({
            success: false,
            error: "Erreur de vérification"
        }, { status: 500 });
    }
}
