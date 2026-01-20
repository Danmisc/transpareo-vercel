import { NextResponse } from "next/server";
import { processDueRepayments } from "@/lib/actions-repayments";

// CRON endpoint for processing due loan repayments
// Should be called daily by a cron service (Vercel Cron, Railway, etc.)
// 
// Example Vercel cron config in vercel.json:
// {
//   "crons": [{
//     "path": "/api/cron/repayments",
//     "schedule": "0 9 * * *"
//   }]
// }

export async function GET(request: Request) {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
        console.error("[CRON/Repayments] CRON_SECRET not configured");
        return NextResponse.json(
            { error: "Cron not configured" },
            { status: 500 }
        );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
        console.warn("[CRON/Repayments] Unauthorized access attempt");
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        console.log("[CRON/Repayments] Starting daily repayment processing...");

        const result = await processDueRepayments();

        console.log(`[CRON/Repayments] Completed. Processed ${result.processed} repayments.`);

        return NextResponse.json({
            success: true,
            processed: result.processed,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("[CRON/Repayments] Error:", error);
        return NextResponse.json(
            { error: "Processing failed", details: String(error) },
            { status: 500 }
        );
    }
}

// Optionally support POST for manual triggers
export async function POST(request: Request) {
    return GET(request);
}
