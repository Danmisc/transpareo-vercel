// ========================================
// USER TRUST SCORE SYSTEM
// Aggregate trust score for social proof and platform safety
// ========================================

import { prisma } from "@/lib/prisma";

// --- TRUST SCORE WEIGHTS ---
const TRUST_WEIGHTS = {
    // Verification (Identity)
    EMAIL_VERIFIED: 10,
    PHONE_VERIFIED: 20,
    KYC_VERIFIED: 50,
    TWO_FACTOR_ENABLED: 15,

    // Account Tenure
    TENURE_PER_MONTH: 1,      // +1 per month (max 24)
    MAX_TENURE_BONUS: 24,

    // Activity & Reputation
    REPUTATION_MULTIPLIER: 0.01, // 1 point per 100 reputation
    MAX_REPUTATION_BONUS: 30,
    BADGE_BONUS: 5,           // Per badge
    MAX_BADGE_BONUS: 25,

    // Positive Social Proof
    FOLLOWERS_TIER_1: 5,      // 10+ followers
    FOLLOWERS_TIER_2: 10,     // 100+ followers
    FOLLOWERS_TIER_3: 15,     // 1000+ followers

    // Negative Signals
    REPORT_PENALTY: -10,      // Per unresolved report against user
    HIDDEN_POST_PENALTY: -2,  // Per hidden post (by others)
    MAX_PENALTY: -50,

    // Professional (Role-based)
    AGENCY_BONUS: 10,         // Verified agencies
    OWNER_BONUS: 5,           // Property owners

    // Content Quality
    QUALITY_POST_BONUS: 0.1,  // Per high-engagement post
    MAX_QUALITY_BONUS: 20
};

// --- TRUST LEVEL TIERS ---
export type TrustLevel = "NEW" | "BASIC" | "TRUSTED" | "VERIFIED" | "EXPERT";

const TRUST_THRESHOLDS: Record<TrustLevel, number> = {
    NEW: 0,
    BASIC: 20,
    TRUSTED: 50,
    VERIFIED: 80,
    EXPERT: 120
};

// --- TYPES ---
export interface TrustScoreResult {
    score: number;
    level: TrustLevel;
    breakdown: {
        verification: number;
        tenure: number;
        reputation: number;
        social: number;
        penalties: number;
    };
    factors: {
        emailVerified: boolean;
        phoneVerified: boolean;
        kycVerified: boolean;
        twoFactorEnabled: boolean;
        accountAgeMonths: number;
        badgeCount: number;
        followerCount: number;
        reportCount: number;
    };
    percentile?: number;
}

