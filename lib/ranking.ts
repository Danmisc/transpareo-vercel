import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// --- UNIFIED SCORING WEIGHTS ---
const WEIGHTS = {
    // Engagement (Base)
    LIKE: 1,
    COMMENT: 5,
    SHARE: 10,
    SAVE: 8,

    // Video Specific
    WATCH_COMPLETION: 3, // Per 10% (Simulated)
    REWATCH: 2,

    // Property Specific
    LOCATION_MATCH: 50, // Massive boost for local properties

    // Quality & Freshness
    HAS_MEDIA: 2,
    HAS_TAGS: 0.5,

    // Multipliers
    AFFINITY_FOLLOWING: 1.5,
    VIRAL_VELOCITY: 1.2, // Boost if recent engagement is high

    // Time Decay
    DECAY_RATE: 0.05 // 5% per hour
}

interface RankingOptions {
    type?: "VIDEO" | "PROPERTY" | "TEXT";
    limit?: number;
    userLocation?: string | null;
}

export class RankingService {

    /**
     * Master Feed Generator
     * Fetches, Scores, and Ranks content based on User Context.
     */
    async getRankedFeed(userId: string, options: RankingOptions = {}) {
        const { type, limit = 20, userLocation } = options;

        // 1. Candidate Generation
        // Fetch pool of candidates (recents + following)
        const candidates = await prisma.post.findMany({
            where: {
                published: true,
                type: type ? type : undefined, // Filter by type if provided (e.g. VIDEO for Reels)
                createdAt: {
                    gt: new Date(Date.now() - (type === 'VIDEO' ? 30 : 7) * 24 * 60 * 60 * 1000) // Videos live longer (30 days), Posts 7 days
                }
            },
            include: {
                author: {
                    include: {
                        badges: {
                            take: 1,
                            orderBy: { awardedAt: 'desc' },
                            include: { badge: true }
                        }
                    }
                },
                interactions: true,
                comments: {
                    include: { user: true }
                },
                savedBy: {
                    where: { userId },
                    select: { id: true }
                },
                video: true,
                hashtags: true
            },
            take: 100 // Fetch larger pool to rank
        });

        // 2. Scoring Loop
        const scoredPosts = await Promise.all(candidates.map(async (post: any) => {
            const score = await this.calculateScore(post, userId, userLocation);

            // Check if user has liked (for UI state)
            const userHasLiked = post.interactions.some((i: any) => i.userId === userId && ['LIKE', 'REACTION'].includes(i.type));

            return {
                ...post,
                score,
                userHasLiked,
                _count: {
                    interactions: post.interactions.length,
                    comments: post.comments.length
                }
            };
        }));

        // 3. Sorting & Reranking
        scoredPosts.sort((a, b) => b.score - a.score);

        // 4. Diversity check (Optional: Don't show 5 posts from same author in a row)
        // For MVP, simple slice is enough.
        return scoredPosts.slice(0, limit);
    }

    /**
     * The Mathematical Core
     * Calculates user-specific relevance score.
     */
    private async calculateScore(post: any, userId: string, userLocation?: string | null): Promise<number> {
        let score = 0;

        // A. Engagement Score (Global Popularity)
        const likes = post.interactions.filter((i: any) => i.type === 'LIKE' || i.type === 'REACTION').length;
        const shares = post.interactions.filter((i: any) => i.type === 'SHARE').length;
        const saves = post.interactions.filter((i: any) => i.type === 'SAVE').length; // Or check savedBy length used in include
        const comments = post.comments.length;

        score += (likes * WEIGHTS.LIKE);
        score += (shares * WEIGHTS.SHARE);
        score += (saves * WEIGHTS.SAVE); // Note: savedBy relation check might be better
        score += (comments * WEIGHTS.COMMENT);

        // B. Content Type Specifics

        // VIDEO Logic
        if (post.type === 'VIDEO' && post.video) {
            // Simulated Watch Time mechanism
            // In a real app, we'd query 'View' events sum / duration.
            // Here, we give a base boost for being a video (engaging format)
            score += 5;
        }

        // PROPERTY Logic
        if (post.type === 'PROPERTY' && post.location && userLocation) {
            // Check for City Match (Simple string inclusion)
            // "Paris, France" vs "Paris"
            if (post.location.toLowerCase().includes(userLocation.toLowerCase()) ||
                userLocation.toLowerCase().includes(post.location.toLowerCase())) {
                score += WEIGHTS.LOCATION_MATCH;
            }
        }

        // C. Quality Boosts
        if (post.image || post.video) score += WEIGHTS.HAS_MEDIA;
        if (post.hashtags && post.hashtags.length > 0) score += WEIGHTS.HAS_TAGS;

        // D. Freshness (Time Decay)
        const hoursOld = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
        // Exponential decay: Score * (1 - decay)^hours
        const freshnessMultiplier = Math.pow(1 - WEIGHTS.DECAY_RATE, Math.max(0, hoursOld));

        // E. Social Affinity (The "For You" Magic)
        let affinityMultiplier = 1.0;

        // Does user follow author?
        const isFollowing = await prisma.follow.findFirst({
            where: { followerId: userId, followingId: post.authorId },
            select: { id: true }
        });
        if (isFollowing) affinityMultiplier = WEIGHTS.AFFINITY_FOLLOWING;

        // Final Calculation
        // Base of 1 ensures new posts don't have 0 score and get fully decayed to 0 immediately
        score = ((score + 1) * freshnessMultiplier) * affinityMultiplier;

        // F. Random Noise (Discovery)
        // Adds 0-2 points to shuffle identical low-score items
        score += Math.random() * 2;

        return parseFloat(score.toFixed(2));
    }
}

export const rankingService = new RankingService();
