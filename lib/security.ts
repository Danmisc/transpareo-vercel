"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// ========================================
// SECURITY ACTION TYPES
// ========================================

export type SecurityAction =
    // Authentication
    | "LOGIN"
    | "LOGOUT"
    | "LOGIN_FAILED"
    | "PASSWORD_RESET"

    // 2FA
    | "2FA_ENABLE"
    | "2FA_DISABLE"
    | "2FA_VERIFY"
    | "2FA_FAILED"

    // KYC
    | "KYC_SUBMISSION"
    | "KYC_APPROVED"
    | "KYC_REJECTED"

    // Financial - Wallet
    | "FUND_DEPOSIT"
    | "FUND_WITHDRAWAL"
    | "FUND_WITHDRAWAL_FAILED"

    // Financial - Investments
    | "INVESTMENT_COMPLETED"
    | "INVESTMENT_FAILED"
    | "INVESTMENT_AUTO"

    // Financial - Loans
    | "LOAN_APPLICATION_CREATED"
    | "LOAN_APPLICATION_APPROVED"
    | "LOAN_APPLICATION_REJECTED"
    | "LOAN_FUNDED"
    | "LOAN_REPAYMENT_RECEIVED"
    | "LOAN_REPAYMENT_MISSED"

    // Transfers
    | "TRANSFER_SENT"
    | "TRANSFER_FAILED"
    | "CREATE_RECURRING_TRANSFER"
    | "CANCEL_RECURRING_TRANSFER"

    // Security Alerts
    | "SUSPICIOUS_ACTIVITY"
    | "RATE_LIMIT_EXCEEDED"
    | "VIEW_SENSITIVE_DATA"
    | "ACCOUNT_LOCKED";

// ========================================
// LOG SECURITY EVENT
// ========================================

export async function logSecurityEvent(
    userId: string,
    action: SecurityAction | string,
    status: "SUCCESS" | "FAILURE" | "BLOCKED" | "WARNING",
    metadata: Record<string, any> = {}
) {
    try {
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        const userAgent = headersList.get("user-agent") || "unknown";

        await prisma.securityLog.create({
            data: {
                userId,
                action,
                status,
                ipAddress: ip,
                userAgent: userAgent.substring(0, 500), // Limit length
                metadata: JSON.stringify({
                    ...metadata,
                    timestamp: new Date().toISOString()
                })
            }
        });

        // Alert on critical events
        if (status === "BLOCKED" || status === "FAILURE") {
            console.warn(`[SECURITY] ${status}: ${action} for user ${userId}`, metadata);
        }

        // High-value transaction logging
        if (metadata.amount && metadata.amount >= 5000) {
            console.log(`[HIGH VALUE] ${action}: ${metadata.amount}€ by user ${userId}`);
        }

    } catch (error) {
        console.error("[Security Log] Failed to write:", error);
        // Don't throw - logging should never crash the app
    }
}

// ========================================
// GET USER SECURITY LOGS
// ========================================

export async function getUserSecurityLogs(userId: string, limit: number = 50) {
    return await prisma.securityLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit
    });
}

// ========================================
// CHECK FOR SUSPICIOUS PATTERNS
// ========================================

export async function checkSuspiciousActivity(userId: string): Promise<{
    suspicious: boolean;
    reasons: string[];
}> {
    const reasons: string[] = [];

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Check for multiple failed logins
    const failedLogins = await prisma.securityLog.count({
        where: {
            userId,
            action: "LOGIN_FAILED",
            createdAt: { gte: oneHourAgo }
        }
    });
    if (failedLogins >= 5) {
        reasons.push(`${failedLogins} échecs de connexion en 1h`);
    }

    // Check for rapid investments
    const recentInvestments = await prisma.securityLog.count({
        where: {
            userId,
            action: "INVESTMENT_COMPLETED",
            createdAt: { gte: oneHourAgo }
        }
    });
    if (recentInvestments >= 10) {
        reasons.push(`${recentInvestments} investissements en 1h`);
    }

    // Check for high daily volume
    const dailyInvestments = await prisma.securityLog.findMany({
        where: {
            userId,
            action: "INVESTMENT_COMPLETED",
            createdAt: { gte: oneDayAgo }
        }
    });

    let dailyVolume = 0;
    for (const log of dailyInvestments) {
        try {
            const meta = JSON.parse(log.metadata || "{}");
            dailyVolume += meta.amount || 0;
        } catch { }
    }

    if (dailyVolume >= 50000) {
        reasons.push(`Volume journalier élevé: ${dailyVolume}€`);
    }

    // Log if suspicious
    if (reasons.length > 0) {
        await logSecurityEvent(userId, "SUSPICIOUS_ACTIVITY", "WARNING", { reasons });
    }

    return {
        suspicious: reasons.length > 0,
        reasons
    };
}

// ========================================
// RATE LIMITING CHECK
// ========================================

export async function checkRateLimit(
    userId: string,
    action: string,
    maxAttempts: number = 10,
    windowMinutes: number = 60
): Promise<boolean> {
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

    const count = await prisma.securityLog.count({
        where: {
            userId,
            action,
            createdAt: { gte: windowStart }
        }
    });

    if (count >= maxAttempts) {
        await logSecurityEvent(userId, "RATE_LIMIT_EXCEEDED", "BLOCKED", {
            action,
            attempts: count,
            limit: maxAttempts
        });
        return false; // Rate limited
    }

    return true; // OK
}
