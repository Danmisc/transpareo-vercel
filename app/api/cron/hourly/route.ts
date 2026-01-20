import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ========================================
// HOURLY CRON JOB
// Called every hour for trending recalculation
// ========================================

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
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
        // TASK 1: Recalculate Trending Hashtags
        // ==========================================
        console.log("[Cron Hourly] Recalculating trending hashtags...");

        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Get recent posts with their hashtags and engagement
        const recentPosts = await prisma.post.findMany({
            where: {
                createdAt: { gte: twentyFourHoursAgo },
                published: true
            },
            include: {
                hashtags: true,
                _count: { select: { interactions: true, comments: true } }
            }
        });

        // Calculate hashtag scores with velocity bonus
        const hashtagData = new Map<string, { score: number; count: number; velocity: number }>();

        for (const post of recentPosts) {
            const isRecent = post.createdAt >= oneHourAgo;
            const velocityMultiplier = isRecent ? 3 : 1; // Boost recent activity
            const score = (post._count.interactions * 2 + post._count.comments * 3) * velocityMultiplier;

            for (const tag of post.hashtags) {
                const existing = hashtagData.get(tag.name) || { score: 0, count: 0, velocity: 0 };
                hashtagData.set(tag.name, {
                    score: existing.score + score,
                    count: existing.count + 1,
                    velocity: existing.velocity + (isRecent ? score : 0)
                });
            }
        }

        // Sort by score and get top 20
        const trending = Array.from(hashtagData.entries())
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 20);

        results.tasks.trending = {
            calculated: trending.length,
            top5: trending.slice(0, 5).map(t => ({ name: t.name, score: t.score }))
        };

        // ==========================================
        // TASK 2: Update Post Velocity Scores
        // ==========================================
        console.log("[Cron Hourly] Updating post velocity scores...");

        // Find posts that are gaining traction quickly
        const trendingPosts = await prisma.post.findMany({
            where: {
                createdAt: { gte: oneHourAgo },
                published: true
            },
            include: {
                _count: { select: { interactions: true, comments: true } },
                author: { select: { id: true } }
            }
        });

        let trendingNotifications = 0;
        for (const post of trendingPosts) {
            const engagement = post._count.interactions + post._count.comments;

            // If post has 10+ engagements in first hour, it's trending
            if (engagement >= 10) {
                try {
                    // Import dynamically to avoid circular deps
                    const { smartNotificationsService } = await import("@/lib/services/smart-notifications.service");
                    await smartNotificationsService.checkPostTrending(post.id, post.author.id);
                    trendingNotifications++;
                } catch (e) {
                    console.error(`[Cron Hourly] Trending check failed for post ${post.id}:`, e);
                }
            }
        }
        results.tasks.trendingPosts = { checked: trendingPosts.length, notified: trendingNotifications };

        // ==========================================
        // DONE
        // ==========================================
        const duration = Date.now() - startTime;
        results.duration = `${duration}ms`;
        results.status = "success";

        console.log("[Cron Hourly] Completed in", duration, "ms");
        return NextResponse.json(results);

    } catch (error) {
        console.error("[Cron Hourly] Fatal error:", error);
        return NextResponse.json({
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    return GET(request);
}
