// ========================================
// ADVANCED RANKING SERVICE
// LinkedIn-quality feed algorithm for real estate social network
// ========================================

import { prisma } from "@/lib/prisma";

// --- SCORING WEIGHTS ---
const WEIGHTS = {
    // Engagement (Base Points)
    LIKE: 1,
    COMMENT: 5,
    SHARE: 10,
    SAVE: 8,

    // Watch Time (Video-specific)
    WATCH_COMPLETION_BONUS: 15,  // Full watch = massive boost
    WATCH_TIME_PER_SECOND: 0.1, // 0.1 points per second watched
    REWATCH_BONUS: 5,           // Multiple views from same user

    // Negative Signals (Penalties)
    SKIP_PENALTY: -5,           // Quick scroll-away
    HIDE_PENALTY: -20,          // User hid the post
    REPORT_PENALTY: -50,        // Post was reported

    // Property/Real Estate Specific
    LOCATION_MATCH: 50,         // Same city as user
    LOCATION_NEARBY: 25,        // Same region
    PRICE_MATCH: 20,            // Within user's budget (if known)

    // Content Quality
    HAS_MEDIA: 3,
    HAS_VIDEO: 5,
    HAS_TAGS: 1,
    CONTENT_LENGTH_BONUS: 2,    // Thoughtful posts (>100 chars)
    VERIFIED_AUTHOR: 10,        // Verified accounts get boost

    // Social Multipliers
    AFFINITY_FOLLOWING: 1.5,
    AFFINITY_MUTUAL: 1.8,       // Both follow each other
    AFFINITY_SAME_INDUSTRY: 1.3,

    // Viral Detection
    VELOCITY_THRESHOLD: 10,     // Interactions in last hour
    VELOCITY_MULTIPLIER: 1.5,

    // Time Decay
    DECAY_RATE: 0.03,           // 3% per hour (slower than before)

    // Discovery (For new users/posts)
    NEW_POST_BOOST: 5,          // Posts < 2h old
    NEW_AUTHOR_BOOST: 3,        // Authors with < 10 posts
};

// --- TYPES ---
interface RankingOptions {
    type?: "VIDEO" | "PROPERTY" | "TEXT";
    limit?: number;
    userLocation?: string | null;
    excludeIds?: string[];
}

interface ScoredPost {
    id: string;
    score: number;
    signals: {
        engagement: number;
        quality: number;
        affinity: number;
        velocity: number;
        freshness: number;
        negative: number;
    };
    [key: string]: any;
}

// --- SERVICE ---
export class RankingService {

