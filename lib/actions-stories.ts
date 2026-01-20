"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ==========================================
// STORY CRUD
// ==========================================

export async function createStory(
    mediaUrl: string,
    mediaType: 'IMAGE' | 'VIDEO' = 'IMAGE',
    caption?: string,
    options?: {
        closeFriendsOnly?: boolean;
        hideFromIds?: string[];
        location?: string;
        mentions?: string[];
    }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Non authentifié" };

        const story = await prisma.story.create({
            data: {
                userId: session.user.id,
                mediaUrl,
                mediaType,
                caption,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
            }
        });

        revalidatePath("/");
        revalidatePath(`/profile/${session.user.id}`);
        return { success: true, story };
    } catch (error) {
        console.error("Create Story Error:", error);
        return { success: false, error: "Échec de création" };
    }
}

export async function deleteStory(storyId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Non authentifié" };

        await prisma.story.delete({
            where: { id: storyId, userId: session.user.id }
        });

        revalidatePath("/");
        revalidatePath(`/profile/${session.user.id}`);
        return { success: true };
    } catch (error) {
        console.error("Delete Story Error:", error);
        return { success: false, error: "Échec de suppression" };
    }
}

// ==========================================
// STORY VIEWING
// ==========================================

export async function getStories(userId?: string) {
    try {
        const now = new Date();

        let whereClause: any = {
            expiresAt: { gt: now }
        };

        // If viewing from a specific user's context, get their following list
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
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        avatar: true,
                        role: true
                    }
                },
                views: userId ? {
                    where: { viewerId: userId },
                    select: { id: true }
                } : false,
                _count: {
                    select: { views: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Group stories by user
        const groupedStories = stories.reduce((acc: any[], story) => {
            let existingGroup = acc.find(g => g.user.id === story.userId);
            if (!existingGroup) {
                existingGroup = {
                    user: {
                        ...story.user,
                        image: story.user.avatar || story.user.image
                    },
                    items: [],
                    hasUnseen: false,
                    latestCreatedAt: story.createdAt,
                    totalViews: 0
                };
                acc.push(existingGroup);
            }

            const isSeen = userId ? (story.views as any[])?.length > 0 : false;

            existingGroup.items.push({
                id: story.id,
                mediaUrl: story.mediaUrl,
                mediaType: story.mediaType,
                caption: story.caption,
                createdAt: story.createdAt,
                expiresAt: story.expiresAt,
                isSeen,
                viewCount: story._count.views
            });

            existingGroup.totalViews += story._count.views;
            if (!isSeen) existingGroup.hasUnseen = true;

            return acc;
        }, []);

        // Sort: unseen first, then by latest
        groupedStories.sort((a, b) => {
            if (a.hasUnseen !== b.hasUnseen) return a.hasUnseen ? -1 : 1;
            return new Date(b.latestCreatedAt).getTime() - new Date(a.latestCreatedAt).getTime();
        });

        return groupedStories;
    } catch (error) {
        console.error("Get Stories Error:", error);
        return [];
    }
}

export async function getMyStories() {
    try {
        const session = await auth();
        if (!session?.user?.id) return [];

        const stories = await prisma.story.findMany({
            where: {
                userId: session.user.id,
                expiresAt: { gt: new Date() }
            },
            include: {
                _count: { select: { views: true } },
                views: {
                    include: {
                        viewer: {
                            select: { id: true, name: true, avatar: true, image: true }
                        }
                    },
                    orderBy: { viewedAt: 'desc' },
                    take: 50
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        return stories;
    } catch (error) {
        console.error("Get My Stories Error:", error);
        return [];
    }
}

export async function markStoryAsSeen(storyId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false };

        // Check if already seen
        const existing = await prisma.storyView.findUnique({
            where: {
                storyId_viewerId: {
                    storyId,
                    viewerId: session.user.id
                }
            }
        });

        if (!existing) {
            await prisma.storyView.create({
                data: {
                    storyId,
                    viewerId: session.user.id
                }
            });
        }

        return { success: true };
    } catch (error) {
        // Silently fail for duplicates
        return { success: false };
    }
}

export async function getStoryViewers(storyId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, viewers: [] };

        // Verify ownership
        const story = await prisma.story.findUnique({
            where: { id: storyId },
            select: { userId: true }
        });

        if (story?.userId !== session.user.id) {
            return { success: false, error: "Non autorisé", viewers: [] };
        }

        const views = await prisma.storyView.findMany({
            where: { storyId },
            include: {
                viewer: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        image: true,
                        role: true
                    }
                }
            },
            orderBy: { viewedAt: 'desc' }
        });

        return {
            success: true,
            viewers: views.map(v => ({
                ...v.viewer,
                image: v.viewer.avatar || v.viewer.image,
                viewedAt: v.viewedAt
            }))
        };
    } catch (error) {
        console.error("Get Story Viewers Error:", error);
        return { success: false, viewers: [] };
    }
}

