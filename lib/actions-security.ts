"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { logSecurityEvent } from "@/lib/security";

export async function enableTwoFactor(userId: string) {
    const currentUser = await getCurrentUser();

    // Security check: Only allow users to enable their own 2FA
    if (!currentUser || currentUser.id !== userId) {
        throw new Error("Unauthorized");
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { twoFactorEnabled: true }
        });

        await logSecurityEvent(userId, "2FA_ENABLE", "SUCCESS", { method: "TOTP" });
        revalidatePath("/p2p/wallet");
        return { success: true };

    } catch (error) {
        console.error("2FA Enable Error:", error);
        await logSecurityEvent(userId, "2FA_ENABLE", "FAILED", { error: "DB Error" });
        return { success: false, error: "Failed to enable 2FA" };
    }
}
