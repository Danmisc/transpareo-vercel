// ========================================
// CONTENT QUALITY SCORING SERVICE
// Scores posts for ranking and moderation
// ========================================

import { prisma } from "@/lib/prisma";

// --- QUALITY WEIGHTS ---
const QUALITY_WEIGHTS = {
    // Content Attributes
    MIN_CONTENT_LENGTH: 50,
    CONTENT_LENGTH_BONUS: 2,
    HAS_MEDIA_BONUS: 5,
    HAS_VIDEO_BONUS: 8,
    HAS_HASHTAGS_BONUS: 2,
    MAX_HASHTAGS: 5, // Penalty after this
    HASHTAG_SPAM_PENALTY: -3,

    // Engagement Signals
    ENGAGEMENT_RATIO_THRESHOLD: 0.05, // 5% engagement is good
    HIGH_ENGAGEMENT_BONUS: 10,

    // Spam Detection
    DUPLICATE_CONTENT_PENALTY: -20,
    ALL_CAPS_PENALTY: -5,
    EXCESSIVE_EMOJI_PENALTY: -3,
    LINK_SPAM_PENALTY: -10,

    // Author Reputation
    VERIFIED_AUTHOR_BONUS: 5,
    NEW_AUTHOR_PENALTY: -2, // First 3 posts
    TRUSTED_AUTHOR_BONUS: 3, // 1000+ rep

    // Time-based
    EDIT_BONUS: 1, // Edited = cared about quality
};

// --- TYPES ---
export interface ContentQualityScore {
    score: number;
    level: "LOW" | "MEDIUM" | "HIGH" | "PREMIUM";
    signals: {
        contentQuality: number;
        engagement: number;
        spam: number;
        author: number;
    };
    flags: string[];
}

// --- SERVICE ---
export const contentQualityService = {

    /**
     * Calculate quality score for a post
     */
    scorePost: async (postId: string): Promise<ContentQualityScore> => {
        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                author: {
                    select: {
                        isVerified: true,
                        reputation: true,
                        _count: { select: { posts: true } }
                    }
                },
                interactions: true,
                hashtags: true,
                video: true
            }
        });

        if (!post) {
            return {
                score: 0,
                level: "LOW",
                signals: { contentQuality: 0, engagement: 0, spam: 0, author: 0 },
                flags: ["POST_NOT_FOUND"]
            };
        }

        const signals = {
            contentQuality: 0,
            engagement: 0,
            spam: 0,
            author: 0
        };
        const flags: string[] = [];

        // --- CONTENT QUALITY ---
        const content = post.content || "";

        // Length bonus
        if (content.length >= QUALITY_WEIGHTS.MIN_CONTENT_LENGTH) {
            signals.contentQuality += QUALITY_WEIGHTS.CONTENT_LENGTH_BONUS;
        }

        // Media bonuses
        if (post.image) signals.contentQuality += QUALITY_WEIGHTS.HAS_MEDIA_BONUS;
        if (post.video) signals.contentQuality += QUALITY_WEIGHTS.HAS_VIDEO_BONUS;

        // Hashtag scoring
        const hashtagCount = post.hashtags?.length || 0;
        if (hashtagCount > 0 && hashtagCount <= QUALITY_WEIGHTS.MAX_HASHTAGS) {
            signals.contentQuality += QUALITY_WEIGHTS.HAS_HASHTAGS_BONUS;
        } else if (hashtagCount > QUALITY_WEIGHTS.MAX_HASHTAGS) {
            signals.spam += QUALITY_WEIGHTS.HASHTAG_SPAM_PENALTY;
            flags.push("EXCESSIVE_HASHTAGS");
        }

        // --- SPAM DETECTION ---
        // All caps detection
        const upperRatio = (content.match(/[A-Z]/g) || []).length / Math.max(content.length, 1);
        if (upperRatio > 0.5 && content.length > 10) {
            signals.spam += QUALITY_WEIGHTS.ALL_CAPS_PENALTY;
            flags.push("ALL_CAPS");
        }

        // Excessive emojis
        const emojiCount = (content.match(/[\u{1F600}-\u{1F64F}]/gu) || []).length;
        if (emojiCount > 10) {
            signals.spam += QUALITY_WEIGHTS.EXCESSIVE_EMOJI_PENALTY;
            flags.push("EXCESSIVE_EMOJIS");
        }

        // Link spam (more than 3 URLs)
        const urlCount = (content.match(/https?:\/\/[^\s]+/g) || []).length;
        if (urlCount > 3) {
            signals.spam += QUALITY_WEIGHTS.LINK_SPAM_PENALTY;
            flags.push("LINK_SPAM");
        }

        // --- ENGAGEMENT ---
        const views = post.video?.views || 100; // Default to 100 for non-video
        const interactions = post.interactions?.length || 0;
        const engagementRatio = interactions / Math.max(views, 1);

        if (engagementRatio >= QUALITY_WEIGHTS.ENGAGEMENT_RATIO_THRESHOLD) {
            signals.engagement += QUALITY_WEIGHTS.HIGH_ENGAGEMENT_BONUS;
        } else {
            signals.engagement += Math.round(engagementRatio * 100); // 0-5 points
        }

        // --- AUTHOR ---
        if (post.author.isVerified) {
            signals.author += QUALITY_WEIGHTS.VERIFIED_AUTHOR_BONUS;
        }

        if ((post.author.reputation || 0) >= 1000) {
            signals.author += QUALITY_WEIGHTS.TRUSTED_AUTHOR_BONUS;
        }

        if ((post.author._count.posts || 0) <= 3) {
            signals.author += QUALITY_WEIGHTS.NEW_AUTHOR_PENALTY;
            flags.push("NEW_AUTHOR");
        }

        // --- CALCULATE TOTAL ---
        const totalScore = Math.max(0,
            signals.contentQuality +
            signals.engagement +
            signals.spam +
            signals.author
        );

        // Determine level
        let level: ContentQualityScore["level"] = "LOW";
        if (totalScore >= 20) level = "PREMIUM";
        else if (totalScore >= 12) level = "HIGH";
        else if (totalScore >= 5) level = "MEDIUM";

        return {
            score: totalScore,
            level,
            signals,
            flags
        };
    },

    /**
     * Batch score multiple posts
     */
    scorePosts: async (postIds: string[]): Promise<Map<string, ContentQualityScore>> => {
        const results = new Map<string, ContentQualityScore>();

        for (const postId of postIds) {
            const score = await contentQualityService.scorePost(postId);
            results.set(postId, score);
        }

        return results;
    },

    /**
     * Check if content passes minimum quality threshold
     */
    meetsMinimumQuality: async (postId: string): Promise<boolean> => {
        const { score, flags } = await contentQualityService.scorePost(postId);

        // Reject if has spam flags
        const hasSpamFlags = flags.some(f =>
            ["LINK_SPAM", "EXCESSIVE_HASHTAGS", "ALL_CAPS"].includes(f)
        );

        return score >= 3 && !hasSpamFlags;
    }
};
