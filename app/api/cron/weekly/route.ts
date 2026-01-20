import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { smartNotificationsService } from "@/lib/services/smart-notifications.service";

// ========================================
// WEEKLY CRON JOB
// Called once per week on Monday at 9:00
// Use Vercel Cron or external service to trigger
// ========================================

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
        dayOfWeek: new Date().toLocaleDateString('fr-FR', { weekday: 'long' }),
        tasks: {}
    };

    try {
        // ==========================================
        // TASK 1: Send Weekly Summaries
        // ==========================================
        console.log("[Cron Weekly] Sending weekly summaries...");

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { lastActive: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
                    { posts: { some: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } } }
                ]
            },
            select: { id: true }
        });

        let summaryCount = 0;
        for (const user of users) {
            try {
                await smartNotificationsService.generateWeeklySummary(user.id);
                summaryCount++;
            } catch (e) {
                console.error(`[Cron Weekly] Summary failed for ${user.id}:`, e);
            }
        }
        results.tasks.weeklySummaries = { sent: summaryCount, total: users.length };

        // ==========================================
        // TASK 2: Check Profile Views Milestones
        // ==========================================
        console.log("[Cron Weekly] Checking profile views milestones...");
        let milestoneCount = 0;
        for (const user of users) {
            try {
                await smartNotificationsService.checkProfileViewsMilestone(user.id);
                milestoneCount++;
            } catch (e) {
                console.error(`[Cron Weekly] Milestone check failed for ${user.id}:`, e);
            }
        }
        results.tasks.profileMilestones = { checked: milestoneCount };

        // ==========================================
        // TASK 3: Check Engagement Spikes
        // ==========================================
        console.log("[Cron Weekly] Checking engagement spikes...");
        let spikeCount = 0;
        for (const user of users) {
            try {
                await smartNotificationsService.checkEngagementSpike(user.id);
                spikeCount++;
            } catch (e) {
                console.error(`[Cron Weekly] Spike check failed for ${user.id}:`, e);
            }
        }
        results.tasks.engagementSpikes = { checked: spikeCount };

        // ==========================================
        // TASK 4: Check Network Growth
        // ==========================================
        console.log("[Cron Weekly] Checking network growth...");
        let growthCount = 0;
        for (const user of users) {
            try {
                await smartNotificationsService.checkNetworkGrowth(user.id);
                growthCount++;
            } catch (e) {
                console.error(`[Cron Weekly] Growth check failed for ${user.id}:`, e);
            }
        }
        results.tasks.networkGrowth = { checked: growthCount };

        // ==========================================
        // TASK 5: Weekly Analytics Aggregation
        // ==========================================
        console.log("[Cron Weekly] Aggregating weekly analytics...");

        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        weekStart.setHours(0, 0, 0, 0);

        // Create weekly snapshots from daily data
        for (const user of users) {
            try {
                const dailySnapshots = await prisma.analyticsSnapshot.findMany({
                    where: {
                        userId: user.id,
                        period: "DAILY",
                        date: { gte: weekStart }
                    }
                });

                if (dailySnapshots.length > 0) {
                    const aggregated = dailySnapshots.reduce((acc, s) => ({
                        profileViews: acc.profileViews + s.profileViews,
                        uniqueVisitors: acc.uniqueVisitors + s.uniqueVisitors,
                        totalLikes: acc.totalLikes + s.totalLikes,
                        totalComments: acc.totalComments + s.totalComments,
                        newFollowers: acc.newFollowers + s.newFollowers,
                        totalImpressions: acc.totalImpressions + s.totalImpressions
                    }), {
                        profileViews: 0,
                        uniqueVisitors: 0,
                        totalLikes: 0,
                        totalComments: 0,
                        newFollowers: 0,
                        totalImpressions: 0
                    });

                    await prisma.analyticsSnapshot.upsert({
                        where: {
                            userId_date_period: {
                                userId: user.id,
                                date: weekStart,
                                period: "WEEKLY"
                            }
                        },
                        create: {
                            userId: user.id,
                            date: weekStart,
                            period: "WEEKLY",
                            ...aggregated,
                            engagementRate: aggregated.totalImpressions > 0
                                ? ((aggregated.totalLikes + aggregated.totalComments) / aggregated.totalImpressions) * 100
                                : 0
                        },
                        update: aggregated
                    });
                }
            } catch (e) {
                console.error(`[Cron Weekly] Aggregation failed for ${user.id}:`, e);
            }
        }
        results.tasks.weeklyAggregation = { processed: users.length };

        // ==========================================
        // DONE
        // ==========================================
        const duration = Date.now() - startTime;
        results.duration = `${duration}ms`;
        results.status = "success";

        console.log("[Cron Weekly] Completed in", duration, "ms");
        return NextResponse.json(results);

    } catch (error) {
        console.error("[Cron Weekly] Fatal error:", error);
        return NextResponse.json({
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    return GET(request);
}