// ==========================================
// STORY REACTIONS & REPLIES
// ==========================================

export async function reactToStory(storyId: string, emoji: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false };

        // Get story owner
        const story = await prisma.story.findUnique({
            where: { id: storyId },
            select: { userId: true }
        });

        if (!story) return { success: false, error: "Story introuvable" };

        // Create a notification for the story owner
        await prisma.notification.create({
            data: {
                type: "STORY_REACTION",
                userId: story.userId,
                actorId: session.user.id,
                message: `a réagi ${emoji} à votre story`,
                metadata: JSON.stringify({ storyId, emoji })
            }
        });

        return { success: true };
    } catch (error) {
        console.error("React to Story Error:", error);
        return { success: false };
    }
}

export async function replyToStory(storyId: string, message: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false };

        // Get story owner
        const story = await prisma.story.findUnique({
            where: { id: storyId },
            select: { userId: true }
        });

        if (!story) return { success: false, error: "Story introuvable" };

        // Create a DM conversation or add to existing
        let conversation = await prisma.conversation.findFirst({
            where: {
                isGroup: false,
                participants: {
                    every: {
                        userId: { in: [session.user.id, story.userId] }
                    }
                }
            }
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    isGroup: false,
                    participants: {
                        create: [
                            { userId: session.user.id },
                            { userId: story.userId }
                        ]
                    }
                }
            });
        }

        // Create message
        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderId: session.user.id,
                content: `[Réponse à story] ${message}`,
                metadata: JSON.stringify({ storyId, isStoryReply: true })
            }
        });

        // Notification
        await prisma.notification.create({
            data: {
                type: "STORY_REPLY",
                userId: story.userId,
                actorId: session.user.id,
                message: `a répondu à votre story: "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}"`,
                metadata: JSON.stringify({ storyId, conversationId: conversation.id })
            }
        });

        return { success: true, conversationId: conversation.id };
    } catch (error) {
        console.error("Reply to Story Error:", error);
        return { success: false };
    }
}

// ==========================================
// STORY HIGHLIGHTS
// ==========================================

export async function createHighlight(title: string, storyIds: string[], coverUrl?: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false };

        const highlight = await prisma.storyHighlight.create({
            data: {
                userId: session.user.id,
                title,
                storyIds: JSON.stringify(storyIds),
                coverUrl
            }
        });

        revalidatePath(`/profile/${session.user.id}`);
        return { success: true, highlight };
    } catch (error) {
        console.error("Create Highlight Error:", error);
        return { success: false };
    }
}

export async function addToHighlight(highlightId: string, storyIds: string[]) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false };

        const highlight = await prisma.storyHighlight.findUnique({
            where: { id: highlightId, userId: session.user.id }
        });

        if (!highlight) return { success: false, error: "Highlight introuvable" };

        const existingIds = JSON.parse(highlight.storyIds || "[]");
        const newIds = [...new Set([...existingIds, ...storyIds])];

        await prisma.storyHighlight.update({
            where: { id: highlightId },
            data: { storyIds: JSON.stringify(newIds) }
        });

        revalidatePath(`/profile/${session.user.id}`);
        return { success: true };
    } catch (error) {
        console.error("Add to Highlight Error:", error);
        return { success: false };
    }
}

export async function deleteHighlight(highlightId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false };

        await prisma.storyHighlight.delete({
            where: { id: highlightId, userId: session.user.id }
        });

        revalidatePath(`/profile/${session.user.id}`);
        return { success: true };
    } catch (error) {
        console.error("Delete Highlight Error:", error);
        return { success: false };
    }
}

// ==========================================
// STORY ARCHIVE (expired stories)
// ==========================================

export async function getArchivedStories() {
    try {
        const session = await auth();
        if (!session?.user?.id) return [];

        // Get all stories including expired ones
        const stories = await prisma.story.findMany({
            where: { userId: session.user.id },
            include: {
                _count: { select: { views: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        return stories;
    } catch (error) {
        console.error("Get Archived Stories Error:", error);
        return [];
    }
}
