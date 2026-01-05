"use server";

import { discoveryService } from "@/lib/services/discovery.service";

export async function getTrendingTagsAction() {
    return await discoveryService.getTrendingHashtags();
}
