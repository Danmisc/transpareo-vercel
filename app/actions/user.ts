"use server";

import { updateUserStatus, updateNotificationSettings, getNotificationSettings } from "@/lib/services/user.service";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { canUseInvisibleMode } from "@/lib/subscription/feature-gates";

export async function updateStatusAction(status: string | null, invisible: boolean) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    // Server-side check for invisible mode permission
    if (invisible) {
        const check = await canUseInvisibleMode(session.user.id);
        if (!check.allowed) {
            return {
                success: false,
                error: check.message || "Le mode invisible nécessite un abonnement Pro ou Business.",
                code: "INVISIBLE_REQUIRES_PRO"
            };
        }
    }

    const result = await updateUserStatus(session.user.id, status, invisible);

    if (result.success) {
        revalidatePath('/'); // Revalidate to update UI potentially
    }

    return result;
}

export async function updateSettingsAction(settings: any) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const result = await updateNotificationSettings(session.user.id, settings);
    if (result.success) revalidatePath('/');
    return result;
}

export async function getSettingsAction() {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    return await getNotificationSettings(session.user.id);
}
