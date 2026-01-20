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
     * Accepts null userId for anonymous/public feed.
     */
    getForYouFeed: async (userId: string | null, limit: number = 20, cursor?: string) => {
        // Fetch User Profile for Location Context (only if authenticated)
        let userLocation: string | null = null;

        if (userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { location: true }
            });
            userLocation = user?.location || null;
        }

        return await rankingService.getRankedFeed(userId || "anonymous", {
            limit,
            userLocation
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
                    video: true,
                    attachments: true,
                    pollVotes: true,
                    quotedPost: {
                        include: {
                            author: {
                                select: { id: true, name: true, avatar: true }
                            }
                        }
                    }
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
