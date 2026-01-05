"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// ============================================================================
// AUDIT LOG TYPES
// ============================================================================

export type AuditAction =
    | "VIEW"
    | "CREATE"
    | "UPDATE"
    | "DELETE"
    | "FLAG"
    | "UNFLAG"
    | "EXPORT"
    | "APPROVE"
    | "REJECT"
    | "SAR_FILED"
    | "MARK_FALSE_POSITIVE"
    | "RESOLVED"
    | "LOGIN"
    | "LOGOUT"
    | "2FA_ENABLED"
    | "2FA_DISABLED"
    | "PASSWORD_CHANGE"
    | "TRANSFER_INITIATED"
    | "TRANSFER_COMPLETED"
    | "SYNC_TRIGGERED";

export type AuditEntityType =
    | "TRANSACTION"
    | "USER"
    | "WALLET"
    | "COMPLIANCE_ALERT"
    | "BENEFICIARY"
    | "LINKED_ACCOUNT"
    | "SESSION"
    | "REPORT";

// ============================================================================
// CREATE AUDIT LOG
// ============================================================================

export async function createAuditLog(
    userId: string,
    entityType: AuditEntityType,
    entityId: string,
    action: AuditAction,
    changes?: Record<string, any>,
    metadata?: Record<string, any>
) {
    // Get request metadata
    const headersList = headers();
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    return await prisma.auditLog.create({
        data: {
            userId,
            entityType,
            entityId,
            action,
            changes: changes ? JSON.stringify(changes) : null,
            ipAddress,
            userAgent,
            metadata: metadata ? JSON.stringify(metadata) : null
        }
    });
}

// ============================================================================
// GET AUDIT TRAIL FOR ENTITY
// ============================================================================

export async function getAuditTrail(
    entityType: AuditEntityType,
    entityId: string,
    limit = 50
) {
    return await prisma.auditLog.findMany({
        where: {
            entityType,
            entityId
        },
        orderBy: { createdAt: 'desc' },
        take: limit
    });
}

// ============================================================================
// GET USER ACTIVITY LOG
// ============================================================================

export async function getUserActivityLog(userId: string, limit = 100) {
    return await prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit
    });
}

// ============================================================================
// SEARCH AUDIT LOGS (Admin function)
// ============================================================================

export async function searchAuditLogs(filters: {
    userId?: string;
    entityType?: AuditEntityType;
    action?: AuditAction;
    dateFrom?: Date;
    dateTo?: Date;
}, page = 1, limit = 50) {
    const where: any = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.action) where.action = filters.action;

    if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
        if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit
        }),
        prisma.auditLog.count({ where })
    ]);

    return { logs, total, page, limit };
}

// ============================================================================
// HELPER: Log transaction action
// ============================================================================

export async function logTransactionAction(
    userId: string,
    transactionId: string,
    action: AuditAction,
    details?: Record<string, any>
) {
    return createAuditLog(userId, "TRANSACTION", transactionId, action, undefined, details);
}

// ============================================================================
// HELPER: Log wallet action
// ============================================================================

export async function logWalletAction(
    userId: string,
    walletId: string,
    action: AuditAction,
    changes?: Record<string, any>
) {
    return createAuditLog(userId, "WALLET", walletId, action, changes);
}

// ============================================================================
// EXPORT AUDIT REPORT
// ============================================================================

export async function generateAuditReport(
    userId: string,
    dateFrom: Date,
    dateTo: Date
) {
    const logs = await prisma.auditLog.findMany({
        where: {
            userId,
            createdAt: {
                gte: dateFrom,
                lte: dateTo
            }
        },
        orderBy: { createdAt: 'asc' }
    });

    // Log the export action
    await createAuditLog(
        userId,
        "REPORT",
        `audit_${dateFrom.toISOString()}_${dateTo.toISOString()}`,
        "EXPORT",
        undefined,
        { count: logs.length }
    );

    return {
        generatedAt: new Date(),
        period: { from: dateFrom, to: dateTo },
        totalActions: logs.length,
        logs: logs.map(log => ({
            timestamp: log.createdAt,
            action: log.action,
            entityType: log.entityType,
            entityId: log.entityId,
            ipAddress: log.ipAddress,
            changes: log.changes ? JSON.parse(log.changes) : null,
            metadata: log.metadata ? JSON.parse(log.metadata) : null
        }))
    };
}
