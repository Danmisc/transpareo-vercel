"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createStory(mediaUrl: string, mediaType: 'IMAGE' | 'VIDEO' = 'IMAGE', caption?: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const story = await prisma.story.create({
            data: {
                userId: session.user.id,
                mediaUrl,
                mediaType,
                caption,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h from now
            }
        });

        revalidatePath("/");
        return { success: true, story };
    } catch (error) {
        console.error("Create Story Error:", error);
        return { success: false, error: "Failed to create story" };
    }
}

export async function getStories(userId?: string) {
    try {
        // Fetch stories from followed users + self, not expired
        const now = new Date();

        // If no user (guest), just return generic or empty? 
        // For guest demo, let's fetch ALL recent stories or generic demo ones.
        // But for real app, default to empty or global trending if we had that.
        // Let's assume we want to show global recent stories for guests to impress them.

        let whereClause: any = {
            expiresAt: { gt: now }
        };

        if (userId) {
            const following = await prisma.follow.findMany({
                where: { followerId: userId },
                select: { followingId: true }
            });
            const followingIds = following.map(f => f.followingId);
            followingIds.push(userId); // Include self

            whereClause = {
                expiresAt: { gt: now },
                userId: { in: followingIds }
            };
        }

        const stories = await prisma.story.findMany({
            where: whereClause,
            include: {
                user: {
                    select: { id: true, name: true, image: true }
                },
                views: userId ? {
                    where: { viewerId: userId },
                    select: { id: true }
                } : false
            },
            orderBy: { createdAt: 'desc' }
        });

        // Group by User
        const groupedStories = stories.reduce((acc: any[], story) => {
            let existingGroup = acc.find(g => g.user.id === story.userId);
            if (!existingGroup) {
                existingGroup = {
                    user: story.user,
                    items: [],
                    hasUnseen: false,
                    latestCreatedAt: story.createdAt
                };
                acc.push(existingGroup);
            }

            const isSeen = userId ? story.views.length > 0 : false;

            existingGroup.items.push({
                ...story,
                isSeen
            });

            if (!isSeen) existingGroup.hasUnseen = true;

            return acc;
        }, []);

        // Sort: Users with unseen stories first, then by latest story
        groupedStories.sort((a, b) => {
            if (a.hasUnseen === b.hasUnseen) {
                return new Date(b.latestCreatedAt).getTime() - new Date(a.latestCreatedAt).getTime();
            }
            return a.hasUnseen ? -1 : 1;
        });

        return groupedStories;
    } catch (error) {
        console.error("Get Stories Error:", error);
        return [];
    }
}

export async function markStoryAsSeen(storyId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false };

        await prisma.storyView.create({
            data: {
                storyId,
                viewerId: session.user.id
            }
        });

        return { success: true };
    } catch (error) {
        // Ignore duplicate view errors
        return { success: false };
    }
}
