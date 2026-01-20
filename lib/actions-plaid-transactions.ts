"use server";

import { plaidClient } from "@/lib/plaid";
import { TransactionsGetRequest } from "plaid";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { decrypt } from "@/lib/encryption";
import { subDays, format } from "date-fns";

// ============================================================================
// CATEGORY MAPPING - Maps Plaid categories to internal categories
// ============================================================================

const PLAID_CATEGORY_MAP: Record<string, string> = {
    "TRANSFER_IN": "TRANSFER",
    "TRANSFER_OUT": "TRANSFER",
    "LOAN_PAYMENTS": "LOAN",
    "BANK_FEES": "FEE",
    "INTEREST_EARNED": "INTEREST",
    "INTEREST_CHARGED": "FEE",
    "DIVIDENDS": "INTEREST",
    "SUBSCRIPTION": "SUBSCRIPTION",
    "SERVICE": "SUBSCRIPTION",
    "INCOME_WAGES": "SALARY",
    "FOOD_AND_DRINK": "SHOPPING",
    "GENERAL_MERCHANDISE": "SHOPPING",
    "SHOPPING": "SHOPPING",
    "ENTERTAINMENT": "SHOPPING",
    "RENT_AND_UTILITIES": "UTILITIES",
    "OTHER": "OTHER",
};

export async function mapPlaidCategory(plaidCategory: string | null | undefined): Promise<string> {
    if (!plaidCategory) return "OTHER";
    if (PLAID_CATEGORY_MAP[plaidCategory]) {
        return PLAID_CATEGORY_MAP[plaidCategory];
    }
    return "OTHER";
}

// ============================================================================
// GET ALL TRANSACTIONS - Simplified version using existing schema
// ============================================================================

export interface TransactionFilters {
    type?: string;
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
    minAmount?: number;
    maxAmount?: number;
    search?: string;
}

export async function getTransactions(filters: TransactionFilters = {}, page = 1, limit = 50) {
    const user = await getCurrentUser();
    if (!user) return { transactions: [], total: 0, page: 1, limit: 50 };

    const wallet = await prisma.wallet.findUnique({
        where: { userId: user.id }
    });

    if (!wallet) return { transactions: [], total: 0, page: 1, limit: 50 };

    // Build where clause with existing schema fields
    const where: any = {
        walletId: wallet.id,
    };

    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;

    if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
        if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
        where.amount = {};
        if (filters.minAmount !== undefined) where.amount.gte = filters.minAmount;
        if (filters.maxAmount !== undefined) where.amount.lte = filters.maxAmount;
    }

    const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.transaction.count({ where })
    ]);

    // Map to expected format with defaults for new fields
    const mappedTransactions = transactions.map(tx => ({
        ...tx,
        category: tx.type === 'DEPOSIT' ? 'SALARY' :
            tx.type === 'WITHDRAWAL' ? 'SHOPPING' :
                tx.type === 'INVESTMENT' ? 'INVESTMENT' :
                    tx.type === 'FEE' ? 'FEE' : 'OTHER',
        flagged: false,
        isRecurring: false,
        counterpartyName: null,
        counterpartyLogo: null,
        description: tx.metadata ? JSON.parse(tx.metadata).method || null : null,
        linkedAccount: null,
    }));

    return { transactions: mappedTransactions, total, page, limit };
}

// ============================================================================
// TRANSACTION STATS - Simplified
// ============================================================================

