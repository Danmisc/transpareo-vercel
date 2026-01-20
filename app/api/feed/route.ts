import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { feedService } from "@/lib/services/feed.service";

export async function GET(req: NextRequest) {
    const session = await auth();
    const userId = session?.user?.id;

    const { searchParams } = new URL(req.url);
    const feedType = searchParams.get("type") || "for-you";
    const cursor = searchParams.get("cursor") || undefined;
    const limit = 10;

    // Security: "following" feed requires authentication
    if (feedType === "following" && !userId) {
        return NextResponse.json(
            { error: "Authentication required for following feed" },
            { status: 401 }
        );
    }

    let posts;
    try {
        if (feedType === "following" && userId) {
            posts = await feedService.getFollowingFeed(userId, limit, cursor);
        } else {
            // For-you feed: personalized if logged in, public trending if not
            posts = await feedService.getForYouFeed(userId || null, limit, cursor);
        }

        // Determine next cursor
        let nextCursor = null;
        if (posts.length === limit) {
            nextCursor = posts[posts.length - 1].id;
        }

        return NextResponse.json({
            posts,
            nextCursor,
            isAuthenticated: !!userId
        });
    } catch (error) {
        console.error("[Feed API] Error:", error);
        return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
    }
}

