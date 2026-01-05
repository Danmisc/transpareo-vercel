import { prisma as basePrisma } from "@/lib/prisma";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = basePrisma as any;

export type GamificationAction = "POST_CREATED" | "COMMENT_CREATED" | "LIKE_RECEIVED" | "BEST_ANSWER" | "FOLLOW_USER";

const POINTS_RULES: Record<GamificationAction, number> = {
    "POST_CREATED": 10,
    "COMMENT_CREATED": 2,
    "LIKE_RECEIVED": 1,
    "BEST_ANSWER": 20,
    "FOLLOW_USER": 5
};

const BADGES = [
    { slug: "premier-pas", name: "Premier Pas", description: "A créé son compte", condition: "Inscription", icon: "User" },
    { slug: "voisin-curieux", name: "Voisin Curieux", description: "A posé sa première question", condition: "1 post", icon: "HelpCircle" },
    { slug: "guide-local", name: "Guide Local", description: "Partage ses connaissances", condition: "500 points", icon: "MapPin" },
    { slug: "visionnaire", name: "Visionnaire", description: "Propose des idées impactantes", condition: "1000 points", icon: "Lightbulb" },
    { slug: "expert", name: "Expert", description: "Une référence dans la communauté", condition: "5000 points", icon: "Award" },
    { slug: "influenceur", name: "Influenceur", description: "Ses posts génèrent beaucoup de réactions", condition: "100 likes reçus", icon: "Star" },
    { slug: "photographe", name: "Photographe", description: "Partage de belles images", condition: "10 photos postées", icon: "Camera" }
];

export async function seedBadges() {
    console.log("Seeding badges...");
    for (const b of BADGES) {
        await prisma.badge.upsert({
            where: { slug: b.slug },
            create: {
                slug: b.slug,
                name: b.name,
                description: b.description,
                condition: b.condition,
                icon: b.icon,
                category: "GENERAL"
            },
            update: {
                name: b.name,
                description: b.description,
                condition: b.condition,
                icon: b.icon
            }
        });
    }
    console.log("Badges seeded.");
}

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
        console.error(`Failed to handle gamification action ${action}:`, error);
        return null;
    }
}

export async function updateReputation(userId: string, points: number) {
    return handleAction(userId, "LIKE_RECEIVED"); // Legacy fallback or direct point manipulation if needed
}

async function checkReputationBadges(userId: string, reputation: number) {
    if (reputation >= 500) await awardBadge(userId, "guide-local");
    if (reputation >= 1000) await awardBadge(userId, "visionnaire");
    if (reputation >= 5000) await awardBadge(userId, "expert");
}

export async function awardBadge(userId: string, badgeSlug: string) {
    try {
        const badge = await prisma.badge.findUnique({ where: { slug: badgeSlug } });

        // Auto-create badge if missing (Lazy seeding)
        let badgeId = badge?.id;
        if (!badge) {
            const defaults = BADGES.find(b => b.slug === badgeSlug);
            if (defaults) {
                const newBadge = await prisma.badge.create({
                    data: {
                        slug: defaults.slug,
                        name: defaults.name,
                        description: defaults.description,
                        condition: defaults.condition,
                        icon: defaults.icon,
                        category: "GENERAL"
                    }
                });
                badgeId = newBadge.id;
            } else {
                return; // Unknown badge
            }
        }

        if (badgeId) {
            await prisma.userBadge.create({
                data: {
                    userId,
                    badgeId
                }
            }); // Will throw if unique constraint fails (already has badge), which we catch.
        }
    } catch (error) {
        // Ignore unique constraint violation or creation errors
    }
}

export async function getBadges(userId: string) {
    return await prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true }
    });
}

export async function getTopContributors(limit: number = 5) {
    return await prisma.user.findMany({
        orderBy: { reputation: 'desc' },
        take: limit,
        select: {
            id: true,
            name: true,
            avatar: true,
            reputation: true,
            badges: {
                take: 1, // Primary badge
                include: { badge: true }
            }
        }
    });
}

export async function getAllBadgesWithStatus(userId: string) {
    // Fetch all badges
    const allBadges = await prisma.badge.findMany({
        orderBy: { category: 'asc' } // or predefined order
    });

    // Fetch user's earned badges
    const userBadges = await prisma.userBadge.findMany({
        where: { userId },
        select: { badgeId: true, awardedAt: true }
    });

    // Create a map for quick lookup
    const earnedMap = new Map(userBadges.map((ub: { badgeId: string, awardedAt: Date }) => [ub.badgeId, ub.awardedAt]));

    return allBadges.map((badge: { id: string }) => ({
        ...badge,
        unlockedAt: earnedMap.get(badge.id) || null,
        isUnlocked: earnedMap.has(badge.id)
    }));
}
