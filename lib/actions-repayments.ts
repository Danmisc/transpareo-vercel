"use server";

import { prisma as db } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { logSecurityEvent } from "@/lib/security";

// ========================================
// GENERATE REPAYMENT SCHEDULE (for LoanProject)
// ========================================

export async function generateRepaymentSchedule(loanProjectId: string) {
    const project = await db.loanProject.findUnique({
        where: { id: loanProjectId }
    });

    if (!project) {
        return { success: false, error: "Projet introuvable" };
    }

    if (project.status !== "FUNDED") {
        return { success: false, error: "Le projet n'est pas encore financé" };
    }

    // Check if schedule already exists
    const existingSchedule = await db.loanRepayment.findMany({
        where: { loanId: loanProjectId }
    });

    if (existingSchedule.length > 0) {
        return { success: false, error: "Calendrier déjà généré" };
    }

    // Calculate monthly payment
    const amount = project.amount;
    const duration = project.duration;
    const monthlyRate = project.apr / 100 / 12;

    const numerator = monthlyRate * Math.pow(1 + monthlyRate, duration);
    const denominator = Math.pow(1 + monthlyRate, duration) - 1;
    const monthlyPayment = denominator > 0
        ? amount * (numerator / denominator)
        : amount / duration;

    // Generate schedule
    const scheduleEntries: any[] = [];
    let remainingPrincipal = amount;
    const startDate = new Date();

    for (let i = 1; i <= duration; i++) {
        const interestPortion = remainingPrincipal * monthlyRate;
        const principalPortion = monthlyPayment - interestPortion;
        remainingPrincipal -= principalPortion;

        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        scheduleEntries.push({
            loanId: loanProjectId,
            dueDate: dueDate,
            amount: Math.round(monthlyPayment * 100) / 100,
            principal: Math.round(principalPortion * 100) / 100,
            interest: Math.round(interestPortion * 100) / 100,
            status: "PENDING"
        });
    }

    // Create all entries
    await db.loanRepayment.createMany({
        data: scheduleEntries
    });

    // Update project status
    await db.loanProject.update({
        where: { id: loanProjectId },
        data: { status: "ACTIVE" }
    });

    return {
        success: true,
        installments: scheduleEntries.length,
        monthlyPayment: Math.round(monthlyPayment * 100) / 100
    };
}

// ========================================
// PROCESS SINGLE REPAYMENT
// ========================================

export async function processRepayment(repaymentId: string) {
    const repayment = await db.loanRepayment.findUnique({
        where: { id: repaymentId },
        include: {
            loan: {
                include: {
                    investments: {
                        include: {
                            wallet: true
                        }
                    }
                }
            }
        }
    });

    if (!repayment) {
        return { success: false, error: "Échéance introuvable" };
    }

    if (repayment.status !== "PENDING") {
        return { success: false, error: "Échéance déjà traitée" };
    }

    const loan = repayment.loan;
    if (!loan) {
        return { success: false, error: "Prêt introuvable" };
    }

    // Calculate total invested in this loan
    const totalInvestedInLoan = loan.investments.reduce(
        (sum: number, inv: any) => sum + inv.amount,
        0
    );

    if (totalInvestedInLoan === 0) {
        return { success: false, error: "Aucun investisseur" };
    }

    // Platform fee (15%)
    const platformFee = repayment.amount * 0.15;
    const amountToDistribute = repayment.amount - platformFee;

    try {
        await db.$transaction(async (tx) => {
            // Distribute to each investor proportionally
            for (const investment of loan.investments) {
                const proportion = investment.amount / totalInvestedInLoan;
                const investorShare = amountToDistribute * proportion;

                // Credit investor wallet
                await tx.wallet.update({
                    where: { id: investment.walletId },
                    data: {
                        balance: { increment: investorShare }
                    }
                });

                // Create transaction record
                await tx.transaction.create({
                    data: {
                        walletId: investment.walletId,
                        amount: investorShare,
                        type: "REPAYMENT",
                        status: "COMPLETED",
                        reference: repaymentId,
                        description: `Remboursement: ${loan.title}`
                    }
                });

                // Log event
                await logSecurityEvent(
                    investment.wallet.userId,
                    "LOAN_REPAYMENT_RECEIVED",
                    "SUCCESS",
                    {
                        loanId: loan.id,
                        amount: investorShare
                    }
                );
            }

            // Mark repayment as completed
            await tx.loanRepayment.update({
                where: { id: repaymentId },
                data: {
                    status: "PAID",
                    paidAt: new Date()
                }
            });

            // Check if all repayments are done
            const pendingRepayments = await tx.loanRepayment.count({
                where: {
                    loanId: loan.id,
                    status: "PENDING"
                }
            });

            if (pendingRepayments === 0) {
                // Loan fully repaid
                await tx.loanProject.update({
                    where: { id: loan.id },
                    data: { status: "COMPLETED" }
                });

                // Update investment statuses
                await tx.investment.updateMany({
                    where: { loanId: loan.id },
                    data: { status: "COMPLETED" }
                });
            }
        });

        revalidatePath("/p2p/portfolio");
        revalidatePath("/p2p/dashboard");

        return {
            success: true,
            distributed: amountToDistribute,
            platformFee,
            investorsCount: loan.investments.length
        };

    } catch (error) {
        console.error("[Repayment] Distribution failed:", error);
        return { success: false, error: "Erreur lors de la distribution" };
    }
}

