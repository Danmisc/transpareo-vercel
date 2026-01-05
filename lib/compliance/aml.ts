"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { subDays } from "date-fns";

// ============================================================================
// AML SCREENING RULES
// ============================================================================

export interface AMLRule {
    id: string;
    name: string;
    description: string;
    check: (params: {
        amount: number;
        userId: string;
        counterparty?: string;
        transactionCount24h?: number;
        volume24h?: number;
    }) => Promise<{ triggered: boolean; severity: string; reason?: string }>;
}

const AML_RULES: AMLRule[] = [
    {
        id: "SINGLE_HIGH_AMOUNT",
        name: "Transaction élevée unique",
        description: "Transaction individuelle dépassant le seuil",
        check: async ({ amount }) => {
            const absAmount = Math.abs(amount);
            if (absAmount > 10000) {
                return { triggered: true, severity: "HIGH", reason: "Transaction > 10,000€" };
            }
            if (absAmount > 5000) {
                return { triggered: true, severity: "MEDIUM", reason: "Transaction > 5,000€" };
            }
            return { triggered: false, severity: "NONE" };
        }
    },
    {
        id: "DAILY_VOLUME",
        name: "Volume journalier élevé",
        description: "Volume total sur 24h dépassant le seuil",
        check: async ({ volume24h }) => {
            if (!volume24h) return { triggered: false, severity: "NONE" };
            if (volume24h > 15000) {
                return { triggered: true, severity: "HIGH", reason: "Volume 24h > 15,000€" };
            }
            if (volume24h > 10000) {
                return { triggered: true, severity: "MEDIUM", reason: "Volume 24h > 10,000€" };
            }
            return { triggered: false, severity: "NONE" };
        }
    },
    {
        id: "VELOCITY",
        name: "Vélocité anormale",
        description: "Nombre de transactions excessif en peu de temps",
        check: async ({ transactionCount24h }) => {
            if (!transactionCount24h) return { triggered: false, severity: "NONE" };
            if (transactionCount24h > 20) {
                return { triggered: true, severity: "MEDIUM", reason: ">20 transactions en 24h" };
            }
            if (transactionCount24h > 10) {
                return { triggered: true, severity: "LOW", reason: ">10 transactions en 24h" };
            }
            return { triggered: false, severity: "NONE" };
        }
    },
    {
        id: "ROUND_AMOUNTS",
        name: "Montants ronds suspects",
        description: "Multiples transactions avec montants ronds exacts",
        check: async ({ amount, volume24h }) => {
            const absAmount = Math.abs(amount);
            // Check if exactly round (1000, 2000, 5000, etc.)
            if (absAmount >= 1000 && absAmount % 1000 === 0 && volume24h && volume24h > 5000) {
                return { triggered: true, severity: "LOW", reason: "Montant rond avec volume élevé" };
            }
            return { triggered: false, severity: "NONE" };
        }
    }
];

// ============================================================================
// MAIN AML CHECK FUNCTION
// ============================================================================

export async function runAMLChecks(
    userId: string,
    amount: number,
    counterparty?: string
) {
    // Get user's 24h stats
    const dayAgo = subDays(new Date(), 1);

    const [transactionCount24h, volumeResult] = await Promise.all([
        prisma.transaction.count({
            where: {
                wallet: { userId },
                createdAt: { gte: dayAgo }
            }
        }),
        prisma.transaction.aggregate({
            where: {
                wallet: { userId },
                createdAt: { gte: dayAgo },
                status: "COMPLETED"
            },
            _sum: { amount: true }
        })
    ]);

    const volume24h = Math.abs(volumeResult._sum.amount || 0) + Math.abs(amount);

    const triggeredRules: Array<{
        ruleId: string;
        ruleName: string;
        severity: string;
        reason: string;
    }> = [];

    for (const rule of AML_RULES) {
        const result = await rule.check({
            amount,
            userId,
            counterparty,
            transactionCount24h,
            volume24h
        });

        if (result.triggered) {
            triggeredRules.push({
                ruleId: rule.id,
                ruleName: rule.name,
                severity: result.severity,
                reason: result.reason || rule.description
            });
        }
    }

    return {
        triggered: triggeredRules.length > 0,
        rules: triggeredRules,
        highestSeverity: triggeredRules.length > 0
            ? triggeredRules.sort((a, b) => {
                const order = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, NONE: 0 };
                return (order[b.severity as keyof typeof order] || 0) - (order[a.severity as keyof typeof order] || 0);
            })[0].severity
            : "NONE"
    };
}

// ============================================================================
// CREATE COMPLIANCE ALERT
// ============================================================================

export async function createComplianceAlert(
    userId: string,
    transactionId: string | null,
    type: string,
    severity: string,
    title: string,
    description: string
) {
    return await prisma.complianceAlert.create({
        data: {
            userId,
            transactionId,
            type,
            severity,
            status: "PENDING",
            title,
            description
        }
    });
}

// ============================================================================
// GET ALERTS
// ============================================================================

export async function getComplianceAlerts(status?: string) {
    const user = await getCurrentUser();
    if (!user) return [];

    return await prisma.complianceAlert.findMany({
        where: {
            userId: user.id,
            ...(status && { status })
        },
        orderBy: [
            { severity: 'desc' },
            { createdAt: 'desc' }
        ]
    });
}

// ============================================================================
// RESOLVE ALERT
// ============================================================================

export async function resolveComplianceAlert(
    alertId: string,
    resolution: string,
    filesSAR: boolean = false
) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const alert = await prisma.complianceAlert.findFirst({
        where: { id: alertId, userId: user.id }
    });

    if (!alert) throw new Error("Alert not found");

    await prisma.complianceAlert.update({
        where: { id: alertId },
        data: {
            status: filesSAR ? "ESCALATED" : "RESOLVED",
            resolvedBy: user.id,
            resolvedAt: new Date(),
            resolution,
            sarFiled: filesSAR,
            sarFiledAt: filesSAR ? new Date() : null
        }
    });

    // Log to audit
    await prisma.auditLog.create({
        data: {
            userId: user.id,
            entityType: "COMPLIANCE_ALERT",
            entityId: alertId,
            action: filesSAR ? "SAR_FILED" : "RESOLVED",
            metadata: JSON.stringify({ resolution })
        }
    });

    revalidatePath("/p2p/portfolio");
    return { success: true };
}

// ============================================================================
// MARK AS FALSE POSITIVE
// ============================================================================

export async function markAlertAsFalsePositive(alertId: string, notes: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    await prisma.complianceAlert.update({
        where: { id: alertId },
        data: {
            status: "FALSE_POSITIVE",
            resolvedBy: user.id,
            resolvedAt: new Date(),
            resolution: notes
        }
    });

    await prisma.auditLog.create({
        data: {
            userId: user.id,
            entityType: "COMPLIANCE_ALERT",
            entityId: alertId,
            action: "MARK_FALSE_POSITIVE",
            metadata: JSON.stringify({ notes })
        }
    });

    revalidatePath("/p2p/portfolio");
    return { success: true };
}
