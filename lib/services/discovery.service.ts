import { prisma } from "@/lib/prisma";

export const discoveryService = {
    /**
     * Get users to follow (highest reputation/followers, excluding joined)
     */
    getRecommendedUsers: async (currentUserId: string, limit: number = 5) => {
        // Get IDs of users already followed
        const following = await prisma.follow.findMany({
            where: { followerId: currentUserId },
            select: { followingId: true }
        });
        const followingIds = following.map(f => f.followingId);
        followingIds.push(currentUserId); // Exclude self

        return await prisma.user.findMany({
            where: {
                id: { notIn: followingIds }
            },
            take: limit,
            orderBy: [
                { reputation: 'desc' },
            ],
            include: {
                _count: {
                    select: { followedBy: true }
                }
            }
        });
    },

    /**
     * Get smart user recommendations with reasons
     */
    getSmartRecommendations: async (currentUserId: string, limit: number = 5) => {
        try {
            // Get current user info
            const currentUser = await prisma.user.findUnique({
                where: { id: currentUserId },
                select: {
                    location: true,
                    role: true,
                    following: { select: { followingId: true } }
                }
            });

            if (!currentUser) return [];

            const followingIds = currentUser.following.map(f => f.followingId);
            followingIds.push(currentUserId);

            // Get followers of people you follow (mutual connections potential)
            const mutualPotential = await prisma.follow.findMany({
                where: {
                    followerId: { in: followingIds.filter(id => id !== currentUserId) },
                    followingId: { notIn: followingIds }
                },
                select: { followingId: true },
                take: 50
            });
            const mutualIds = [...new Set(mutualPotential.map(m => m.followingId))];

            // Fetch recommended users with priority scoring
            const users = await prisma.user.findMany({
                where: {
                    id: { notIn: followingIds },
                    OR: [
                        // Same location
                        currentUser.location ? { location: currentUser.location } : {},
                        // Same role (agents follow agents etc)
                        { role: currentUser.role },
                        // High reputation
                        { reputation: { gte: 50 } },
                        // Mutual connections
                        { id: { in: mutualIds } }
                    ].filter(cond => Object.keys(cond).length > 0)
                },
                take: limit * 2,
                orderBy: { reputation: 'desc' },
                include: {
                    _count: { select: { followedBy: true } }
                }
            });

            // Add reasons for recommendations
            return users.slice(0, limit).map(user => {
                let reason = "Populaire sur Transpareo";

                if (mutualIds.includes(user.id)) {
                    reason = "Suivi par des personnes que vous suivez";
                } else if (currentUser.location && user.location === currentUser.location) {
                    reason = `Même ville: ${user.location}`;
                } else if (user.role === currentUser.role) {
                    reason = `Même profil: ${user.role}`;
                } else if ((user._count?.followedBy || 0) > 100) {
                    reason = `${user._count?.followedBy} abonnés`;
                }

                return { ...user, reason };
            });
        } catch (error) {
            console.error("[Smart Recommendations] Error:", error);
            return [];
        }
    },

    /**
     * Get trending hashtags (Most used in recent posts)
     */
    getTrendingHashtags: async (limit: number = 10) => {
        try {
            const tags = await prisma.hashtag.findMany({
                take: limit,
                orderBy: { posts: { _count: 'desc' } },
                include: {
                    _count: { select: { posts: true } }
                }
            });

            if (tags.length > 0) return tags;

            // Fallback for demo if no tags in DB yet
            return [
                { id: "1", tag: "Immobilier", _count: { posts: 120 } },
                { id: "2", tag: "Paris", _count: { posts: 85 } },
                { id: "3", tag: "Rénovation", _count: { posts: 64 } },
                { id: "4", tag: "Investissement", _count: { posts: 42 } },
                { id: "5", tag: "Voisinage", _count: { posts: 21 } },
                { id: "6", tag: "Architecture", _count: { posts: 18 } },
                { id: "7", tag: "Lyon", _count: { posts: 15 } },
                { id: "8", tag: "Colocation", _count: { posts: 12 } }
            ];

        } catch (e) {
            return [
                { id: "1", tag: "Transpareo", _count: { posts: 100 } },
                { id: "2", tag: "Bienvenue", _count: { posts: 50 } }
            ];
        }
    },

    /**
     * Get hashtags with velocity (trending fast)
     */
    getTrendingHashtagsWithVelocity: async (limit: number = 5) => {
        try {
            // Get recent posts from last 24h
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

            const recentPosts = await prisma.post.findMany({
                where: { createdAt: { gte: yesterday } },
                select: {
                    hashtags: { select: { tag: true } }
                }
            });

            // Count hashtag occurrences
            const hashtagCounts = new Map<string, number>();
            recentPosts.forEach(post => {
                post.hashtags.forEach((h: any) => {
                    hashtagCounts.set(h.tag, (hashtagCounts.get(h.tag) || 0) + 1);
                });
            });

            // Sort and return top
            return Array.from(hashtagCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, limit)
                .map(([tag, count]) => ({
                    tag,
                    recentPosts: count,
                    trending: true
                }));
        } catch (error) {
            console.error("[Trending Velocity] Error:", error);
            return [];
        }
    },

    /**
     * 4.6 - Get "Users You May Know" (mutual connections)
     */
    getUsersYouMayKnow: async (currentUserId: string, limit: number = 10) => {
        try {
            // Get current user's following
            const myFollowing = await prisma.follow.findMany({
                where: { followerId: currentUserId },
                select: { followingId: true }
            });
            const followingIds = myFollowing.map(f => f.followingId);
            followingIds.push(currentUserId);

            // Find who my following follow (friends of friends)
            const friendsOfFriends = await prisma.follow.findMany({
                where: {
                    followerId: { in: followingIds.filter(id => id !== currentUserId) },
                    followingId: { notIn: followingIds }
                },
                select: { followingId: true, followerId: true }
            });

            // Count how many mutual connections each user has
            const mutualCounts = new Map<string, { count: number; through: string[] }>();
            for (const fof of friendsOfFriends) {
                const existing = mutualCounts.get(fof.followingId) || { count: 0, through: [] };
                existing.count++;
                if (existing.through.length < 3) existing.through.push(fof.followerId);
                mutualCounts.set(fof.followingId, existing);
            }

            // Sort by mutual count and fetch user details
            const topMutual = Array.from(mutualCounts.entries())
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, limit);

            const users = await prisma.user.findMany({
                where: { id: { in: topMutual.map(m => m[0]) } },
                include: { _count: { select: { followedBy: true } } }
            });

            return users.map(u => ({
                ...u,
                mutualCount: mutualCounts.get(u.id)?.count || 0,
                reason: `${mutualCounts.get(u.id)?.count || 0} connexions en commun`
            }));
        } catch (error) {
            console.error("[Users You May Know] Error:", error);
            return [];
        }
    },

    /**
     * 4.11 - Get nearby users (same location/city)
     */
    getNearbyUsers: async (currentUserId: string, limit: number = 10) => {
        try {
            const currentUser = await prisma.user.findUnique({
                where: { id: currentUserId },
                select: { location: true }
            });

            if (!currentUser?.location) return [];

            // Get users in same location, not already followed
            const following = await prisma.follow.findMany({
                where: { followerId: currentUserId },
                select: { followingId: true }
            });
            const followingIds = [...following.map(f => f.followingId), currentUserId];

            const nearbyUsers = await prisma.user.findMany({
                where: {
                    id: { notIn: followingIds },
                    location: currentUser.location
                },
                orderBy: { reputation: 'desc' },
                take: limit,
                include: { _count: { select: { followedBy: true } } }
            });

            return nearbyUsers.map(u => ({
                ...u,
                reason: `📍 À ${currentUser.location}`
            }));
        } catch (error) {
            console.error("[Nearby Users] Error:", error);
            return [];
        }
    },

    /**
     * 4.10 - Get similar accounts (based on content/followers overlap)
     */
    getSimilarAccounts: async (userId: string, limit: number = 5) => {
        try {
            // Get who the target user follows
            const targetFollowing = await prisma.follow.findMany({
                where: { followerId: userId },
                select: { followingId: true }
            });
            const targetFollowingIds = targetFollowing.map(f => f.followingId);

            // Find users who follow similar accounts
            const similarFollowers = await prisma.follow.findMany({
                where: {
                    followingId: { in: targetFollowingIds },
                    followerId: { not: userId }
                },
                select: { followerId: true }
            });

            // Count overlap
            const overlapCounts = new Map<string, number>();
            similarFollowers.forEach(sf => {
                overlapCounts.set(sf.followerId, (overlapCounts.get(sf.followerId) || 0) + 1);
            });

            // Get top similar users
            const topSimilar = Array.from(overlapCounts.entries())
                .filter(([id]) => id !== userId)
                .sort((a, b) => b[1] - a[1])
                .slice(0, limit);

            const users = await prisma.user.findMany({
                where: { id: { in: topSimilar.map(s => s[0]) } },
                include: { _count: { select: { followedBy: true } } }
            });

            return users.map(u => ({
                ...u,
                overlapScore: overlapCounts.get(u.id) || 0,
                reason: "Intérêts similaires"
            }));
        } catch (error) {
            console.error("[Similar Accounts] Error:", error);
            return [];
        }
    },

    /**
     * 4.14 - Get topics to follow
     */
    getTopicsToFollow: async (currentUserId: string, limit: number = 10) => {
        try {
            // Get hashtags user has interacted with
            const userInteractions = await prisma.interaction.findMany({
                where: { userId: currentUserId },
                include: {
                    post: {
                        include: { hashtags: { select: { id: true, tag: true } } }
                    }
                },
                take: 100
            });

            const interactedTags = new Set<string>();
            userInteractions.forEach(i => {
                i.post?.hashtags.forEach((h: any) => interactedTags.add(h.tag));
            });

            // Get popular hashtags user hasn't interacted with
            const popularTags = await prisma.hashtag.findMany({
                where: {
                    tag: { notIn: Array.from(interactedTags) }
                },
                orderBy: { posts: { _count: 'desc' } },
                take: limit,
                include: { _count: { select: { posts: true } } }
            });

            return popularTags.map(tag => ({
                id: tag.id,
                name: tag.tag,
                postCount: tag._count?.posts || 0,
                category: getCategoryFromHashtag(tag.tag)
            }));
        } catch (error) {
            console.error("[Topics To Follow] Error:", error);
            return [];
        }
    },

    /**
     * 4.9 - Get explore feed content (discovery algorithm)
     */
    getExploreContent: async (currentUserId: string, limit: number = 20) => {
        try {
            // Get users not followed
            const following = await prisma.follow.findMany({
                where: { followerId: currentUserId },
                select: { followingId: true }
            });
            const followingIds = [...following.map(f => f.followingId), currentUserId];

            // Get high-engagement posts from non-followed users
            const explorePosts = await prisma.post.findMany({
                where: {
                    authorId: { notIn: followingIds },
                    published: true,
                    createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                },
                include: {
                    author: { select: { id: true, name: true, avatar: true, role: true } },
                    _count: { select: { interactions: true, comments: true } },
                    hashtags: { select: { tag: true } }
                },
                orderBy: { createdAt: 'desc' },
                take: 100
            });

            // Score and sort by engagement
            const scored = explorePosts.map(post => ({
                ...post,
                score: post._count.interactions * 2 + post._count.comments * 3
            })).sort((a, b) => b.score - a.score);

            return scored.slice(0, limit);
        } catch (error) {
            console.error("[Explore Content] Error:", error);
            return [];
        }
    },

    /**
     * 4.4 - Get geographic trending (by location)
     */
    getGeographicTrending: async (location: string, limit: number = 5) => {
        try {
            // Get posts from users in this location
            const localPosts = await prisma.post.findMany({
                where: {
                    author: { location },
                    createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                },
                include: {
                    hashtags: { select: { tag: true } },
                    _count: { select: { interactions: true, comments: true } }
                }
            });

            // Aggregate hashtags from local posts
            const localTags = new Map<string, number>();
            localPosts.forEach(post => {
                const score = post._count.interactions + post._count.comments;
                post.hashtags.forEach((h: any) => {
                    localTags.set(h.tag, (localTags.get(h.tag) || 0) + score);
                });
            });

            return Array.from(localTags.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, limit)
                .map(([name, score]) => ({ name, score, location }));
        } catch (error) {
            console.error("[Geographic Trending] Error:", error);
            return [];
        }
    },

    /**
     * 4.3 - Detect bursting hashtags (sudden spike)
     */
    getBurstingHashtags: async (limit: number = 5) => {
        try {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

            // Get posts from last hour
            const recentPosts = await prisma.post.findMany({
                where: { createdAt: { gte: oneHourAgo } },
                include: { hashtags: { select: { tag: true } } }
            });

            // Get posts from 1-24 hours ago
            const olderPosts = await prisma.post.findMany({
                where: {
                    createdAt: { gte: twentyFourHoursAgo, lt: oneHourAgo }
                },
                include: { hashtags: { select: { tag: true } } }
            });

            // Count hashtags in each period
            const recentCounts = new Map<string, number>();
            const olderCounts = new Map<string, number>();

            recentPosts.forEach(p => {
                p.hashtags.forEach((h: any) => {
                    recentCounts.set(h.tag, (recentCounts.get(h.tag) || 0) + 1);
                });
            });

            olderPosts.forEach(p => {
                p.hashtags.forEach((h: any) => {
                    olderCounts.set(h.tag, (olderCounts.get(h.tag) || 0) + 1);
                });
            });

            // Calculate velocity (recent / (older/23) to normalize hourly rate)
            const bursting: Array<{ name: string; velocity: number; recentCount: number }> = [];

            recentCounts.forEach((recentCount, name) => {
                const olderCount = olderCounts.get(name) || 0;
                const olderHourlyRate = olderCount / 23;
                const velocity = olderHourlyRate > 0 ? recentCount / olderHourlyRate : recentCount * 10;

                if (velocity > 2) { // At least 2x normal rate
                    bursting.push({ name, velocity, recentCount });
                }
            });

            return bursting
                .sort((a, b) => b.velocity - a.velocity)
                .slice(0, limit);
        } catch (error) {
            console.error("[Bursting Hashtags] Error:", error);
            return [];
        }
    },

    /**
     * 4.13 - Get interest-based feed
     */
    getInterestBasedFeed: async (currentUserId: string, limit: number = 20) => {
        try {
            // Get hashtags user has engaged with
            const userInteractions = await prisma.interaction.findMany({
                where: { userId: currentUserId },
                include: {
                    post: {
                        include: { hashtags: { select: { tag: true } } }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 50
            });

            const engagedTags = new Set<string>();
            userInteractions.forEach(i => {
                i.post?.hashtags.forEach((h: any) => engagedTags.add(h.tag));
            });

            if (engagedTags.size === 0) {
                // No interests detected, return popular content
                return discoveryService.getExploreContent(currentUserId, limit);
            }

            // Get posts with similar hashtags
            const interestPosts = await prisma.post.findMany({
                where: {
                    hashtags: { some: { tag: { in: Array.from(engagedTags) } } },
                    authorId: { not: currentUserId },
                    createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                },
                include: {
                    author: { select: { id: true, name: true, avatar: true } },
                    hashtags: { select: { tag: true } },
                    _count: { select: { interactions: true, comments: true } }
                },
                orderBy: { createdAt: 'desc' },
                take: limit * 2
            });

            // Score by interest match
            return interestPosts.slice(0, limit).map(post => ({
                ...post,
                matchedInterests: post.hashtags.filter((h: any) => engagedTags.has(h.tag)).length
            }));
        } catch (error) {
            console.error("[Interest Based Feed] Error:", error);
            return [];
        }
    }
};

// Helper function to categorize hashtags
function getCategoryFromHashtag(name: string): string {
    const categories: Record<string, string[]> = {
        "Immobilier": ["immobilier", "logement", "appartement", "maison", "achat", "vente", "location"],
        "Investissement": ["investissement", "rendement", "crowdfunding", "scpi", "patrimoine"],
        "Ville": ["paris", "lyon", "marseille", "bordeaux", "toulouse", "nantes", "lille"],
        "Rénovation": ["renovation", "travaux", "decoration", "diy", "amenagement"],
        "Lifestyle": ["colocation", "voisinage", "quartier", "communaute"]
    };

    const lowerName = name.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(k => lowerName.includes(k))) {
            return category;
        }
    }
    return "Autre";
}
