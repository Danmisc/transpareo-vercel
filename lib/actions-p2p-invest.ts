"use server";

import { prisma as db } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function saveAutoInvestSettings(data: {
    minInterest: number;
    maxDuration: number;
    riskTolerance: string[];
    amountPerLoan: number;
    isEnabled: boolean;
}) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    await db.autoInvestSettings.upsert({
        where: { userId: user.id },
        update: {
            minInterest: data.minInterest,
            maxDuration: data.maxDuration,
            riskTolerance: data.riskTolerance.join(","),
            amountPerLoan: data.amountPerLoan,
            isEnabled: data.isEnabled
        },
        create: {
            userId: user.id,
            minInterest: data.minInterest,
            maxDuration: data.maxDuration,
            riskTolerance: data.riskTolerance.join(","),
            amountPerLoan: data.amountPerLoan,
            isEnabled: data.isEnabled
        }
    });

    revalidatePath("/p2p/dashboard");
    return { success: true };
}

export async function getAutoInvestSettings() {
    const user = await getCurrentUser();
    if (!user) return null;

    const settings = await db.autoInvestSettings.findUnique({
        where: { userId: user.id }
    });

    if (!settings) return null;

    return {
        ...settings,
        riskTolerance: settings.riskTolerance ? settings.riskTolerance.split(",") : []
    };
}

// 🤖 THE ENGINE
// In a real app, this should be a background job / queue worker
// triggered when a loan status changes to "FUNDING".
export async function runAutoInvestEngine(loanId: string) {
    console.log(`🤖 Auto-Invest Engine started for Loan ${loanId}`);

    // 1. Fetch Loan Details
    const loan = await db.loanProject.findUnique({ where: { id: loanId } });
    if (!loan || loan.status !== "FUNDING") return;

    // 2. Find Eligible Investors
    // Logic: Enabled AND Interest Match AND Duration Match AND Risk Match
    const eligibleSettings = await db.autoInvestSettings.findMany({
        where: {
            isEnabled: true,
            minInterest: { lte: loan.apr },
            maxDuration: { gte: loan.duration },
            // riskTolerance check needs application-level filtering if stored as string
        }
    });

    console.log(`Found ${eligibleSettings.length} potential investors.`);

    let totalInvested = 0;

    for (const settings of eligibleSettings) {
        // Application-level Risk Check
        const risks = settings.riskTolerance.split(",");
        if (!risks.includes(loan.riskGrade)) continue;

        // 3. Check Wallet Balance
        const wallet = await db.wallet.findUnique({ where: { userId: settings.userId } });
        if (!wallet || wallet.balance < settings.amountPerLoan) {
            console.log(`Skipping User ${settings.userId}: Insufficient funds.`);
            continue;
        }

        // 4. Execute Investment (Atomic Transaction preferred, doing sequentially here for simplicity)
        try {
            await db.$transaction(async (tx) => {
                // Double check balance inside transaction
                const w = await tx.wallet.findUnique({ where: { id: wallet.id } });
                if (!w || w.balance < settings.amountPerLoan) throw new Error("No funds");

                // Deduct
                await tx.wallet.update({
                    where: { id: w.id },
                    data: {
                        balance: { decrement: settings.amountPerLoan },
                        invested: { increment: settings.amountPerLoan }
                    }
                });

                // Record Transaction
                await tx.transaction.create({
                    data: {
                        walletId: w.id,
                        amount: -settings.amountPerLoan,
                        type: "INVESTMENT_AUTO",
                        status: "COMPLETED",
                        reference: loan.id
                    }
                });

                // Create Investment
                await tx.investment.create({
                    data: {
                        walletId: w.id,
                        loanId: loan.id,
                        amount: settings.amountPerLoan,
                        status: "ACTIVE"
                    }
                });

                // Update Loan
                await tx.loanProject.update({
                    where: { id: loan.id },
                    data: { funded: { increment: settings.amountPerLoan } }
                });
            });

            console.log(`✅ User ${settings.userId} auto-invested ${settings.amountPerLoan}€`);
            totalInvested += settings.amountPerLoan;

        } catch (err) {
            console.error(`Failed to auto-invest for user ${settings.userId}:`, err);
        }
    }

    return { totalInvested };
}
