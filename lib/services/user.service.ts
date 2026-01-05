import { prisma } from "@/lib/prisma";

export async function updateUserStatus(userId: string, statusMessage: string | null, isInvisible: boolean) {
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                statusMessage,
                isInvisible
            },
            select: {
                id: true,
                name: true,
                image: true,
                statusMessage: true,
                isInvisible: true
            }
        });
        return { success: true, data: user };
    } catch (error) {
        console.error("Update status error:", error);
        return { success: false, error: "Failed to update status" };
    }
}

export async function getUserProfile(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                image: true,
                email: true,
                bio: true,
                location: true,
                website: true,
                statusMessage: true,
                isInvisible: true,
                _count: {
                    select: {
                        followedBy: true,
                        following: true,
                        posts: true
                    }
                }
            }
        });
        return { success: true, data: user };
    } catch (error) {
        console.error("Get profile error:", error);
        return { success: false, error: "Failed to fetch profile" };
    }
}

export async function updateNotificationSettings(userId: string, settings: any) {
    try {
        const updated = await prisma.notificationSettings.upsert({
            where: { userId },
            create: {
                userId,
                ...settings
            },
            update: {
                ...settings
            }
        });
        return { success: true, data: updated };
    } catch (error) {
        console.error("Update settings error:", error);
        return { success: false, error: "Failed to update settings" };
    }
}

export async function getNotificationSettings(userId: string) {
    try {
        const settings = await prisma.notificationSettings.findUnique({
            where: { userId }
        });
        return { success: true, data: settings };
    } catch (error) {
        return { success: false, error: "Failed to fetch settings" };
    }
}
