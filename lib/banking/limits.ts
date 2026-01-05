"use server";

import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";

const LIMITS = {
    DAILY_TRANSFER: 2000,
    WEEKLY_TRANSFER: 10000,
    MIN_BALANCE_AFTER: 0 // No overdraft
};

export async function checkTransferLimits(userId: string, amount: number): Promise<{ allowed: boolean; error?: string }> {
    // 1. Balance Check (Redundant but safe)
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || wallet.balance < amount) {
        return { allowed: false, error: "Solde insuffisant" };
    }

    // 2. Daily Limits
    const dailyTotal = await _getUsage(userId, startOfDay(new Date()), endOfDay(new Date()));
    if (dailyTotal + amount > LIMITS.DAILY_TRANSFER) {
        return { allowed: false, error: `Plafond journalier atteint (${LIMITS.DAILY_TRANSFER}€)` };
    }

    // 3. Weekly Limits
    const weeklyTotal = await _getUsage(userId, startOfWeek(new Date()), endOfWeek(new Date()));
    if (weeklyTotal + amount > LIMITS.WEEKLY_TRANSFER) {
        return { allowed: false, error: `Plafond hebdomadaire atteint (${LIMITS.WEEKLY_TRANSFER}€)` };
    }

    return { allowed: true };
}

async function _getUsage(userId: string, start: Date, end: Date) {
    const usage = await prisma.transaction.aggregate({
        where: {
            wallet: { userId },
            type: { in: ["TRANSFER", "WITHDRAWAL"] },
            status: "COMPLETED",
            createdAt: { gte: start, lte: end }
        },
        _sum: { amount: true }
    });
    return usage._sum.amount || 0;
}
