"use server";

import { searchService } from "@/lib/services/search.service";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getSearchHistoryAction() {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await searchService.getHistory(session.user.id);
}

export async function addToSearchHistoryAction(query: string) {
    const session = await auth();
    if (!session?.user?.id) return;

    await searchService.addToHistory(session.user.id, query);
    // No revalidate needed really, as it's local state mostly, but good practice
}
