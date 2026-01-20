"use server";

import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

// ========================================
// NOTIFICATION BATCHING SERVICE
// Groups similar notifications for better UX
// ========================================

// --- BATCH CONFIGURATION ---
const BATCH_WINDOW_MS = 60 * 1000; // 1 minute window for batching
const BATCH_THRESHOLD = 3; // Min notifications to trigger batching

type BatchableType = "LIKE" | "COMMENT" | "FOLLOW" | "SHARE" | "SAVE";

// --- NOTIFICATION BATCHING ---

interface BatchedNotification {
    type: string;
    count: number;
    latestActors: Array<{ id: string; name: string; avatar: string | null }>;
    postId?: string;
    createdAt: Date;
}

/**
 * Create notification with batching support
 * Instead of creating individual notifications, batches similar ones
 */
export async function createBatchedNotification(
    recipientId: string,
    type: BatchableType,
    senderId: string,
    postId?: string,
    message?: string
) {
    if (recipientId === senderId) return; // Don't notify self

    try {
        // Check for recent similar notifications in batch window
        const recentCutoff = new Date(Date.now() - BATCH_WINDOW_MS);

        const existingNotifications = await prisma.notification.findMany({
            where: {
                userId: recipientId,
                type,
                postId: postId || undefined,
                createdAt: { gte: recentCutoff },
                read: false
            },
            orderBy: { createdAt: "desc" },
            take: 10
        });

        // Get sender info
        const sender = await prisma.user.findUnique({
            where: { id: senderId },
            select: { name: true, avatar: true }
        });

        if (existingNotifications.length >= BATCH_THRESHOLD - 1) {
            // BATCH: Update existing notification with count
            const existingIds = existingNotifications.map(n => n.id);

            // Delete old individual notifications
            await prisma.notification.deleteMany({
                where: { id: { in: existingIds } }
            });

            // Create batched notification
            const count = existingNotifications.length + 1;
            const batchedMessage = generateBatchedMessage(type, count, sender?.name || "Quelqu'un");

            const notification = await prisma.notification.create({
                data: {
                    userId: recipientId,
                    type: `${type}_BATCH`,
                    senderId, // Latest sender
                    postId,
                    message: `[BATCH:${count}]${batchedMessage}` // Encode count in message
                },
                include: {
                    sender: { select: { name: true, avatar: true } }
                }
            });

            // Send real-time update
            await pusherServer.trigger(`user-${recipientId}`, "new-notification", {
                ...notification,
                isBatched: true,
                count
            });

            return notification;
        } else {
            // INDIVIDUAL: Create single notification
            const notification = await prisma.notification.create({
                data: {
                    userId: recipientId,
                    type,
                    senderId,
                    postId,
                    message
                },
                include: {
                    sender: { select: { name: true, avatar: true } }
                }
            });

            // Send real-time update
            await pusherServer.trigger(`user-${recipientId}`, "new-notification", notification);

            return notification;
        }
    } catch (error) {
        console.error("[Notifications] Batch creation failed:", error);
    }
}

/**
 * Get notifications with batching applied for display
 */
export async function getGroupedNotifications(userId: string, limit: number = 20) {
    const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
            sender: { select: { id: true, name: true, avatar: true } },
            post: { select: { id: true, content: true, type: true } }
        }
    });

    // Parse batched notifications
    return notifications.map(n => {
        if (n.type.endsWith("_BATCH") && n.message?.startsWith("[BATCH:")) {
            const match = n.message.match(/^\[BATCH:(\d+)\]/);
            const count = match ? parseInt(match[1]) : 1;
            const cleanMessage = n.message.replace(/^\[BATCH:\d+\]/, "");
            return {
                ...n,
                message: cleanMessage,
                isBatched: true,
                count
            };
        }
        return { ...n, isBatched: false, count: 1 };
    });
}

/**
 * Aggregate unread notification counts by type
 */
export async function getNotificationSummary(userId: string) {
    const counts = await prisma.notification.groupBy({
        by: ["type"],
        where: {
            userId,
            read: false
        },
        _count: true
    });

    const total = counts.reduce((sum, c) => sum + c._count, 0);

    return {
        total,
        byType: Object.fromEntries(counts.map(c => [c.type, c._count]))
    };
}

// --- HELPERS ---

function generateBatchedMessage(type: BatchableType, count: number, latestName: string): string {
    const others = count - 1;

    switch (type) {
        case "LIKE":
            return others > 0
                ? `${latestName} et ${others} autres ont aimé votre publication`
                : `${latestName} a aimé votre publication`;
        case "COMMENT":
            return others > 0
                ? `${latestName} et ${others} autres ont commenté votre publication`
                : `${latestName} a commenté votre publication`;
        case "FOLLOW":
            return others > 0
                ? `${latestName} et ${others} autres vous suivent maintenant`
                : `${latestName} vous suit maintenant`;
        case "SHARE":
            return others > 0
                ? `${latestName} et ${others} autres ont partagé votre publication`
                : `${latestName} a partagé votre publication`;
        case "SAVE":
            return others > 0
                ? `${latestName} et ${others} autres ont enregistré votre publication`
                : `${latestName} a enregistré votre publication`;
        default:
            return `Nouvelle notification`;
    }
}

/**
 * Mark notifications as read
 */
export async function markNotificationsRead(
    userId: string,
    notificationIds?: string[]
) {
    if (notificationIds && notificationIds.length > 0) {
        await prisma.notification.updateMany({
            where: {
                userId,
                id: { in: notificationIds }
            },
            data: { read: true }
        });
    } else {
        // Mark all as read
        await prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true }
        });
    }
}

/**
 * Clean up old notifications (for cron job)
 */
export async function cleanupOldNotifications(daysOld: number = 30) {
    const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

    const deleted = await prisma.notification.deleteMany({
        where: {
            read: true,
            createdAt: { lt: cutoff }
        }
    });

    console.log(`[Notifications] Cleaned up ${deleted.count} old notifications`);
    return deleted.count;
}
