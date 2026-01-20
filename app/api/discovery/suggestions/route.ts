import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { discoveryService } from "@/lib/services/discovery.service";
import { DEMO_USER_ID } from "@/lib/constants";

export async function GET() {
    try {
        const session = await auth();
        const userId = session?.user?.id || DEMO_USER_ID;

        // Get smart recommendations with reasons
        const users = await discoveryService.getSmartRecommendations(userId, 5);

        return NextResponse.json({ users });
    } catch (error) {
        console.error("[API Discovery Suggestions] Error:", error);
        return NextResponse.json({ users: [] });
    }
}
