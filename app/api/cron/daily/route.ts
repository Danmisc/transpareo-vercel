import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyticsService } from "@/lib/services/analytics.service";
import { smartNotificationsService } from "@/lib/services/smart-notifications.service";

// ========================================
// DAILY CRON JOB
// Called once per day at midnight (00:00)
// Use Vercel Cron or external service to trigger
// ========================================

// Security: Verify cron secret
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
    // Verify authorization
    const authHeader = request.headers.get("authorization");
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startTime = Date.now();
    const results: Record<string, any> = {
        timestamp: new Date().toISOString(),
        tasks: {}
    };

    try {
        // ==========================================
        // TASK 1: Save Analytics Snapshots
        // ==========================================
        console.log("[Cron Daily] Starting analytics snapshots...");
        const users = await prisma.user.findMany({
            where: {
                // Only active users (posted or logged in last 30 days)
                OR: [
                    { lastActive: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
                    { posts: { some: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } } }
                ]
            },
            select: { id: true }
        });

        let snapshotCount = 0;
        for (const user of users) {
            try {
                await analyticsService.saveDailySnapshot(user.id);
                snapshotCount++;
            } catch (e) {
                console.error(`[Cron] Snapshot failed for ${user.id}:`, e);
            }
        }
        results.tasks.analyticsSnapshots = { processed: snapshotCount, total: users.length };

        // ==========================================
        // TASK 2: Send Daily Digests
        // ==========================================
        console.log("[Cron Daily] Sending daily digests...");
        let digestCount = 0;
        for (const user of users) {
            try {
                await smartNotificationsService.generateDailyDigest(user.id);
                digestCount++;
            } catch (e) {
                console.error(`[Cron] Digest failed for ${user.id}:`, e);
            }
        }
        results.tasks.dailyDigests = { sent: digestCount };

        // ==========================================
        // TASK 3: Check Achievements
        // ==========================================
        console.log("[Cron Daily] Checking achievements...");
        let achievementCount = 0;
        for (const user of users) {
            try {
                await smartNotificationsService.checkAllAchievements(user.id);
                achievementCount++;
            } catch (e) {
                console.error(`[Cron] Achievement check failed for ${user.id}:`, e);
            }
        }
        results.tasks.achievementChecks = { processed: achievementCount };

        // ==========================================
        // TASK 4.5: Publish Scheduled Posts
        // ==========================================
        console.log("[Cron Daily] Publishing scheduled posts...");
        const now = new Date();
        const postsToPublish = await prisma.post.findMany({
            where: {
                scheduledAt: { lte: now },
                published: false,
                isDraft: false,
            }
        });

        let publishedCount = 0;
        for (const post of postsToPublish) {
            try {
                await prisma.post.update({
                    where: { id: post.id },
                    data: {
                        published: true,
                        publishedAt: now,
                        scheduledAt: null,
                    }
                });
                publishedCount++;
            } catch (e) {
                console.error(`[Cron] Failed to publish scheduled post ${post.id}:`, e);
            }
        }
        results.tasks.scheduledPostsPublished = { published: publishedCount, pending: postsToPublish.length };

        // ==========================================
        // TASK 5: Send Inactive Reminders
        // ==========================================
        console.log("[Cron Daily] Sending inactive reminders...");
        let reminderCount = 0;
        for (const user of users) {
            try {
                await smartNotificationsService.sendInactiveReminder(user.id);
                reminderCount++;
            } catch (e) {
                console.error(`[Cron] Inactive reminder failed for ${user.id}:`, e);
            }
        }
        results.tasks.inactiveReminders = { processed: reminderCount };

        // ==========================================
        // TASK 5: Send Best Time Alerts
        // ==========================================
        console.log("[Cron Daily] Sending best time alerts...");
        let bestTimeCount = 0;
        for (const user of users) {
            try {
                await smartNotificationsService.sendBestTimeAlert(user.id);
                bestTimeCount++;
            } catch (e) {
                console.error(`[Cron] Best time alert failed for ${user.id}:`, e);
            }
        }
        results.tasks.bestTimeAlerts = { processed: bestTimeCount };

        // ==========================================
        // TASK 6: Clean Old Notifications (90 days)
        // ==========================================
        console.log("[Cron Daily] Cleaning old notifications...");
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const deletedNotifications = await prisma.notification.deleteMany({
            where: {
                createdAt: { lt: ninetyDaysAgo },
                read: true // Only delete read notifications
            }
        });
        results.tasks.cleanedNotifications = { deleted: deletedNotifications.count };

        // ==========================================
        // TASK 7: Clean Expired Sessions (7 days)
        // ==========================================
        console.log("[Cron Daily] Cleaning expired sessions...");
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const deletedSessions = await prisma.session.deleteMany({
            where: {
                expires: { lt: new Date() }
            }
        });
        results.tasks.cleanedSessions = { deleted: deletedSessions.count };

        // ==========================================
        // TASK 8: Recalculate Trending
        // ==========================================
        console.log("[Cron Daily] Recalculating trending...");
        // Get hashtags with recent activity
        const recentPosts = await prisma.post.findMany({
            where: {
                createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            },
            include: {
                hashtags: true,
                _count: { select: { interactions: true, comments: true } }
            }
        });

        // Aggregate hashtag scores
        const hashtagScores = new Map<string, number>();
        for (const post of recentPosts) {
            const score = post._count.interactions * 2 + post._count.comments * 3;
            for (const tag of post.hashtags) {
                hashtagScores.set(tag.tag, (hashtagScores.get(tag.tag) || 0) + score);
            }
        }
        results.tasks.trendingRecalculated = { hashtags: hashtagScores.size };

        // ==========================================
        // DONE
        // ==========================================
        const duration = Date.now() - startTime;
        results.duration = `${duration}ms`;
        results.status = "success";

        console.log("[Cron Daily] Completed in", duration, "ms");
        return NextResponse.json(results);

    } catch (error) {
        console.error("[Cron Daily] Fatal error:", error);
        return NextResponse.json({
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

// Also support POST for some cron services
export async function POST(request: Request) {
    return GET(request);
}
