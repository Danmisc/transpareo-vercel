"use server";

import { updateUserStatus, updateNotificationSettings, getNotificationSettings } from "@/lib/services/user.service";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateStatusAction(status: string | null, invisible: boolean) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
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
