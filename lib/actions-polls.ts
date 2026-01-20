"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ========================================
// POLL VOTING ACTIONS
// ========================================

interface PollResults {
    votes: number[];
    total: number;
    userVote: number | null;
}

/**
 * Vote on a poll (or change existing vote)
 */
export async function votePoll(
    postId: string,
    userId: string,
    optionIdx: number
): Promise<{ success: boolean; error?: string; results?: PollResults }> {
    try {
        // 1. Verify post exists and is a POLL
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { type: true, metadata: true }
        });

        if (!post) {
            return { success: false, error: "Post introuvable" };
        }

        if (post.type !== "POLL") {
            return { success: false, error: "Ce post n'est pas un sondage" };
        }

        // 2. Get options to validate optionIdx
        const metadata = post.metadata ? JSON.parse(post.metadata) : {};
        const options = metadata.options || [];

        if (optionIdx < 0 || optionIdx >= options.length) {
            return { success: false, error: "Option invalide" };
        }

        // 3. Upsert the vote (allows changing vote)
        await prisma.pollVote.upsert({
            where: {
                postId_userId: { postId, userId }
            },
            create: {
                postId,
                userId,
                optionIdx
            },
            update: {
                optionIdx
            }
        });

        // 4. Get updated results
        const results = await getPollResults(postId, userId);

        revalidatePath("/");

        return { success: true, results };
    } catch (error) {
        console.error("[PollVote] Error:", error);
        return { success: false, error: "Erreur lors du vote" };
    }
}

/**
 * Get poll results with vote counts per option
 */
export async function getPollResults(
    postId: string,
    userId?: string
): Promise<PollResults> {
    // Get the post metadata to know how many options there are
    const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { metadata: true }
    });

    const metadata = post?.metadata ? JSON.parse(post.metadata) : {};
    const options = metadata.options || [];
    const optionCount = options.length;

    // Count votes per option
    const voteCounts = await prisma.pollVote.groupBy({
        by: ["optionIdx"],
        where: { postId },
        _count: { optionIdx: true }
    });

    // Build votes array (index = optionIdx, value = count)
    const votes = new Array(optionCount).fill(0);
    let total = 0;

    for (const vc of voteCounts) {
        if (vc.optionIdx >= 0 && vc.optionIdx < optionCount) {
            votes[vc.optionIdx] = vc._count.optionIdx;
            total += vc._count.optionIdx;
        }
    }

    // Get user's vote if userId provided
    let userVote: number | null = null;
    if (userId) {
        const userVoteRecord = await prisma.pollVote.findUnique({
            where: { postId_userId: { postId, userId } },
            select: { optionIdx: true }
        });
        userVote = userVoteRecord?.optionIdx ?? null;
    }

    return { votes, total, userVote };
}

/**
 * Remove user's vote from a poll
 */
export async function unvotePoll(
    postId: string,
    userId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await prisma.pollVote.delete({
            where: { postId_userId: { postId, userId } }
        });

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        // Vote doesn't exist, that's fine
        return { success: true };
    }
}