// --- SERVICE ---
export const trustScoreService = {

    /**
     * Calculate comprehensive trust score for a user
     */
    calculateTrustScore: async (userId: string): Promise<TrustScoreResult> => {
        // Fetch all relevant data
        const [user, kyc, badges, followers, reports, posts] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    emailVerified: true,
                    phoneVerified: true,
                    twoFactorEnabled: true,
                    role: true,
                    reputation: true,
                    isVerified: true,
                    createdAt: true
                }
            }),
            prisma.kYCProfile.findUnique({
                where: { userId },
                select: { status: true }
            }),
            prisma.userBadge.count({
                where: { userId }
            }),
            prisma.follow.count({
                where: { followingId: userId }
            }),
            prisma.report.count({
                where: {
                    targetId: userId,
                    targetType: "USER",
                    status: { not: "DISMISSED" }
                }
            }),
            prisma.post.findMany({
                where: { authorId: userId, published: true },
                select: {
                    _count: { select: { interactions: true, comments: true } }
                },
                take: 50
            })
        ]);

        if (!user) {
            return {
                score: 0,
                level: "NEW",
                breakdown: { verification: 0, tenure: 0, reputation: 0, social: 0, penalties: 0 },
                factors: {
                    emailVerified: false,
                    phoneVerified: false,
                    kycVerified: false,
                    twoFactorEnabled: false,
                    accountAgeMonths: 0,
                    badgeCount: 0,
                    followerCount: 0,
                    reportCount: 0
                }
            };
        }

        // Calculate breakdown
        const breakdown = {
            verification: 0,
            tenure: 0,
            reputation: 0,
            social: 0,
            penalties: 0
        };

        // 1. VERIFICATION SCORE
        if (user.emailVerified) breakdown.verification += TRUST_WEIGHTS.EMAIL_VERIFIED;
        if (user.phoneVerified) breakdown.verification += TRUST_WEIGHTS.PHONE_VERIFIED;
        if (kyc?.status === "VERIFIED") breakdown.verification += TRUST_WEIGHTS.KYC_VERIFIED;
        if (user.twoFactorEnabled) breakdown.verification += TRUST_WEIGHTS.TWO_FACTOR_ENABLED;

        // 2. TENURE SCORE
        const accountAgeMonths = Math.floor(
            (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)
        );
        breakdown.tenure = Math.min(
            accountAgeMonths * TRUST_WEIGHTS.TENURE_PER_MONTH,
            TRUST_WEIGHTS.MAX_TENURE_BONUS
        );

        // 3. REPUTATION SCORE
        const repBonus = Math.min(
            (user.reputation || 0) * TRUST_WEIGHTS.REPUTATION_MULTIPLIER,
            TRUST_WEIGHTS.MAX_REPUTATION_BONUS
        );
        const badgeBonus = Math.min(
            badges * TRUST_WEIGHTS.BADGE_BONUS,
            TRUST_WEIGHTS.MAX_BADGE_BONUS
        );
        breakdown.reputation = repBonus + badgeBonus;

        // Role bonus
        if (user.role === "AGENCY") breakdown.reputation += TRUST_WEIGHTS.AGENCY_BONUS;
        if (user.role === "OWNER") breakdown.reputation += TRUST_WEIGHTS.OWNER_BONUS;

        // 4. SOCIAL SCORE
        if (followers >= 1000) breakdown.social = TRUST_WEIGHTS.FOLLOWERS_TIER_3;
        else if (followers >= 100) breakdown.social = TRUST_WEIGHTS.FOLLOWERS_TIER_2;
        else if (followers >= 10) breakdown.social = TRUST_WEIGHTS.FOLLOWERS_TIER_1;

        // Quality posts bonus
        const qualityPosts = posts.filter(p =>
            (p._count.interactions + p._count.comments) > 5
        ).length;
        breakdown.social += Math.min(
            qualityPosts * TRUST_WEIGHTS.QUALITY_POST_BONUS,
            TRUST_WEIGHTS.MAX_QUALITY_BONUS
        );

        // 5. PENALTIES
        breakdown.penalties = Math.max(
            reports * TRUST_WEIGHTS.REPORT_PENALTY,
            TRUST_WEIGHTS.MAX_PENALTY
        );

        // Total score
        const totalScore = Math.max(0,
            breakdown.verification +
            breakdown.tenure +
            breakdown.reputation +
            breakdown.social +
            breakdown.penalties
        );

        // Determine level
        let level: TrustLevel = "NEW";
        for (const [lvl, threshold] of Object.entries(TRUST_THRESHOLDS).reverse()) {
            if (totalScore >= threshold) {
                level = lvl as TrustLevel;
                break;
            }
        }

        return {
            score: Math.round(totalScore * 10) / 10,
            level,
            breakdown,
            factors: {
                emailVerified: !!user.emailVerified,
                phoneVerified: !!user.phoneVerified,
                kycVerified: kyc?.status === "VERIFIED",
                twoFactorEnabled: user.twoFactorEnabled,
                accountAgeMonths,
                badgeCount: badges,
                followerCount: followers,
                reportCount: reports
            }
        };
    },

    /**
     * Get trust level display info
     */
    getTrustLevelInfo: (level: TrustLevel) => {
        const levelInfo: Record<TrustLevel, { label: string; color: string; icon: string }> = {
            NEW: { label: "Nouveau", color: "gray", icon: "User" },
            BASIC: { label: "Basique", color: "blue", icon: "UserCheck" },
            TRUSTED: { label: "Fiable", color: "green", icon: "Shield" },
            VERIFIED: { label: "Vérifié", color: "purple", icon: "BadgeCheck" },
            EXPERT: { label: "Expert", color: "gold", icon: "Crown" }
        };
        return levelInfo[level];
    },

    /**
     * Quick check if user meets minimum trust for action
     */
    meetsMinimumTrust: async (userId: string, minLevel: TrustLevel): Promise<boolean> => {
        const { score } = await trustScoreService.calculateTrustScore(userId);
        return score >= TRUST_THRESHOLDS[minLevel];
    }
};
