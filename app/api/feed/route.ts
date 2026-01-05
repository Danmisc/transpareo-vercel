import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { feedService } from "@/lib/services/feed.service";
import { DEMO_USER_ID } from "@/lib/constants";

export async function GET(req: NextRequest) {
    const session = await auth();
    const userId = session?.user?.id || DEMO_USER_ID;

    const { searchParams } = new URL(req.url);
    const feedType = searchParams.get("type") || "for-you";
    const cursor = searchParams.get("cursor") || undefined;
    const limit = 10;

    let posts;
    try {
        if (feedType === "following") {
            posts = await feedService.getFollowingFeed(userId, limit, cursor);
        } else {
            posts = await feedService.getForYouFeed(userId, limit, cursor);
        }

        // Determine next cursor
        let nextCursor = null;
        if (posts.length === limit) {
            nextCursor = posts[posts.length - 1].id;
        }

        return NextResponse.json({
            posts,
            nextCursor
        });
    } catch (error) {
        console.error("Feed API Error:", error);
        return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
    }
}
