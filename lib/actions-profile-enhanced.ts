"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ==========================================
// PORTFOLIO ACTIONS
// ==========================================

export async function addPortfolioItem(data: {
    title: string;
    description?: string;
    imageUrl?: string;
    category: string;
    price?: number;
    location?: string;
    link?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non authentifié");

    const item = await prisma.portfolioItem.create({
        data: {
            userId: session.user.id,
            ...data
        }
    });

    revalidatePath(`/profile/${session.user.id}`);
    return item;
}

export async function updatePortfolioItem(id: string, data: Partial<{
    title: string;
    description: string;
    imageUrl: string;
    category: string;
    price: number;
    location: string;
    link: string;
    featured: boolean;
}>) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non authentifié");

    const item = await prisma.portfolioItem.update({
        where: { id, userId: session.user.id },
        data
    });

    revalidatePath(`/profile/${session.user.id}`);
    return item;
}

export async function deletePortfolioItem(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non authentifié");

    await prisma.portfolioItem.delete({
        where: { id, userId: session.user.id }
    });

    revalidatePath(`/profile/${session.user.id}`);
}

// ==========================================
// ENDORSEMENT ACTIONS
// ==========================================

export async function giveEndorsement(receiverId: string, skill: string, message?: string, relationship?: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non authentifié");
    if (session.user.id === receiverId) throw new Error("Vous ne pouvez pas vous recommander vous-même");

    const endorsement = await prisma.endorsement.create({
        data: {
            giverId: session.user.id,
            receiverId,
            skill,
            message,
            relationship
        }
    });

    revalidatePath(`/profile/${receiverId}`);
    return endorsement;
}

export async function deleteEndorsement(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non authentifié");

    await prisma.endorsement.delete({
        where: { id, giverId: session.user.id }
    });

    revalidatePath(`/profile/${session.user.id}`);
}

// ==========================================
// SOCIAL LINKS ACTIONS
// ==========================================

export async function updateSocialLinks(links: Array<{ platform: string; url: string; label?: string }>) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non authentifié");

    await prisma.user.update({
        where: { id: session.user.id },
        data: { socialLinks: JSON.stringify(links) }
    });

    revalidatePath(`/profile/${session.user.id}`);
}

// ==========================================
// STORY HIGHLIGHT ACTIONS
// ==========================================

export async function createStoryHighlight(title: string, storyIds: string[], coverUrl?: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non authentifié");

    const highlight = await prisma.storyHighlight.create({
        data: {
            userId: session.user.id,
            title,
            storyIds: JSON.stringify(storyIds),
            coverUrl
        }
    });

    revalidatePath(`/profile/${session.user.id}`);
    return highlight;
}

export async function deleteStoryHighlight(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non authentifié");

    await prisma.storyHighlight.delete({
        where: { id, userId: session.user.id }
    });

    revalidatePath(`/profile/${session.user.id}`);
}

// ==========================================
// PROFILE SETTINGS ACTIONS
// ==========================================

export async function updateActivityStatus(showStatus: boolean) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non authentifié");

    await prisma.user.update({
        where: { id: session.user.id },
        data: { showActivityStatus: showStatus }
    });

    revalidatePath(`/profile/${session.user.id}`);
}

export async function updateLastSeen() {
    const session = await auth();
    if (!session?.user?.id) return;

    await prisma.user.update({
        where: { id: session.user.id },
        data: { lastSeen: new Date() }
    });
}