    /**
     * Master Feed Generator
     * Fetches, Scores, and Ranks content based on User Context.
     */
    async getRankedFeed(userId: string, options: RankingOptions = {}): Promise<ScoredPost[]> {
        const { type, limit = 20, userLocation, excludeIds = [] } = options;
        const isAnonymous = userId === "anonymous";

        // 1. CANDIDATE GENERATION
        const windowDays = type === "VIDEO" ? 30 : 7;
        const candidates = await prisma.post.findMany({
            where: {
                published: true,
                type: type || undefined,
                id: { notIn: excludeIds },
                createdAt: {
                    gt: new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000)
                }
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        role: true,
                        isVerified: true,
                        industry: true,
                        location: true,
                        _count: { select: { posts: true } }
                    }
                },
                interactions: {
                    orderBy: { createdAt: "desc" }
                },
                comments: {
                    take: 5,
                    orderBy: { createdAt: "desc" },
                    include: { user: { select: { name: true, avatar: true } } }
                },
                video: true,
                hashtags: true,
                attachments: true,
                savedBy: true,
                pollVotes: true,
                quotedPost: {
                    include: {
                        author: {
                            select: { id: true, name: true, avatar: true }
                        }
                    }
                },
                _count: {
                    select: { interactions: true, comments: true }
                }
            },
            take: 200 // Larger pool for better ranking
        });

        // 2. Get user context for personalization (if authenticated)
        const userContext = isAnonymous ? null : await this.getUserContext(userId);

        // 3. SCORING LOOP
        const scoredPosts = await Promise.all(
            candidates.map(async (post) => {
                const signals = await this.calculateAllSignals(post, userId, userLocation, userContext);

                // Aggregate final score
                const score =
                    signals.engagement +
                    signals.quality +
                    signals.affinity +
                    signals.velocity +
                    signals.freshness +
                    signals.negative +
                    (Math.random() * 3); // Discovery noise

                // Add user-specific state
                const userHasLiked = post.interactions.some(
                    (i: any) => i.userId === userId && ["LIKE", "REACTION"].includes(i.type)
                );
                const userHasSaved = post.interactions.some(
                    (i: any) => i.userId === userId && i.type === "SAVE"
                );

                return {
                    ...post,
                    score: parseFloat(score.toFixed(2)),
                    signals,
                    userHasLiked,
                    userHasSaved
                };
            })
        );

        // 4. SORTING
        scoredPosts.sort((a, b) => b.score - a.score);

        // 5. DIVERSITY FILTER
        // Avoid showing multiple posts from same author consecutively
        const diversifiedFeed = this.applyDiversity(scoredPosts, limit);

        return diversifiedFeed;
    }

    /**
     * Calculate all scoring signals for a post
     */
    private async calculateAllSignals(
        post: any,
        userId: string,
        userLocation: string | null | undefined,
        userContext: any
    ) {
        const signals = {
            engagement: 0,
            quality: 0,
            affinity: 0,
            velocity: 0,
            freshness: 0,
            negative: 0
        };

        // A. ENGAGEMENT SCORE
        const likes = post.interactions.filter((i: any) => ["LIKE", "REACTION"].includes(i.type)).length;
        const shares = post.interactions.filter((i: any) => i.type === "SHARE").length;
        const saves = post.interactions.filter((i: any) => i.type === "SAVE").length;
        const comments = post._count.comments;

        signals.engagement =
            (likes * WEIGHTS.LIKE) +
            (shares * WEIGHTS.SHARE) +
            (saves * WEIGHTS.SAVE) +
            (comments * WEIGHTS.COMMENT);

        // B. QUALITY SCORE
        if (post.image || post.video) signals.quality += WEIGHTS.HAS_MEDIA;
        if (post.video) signals.quality += WEIGHTS.HAS_VIDEO;
        if (post.hashtags?.length > 0) signals.quality += WEIGHTS.HAS_TAGS;
        if (post.content?.length > 100) signals.quality += WEIGHTS.CONTENT_LENGTH_BONUS;
        if (post.author.isVerified) signals.quality += WEIGHTS.VERIFIED_AUTHOR;

        // New author boost (discovery)
        if (post.author._count.posts < 10) signals.quality += WEIGHTS.NEW_AUTHOR_BOOST;

        // C. AFFINITY SCORE (Personalization)
        if (userContext && userId !== "anonymous") {
            // Following check
            if (userContext.followingIds.includes(post.authorId)) {
                signals.affinity += 10 * WEIGHTS.AFFINITY_FOLLOWING;
            }

            // Mutual follow
            if (userContext.followerIds.includes(post.authorId)) {
                signals.affinity += 5 * WEIGHTS.AFFINITY_MUTUAL;
            }

            // Same industry
            if (userContext.industry && post.author.industry === userContext.industry) {
                signals.affinity += 5 * WEIGHTS.AFFINITY_SAME_INDUSTRY;
            }

            // Location match
            if (userLocation && post.location) {
                if (post.location.toLowerCase().includes(userLocation.toLowerCase())) {
                    signals.affinity += WEIGHTS.LOCATION_MATCH;
                }
            }
        }

        // D. VELOCITY SCORE (Viral Detection)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentInteractions = post.interactions.filter(
            (i: any) => new Date(i.createdAt) > oneHourAgo
        ).length;

        if (recentInteractions >= WEIGHTS.VELOCITY_THRESHOLD) {
            signals.velocity = recentInteractions * WEIGHTS.VELOCITY_MULTIPLIER;
        }

        // E. FRESHNESS SCORE
        const hoursOld = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
        const freshnessMultiplier = Math.pow(1 - WEIGHTS.DECAY_RATE, Math.max(0, hoursOld));

        // Apply freshness to engagement (not quality/affinity)
        signals.freshness = signals.engagement * (freshnessMultiplier - 1); // Adjustment factor

        // New post boost
        if (hoursOld < 2) signals.freshness += WEIGHTS.NEW_POST_BOOST;

        // F. NEGATIVE SIGNALS
        // In production, query PostView table for skip/hide/report counts
        // For now, check if current user has negative interaction
        const userHidden = post.interactions.some(
            (i: any) => i.userId === userId && i.type === "HIDE"
        );
        if (userHidden) signals.negative += WEIGHTS.HIDE_PENALTY;

        return signals;
    }

    /**
     * Get user context for personalization
     */
    private async getUserContext(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                location: true,
                industry: true,
                following: { select: { followingId: true } },
                followedBy: { select: { followerId: true } }
            }
        });

        if (!user) return null;

        return {
            location: user.location,
            industry: user.industry,
            followingIds: user.following.map((f) => f.followingId),
            followerIds: user.followedBy.map((f) => f.followerId)
        };
    }

    /**
     * Apply diversity to prevent author repetition
     */
    private applyDiversity(posts: ScoredPost[], limit: number): ScoredPost[] {
        const result: ScoredPost[] = [];
        const authorCounts: Record<string, number> = {};
        const MAX_CONSECUTIVE = 2;

        for (const post of posts) {
            if (result.length >= limit) break;

            const authorId = post.authorId;
            const count = authorCounts[authorId] || 0;

            if (count < MAX_CONSECUTIVE) {
                result.push(post);
                authorCounts[authorId] = count + 1;
            }
        }

        // Pad with remaining posts if needed
        if (result.length < limit) {
            for (const post of posts) {
                if (result.length >= limit) break;
                if (!result.includes(post)) {
                    result.push(post);
                }
            }
        }

        return result;
    }

    /**
     * Log a post view for analytics (called from client)
     */
    async logPostView(
        postId: string,
        userId: string | null,
        data: {
            watchTimeMs?: number;
            completionRate?: number;
            didSkip?: boolean;
            source?: string;
            deviceType?: string;
        }
    ) {
        try {
            await prisma.postView.create({
                data: {
                    postId,
                    userId,
                    watchTimeMs: data.watchTimeMs || 0,
                    completionRate: data.completionRate || 0,
                    didSkip: data.didSkip || false,
                    source: data.source,
                    deviceType: data.deviceType
                }
            });
        } catch (error) {
            console.error("[Ranking] Failed to log post view:", error);
        }
    }
}

export const rankingService = new RankingService();
