"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSearchCriteria(userId: string) {
    try {
        const criteria = await prisma.userSearchCriteria.findUnique({
            where: { userId },
        });
        return criteria;
    } catch (error) {
        console.error("[getSearchCriteria] Error:", error);
        return null;
    }
}

export type UpdateSearchCriteriaData = {
    isActive?: boolean;
    type?: string;
    minBudget?: number | null;
    maxBudget?: number | null;
    minSurface?: number | null;
    maxSurface?: number | null;
    location?: string | null;
    rooms?: string | null;
    assetTypes?: string | null;
};

export async function updateSearchCriteria(data: UpdateSearchCriteriaData) {
    try {
        console.log("[updateSearchCriteria] Starting...", data);
        const session = await auth();
        if (!session?.user?.id) {
            console.error("[updateSearchCriteria] No session/user ID");
            throw new Error("Unauthorized");
        }
        console.log("[updateSearchCriteria] User ID:", session.user.id);

        const criteria = await prisma.userSearchCriteria.upsert({
            where: { userId: session.user.id },
            update: data,
            create: {
                userId: session.user.id,
                ...data,
                // Set default type if creating new and not provided, though upsert create needs all defaults usually
                type: data.type || "BUY",
            },
        });

        revalidatePath(`/profile/${session.user.id}`);
        return { success: true, data: criteria };
    } catch (error) {
        console.error("[updateSearchCriteria] Error:", error);
        return { success: false, error: "Failed to update search criteria" };
    }
}
