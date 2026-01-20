import { prisma } from "@/lib/prisma";

// ========================================
// ENHANCED ANALYTICS SERVICE
// LinkedIn-style with period filters & comparisons
// ========================================

// ==================== TYPES ====================

export type AnalyticsPeriod = "TODAY" | "7D" | "28D" | "90D" | "365D" | "ALL" | "CUSTOM";

export interface PeriodRange {
    start: Date;
    end: Date;
    previousStart: Date;
    previousEnd: Date;
}

export interface ProfileAnalytics {
    profileViews: number;
    uniqueVisitors: number;
    searchAppearances: number;
    followerCount: number;
    followingCount: number;
    postsCount: number;
    // Changes vs previous period
    changes: {
        profileViews: number;    // percentage
        followers: number;       // absolute
        engagement: number;      // percentage
    };
}

export interface ContentAnalytics {
    totalImpressions: number;
    totalReach: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalSaves: number;
    engagementRate: number;
    avgPostReach: number;
    // Changes
    changes: {
        impressions: number;
        likes: number;
        engagement: number;
    };
}

export interface PostAnalytics {
    id: string;
    content: string;
    createdAt: Date;
    type: string;
    impressions: number;
    reach: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    engagementRate: number;
    topSource: string;
}

export interface DailyEngagement {
    date: string;
    dateRaw: Date;
    likes: number;
    comments: number;
    views: number;
    followers: number;
    impressions: number;
}

export interface AudienceInsight {
    category: string;
    label: string;
    count: number;
    percentage: number;
}

export interface RealEstateAnalytics {
    propertyViews: number;
    investmentClicks: number;
    contactRequests: number;
    leadScore: number;
    topProperties: Array<{
        id: string;
        title: string;
        views: number;
        contacts: number;
    }>;
}

// ==================== HELPERS ====================

