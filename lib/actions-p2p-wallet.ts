"use server";

import { prisma as db } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { logSecurityEvent } from "@/lib/security";

// ========================================
// GAINS ACTIONS (Formerly Wallet Actions)
// For P2P investment gains management
// ========================================

/**
 * Get user's wallet/gains data
 * Used for displaying gains balance and investment summary
 */
export async function getMyWallet() {
    const user = await getCurrentUser();
    if (!user) return null;

    let wallet = await db.wallet.findUnique({
        where: { userId: user.id },
        include: {
            transactions: {
                orderBy: { createdAt: 'desc' },
                take: 10
            },
            user: {
                select: { autoInvestSettings: true }
            }
        }
    });

    if (!wallet) {
        const dbUser = await db.user.findUnique({ where: { id: user.id } });
        if (!dbUser) {
            console.error(`[getMyWallet] User ${user.id} not found in DB. Stale session.`);
            return null;
        }

        wallet = await db.wallet.create({
            data: {
                userId: user.id,
                balance: 0,
                invested: 0,
                locked: 0,
                currency: "EUR"
            },
            include: {
                transactions: true,
                user: {
                    select: { autoInvestSettings: true }
                }
            }
        });
    }

    return wallet;
}

// ========================================
// WALLET STATS SUMMARY
// ========================================

export async function getWalletStats() {
    const user = await getCurrentUser();
    if (!user) return null;

    const wallet = await db.wallet.findUnique({
        where: { userId: user.id }
    });

    if (!wallet) return null;

    // Get this month's transactions
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyTransactions = await db.transaction.findMany({
        where: {
            walletId: wallet.id,
            createdAt: { gte: startOfMonth }
        }
    });

    // Calculate monthly stats
    const monthlyDeposits = monthlyTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

    const monthlyWithdrawals = monthlyTransactions
        .filter(t => t.amount < 0 && t.type !== "INVESTMENT")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const monthlyInvestments = monthlyTransactions
        .filter(t => t.type === "INVESTMENT")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const monthlyReturns = monthlyTransactions
        .filter(t => t.type === "REPAYMENT")
        .reduce((sum, t) => sum + t.amount, 0);

    // Get total returns (all time)
    const allTimeReturns = await db.transaction.aggregate({
        where: {
            walletId: wallet.id,
            type: "REPAYMENT"
        },
        _sum: { amount: true }
    });

    return {
        balance: wallet.balance,
        invested: wallet.invested,
        locked: wallet.locked || 0,
        totalValue: wallet.balance + wallet.invested,
        totalReturns: allTimeReturns._sum.amount || 0,
        monthly: {
            deposits: monthlyDeposits,
            withdrawals: monthlyWithdrawals,
            investments: monthlyInvestments,
            returns: monthlyReturns
        }
    };
}

// ========================================
// PORTFOLIO HISTORY (For Charts)
// ========================================
export async function getPortfolioHistory(months: number = 6) {
    const user = await getCurrentUser();
    if (!user) return [];

    const wallet = await db.wallet.findUnique({
        where: { userId: user.id }
    });

    if (!wallet) return [];

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const transactions = await db.transaction.findMany({
        where: {
            walletId: wallet.id,
            createdAt: { gte: startDate }
        },
        orderBy: { createdAt: 'asc' }
    });

    const monthlyData: { name: string; value: number; invested: number; returns: number }[] = [];
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

    let cumulativeBalance = 0;
    let cumulativeInvested = 0;
    let cumulativeReturns = 0;

    for (let i = 0; i < months; i++) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - (months - 1 - i));
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        const monthTxs = transactions.filter(t => {
            const txDate = new Date(t.createdAt);
            return txDate >= monthStart && txDate < monthEnd;
        });

        for (const tx of monthTxs) {
            if (tx.type === "DEPOSIT") {
                cumulativeBalance += tx.amount;
            } else if (tx.type === "WITHDRAWAL") {
                cumulativeBalance += tx.amount;
            } else if (tx.type === "INVESTMENT") {
                cumulativeBalance += tx.amount;
                cumulativeInvested += Math.abs(tx.amount);
            } else if (tx.type === "REPAYMENT") {
                cumulativeReturns += tx.amount;
                cumulativeBalance += tx.amount;
            }
        }

        monthlyData.push({
            name: monthNames[monthStart.getMonth()],
            value: Math.max(0, cumulativeBalance + cumulativeInvested),
            invested: cumulativeInvested,
            returns: cumulativeReturns
        });
    }

    return monthlyData;
}

