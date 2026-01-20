"use server";

import { prisma as db } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { logSecurityEvent } from "@/lib/security";
import { COMPLIANCE_LIMITS, type InvestorSophistication } from "@/lib/compliance-constants";

// Re-export for convenience (but as async function to comply with 'use server')
export async function getComplianceLimits() {
    return COMPLIANCE_LIMITS;
}

// ========================================
// INVESTOR PROFILE (Suitability Test)
// ========================================

interface SuitabilityAnswers {
    investmentExperience: "NONE" | "SOME" | "EXTENSIVE";
    riskUnderstanding: boolean;
    canAffordLoss: boolean;
    investmentHorizon: "SHORT" | "MEDIUM" | "LONG";
    monthlyIncome?: number;
    totalPatrimony?: number;
    investmentObjective: "CAPITAL_GROWTH" | "INCOME" | "DIVERSIFICATION";
}

export async function getSuitabilityProfile() {
    const user = await getCurrentUser();
    if (!user) return null;

    const profile = await db.investorProfile.findUnique({
        where: { userId: user.id }
    });

    return profile;
}

export async function submitSuitabilityTest(answers: SuitabilityAnswers) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // Determine sophistication level based on answers
    let sophistication: InvestorSophistication = "NON_SOPHISTICATED";

    // User is sophisticated if:
    // - Has extensive investment experience
    // - Understands risks
    // - Has significant patrimony (>250k) or income (>5k/month)
    if (
        answers.investmentExperience === "EXTENSIVE" &&
        answers.riskUnderstanding &&
        (answers.totalPatrimony && answers.totalPatrimony > 250000 ||
            answers.monthlyIncome && answers.monthlyIncome > 5000)
    ) {
        sophistication = "SOPHISTICATED";
    }

    // Upsert investor profile
    const profile = await db.investorProfile.upsert({
        where: { userId: user.id },
        create: {
            userId: user.id,
            sophistication,
            investmentExperience: answers.investmentExperience,
            riskUnderstanding: answers.riskUnderstanding,
            canAffordLoss: answers.canAffordLoss,
            investmentHorizon: answers.investmentHorizon,
            monthlyIncome: answers.monthlyIncome,
            totalPatrimony: answers.totalPatrimony,
            investmentObjective: answers.investmentObjective,
            testCompletedAt: new Date()
        },
        update: {
            sophistication,
            investmentExperience: answers.investmentExperience,
            riskUnderstanding: answers.riskUnderstanding,
            canAffordLoss: answers.canAffordLoss,
            investmentHorizon: answers.investmentHorizon,
            monthlyIncome: answers.monthlyIncome,
            totalPatrimony: answers.totalPatrimony,
            investmentObjective: answers.investmentObjective,
            testCompletedAt: new Date()
        }
    });

    await logSecurityEvent(
        user.id,
        "SUITABILITY_TEST_COMPLETED",
        "SUCCESS",
        { sophistication }
    );

    return { success: true, sophistication };
}

// ========================================
// ANNUAL INVESTMENT TRACKING
// ========================================

export async function getAnnualInvestmentStats() {
    const user = await getCurrentUser();
    if (!user) return null;

    const startOfYear = new Date(new Date().getFullYear(), 0, 1);

    // Get yearly investments
    const yearlyInvestments = await db.investment.aggregate({
        where: {
            wallet: { userId: user.id },
            createdAt: { gte: startOfYear }
        },
        _sum: { amount: true },
        _count: true
    });

    // Get KYC status
    const kyc = await db.kYCProfile.findUnique({
        where: { userId: user.id },
        select: { status: true }
    });

    // Get investor profile
    const profile = await db.investorProfile.findUnique({
        where: { userId: user.id },
        select: { sophistication: true, totalPatrimony: true }
    });

    const totalInvested = yearlyInvestments._sum.amount || 0;
    const investmentCount = yearlyInvestments._count || 0;
    const isVerified = kyc?.status === "VERIFIED";
    const isSophisticated = profile?.sophistication === "SOPHISTICATED";

    // Calculate limits
    const annualLimit = isVerified
        ? (isSophisticated ? Infinity : 100000)
        : COMPLIANCE_LIMITS.ANNUAL_LIMIT_NO_KYC;

    const remainingCapacity = Math.max(0, annualLimit - totalInvested);

    return {
        totalInvested,
        investmentCount,
        annualLimit: annualLimit === Infinity ? null : annualLimit,
        remainingCapacity: annualLimit === Infinity ? null : remainingCapacity,
        isVerified,
        isSophisticated,
        patrimony: profile?.totalPatrimony || null,
        percentOfLimit: annualLimit === Infinity ? 0 : (totalInvested / annualLimit) * 100
    };
}

// ========================================
// PRE-INVESTMENT COMPLIANCE CHECK
// ========================================