export async function getTransactionStats(period: 'day' | 'week' | 'month' | 'year' = 'month') {
    const user = await getCurrentUser();
    if (!user) return null;

    const wallet = await prisma.wallet.findUnique({
        where: { userId: user.id }
    });

    if (!wallet) return null;

    let startDate: Date;
    const endDate = new Date();

    switch (period) {
        case 'day': startDate = subDays(endDate, 1); break;
        case 'week': startDate = subDays(endDate, 7); break;
        case 'month': startDate = subDays(endDate, 30); break;
        case 'year': startDate = subDays(endDate, 365); break;
    }

    const [totalCount, totalVolume, byType] = await Promise.all([
        prisma.transaction.count({
            where: { walletId: wallet.id, createdAt: { gte: startDate } }
        }),
        prisma.transaction.aggregate({
            where: { walletId: wallet.id, createdAt: { gte: startDate }, status: "COMPLETED" },
            _sum: { amount: true }
        }),
        prisma.transaction.groupBy({
            by: ['type'],
            where: { walletId: wallet.id, createdAt: { gte: startDate } },
            _count: true,
            _sum: { amount: true }
        })
    ]);

    // Map types to categories for UI
    const byCategory = byType.map(t => ({
        category: t.type === 'DEPOSIT' ? 'SALARY' :
            t.type === 'WITHDRAWAL' ? 'SHOPPING' :
                t.type === 'INVESTMENT' ? 'INVESTMENT' :
                    t.type === 'FEE' ? 'FEE' : 'OTHER',
        count: typeof t._count === 'number' ? t._count : 1,
        amount: t._sum?.amount || 0
    }));

    return {
        period,
        totalCount,
        totalVolume: totalVolume._sum.amount || 0,
        byCategory,
        byType: byType.map(t => ({
            type: t.type,
            count: typeof t._count === 'number' ? t._count : 1,
            amount: t._sum?.amount || 0
        })),
        flaggedCount: 0
    };
}

// ============================================================================
// SYNC TRANSACTIONS FROM PLAID - Simplified for existing schema
// ============================================================================

export async function syncTransactionsFromPlaid(linkedAccountId: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const linkedAccount = await prisma.linkedAccount.findUnique({
        where: { id: linkedAccountId, userId: user.id }
    });

    if (!linkedAccount || !linkedAccount.accessToken) {
        return { success: false, error: "Account not found or not connected" };
    }

    const wallet = await prisma.wallet.findUnique({
        where: { userId: user.id }
    });

    if (!wallet) {
        return { success: false, error: "No wallet found" };
    }

    try {
        const accessToken = decrypt(linkedAccount.accessToken);
        const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
        const endDate = format(new Date(), 'yyyy-MM-dd');

        const request: TransactionsGetRequest = {
            access_token: accessToken,
            start_date: startDate,
            end_date: endDate,
        };

        const response = await plaidClient.transactionsGet(request);
        const plaidTransactions = response.data.transactions;

        let synced = 0;

        for (const plaidTx of plaidTransactions) {
            // Check if already exists by reference
            const existing = await prisma.transaction.findFirst({
                where: {
                    walletId: wallet.id,
                    reference: plaidTx.transaction_id
                }
            });

            if (existing) continue;

            const amount = -plaidTx.amount;
            const type = amount > 0 ? "DEPOSIT" : "WITHDRAWAL";

            await prisma.transaction.create({
                data: {
                    walletId: wallet.id,
                    amount: amount,
                    type: type,
                    status: "COMPLETED",
                    reference: plaidTx.transaction_id,
                    metadata: JSON.stringify({
                        merchant: plaidTx.merchant_name || plaidTx.name,
                        category: plaidTx.category?.[0],
                        source: "plaid"
                    }),
                }
            });

            synced++;
        }

        await prisma.linkedAccount.update({
            where: { id: linkedAccountId },
            data: { lastSync: new Date() }
        });

        revalidatePath("/p2p/portfolio");
        revalidatePath("/p2p/gains");

        return { success: true, synced, total: plaidTransactions.length };

    } catch (error) {
        console.error("Plaid Transaction Sync Error:", error);
        return { success: false, error: "Failed to sync transactions" };
    }
}

// ============================================================================
// FLAG TRANSACTION - Stub for now, will work when schema is regenerated
// ============================================================================

export async function flagTransaction(transactionId: string, reason: string, notes?: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // Just log for now until Prisma client is regenerated with new fields
    console.log(`[STUB] Flag transaction ${transactionId}: ${reason}`);

    revalidatePath("/p2p/portfolio");
    return { success: true };
}

export async function unflagTransaction(transactionId: string, resolution: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    console.log(`[STUB] Unflag transaction ${transactionId}: ${resolution}`);

    revalidatePath("/p2p/portfolio");
    return { success: true };
}
