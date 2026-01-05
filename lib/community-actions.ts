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
    }
) {
    try {
        // Generate simple slug
        let slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
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
            take: 20,
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