function getPeriodRange(period: AnalyticsPeriod, customStart?: Date, customEnd?: Date): PeriodRange {
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    let start: Date;
    let periodLength: number;

    switch (period) {
        case "TODAY":
            start = new Date(now);
            start.setHours(0, 0, 0, 0);
            periodLength = 1;
            break;
        case "7D":
            start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            periodLength = 7;
            break;
        case "28D":
            start = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
            periodLength = 28;
            break;
        case "90D":
            start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            periodLength = 90;
            break;
        case "365D":
            start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            periodLength = 365;
            break;
        case "CUSTOM":
            start = customStart || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            periodLength = Math.ceil((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
            break;
        case "ALL":
        default:
            start = new Date(0); // Beginning of time
            periodLength = Math.ceil((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
            break;
    }

    // Previous period for comparison
    const previousEnd = new Date(start.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - periodLength * 24 * 60 * 60 * 1000);

    return {
        start,
        end: customEnd || now,
        previousStart,
        previousEnd
    };
}

function calculateChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
}

// ==================== SERVICE ====================

export const analyticsService = {
    /**
     * Get profile analytics with period filter and comparison
     */
    getProfileAnalytics: async (
        userId: string,
        period: AnalyticsPeriod = "28D",
        customStart?: Date,
        customEnd?: Date
    ): Promise<ProfileAnalytics> => {
        const range = getPeriodRange(period, customStart, customEnd);

        try {
            // Current period stats
            const [
                profileViews,
                uniqueViewers,
                followerCount,
                followingCount,
                postsCount,
                // Previous period for comparison
                prevProfileViews,
                prevFollowers
            ] = await Promise.all([
                prisma.profileView.count({
                    where: { viewedId: userId, createdAt: { gte: range.start, lte: range.end } }
                }),
                prisma.profileView.groupBy({
                    by: ['viewerId'],
                    where: { viewedId: userId, createdAt: { gte: range.start, lte: range.end } }
                }).then((r: any[]) => r.length),
                prisma.follow.count({ where: { followingId: userId } }),
                prisma.follow.count({ where: { followerId: userId } }),
                prisma.post.count({ where: { authorId: userId } }),
                // Previous period
                prisma.profileView.count({
                    where: { viewedId: userId, createdAt: { gte: range.previousStart, lte: range.previousEnd } }
                }),
                prisma.follow.count({
                    where: { followingId: userId, createdAt: { lt: range.start } }
                })
            ]);

            const followerGrowth = followerCount - prevFollowers;

            return {
                profileViews,
                uniqueVisitors: uniqueViewers,
                searchAppearances: Math.round(profileViews * 0.3),
                followerCount,
                followingCount,
                postsCount,
                changes: {
                    profileViews: calculateChange(profileViews, prevProfileViews),
                    followers: followerGrowth,
                    engagement: 0 // Will be calculated from content
                }
            };
        } catch (error) {
            console.error("[Analytics] Profile error:", error);
            return {
                profileViews: 0,
                uniqueVisitors: 0,
                searchAppearances: 0,
                followerCount: 0,
                followingCount: 0,
                postsCount: 0,
                changes: { profileViews: 0, followers: 0, engagement: 0 }
            };
        }
    },

    /**
     * Get content analytics with period filter
     */
    getContentAnalytics: async (
        userId: string,
        period: AnalyticsPeriod = "28D",
        customStart?: Date,
        customEnd?: Date
    ): Promise<ContentAnalytics> => {
        const range = getPeriodRange(period, customStart, customEnd);

        try {
            const [
                totalLikes,
                totalComments,
                totalSaves,
                impressions,
                // Previous period
                prevLikes,
                prevImpressions
            ] = await Promise.all([
                prisma.interaction.count({
                    where: {
                        post: { authorId: userId },
                        type: { in: ["LIKE", "REACTION"] },
                        createdAt: { gte: range.start, lte: range.end }
                    }
                }),
                prisma.comment.count({
                    where: {
                        post: { authorId: userId },
                        createdAt: { gte: range.start, lte: range.end }
                    }
                }),
                prisma.savedPost.count({
                    where: {
                        post: { authorId: userId },
                        createdAt: { gte: range.start, lte: range.end }
                    }
                }),
                prisma.postImpression.count({
                    where: {
                        post: { authorId: userId },
                        createdAt: { gte: range.start, lte: range.end }
                    }
                }).catch(() => 0), // May not exist yet
                // Previous
                prisma.interaction.count({
                    where: {
                        post: { authorId: userId },
                        type: { in: ["LIKE", "REACTION"] },
                        createdAt: { gte: range.previousStart, lte: range.previousEnd }
                    }
                }),
                prisma.postImpression.count({
                    where: {
                        post: { authorId: userId },
                        createdAt: { gte: range.previousStart, lte: range.previousEnd }
                    }
                }).catch(() => 0)
            ]);

            // Estimate impressions if tracking not available
            const estimatedImpressions = impressions > 0 ? impressions : (totalLikes + totalComments) * 15;
            const engagementRate = estimatedImpressions > 0
                ? ((totalLikes + totalComments) / estimatedImpressions) * 100
                : 0;

            return {
                totalImpressions: estimatedImpressions,
                totalReach: Math.round(estimatedImpressions * 0.7),
                totalLikes,
                totalComments,
                totalShares: 0,
                totalSaves,
                engagementRate: parseFloat(engagementRate.toFixed(2)),
                avgPostReach: 0,
                changes: {
                    impressions: calculateChange(estimatedImpressions, prevImpressions || (prevLikes * 15)),
                    likes: calculateChange(totalLikes, prevLikes),
                    engagement: calculateChange(engagementRate, prevLikes > 0 ? (prevLikes / Math.max(prevImpressions, prevLikes * 15)) * 100 : 0)
                }
            };
        } catch (error) {
            console.error("[Analytics] Content error:", error);
            return {
                totalImpressions: 0,
                totalReach: 0,
                totalLikes: 0,
                totalComments: 0,
                totalShares: 0,
                totalSaves: 0,
                engagementRate: 0,
                avgPostReach: 0,
                changes: { impressions: 0, likes: 0, engagement: 0 }
            };
        }
    },

    /**
     * Get individual post analytics
     */
    getPostAnalytics: async (
        userId: string,
        period: AnalyticsPeriod = "28D",
        limit: number = 20
    ): Promise<PostAnalytics[]> => {
        const range = getPeriodRange(period);

        try {
            const posts = await prisma.post.findMany({
                where: {
                    authorId: userId,
                    published: true,
                    createdAt: period !== "ALL" ? { gte: range.start } : undefined
                },
                orderBy: { createdAt: "desc" },
                take: limit,
                include: {
                    interactions: true,
                    comments: { select: { id: true } },
                    savedBy: { select: { id: true } },
                    _count: { select: { interactions: true, comments: true } }
                }
            });

            return posts.map(post => {
                const likes = post.interactions.filter(
                    (i: any) => i.type === "LIKE" || i.type === "REACTION"
                ).length;
                const comments = post._count.comments;
                const saves = post.savedBy.length;
                const impressions = Math.max((likes + comments) * 15, 50);
                const engagementRate = impressions > 0
                    ? ((likes + comments + saves) / impressions) * 100
                    : 0;

                return {
                    id: post.id,
                    content: post.content.substring(0, 100),
                    createdAt: post.createdAt,
                    type: post.type,
                    impressions,
                    reach: Math.round(impressions * 0.7),
                    likes,
                    comments,
                    shares: 0,
                    saves,
                    engagementRate: parseFloat(engagementRate.toFixed(2)),
                    topSource: "FEED"
                };
            });
        } catch (error) {
            console.error("[Analytics] Posts error:", error);
            return [];
        }
    },

    /**
     * Get top performing posts
     */
    getTopPosts: async (userId: string, limit: number = 5): Promise<PostAnalytics[]> => {
        try {
            const posts = await prisma.post.findMany({
                where: { authorId: userId, published: true },
                include: {
                    interactions: true,
                    _count: { select: { interactions: true, comments: true } }
                },
                take: 50
            });

            const sorted = posts.sort((a, b) => {
                const aScore = a._count.interactions * 2 + a._count.comments * 3;
                const bScore = b._count.interactions * 2 + b._count.comments * 3;
                return bScore - aScore;
            }).slice(0, limit);

            return sorted.map(post => {
                const likes = post.interactions.filter(
                    (i: any) => i.type === "LIKE" || i.type === "REACTION"
                ).length;
                const comments = post._count.comments;
                const impressions = Math.max((likes + comments) * 15, 100);

                return {
                    id: post.id,
                    content: post.content.substring(0, 100),
                    createdAt: post.createdAt,
                    type: post.type,
                    impressions,
                    reach: Math.round(impressions * 0.7),
                    likes,
                    comments,
                    shares: 0,
                    saves: 0,
                    engagementRate: parseFloat((((likes + comments) / impressions) * 100).toFixed(2)),
                    topSource: "FEED"
                };
            });
        } catch (error) {
            console.error("[Analytics] Top posts error:", error);
            return [];
        }
    },

    /**
     * Get daily engagement trend for charts
     */
    getEngagementTrend: async (
        userId: string,
        period: AnalyticsPeriod = "7D"
    ): Promise<DailyEngagement[]> => {
        const range = getPeriodRange(period);
        const days = Math.min(
            Math.ceil((range.end.getTime() - range.start.getTime()) / (24 * 60 * 60 * 1000)),
            90 // Max 90 days for performance
        );

        const result: DailyEngagement[] = [];

        try {
            for (let i = days - 1; i >= 0; i--) {
                const dayStart = new Date();
                dayStart.setDate(dayStart.getDate() - i);
                dayStart.setHours(0, 0, 0, 0);

                const dayEnd = new Date(dayStart);
                dayEnd.setHours(23, 59, 59, 999);

                const [likes, comments, views, followers, impressions] = await Promise.all([
                    prisma.interaction.count({
                        where: {
                            post: { authorId: userId },
                            type: { in: ["LIKE", "REACTION"] },
                            createdAt: { gte: dayStart, lte: dayEnd }
                        }
                    }),
                    prisma.comment.count({
                        where: {
                            post: { authorId: userId },
                            createdAt: { gte: dayStart, lte: dayEnd }
                        }
                    }),
                    prisma.profileView.count({
                        where: {
                            viewedId: userId,
                            createdAt: { gte: dayStart, lte: dayEnd }
                        }
                    }),
                    prisma.follow.count({
                        where: {
                            followingId: userId,
                            createdAt: { gte: dayStart, lte: dayEnd }
                        }
                    }),
                    prisma.postImpression.count({
                        where: {
                            post: { authorId: userId },
                            createdAt: { gte: dayStart, lte: dayEnd }
                        }
                    }).catch(() => (likes + comments) * 10)
                ]);

                result.push({
                    date: dayStart.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
                    dateRaw: dayStart,
                    likes,
                    comments,
                    views,
                    followers,
                    impressions: typeof impressions === 'number' ? impressions : 0
                });
            }

            return result;
        } catch (error) {
            console.error("[Analytics] Trend error:", error);
            return [];
        }
    },

    /**
     * Get audience insights
     */
    getAudienceInsights: async (userId: string): Promise<{
        byRole: AudienceInsight[];
        byLocation: AudienceInsight[];
        byIndustry: AudienceInsight[];
        peakHours: number[];
    }> => {
        try {
            const followers = await prisma.follow.findMany({
                where: { followingId: userId },
                include: {
                    follower: {
                        select: { role: true, location: true, industry: true }
                    }
                }
            });

            const total = followers.length;
            if (total === 0) {
                return { byRole: [], byLocation: [], byIndustry: [], peakHours: [] };
            }

            // Group by role
            const roleMap = new Map<string, number>();
            followers.forEach(f => {
                const role = f.follower.role || "USER";
                roleMap.set(role, (roleMap.get(role) || 0) + 1);
            });

            const byRole = Array.from(roleMap.entries())
                .map(([label, count]) => ({
                    category: "role",
                    label: label === "PRO" ? "Professionnel" : label === "ADMIN" ? "Admin" : "Utilisateur",
                    count,
                    percentage: Math.round((count / total) * 100)
                }))
                .sort((a, b) => b.count - a.count);

            // Group by location
            const locMap = new Map<string, number>();
            followers.forEach(f => {
                const loc = f.follower.location || "Non renseigné";
                locMap.set(loc, (locMap.get(loc) || 0) + 1);
            });

            const byLocation = Array.from(locMap.entries())
                .slice(0, 5)
                .map(([label, count]) => ({
                    category: "location",
                    label,
                    count,
                    percentage: Math.round((count / total) * 100)
                }))
                .sort((a, b) => b.count - a.count);

            // Group by industry
            const indMap = new Map<string, number>();
            followers.forEach(f => {
                const ind = f.follower.industry || "Autre";
                indMap.set(ind, (indMap.get(ind) || 0) + 1);
            });

            const byIndustry = Array.from(indMap.entries())
                .slice(0, 5)
                .map(([label, count]) => ({
                    category: "industry",
                    label,
                    count,
                    percentage: Math.round((count / total) * 100)
                }))
                .sort((a, b) => b.count - a.count);

            // Peak hours (from recent interactions)
            const recentInteractions = await prisma.interaction.findMany({
                where: {
                    post: { authorId: userId },
                    createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                },
                select: { createdAt: true }
            });

            const hourCounts = new Array(24).fill(0);
            recentInteractions.forEach(i => {
                hourCounts[new Date(i.createdAt).getHours()]++;
            });

            return { byRole, byLocation, byIndustry, peakHours: hourCounts };
        } catch (error) {
            console.error("[Analytics] Audience error:", error);
            return { byRole: [], byLocation: [], byIndustry: [], peakHours: [] };
        }
    },

    /**
     * Get real estate specific analytics
     */
    getRealEstateAnalytics: async (
        userId: string,
        period: AnalyticsPeriod = "28D"
    ): Promise<RealEstateAnalytics> => {
        const range = getPeriodRange(period);

        try {
            // Get property analytics
            const propAnalytics = await prisma.propertyAnalytics.findMany({
                where: {
                    userId,
                    date: { gte: range.start, lte: range.end }
                }
            }).catch(() => []);

            const totals = propAnalytics.reduce((acc, p) => ({
                views: acc.views + p.totalViews,
                contacts: acc.contacts + p.contactClicks,
                invest: acc.invest + p.investInterest
            }), { views: 0, contacts: 0, invest: 0 });

            return {
                propertyViews: totals.views,
                investmentClicks: totals.invest,
                contactRequests: totals.contacts,
                leadScore: totals.contacts > 0 ? Math.min(100, totals.contacts * 10) : 0,
                topProperties: []
            };
        } catch (error) {
            console.error("[Analytics] Real estate error:", error);
            return {
                propertyViews: 0,
                investmentClicks: 0,
                contactRequests: 0,
                leadScore: 0,
                topProperties: []
            };
        }
    },

    /**
     * Save daily analytics snapshot (call from cron)
     */
    saveDailySnapshot: async (userId: string): Promise<void> => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const [profile, content] = await Promise.all([
                analyticsService.getProfileAnalytics(userId, "TODAY"),
                analyticsService.getContentAnalytics(userId, "TODAY")
            ]);

            await prisma.analyticsSnapshot.upsert({
                where: {
                    userId_date_period: {
                        userId,
                        date: today,
                        period: "DAILY"
                    }
                },
                create: {
                    userId,
                    date: today,
                    period: "DAILY",
                    profileViews: profile.profileViews,
                    uniqueVisitors: profile.uniqueVisitors,
                    followers: profile.followerCount,
                    following: profile.followingCount,
                    totalImpressions: content.totalImpressions,
                    totalLikes: content.totalLikes,
                    totalComments: content.totalComments,
                    totalSaves: content.totalSaves,
                    engagementRate: content.engagementRate
                },
                update: {
                    profileViews: profile.profileViews,
                    uniqueVisitors: profile.uniqueVisitors,
                    followers: profile.followerCount,
                    following: profile.followingCount,
                    totalImpressions: content.totalImpressions,
                    totalLikes: content.totalLikes,
                    totalComments: content.totalComments,
                    totalSaves: content.totalSaves,
                    engagementRate: content.engagementRate
                }
            });
        } catch (error) {
            console.error("[Analytics] Snapshot save error:", error);
        }
    },

    /**
     * Get historical data from snapshots
     */
    getHistoricalData: async (
        userId: string,
        period: AnalyticsPeriod = "90D"
    ): Promise<DailyEngagement[]> => {
        const range = getPeriodRange(period);

        try {
            const snapshots = await prisma.analyticsSnapshot.findMany({
                where: {
                    userId,
                    period: "DAILY",
                    date: { gte: range.start, lte: range.end }
                },
                orderBy: { date: "asc" }
            });

            return snapshots.map(s => ({
                date: s.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
                dateRaw: s.date,
                likes: s.totalLikes,
                comments: s.totalComments,
                views: s.profileViews,
                followers: s.newFollowers,
                impressions: s.totalImpressions
            }));
        } catch (error) {
            console.error("[Analytics] Historical error:", error);
            return [];
        }
    }
};
