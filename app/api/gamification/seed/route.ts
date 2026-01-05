import { NextResponse } from "next/server";
import { seedBadges } from "@/lib/gamification";

export async function GET() {
    try {
        await seedBadges();
        return NextResponse.json({ success: true, message: "Badges seeded" });
    } catch (error) {
        console.error("Seeding failed:", error);
        return NextResponse.json({ success: false, error: "Seeding failed" }, { status: 500 });
    }
}
