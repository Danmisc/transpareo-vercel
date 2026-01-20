import { NextResponse } from "next/server";
import { discoveryService } from "@/lib/services/discovery.service";

export async function GET() {
    try {
        const hashtags = await discoveryService.getTrendingHashtags(10);
        return NextResponse.json({ hashtags });
    } catch (error) {
        console.error("[API Discovery Trending] Error:", error);
        return NextResponse.json({ hashtags: [] });
    }
}