export async function checkInvestmentCompliance(amount: number, loanId: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const warnings: string[] = [];
    const blockers: string[] = [];
    let requiresConfirmation = false;

    // 1. Get user data
    const [kyc, profile, annualStats] = await Promise.all([
        db.kYCProfile.findUnique({ where: { userId: user.id } }),
        db.investorProfile.findUnique({ where: { userId: user.id } }),
        getAnnualInvestmentStats()
    ]);

    const isVerified = kyc?.status === "VERIFIED";
    const hasSuitabilityTest = !!profile?.testCompletedAt;
    const patrimony = profile?.totalPatrimony || 0;

    // 2. Check suitability test completed
    if (!hasSuitabilityTest) {
        blockers.push("Vous devez compléter le questionnaire investisseur avant d'investir.");
    }

    // 3. Check annual limit
    if (!isVerified && annualStats) {
        const newTotal = annualStats.totalInvested + amount;
        if (newTotal > COMPLIANCE_LIMITS.ANNUAL_LIMIT_NO_KYC) {
            blockers.push(
                `Limite annuelle de ${COMPLIANCE_LIMITS.ANNUAL_LIMIT_NO_KYC}€ atteinte. Vérifiez votre identité pour investir davantage.`
            );
        }
    }

    // 4. Warning for investments >€1000
    if (amount > COMPLIANCE_LIMITS.WARNING_THRESHOLD) {
        warnings.push(
            `Investissement supérieur à ${COMPLIANCE_LIMITS.WARNING_THRESHOLD}€. Assurez-vous de diversifier vos placements.`
        );
        requiresConfirmation = true;
    }

    // 5. Warning if >5% of patrimony
    if (patrimony > 0 && amount > patrimony * (COMPLIANCE_LIMITS.PATRIMONY_PERCENTAGE / 100)) {
        warnings.push(
            `Cet investissement représente plus de ${COMPLIANCE_LIMITS.PATRIMONY_PERCENTAGE}% de votre patrimoine déclaré.`
        );
        requiresConfirmation = true;
    }

    // 6. Risk reminder for non-sophisticated
    if (profile?.sophistication === "NON_SOPHISTICATED") {
        warnings.push(
            "Rappel: Le prêt participatif comporte un risque de perte partielle ou totale du capital."
        );
    }

    return {
        canInvest: blockers.length === 0,
        blockers,
        warnings,
        requiresConfirmation,
        suitabilityCompleted: hasSuitabilityTest,
        isVerified,
        annualStats
    };
}

// ========================================
// COOLING-OFF PERIOD (Rétractation)
// ========================================

export async function getRecentInvestmentsWithCoolingOff() {
    const user = await getCurrentUser();
    if (!user) return [];

    const coolingOffDate = new Date();
    coolingOffDate.setDate(coolingOffDate.getDate() - COMPLIANCE_LIMITS.COOLING_OFF_DAYS);

    // Get investments within cooling-off period
    const recentInvestments = await db.investment.findMany({
        where: {
            wallet: { userId: user.id },
            createdAt: { gte: coolingOffDate },
            status: { not: "CANCELLED" }
        },
        include: {
            loan: {
                select: { id: true, title: true, status: true }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return recentInvestments.map(inv => ({
        ...inv,
        coolingOffEnds: new Date(inv.createdAt.getTime() + COMPLIANCE_LIMITS.COOLING_OFF_DAYS * 24 * 60 * 60 * 1000),
        canCancel: inv.loan.status === "FUNDING" // Can only cancel if funding still open
    }));
}

export async function cancelInvestmentCoolingOff(investmentId: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const investment = await db.investment.findFirst({
        where: {
            id: investmentId,
            wallet: { userId: user.id }
        },
        include: {
            wallet: true,
            loan: true
        }
    });

    if (!investment) {
        return { success: false, error: "Investissement introuvable" };
    }

    // Check cooling-off period
    const coolingOffEnd = new Date(investment.createdAt);
    coolingOffEnd.setDate(coolingOffEnd.getDate() + COMPLIANCE_LIMITS.COOLING_OFF_DAYS);

    if (new Date() > coolingOffEnd) {
        return { success: false, error: "La période de rétractation a expiré" };
    }

    if (investment.loan.status !== "FUNDING") {
        return { success: false, error: "Le projet a déjà démarré, annulation impossible" };
    }

    // Execute cancellation atomically
    try {
        await db.$transaction(async (tx) => {
            // 1. Refund wallet
            await tx.wallet.update({
                where: { id: investment.wallet.id },
                data: {
                    balance: { increment: investment.amount },
                    invested: { decrement: investment.amount }
                }
            });

            // 2. Update loan funded amount
            await tx.loanProject.update({
                where: { id: investment.loan.id },
                data: {
                    funded: { decrement: investment.amount }
                }
            });

            // 3. Mark investment as cancelled
            await tx.investment.update({
                where: { id: investmentId },
                data: { status: "CANCELLED" }
            });

            // 4. Create refund transaction
            await tx.transaction.create({
                data: {
                    walletId: investment.wallet.id,
                    amount: investment.amount,
                    type: "REFUND",
                    description: `Rétractation: ${investment.loan.title}`,
                    status: "COMPLETED"
                }
            });
        });

        await logSecurityEvent(
            user.id,
            "INVESTMENT_COOLING_OFF_CANCELLED",
            "SUCCESS",
            { investmentId, amount: investment.amount }
        );

        return { success: true, refundedAmount: investment.amount };
    } catch (error) {
        console.error("Cooling-off cancellation failed:", error);
        return { success: false, error: "Erreur lors de l'annulation" };
    }
}

// ========================================
// RISK DISCLOSURE ACKNOWLEDGMENT
// ========================================

export async function acknowledgeRiskDisclosure(loanId: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // Store acknowledgment
    await db.riskAcknowledgment.upsert({
        where: {
            userId_loanId: { userId: user.id, loanId }
        },
        create: {
            userId: user.id,
            loanId,
            acknowledgedAt: new Date()
        },
        update: {
            acknowledgedAt: new Date()
        }
    });

    return { success: true };
}

export async function hasAcknowledgedRisk(loanId: string) {
    const user = await getCurrentUser();
    if (!user) return false;

    const ack = await db.riskAcknowledgment.findUnique({
        where: {
            userId_loanId: { userId: user.id, loanId }
        }
    });

    return !!ack;
}
