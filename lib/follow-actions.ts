"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { createNotification } from "@/lib/actions";
import { discoveryService } from "@/lib/services/discovery.service";

export async function followUser(targetId: string, type: string = "FOLLOWER") {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await prisma.follow.create({
            data: {
                followerId: session.user.id,
                followingId: targetId,
                type
            }
        });

        await createNotification(
            targetId,
            "FOLLOW",
            session.user.id,
            undefined,
            undefined,
            "a commencé à vous suivre."
        );

        revalidatePath(`/profile/${targetId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to follow user:", error);
        return { success: false, error: "Failed to follow" };
    }
}

export async function unfollowUser(targetId: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: session.user.id,
                    followingId: targetId
                }
            }
        });

        revalidatePath(`/profile/${targetId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to unfollow" };
    }
}

export async function toggleMuteUser(targetId: string, isMuted: boolean) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await prisma.follow.update({
            where: {
                followerId_followingId: {
                    followerId: session.user.id,
                    followingId: targetId
                }
            },
            data: { isMuted }
        });
        revalidatePath(`/profile/${targetId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to mute/unmute" };
    }
}

export async function updateRelationshipType(targetId: string, type: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await prisma.follow.update({
            where: {
                followerId_followingId: {
                    followerId: session.user.id,
                    followingId: targetId
                }
            },
            data: { type }
        });
        revalidatePath(`/profile/${targetId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update relationship" };
    }
}

export async function blockUser(targetId: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        // Create block
        await prisma.block.create({
            data: {
                blockerId: session.user.id,
                blockedId: targetId
            }
        });

        // Force unfollow both ways
        await prisma.follow.deleteMany({
            where: {
                OR: [
                    { followerId: session.user.id, followingId: targetId },
                    { followerId: targetId, followingId: session.user.id }
                ]
            }
        });

        revalidatePath(`/profile/${targetId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to block" };
    }
}

export async function unblockUser(targetId: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await prisma.block.delete({
            where: {
                blockerId_blockedId: {
                    blockerId: session.user.id,
                    blockedId: targetId
                }
            }
        });
        revalidatePath(`/profile/${targetId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to unblock" };
    }
}

export async function getRelationshipStatus(currentUserId: string, targetId: string) {
    const follow = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: currentUserId,
                followingId: targetId
            }
        }
    });

    const block = await prisma.block.findUnique({
        where: {
            blockerId_blockedId: {
                blockerId: currentUserId,
                blockedId: targetId
            }
        }
    });

    // Check if target blocked current user
    const isBlockedByTarget = await prisma.block.findUnique({
        where: {
            blockerId_blockedId: {
                blockerId: targetId,
                blockedId: currentUserId
            }
        }
    });

    return {
        isFollowing: !!follow,
        isMuted: follow?.isMuted || false,
        relationshipType: follow?.type || null,
        isBlocked: !!block,
        isBlockedByTarget: !!isBlockedByTarget
    };
}

export async function getNetwork(userId: string, type: "FOLLOWERS" | "FOLLOWING") {
    try {
        if (type === "FOLLOWERS") {
            const followers = await prisma.follow.findMany({
                where: { followingId: userId },
                include: {
                    follower: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                            role: true,
                            bio: true
                        }
                    }
                }
            });
            return { success: true, data: followers.map(f => f.follower) };
        } else {
            const following = await prisma.follow.findMany({
                where: { followerId: userId },
                include: {
                    following: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                            role: true,
                            bio: true
                        }
                    }
                }
            });
            return { success: true, data: following.map(f => f.following) };
        }
    } catch (error) {
        return { success: false, error: "Failed to fetch network" };
    }
}

export async function getSuggestions() {
    const session = await auth();
    if (!session?.user?.id) return { success: false, data: [] };
    const userId = session.user.id;

    try {
        const suggestions = await discoveryService.getRecommendedUsers(userId);
        return { success: true, data: suggestions };
    } catch (error) {
        return { success: false, data: [] };
    }
}