// ========================================
// WITHDRAWAL REQUEST - PRODUCTION READY
// With rate limiting and security checks
// ========================================

// Simple in-memory rate limiting (use Redis in production for distributed systems)
const withdrawalRateLimits = new Map<string, { count: number; resetAt: number }>();

export async function requestWithdrawal(data: {
    amount: number;
    iban: string;
    bic?: string;
}) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // SECURITY: Rate limiting - max 3 withdrawals per hour
    const rateLimitKey = `withdrawal:${user.id}`;
    const now = Date.now();
    const rateLimit = withdrawalRateLimits.get(rateLimitKey);

    if (rateLimit) {
        if (now < rateLimit.resetAt) {
            if (rateLimit.count >= 3) {
                await logSecurityEvent(user.id, "WITHDRAWAL_RATE_LIMITED", "FAILURE", {
                    amount: data.amount,
                    attemptCount: rateLimit.count
                });
                return {
                    success: false,
                    error: "Trop de demandes de retrait. Réessayez dans 1 heure."
                };
            }
            rateLimit.count++;
        } else {
            withdrawalRateLimits.set(rateLimitKey, { count: 1, resetAt: now + 3600000 });
        }
    } else {
        withdrawalRateLimits.set(rateLimitKey, { count: 1, resetAt: now + 3600000 });
    }

    const { amount, iban, bic } = data;

    // VALIDATION
    if (!amount || amount < 10) {
        return { success: false, error: "Montant minimum: 10€" };
    }
    if (amount > 10000) {
        return { success: false, error: "Montant maximum: 10 000€ par retrait" };
    }
    if (!iban || iban.replace(/\s/g, '').length < 15) {
        return { success: false, error: "IBAN invalide" };
    }

    // SECURITY: KYC verification required for withdrawals
    const kycProfile = await db.kYCProfile.findUnique({
        where: { userId: user.id }
    });

    if (!kycProfile || kycProfile.status !== "VERIFIED") {
        await logSecurityEvent(user.id, "WITHDRAWAL_KYC_REQUIRED", "FAILURE", { amount });
        return {
            success: false,
            error: "Vérification d'identité requise pour les retraits",
            requiresKYC: true
        };
    }

    // Get wallet
    const wallet = await db.wallet.findUnique({ where: { userId: user.id } });

    if (!wallet) {
        return { success: false, error: "Wallet introuvable" };
    }
    if (wallet.balance < amount) {
        return { success: false, error: `Solde insuffisant (disponible: ${wallet.balance.toFixed(2)}€)` };
    }

    // ATOMIC TRANSACTION for withdrawal
    try {
        const result = await db.$transaction(async (tx) => {
            // Lock the amount (prevent double-spending)
            const updatedWallet = await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    balance: { decrement: amount },
                    locked: { increment: amount }
                }
            });

            // Validate balance didn't go negative
            if (updatedWallet.balance < 0) {
                throw new Error("INSUFFICIENT_FUNDS");
            }

            // Create withdrawal transaction
            const transaction = await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    amount: -amount,
                    type: "WITHDRAWAL",
                    status: "PENDING",
                    category: "TRANSFER",
                    reference: `WD-${Date.now()}-${user.id.slice(-4)}`,
                    metadata: JSON.stringify({
                        iban: iban.slice(0, 4) + "****" + iban.slice(-4), // Masked IBAN for logs
                        bic: bic || null,
                        requestedAt: new Date().toISOString()
                    }),
                    description: `Retrait vers ${iban.slice(0, 4)}****`,
                    counterpartyName: "Virement SEPA",
                    balanceAfter: updatedWallet.balance
                }
            });

            return { transaction, updatedWallet };
        });

        await logSecurityEvent(user.id, "WITHDRAWAL_REQUEST", "SUCCESS", {
            amount,
            transactionId: result.transaction.id,
            newBalance: result.updatedWallet.balance
        });

        revalidatePath("/p2p/gains");
        revalidatePath("/p2p/portfolio");

        return {
            success: true,
            transactionId: result.transaction.id,
            newBalance: result.updatedWallet.balance
        };

    } catch (error: any) {
        console.error("[Withdrawal] Error:", error);

        if (error.message === "INSUFFICIENT_FUNDS") {
            return { success: false, error: "Solde insuffisant" };
        }

        await logSecurityEvent(user.id, "WITHDRAWAL_REQUEST", "FAILURE", {
            amount,
            error: String(error)
        });

        return { success: false, error: "Erreur lors de la demande de retrait" };
    }
}

