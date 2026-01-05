import { auth } from "@/lib/auth";
import { searchService } from "@/lib/services/search.service";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q || q.length < 2) {
        return NextResponse.json([]);
    }

    try {
        const suggestions = await searchService.getSuggestions(q);
        return NextResponse.json(suggestions);
    } catch (error) {
        console.error("Suggestions API Error:", error);
        return NextResponse.json([], { status: 500 });
    }
}
