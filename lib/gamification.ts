import { prisma } from "@/lib/prisma";

// ========================================
// UNIFIED GAMIFICATION SYSTEM
// Points, Levels, Badges & Streaks for Real Estate Social Network
// ========================================

// --- USER LEVELS ---
export type UserLevel = "BRONZE" | "ARGENT" | "OR" | "DIAMANT" | "PLATINE";

const LEVEL_THRESHOLDS: Record<UserLevel, number> = {
    BRONZE: 0,
    ARGENT: 100,
    OR: 500,
    DIAMANT: 2000,
    PLATINE: 10000
};

export const LEVEL_INFO: Record<UserLevel, { label: string; color: string; icon: string; perks: string[] }> = {
    BRONZE: {
        label: "Bronze",
        color: "#CD7F32",
        icon: "Medal",
        perks: ["Accès basique", "5 messages/jour"]
    },
    ARGENT: {
        label: "Argent",
        color: "#C0C0C0",
        icon: "Medal",
        perks: ["20 messages/jour", "Badge visible"]
    },
    OR: {
        label: "Or",
        color: "#FFD700",
        icon: "Crown",
        perks: ["Messages illimités", "Profil mis en avant", "Support prioritaire"]
    },
    DIAMANT: {
        label: "Diamant",
        color: "#B9F2FF",
        icon: "Diamond",
        perks: ["Badge exclusif", "Accès beta features", "Invitation événements"]
    },
    PLATINE: {
        label: "Platine",
        color: "#E5E4E2",
        icon: "Crown",
        perks: ["Top 1%", "Accès VIP", "Co-création produit"]
    }
};

// --- COMPLETE BADGE COLLECTION (18 badges) ---
export const BADGES = [
    // General (2)
    { slug: "premier-pas", name: "Premier Pas", description: "A créé son compte", condition: "Inscription", icon: "User", category: "GENERAL" },
    { slug: "voisin-curieux", name: "Voisin Curieux", description: "A posé sa première question", condition: "1 post", icon: "HelpCircle", category: "GENERAL" },

    // Expertise (4)
    { slug: "expert-quartier", name: "Expert Quartier", description: "Connaît son quartier comme sa poche", condition: "50 réponses locales", icon: "MapPin", category: "EXPERTISE" },
    { slug: "negociateur", name: "Négociateur", description: "Maître de la négociation immobilière", condition: "10 deals conseillés", icon: "Handshake", category: "EXPERTISE" },
    { slug: "mentor-immo", name: "Mentor Immo", description: "Guide les nouveaux membres", condition: "100 réponses utiles", icon: "GraduationCap", category: "EXPERTISE" },
    { slug: "analyste", name: "Analyste Marché", description: "Partage des analyses de marché", condition: "25 posts analyse", icon: "TrendingUp", category: "EXPERTISE" },

    // Role-based (3)
    { slug: "proprio-actif", name: "Proprio Actif", description: "Propriétaire engagé", condition: "Rôle Owner + 10 posts", icon: "Home", category: "ROLE" },
    { slug: "agent-star", name: "Agent Star", description: "Agent immobilier de confiance", condition: "Rôle Agency + 100 followers", icon: "Star", category: "ROLE" },
    { slug: "locataire-modele", name: "Locataire Modèle", description: "Un dossier parfait", condition: "Dossier + recommandation", icon: "FileCheck", category: "ROLE" },

    // Engagement/Points (4)
    { slug: "guide-local", name: "Guide Local", description: "Partage ses connaissances", condition: "500 points", icon: "Compass", category: "ENGAGEMENT" },
    { slug: "visionnaire", name: "Visionnaire", description: "Propose des idées impactantes", condition: "1000 points", icon: "Lightbulb", category: "ENGAGEMENT" },
    { slug: "expert", name: "Expert", description: "Une référence dans la communauté", condition: "5000 points", icon: "Award", category: "ENGAGEMENT" },
    { slug: "influenceur", name: "Influenceur", description: "Ses posts génèrent beaucoup de réactions", condition: "100 likes reçus", icon: "Zap", category: "ENGAGEMENT" },

    // Streaks (3)
    { slug: "regulier", name: "Régulier", description: "7 jours consécutifs actif", condition: "7-day streak", icon: "Flame", category: "STREAK" },
    { slug: "assidu", name: "Assidu", description: "30 jours consécutifs actif", condition: "30-day streak", icon: "Flame", category: "STREAK" },
    { slug: "legendaire", name: "Légendaire", description: "100 jours consécutifs actif", condition: "100-day streak", icon: "Crown", category: "STREAK" },

    // Special (2)
    { slug: "early-adopter", name: "Early Adopter", description: "Parmi les premiers membres", condition: "1000 premiers inscrits", icon: "Rocket", category: "SPECIAL" },
    { slug: "ambassadeur", name: "Ambassadeur", description: "Fait rayonner la communauté", condition: "5 parrainages", icon: "Heart", category: "SPECIAL" }
];

// --- GAMIFICATION ACTIONS & POINTS ---
export type GamificationAction =
    | "POST_CREATED"
    | "COMMENT_CREATED"
    | "LIKE_RECEIVED"
    | "BEST_ANSWER"
    | "FOLLOW_USER"
    | "DAILY_LOGIN"
    | "PROFILE_COMPLETED"
    | "FIRST_MESSAGE"
    | "HELPED_NEIGHBOR"
    | "MARKET_ANALYSIS"
    | "REFERRAL_SUCCESS";

