"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ActionResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
};

// Get Neighborhood by Slug (including Vibe Score)
export async function getNeighborhood(slug: string) {
    const community = await prisma.community.findUnique({
        where: { slug },
        include: {
            _count: { select: { members: true, posts: true } },
            vibeReviews: true
        }
    });

    if (!community) return null;

    // Calculate Vibe Score
    const reviews = community.vibeReviews;
    const count = reviews.length;

    let vibeScore = null;
    if (count > 0) {
        const totalSafety = reviews.reduce((acc, r) => acc + r.safetyRating, 0);
        const totalNoise = reviews.reduce((acc, r) => acc + r.noiseRating, 0);
        const totalTransport = reviews.reduce((acc, r) => acc + r.transportRating, 0);

        vibeScore = {
            safety: Math.round((totalSafety / count) * 10) / 10,
            noise: Math.round((totalNoise / count) * 10) / 10,
            transport: Math.round((totalTransport / count) * 10) / 10,
            global: Math.round(((totalSafety + totalNoise + totalTransport) / (3 * count)) * 10) / 10,
            count
        };
    }

    return { ...community, vibeScore };
}

// Add a Vibe Review
export async function addVibeReview(communityId: string, userId: string, data: { safety: number, noise: number, transport: number, comment?: string }): Promise<ActionResponse<any>> {
    try {
        await prisma.vibeReview.create({
            data: {
                communityId,
                userId,
                safetyRating: data.safety,
                noiseRating: data.noise,
                transportRating: data.transport,
                comment: data.comment
            }
        });

        revalidatePath(`/neighborhood`);
        return { success: true };
    } catch (error) {
        console.error("Error adding review:", error);
        return { success: false, error: "Erreur ou avis déjà existant." };
    }
}

// Ask a Local (Create a Question Post)
// We reuse the existing createPost but maybe wrap it here for clarity?
// For now, allow direct usage of createPost with type="QUESTION"
