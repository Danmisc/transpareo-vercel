"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export type SecurityAction =
    | "LOGIN"
    | "LOGOUT"
    | "2FA_ENABLE"
    | "2FA_VERIFY"
    | "FUND_WITHDRAWAL"
    | "FUND_DEPOSIT"
    | "VIEW_SENSITIVE_DATA"
    | "KYC_SUBMISSION";

export async function logSecurityEvent(
    userId: string,
    action: SecurityAction,
    status: "SUCCESS" | "FAILED" | "BLOCKED",
    metadata: Record<string, any> = {}
) {
    try {
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for") || "unknown";
        const userAgent = headersList.get("user-agent") || "unknown";

        await prisma.securityLog.create({
            data: {
                userId,
                action,
                status,
                ipAddress: ip,
                userAgent: userAgent,
                metadata: JSON.stringify(metadata)
            }
        });

        if (status === "BLOCKED" || status === "FAILED") {
            // TODO: Alerting system (Phase 2)
            console.warn(`[SECURITY ALERT] ${action} failed for user ${userId}`);
        }

    } catch (error) {
        console.error("Failed to write security log", error);
        // Fail silently to not crash the app, but this is critical
    }
}
