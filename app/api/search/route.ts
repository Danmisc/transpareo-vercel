import { NextRequest, NextResponse } from "next/server";
import { searchService } from "@/lib/services/search.service";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || ""; // Allow empty if filters exist
    const type = searchParams.get("type") as any || 'all';
    const page = Number(searchParams.get("page")) || 1;
    const limit = 10;

    // Extract filters
    const filters = {
        role: searchParams.get("role") || undefined,
        location: searchParams.get("location") || undefined,
        verified: searchParams.get("verified") === "true",
        minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
        maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
        company: searchParams.get("company") || undefined,
        school: searchParams.get("school") || undefined,
        industry: searchParams.get("industry") || undefined,
        minSurface: searchParams.get("minSurface") ? Number(searchParams.get("minSurface")) : undefined,
        maxSurface: searchParams.get("maxSurface") ? Number(searchParams.get("maxSurface")) : undefined,
        amenities: searchParams.get("amenities") || undefined, // Single tag for now in UI loop
        availability: searchParams.get("availability") || undefined,
        category: searchParams.get("category") || undefined,
        date: searchParams.get("date") || undefined,
        contentType: searchParams.get("contentType") || undefined,
    };

    // if (!query) { ... } // Removed required check, service handles it

    try {
        const results = await searchService.search(query, type, filters, page, limit);
        return NextResponse.json(results);
    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
