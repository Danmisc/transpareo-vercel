import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserSubscription } from "@/lib/subscription/service";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { planName: "FREE", features: null, status: "UNAUTHENTICATED" },
                { status: 200 }
            );
        }

        const subscription = await getUserSubscription(session.user.id);

        return NextResponse.json(subscription);
    } catch (error) {
        console.error("Error fetching subscription:", error);
        return NextResponse.json(
            { error: "Failed to fetch subscription" },
            { status: 500 }
        );
    }
}
