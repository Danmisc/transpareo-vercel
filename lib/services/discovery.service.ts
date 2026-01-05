import { prisma } from "@/lib/prisma";

export const discoveryService = {
    /**
     * Get users to follow (highest reputation/followers, excluding joined)
     */
    getRecommendedUsers: async (currentUserId: string, limit: number = 3) => {
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
                // { followers: { _count: 'desc' } } // usage might vary with schema, relying on reputation first
            ],
            include: {
                _count: {
                    select: { followedBy: true }
                }
            }
        });
    },

    /**
     * Get trending hashtags (Most used in recent posts)
     * Using a simplified query or Hashtag table if maintained.
     * Fallback to static list if DB is empty for demo.
     */
    getTrendingHashtags: async (limit: number = 5) => {
        // Ideally we aggregate from Posts content or use Hashtag table
        // For MVP, we'll fetch hashtags from the explicit model if available,
        // or just return seeded ones for the demo experience if aggregation is complex in Prisma w/o raw SQL.

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
                { tag: "Immobilier", _count: { posts: 120 } },
                { tag: "Paris", _count: { posts: 85 } },
                { tag: "Rénovation", _count: { posts: 64 } },
                { tag: "Investissement", _count: { posts: 42 } },
                { tag: "Voisinage", _count: { posts: 21 } }
            ];

        } catch (e) {
            return [
                { tag: "Transpareo", _count: { posts: 100 } },
                { tag: "Bienvenue", _count: { posts: 50 } }
            ];
        }
    }
};
