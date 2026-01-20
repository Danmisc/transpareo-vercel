"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { generateTwoFactorSecret, generateTwoFactorQRCode, verifyTwoFactorToken } from "@/lib/otp";
import { encrypt, decrypt } from "@/lib/crypto";
import { revalidatePath } from "next/cache";

/**
 * Generate new 2FA setup (secret + QR code)
 * Secret is NOT stored until user confirms with valid token
 */
export async function getTwoFactorSetup() {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const secret = generateTwoFactorSecret();
    const qrCode = await generateTwoFactorQRCode(user.email || "user@transpareo.com", secret);

    // Secret returned to client for QR display, will be encrypted on confirmation
    return { secret, qrCode };
}

/**
 * Enable 2FA after user confirms with valid TOTP code
 * Secret is encrypted with AES-256 before storage
 */
export async function enableTwoFactor(secret: string, token: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // Validate the token against the secret
    const isValid = verifyTwoFactorToken(token, secret);

    if (!isValid) {
        // Log failed attempt
        await logSecurityEvent(user.id, "2FA_ENABLE_FAILED", "Invalid token provided");
        return { success: false, error: "Code invalide. Vérifiez votre application." };
    }

    // Encrypt secret before storage (security hardening)
    const encryptedSecret = encrypt(secret);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            twoFactorEnabled: true,
            twoFactorSecret: encryptedSecret
        }
    });

    // Log success
    await logSecurityEvent(user.id, "2FA_ENABLED", "Two-factor authentication activated");

    revalidatePath("/p2p/settings/security");
    revalidatePath("/p2p/dashboard");
    revalidatePath("/settings/security");
    return { success: true };
}

/**
 * Disable 2FA (requires current session - could add password confirmation)
 */
export async function disableTwoFactor() {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    await prisma.user.update({
        where: { id: user.id },
        data: {
            twoFactorEnabled: false,
            twoFactorSecret: null
        }
    });

    await logSecurityEvent(user.id, "2FA_DISABLED", "Two-factor authentication deactivated");

    revalidatePath("/p2p/settings/security");
    revalidatePath("/settings/security");
    return { success: true };
}

/**
 * Verify a 2FA token for login or sensitive actions
 * Decrypts stored secret for comparison
 */
export async function verifyTwoFactor(userId: string, token: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { twoFactorSecret: true, twoFactorEnabled: true }
    });

    if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
        return true; // 2FA not enabled, skip
    }

    // Decrypt the stored secret
    const decryptedSecret = decrypt(user.twoFactorSecret);
    if (!decryptedSecret) {
        console.error("[2FA] Failed to decrypt secret for user:", userId);
        return false;
    }

    return verifyTwoFactorToken(token, decryptedSecret);
}

/**
 * Log security-relevant events for audit trail
 */
async function logSecurityEvent(userId: string, action: string, details: string) {
    try {
        await prisma.securityLog.create({
            data: {
                userId,
                action,
                status: "SUCCESS",
                metadata: details, // Using metadata field for details
                ipAddress: "server",
                userAgent: "server"
            }
        });
    } catch (e) {
        console.error("[Security] Failed to log event:", e);
    }
}