// ========================================
// GET UPCOMING REPAYMENTS (For borrower)
// ========================================

export async function getUpcomingRepayments(loanId?: string) {
    const user = await getCurrentUser();
    if (!user) return [];

    const where: any = {
        status: "PENDING",
        loan: { borrowerId: user.id }
    };

    if (loanId) {
        where.loanId = loanId;
    }

    return await db.loanRepayment.findMany({
        where,
        include: {
            loan: true
        },
        orderBy: { dueDate: 'asc' },
        take: 10
    });
}

// ========================================
// GET INVESTOR RETURNS SUMMARY
// ========================================

export async function getInvestorReturnsSummary() {
    const user = await getCurrentUser();
    if (!user) return null;

    const wallet = await db.wallet.findUnique({
        where: { userId: user.id }
    });

    if (!wallet) return null;

    // Get all repayment transactions
    const repayments = await db.transaction.findMany({
        where: {
            walletId: wallet.id,
            type: "REPAYMENT"
        }
    });

    const totalReturns = repayments.reduce((sum, t) => sum + t.amount, 0);

    // Get investments
    const investments = await db.investment.findMany({
        where: { walletId: wallet.id },
        include: {
            loan: true
        }
    });

    const activeInvestments = investments.filter((i: any) => i.status === "ACTIVE");
    const completedInvestments = investments.filter((i: any) => i.status === "COMPLETED");

    const totalInvested = investments.reduce((sum: number, i: any) => sum + i.amount, 0);
    const activeAmount = activeInvestments.reduce((sum: number, i: any) => sum + i.amount, 0);

    // Calculate average APR
    const averageAPR = activeInvestments.length > 0
        ? activeInvestments.reduce((sum: number, i: any) => sum + (i.loan?.apr || 0), 0) / activeInvestments.length
        : 0;

    return {
        totalReturns: Math.round(totalReturns * 100) / 100,
        totalInvested,
        activeAmount,
        completedAmount: completedInvestments.reduce((sum: number, i: any) => sum + i.amount, 0),
        activeCount: activeInvestments.length,
        completedCount: completedInvestments.length,
        averageAPR: Math.round(averageAPR * 100) / 100
    };
}

// ========================================
// CRON: Process Due Repayments
// ========================================

export async function processDueRepayments() {
    const now = new Date();

    const dueRepayments = await db.loanRepayment.findMany({
        where: {
            status: "PENDING",
            dueDate: { lte: now }
        },
        take: 100 // Process in batches
    });

    const results = [];

    for (const repayment of dueRepayments) {
        const result = await processRepayment(repayment.id);
        results.push({
            id: repayment.id,
            ...result
        });
    }

    return {
        processed: results.length,
        results
    };
}
