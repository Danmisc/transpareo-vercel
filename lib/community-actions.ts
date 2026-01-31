"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- CREATE ---
export async function createCommunity(
    userId: string,
    data: {
        name: string;
        description: string;
        type: "PUBLIC" | "PRIVATE" | "RESTRICTED";
        slug?: string;
        avatar?: string;
        coverImage?: string;
        theme?: any; // Start simple, or refine type if needed
    }
) {
    try {
        // Use provided slug or generate one
        let slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

        // Ensure uniqueness logic remains
        const existing = await prisma.community.findUnique({ where: { slug } });
        if (existing) {
            slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }

        const community = await prisma.community.create({
            data: {
                name: data.name,
                slug,
                description: data.description,
                type: data.type,
                image: data.avatar, // Mapping avatar to image
                coverImage: data.coverImage,
                // We might need to store theme in a JSON field or similar if DB supports it.
                // Checking Schema would be best but let's assume 'metadata' or specific fields exist.
                // Since I can't see Schema, I will map common fields.
                // If 'image' and 'coverImage' exist on Community model, this works.
                creatorId: userId,
                members: {
                    create: {
                        userId,
                        role: "ADMIN"
                    }
                }
            }
        });

        revalidatePath("/communities");
        return { success: true, data: community };
    } catch (error) {
        console.error("Failed to create community:", error);
        return { success: false, error: "Failed to create community" };
    }
}

// --- JOIN/LEAVE ---
export async function joinCommunity(communityId: string, userId: string) {
    try {
        // Check if user is banned
        const banned = await prisma.communityBannedUser.findUnique({
            where: {
                communityId_userId: {
                    communityId,
                    userId
                }
            }
        });

        if (banned) {
            // If ban has expiration and is past, allow delete
            if (banned.expiresAt && new Date() > banned.expiresAt) {
                await prisma.communityBannedUser.delete({
                    where: {
                        communityId_userId: {
                            communityId,
                            userId
                        }
                    }
                });
            } else {
                return { success: false, error: "You are banned from this community." };
            }
        }

        await prisma.communityMember.create({
            data: {
                communityId,
                userId,
                role: "MEMBER"
            }
        });
        revalidatePath("/communities");
        revalidatePath(`/communities/${communityId}`); // Only if we had ID, but we usually nav by slug
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to join" };
    }
}

export async function leaveCommunity(communityId: string, userId: string) {
    try {
        await prisma.communityMember.delete({
            where: {
                communityId_userId: {
                    communityId,
                    userId
                }
            }
        });
        revalidatePath("/communities");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to leave" };
    }
}

// --- FETCH ---
// ...
export async function getUserCommunities(userId: string) {
    try {
        const memberships = await prisma.communityMember.findMany({
            where: { userId },
            include: {
                community: {
                    include: {
                        _count: { select: { members: true } }
                    }
                }
            },
            orderBy: { joinedAt: 'desc' }
        });

        const data = memberships.map(m => ({
            ...m.community,
            role: m.role,
            joinedAt: m.joinedAt,
            // Add derived properties expected by UI if needed
            isPinned: false, // Default
            hasUnread: false // Default
        }));

        return { success: true, data };
    } catch (error) {
        console.error("Failed to fetch user communities:", error);
        return { success: false, error: "Failed to fetch user communities" };
    }
}

export async function getCommunities(query?: string) {
    try {
        const communities = await prisma.community.findMany({
            where: query ? {
                OR: [
                    { name: { contains: query } },
                    { description: { contains: query } }
                ]
            } : undefined,
            include: {
                _count: {
                    select: { members: true }
                }
            },
            take: 50,
            orderBy: { members: { _count: 'desc' } }
        });
        return { success: true, data: communities };
    } catch (error) {
        return { success: false, error: "Failed to fetch communities" };
    }
}

export async function getCommunity(slug: string, currentUserId?: string) {
    try {
        const community = await prisma.community.findUnique({
            where: { slug },
            include: {
                _count: { select: { members: true, posts: true } },
                members: currentUserId ? {
                    where: { userId: currentUserId }
                } : false
            }
        });

        if (!community) return null;

        // Check membership
        const membership = community.members?.[0] || null;

        return { ...community, membership };
    } catch (error) {
        return null;
    }
}