// ========================================
// KYC ACTIONS
// ========================================

export async function getKYCStatus() {
    const user = await getCurrentUser();
    if (!user) return null;

    return db.kYCProfile.findUnique({ where: { userId: user.id } });
}

export async function submitKYC(data: { documentType: string, documentUrl: string }) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const existing = await db.kYCProfile.findUnique({ where: { userId: user.id } });

    if (existing) {
        return db.kYCProfile.update({
            where: { userId: user.id },
            data: {
                documentType: data.documentType,
                documentUrl: data.documentUrl,
                status: "PENDING",
                submittedAt: new Date()
            }
        });
    }

    return db.kYCProfile.create({
        data: {
            userId: user.id,
            documentType: data.documentType,
            documentUrl: data.documentUrl,
            status: "PENDING",
            submittedAt: new Date()
        }
    });
}

// ========================================
// PORTFOLIO
// ========================================

export async function getPortfolio() {
    const user = await getCurrentUser();
    if (!user) return [];

    const wallet = await db.wallet.findUnique({
        where: { userId: user.id },
        select: { id: true }
    });

    if (!wallet) return [];

    return db.investment.findMany({
        where: { walletId: wallet.id },
        include: {
            loan: {
                select: {
                    id: true,
                    title: true,
                    apr: true,
                    duration: true,
                    status: true,
                    projectType: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
}

// ========================================
// USER LOANS (Borrower side)
// ========================================

export async function getMyLoans() {
    const user = await getCurrentUser();
    if (!user) return [];

    const loans = await db.loan.findMany({
        where: { borrowerId: user.id },
        include: {
            repaymentSchedule: {
                where: { status: "PENDING" },
                orderBy: { dueDate: "asc" },
                take: 1
            },
            request: true
        },
        orderBy: { createdAt: "desc" }
    });

    return loans.map(loan => ({
        id: loan.id,
        title: loan.request?.reason || "Prêt Personnel",
        amount: loan.amount,
        status: loan.status,
        projectType: loan.request?.category || "PERSONAL",
        nextPayment: loan.repaymentSchedule[0] || null
    }));
}

// ========================================
// GET TRANSACTION HISTORY
// ========================================

export async function getTransactionHistory(options?: {
    type?: string;
    limit?: number;
    offset?: number;
}) {
    const user = await getCurrentUser();
    if (!user) return { transactions: [], total: 0 };

    const wallet = await db.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet) return { transactions: [], total: 0 };

    const where: any = { walletId: wallet.id };
    if (options?.type) where.type = options.type;

    const [transactions, total] = await Promise.all([
        db.transaction.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: options?.limit || 20,
            skip: options?.offset || 0
        }),
        db.transaction.count({ where })
    ]);

    return { transactions, total };
}
