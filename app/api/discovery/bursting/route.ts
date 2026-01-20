import { NextResponse } from "next/server";
import { discoveryService } from "@/lib/services/discovery.service";

export async function GET() {
    try {
        const bursting = await discoveryService.getBurstingHashtags(5);
        return NextResponse.json({ bursting });
    } catch (error) {
        console.error("[API Discovery Bursting] Error:", error);
        return NextResponse.json({ bursting: [] });
    }
}