const POINTS_RULES: Record<GamificationAction, number> = {
    POST_CREATED: 10,
    COMMENT_CREATED: 2,
    LIKE_RECEIVED: 1,
    BEST_ANSWER: 20,
    FOLLOW_USER: 5,
    DAILY_LOGIN: 5,
    PROFILE_COMPLETED: 25,
    FIRST_MESSAGE: 10,
    HELPED_NEIGHBOR: 15,
    MARKET_ANALYSIS: 30,
    REFERRAL_SUCCESS: 50
};

// ========================================
// PUBLIC API
// ========================================

/**
 * Award points and check for badges/level ups
 */
export async function handleAction(userId: string, action: GamificationAction) {
    const points = POINTS_RULES[action] || 0;
    if (points === 0) return;

    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { reputation: { increment: points } }
        });

        // Check for reputation-based badges
        await checkReputationBadges(userId, user.reputation);

        return user.reputation;
    } catch (error) {
        console.error(`[Gamification] Failed to handle action ${action}:`, error);
        return null;
    }
}

/**
 * Get user's current level based on reputation
 */
export async function getUserLevel(userId: string): Promise<{ level: UserLevel; progress: number; nextLevel: UserLevel | null; info: typeof LEVEL_INFO.BRONZE }> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { reputation: true }
    });

    const reputation = user?.reputation || 0;
    let currentLevel: UserLevel = "BRONZE";
    let nextLevel: UserLevel | null = null;

    const levels = Object.entries(LEVEL_THRESHOLDS) as [UserLevel, number][];
    for (let i = levels.length - 1; i >= 0; i--) {
        if (reputation >= levels[i][1]) {
            currentLevel = levels[i][0];
            nextLevel = i < levels.length - 1 ? levels[i + 1][0] : null;
            break;
        }
    }

    // Calculate progress to next level
    const currentThreshold = LEVEL_THRESHOLDS[currentLevel];
    const nextThreshold = nextLevel ? LEVEL_THRESHOLDS[nextLevel] : null;
    const progress = nextThreshold
        ? ((reputation - currentThreshold) / (nextThreshold - currentThreshold)) * 100
        : 100;

    return {
        level: currentLevel,
        progress: Math.min(100, Math.round(progress)),
        nextLevel,
        info: LEVEL_INFO[currentLevel]
    };
}

/**
 * Award a specific badge to user
 */
export async function awardBadge(userId: string, badgeSlug: string) {
    try {
        let badge = await prisma.badge.findUnique({ where: { slug: badgeSlug } });

        // Auto-create badge if missing (Lazy seeding)
        if (!badge) {
            const defaults = BADGES.find(b => b.slug === badgeSlug);
            if (defaults) {
                badge = await prisma.badge.create({ data: defaults });
            } else {
                return; // Unknown badge
            }
        }

        await prisma.userBadge.create({
            data: { userId, badgeId: badge.id }
        });
    } catch (error) {
        // Ignore unique constraint violation (already has badge)
    }
}

/**
 * Get user's earned badges
 */
export async function getBadges(userId: string) {
    return await prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true },
        orderBy: { awardedAt: "desc" }
    });
}

/**
 * Get all badges with unlock status for display
 */
export async function getAllBadgesWithStatus(userId: string) {
    const allBadges = await prisma.badge.findMany({
        orderBy: { category: "asc" }
    });

    const userBadges = await prisma.userBadge.findMany({
        where: { userId },
        select: { badgeId: true, awardedAt: true }
    });

    const earnedMap = new Map(userBadges.map((ub: any) => [ub.badgeId, ub.awardedAt]));

    return allBadges.map((badge: any) => ({
        ...badge,
        unlockedAt: earnedMap.get(badge.id) || null,
        isUnlocked: earnedMap.has(badge.id)
    }));
}

/**
 * Get top contributors leaderboard
 */
export async function getTopContributors(limit: number = 10) {
    return await prisma.user.findMany({
        orderBy: { reputation: "desc" },
        take: limit,
        select: {
            id: true,
            name: true,
            avatar: true,
            reputation: true,
            role: true,
            isVerified: true,
            badges: {
                take: 3,
                orderBy: { awardedAt: "desc" },
                include: { badge: true }
            }
        }
    });
}

/**
 * Seed all badges to database
 */
export async function seedBadges() {
    console.log("[Gamification] Seeding badges...");
    for (const badge of BADGES) {
        await prisma.badge.upsert({
            where: { slug: badge.slug },
            create: badge,
            update: {
                name: badge.name,
                description: badge.description,
                icon: badge.icon,
                category: badge.category
            }
        });
    }
    console.log(`[Gamification] ${BADGES.length} badges seeded.`);
}

// ========================================
// INTERNAL HELPERS
// ========================================

async function checkReputationBadges(userId: string, reputation: number) {
    if (reputation >= 500) await awardBadge(userId, "guide-local");
    if (reputation >= 1000) await awardBadge(userId, "visionnaire");
    if (reputation >= 5000) await awardBadge(userId, "expert");
}

// Legacy export for backward compatibility
export const updateReputation = handleAction;
