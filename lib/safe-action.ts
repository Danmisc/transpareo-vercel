"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { logSecurityEvent } from "@/lib/security";

export async function verifyTwoFactor(code: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { twoFactorEnabled: true, twoFactorSecret: true }
    });

    if (!dbUser?.twoFactorEnabled) return true; // Bypass if not enabled (or enforce?)

    // Mock Verification Logic since we used a mock secret 'JBSWY3DPEHPK3PXP'
    // In real app: import { authenticator } from 'otplib'; return authenticator.verify({ token: code, secret: dbUser.twoFactorSecret });

    // For this simulation phase, we accept "123456" or the real TOTP if we had the lib
    if (code === "123456") {
        await logSecurityEvent(user.id, "2FA_VERIFY", "SUCCESS");
        return true;
    }

    await logSecurityEvent(user.id, "2FA_VERIFY", "FAILED", { codeProvided: "***" });
    return false;
}

export async function with2FA<T>(
    actionName: string,
    code: string,
    action: () => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string }> {
    const isValid = await verifyTwoFactor(code);

    if (!isValid) {
        return { success: false, error: "Code 2FA invalide" };
    }

    try {
        const result = await action();
        return { success: true, data: result };
    } catch (error) {
        console.error(`Action ${actionName} failed:`, error);
        return { success: false, error: "Erreur serveur" };
    }
}
