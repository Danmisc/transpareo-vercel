import { prisma } from "@/lib/prisma";
import { rankingService } from "@/lib/ranking";

export const feedService = {
    /**
     * Get the "For You" feed (Algorithmic)
     * Wraps the ranking service which scores posts based on engagement/recency.
     */
    /**
     * Get the "For You" feed (Algorithmic)
     * Wraps the ranking service which scores posts based on engagement/recency/affinity.
     */
    getForYouFeed: async (userId: string, limit: number = 20, cursor?: string) => {
        // Fetch User Profile for Location Context
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { location: true }
        });

        return await rankingService.getRankedFeed(userId, {
            limit,
            userLocation: user?.location
        });
    },

    /**
     * Get the "Following" feed (Chronological)
     * Only posts from users the current user follows.
     */
    getFollowingFeed: async (userId: string, limit: number = 20, cursor?: string) => {
        try {
            const posts = await prisma.post.findMany({
                where: {
                    published: true,
                    author: {
                        followedBy: { // Use correct relation name from schema
                            some: {
                                followerId: userId
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit,
                skip: cursor ? 1 : 0,
                cursor: cursor ? { id: cursor } : undefined,
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
                        include: {
                            user: true
                        }
                    },
                    savedBy: {
                        where: { userId },
                        select: { id: true, collectionId: true }
                    },
                    video: true
                }
            });

            // Add a mock "score" of 0 since it's chronological, for consistency if needed
            return posts.map(p => ({ ...p, score: 0 }));

        } catch (error) {
            console.error("Error fetching following feed:", error);
            return [];
        }
    }
};
