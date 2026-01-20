"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ========================================
// PROFILE VIEWS ACTIONS
// ========================================

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Log a profile view (max 1 per viewer per viewed user per day)
 */
export async function logProfileView(
    viewerId: string,
    viewedId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Don't track self-views
        if (viewerId === viewedId) {
            return { success: true };
        }

        // Check if already viewed today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingView = await prisma.profileView.findFirst({
            where: {
                viewerId,
                viewedId,
                createdAt: { gte: today }
            }
        });

        if (existingView) {
            // Already viewed today, skip
            return { success: true };
        }

        // Log the view
        await prisma.profileView.create({
            data: {
                viewerId,
                viewedId
            }
        });

        return { success: true };
    } catch (error) {
        console.error("[Profile View] Error:", error);
        return { success: false, error: "Erreur lors de l'enregistrement" };
    }
}

/**
 * Get profile views count for a user (last N days)
 */
export async function getProfileViewsCount(
    userId: string,
    days: number = 7
): Promise<number> {
    try {
        const since = new Date(Date.now() - days * ONE_DAY_MS);

        const count = await prisma.profileView.count({
            where: {
                viewedId: userId,
                createdAt: { gte: since }
            }
        });

        return count;
    } catch (error) {
        console.error("[Profile Views Count] Error:", error);
        return 0;
    }
}

/**
 * Get unique profile viewers count (last N days)
 */
export async function getUniqueProfileViewersCount(
    userId: string,
    days: number = 30
): Promise<number> {
    try {
        const since = new Date(Date.now() - days * ONE_DAY_MS);

        const result = await prisma.profileView.groupBy({
            by: ['viewerId'],
            where: {
                viewedId: userId,
                createdAt: { gte: since }
            }
        });

        return result.length;
    } catch (error) {
        console.error("[Unique Profile Viewers] Error:", error);
        return 0;
    }
}

/**
 * Get recent profile viewers with details (for premium feature)
 */
export async function getRecentProfileViewers(
    userId: string,
    limit: number = 10
): Promise<any[]> {
    try {
        const views = await prisma.profileView.findMany({
            where: { viewedId: userId },
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                viewer: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        role: true
                    }
                }
            },
            distinct: ['viewerId'] // Unique viewers
        });

        return views.map(v => ({
            ...v.viewer,
            viewedAt: v.createdAt
        }));
    } catch (error) {
        console.error("[Recent Profile Viewers] Error:", error);
        return [];
    }
}

/**
 * Update User Pitch (Video Bio)
 */
export async function updateUserPitch(
    userId: string,
    data: {
        videoUrl: string;
        thumbnailUrl?: string;
        duration?: number;
    }
): Promise<{ success: boolean; error?: string }> {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                pitchVideoUrl: data.videoUrl,
                pitchVideoThumbnail: data.thumbnailUrl,
                pitchDuration: data.duration
            }
        });

        revalidatePath(`/profile/${userId}`);
        return { success: true };
    } catch (error) {
        console.error("[Update Pitch] Error:", error);
        return { success: false, error: "Failed to update pitch" };
    }
}

/**
 * Delete User Pitch
 */
export async function deleteUserPitch(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                pitchVideoUrl: null,
                pitchVideoThumbnail: null,
                pitchDuration: null
            }
        });

        revalidatePath(`/profile/${userId}`);
        return { success: true };
    } catch (error) {
        console.error("[Delete Pitch] Error:", error);
        return { success: false, error: "Failed to delete pitch" };
    }
}
