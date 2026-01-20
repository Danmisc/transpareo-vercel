"use server";

import { prisma as db } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { logSecurityEvent } from "@/lib/security";

// ========================================
// PROJECT TYPES & RATES
// ========================================

const PROJECT_RATES: Record<string, { baseRate: number; label: string }> = {
    REAL_ESTATE: { baseRate: 0.065, label: "Immobilier" },
    RENOVATION: { baseRate: 0.072, label: "Rénovation" },
    BUSINESS: { baseRate: 0.085, label: "Commerce" },
    GREEN_ENERGY: { baseRate: 0.058, label: "Énergie Verte" },
    AGRICULTURE: { baseRate: 0.068, label: "Agriculture" },
    OTHER: { baseRate: 0.08, label: "Autre" }
};

// ========================================
// LOAN SIMULATION (Public - No Auth)
// ========================================

export async function simulateLoan(
    amount: number,
    duration: number,
    projectType: string,
    creditScore?: number
) {
    // Validate inputs
    if (!amount || amount < 1000 || amount > 500000) {
        return { error: "Montant: 1 000€ - 500 000€" };
    }
    if (!duration || duration < 6 || duration > 60) {
        return { error: "Durée: 6 - 60 mois" };
    }

    // Get base rate for project type
    const projectConfig = PROJECT_RATES[projectType] || PROJECT_RATES.OTHER;
    let rate = projectConfig.baseRate;

    // Adjust by amount (volume discount)
    if (amount >= 100000) rate -= 0.005;
    if (amount >= 200000) rate -= 0.005;

    // Adjust by duration (shorter = slightly better rate)
    if (duration <= 12) rate -= 0.003;
    if (duration >= 48) rate += 0.005;

    // Adjust by credit score (if provided)
    if (creditScore) {
        if (creditScore >= 800) rate -= 0.01;
        else if (creditScore >= 700) rate -= 0.005;
        else if (creditScore < 600) rate += 0.015;
    }

    // Ensure rate is reasonable
    rate = Math.max(0.03, Math.min(rate, 0.15));

    // Calculate monthly payment (amortization formula)
    const monthlyRate = rate / 12;
    const numerator = monthlyRate * Math.pow(1 + monthlyRate, duration);
    const denominator = Math.pow(1 + monthlyRate, duration) - 1;
    const monthlyPayment = denominator > 0
        ? amount * (numerator / denominator)
        : amount / duration;

    const totalRepayment = monthlyPayment * duration;
    const totalInterest = totalRepayment - amount;

    // Calculate for investors (what they earn)
    const investorReturn = totalInterest * 0.85; // Platform takes 15% fee
    const investorAPY = (investorReturn / amount / (duration / 12)) * 100;

    return {
        amount,
        duration,
        projectType: projectConfig.label,
        rate: Math.round(rate * 10000) / 100, // e.g., 7.25%
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalRepayment: Math.round(totalRepayment * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        investorAPY: Math.round(investorAPY * 100) / 100,
        platformFee: Math.round(totalInterest * 0.15 * 100) / 100
    };
}

// ========================================
// SUBMIT LOAN REQUEST (Authenticated)
// ========================================

export async function submitLoanRequest(data: {
    amount: number;
    duration: number;
    reason: string;
    category: string;
    description?: string;
    title?: string;
    location?: string;
}) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // ========================================
    // 1. VALIDATION
    // ========================================

    if (!data.amount || data.amount < 1000) {
        return { success: false, error: "Montant minimum: 1 000€" };
    }
    if (data.amount > 500000) {
        return { success: false, error: "Montant maximum: 500 000€" };
    }
    if (!data.duration || data.duration < 6 || data.duration > 60) {
        return { success: false, error: "Durée: 6-60 mois" };
    }
    if (!data.reason || data.reason.length < 10) {
        return { success: false, error: "Veuillez décrire votre projet" };
    }

    // ========================================
    // 2. KYC VERIFICATION (Required for borrowers)
    // ========================================

    const kycProfile = await db.kYCProfile.findUnique({
        where: { userId: user.id }
    });

    if (!kycProfile || kycProfile.status !== "VERIFIED") {
        return {
            success: false,
            error: "Vérification d'identité requise pour emprunter",
            requiresKYC: true
        };
    }

    // ========================================
    // 3. GET/CREATE CREDIT SCORE
    // ========================================

    let creditScore = await db.creditScore.findUnique({
        where: { userId: user.id }
    });

    if (!creditScore) {
        // Initialize credit score based on account age and activity
        const userCreatedAt = await db.user.findUnique({
            where: { id: user.id },
            select: { createdAt: true }
        });

        const accountAgeMonths = userCreatedAt
            ? Math.floor((Date.now() - new Date(userCreatedAt.createdAt).getTime()) / (30 * 24 * 60 * 60 * 1000))
            : 0;

        // Base score + bonus for account age
        const initialScore = Math.min(850, 650 + accountAgeMonths * 5);

        creditScore = await db.creditScore.create({
            data: {
                userId: user.id,
                score: initialScore
            }
        });
    }

    // ========================================
    // 4. CALCULATE LOAN TERMS
    // ========================================

    const simulation = await simulateLoan(
        data.amount,
        data.duration,
        data.category,
        creditScore.score
    );

    if ('error' in simulation) {
        return { success: false, error: simulation.error };
    }

    // Determine risk grade
    let riskGrade = "B";
    if (creditScore.score >= 750 && data.amount <= 50000) riskGrade = "A";
    else if (creditScore.score >= 700) riskGrade = "B";
    else if (creditScore.score >= 600) riskGrade = "C";
    else riskGrade = "D";

    // ========================================
    // 5. CREATE LOAN REQUEST
    // ========================================

    try {
        const request = await db.loanRequest.create({
            data: {
                userId: user.id,
                amount: data.amount,
                duration: data.duration,
                reason: data.reason,
                category: data.category,
                description: data.description || "",
                creditScore: creditScore.score,
                status: "PENDING"
            }
        });

        // Log the action
        await logSecurityEvent(user.id, "LOAN_APPLICATION_CREATED", "SUCCESS", {
            requestId: request.id,
            amount: data.amount,
            duration: data.duration,
            category: data.category,
            riskGrade
        });

        revalidatePath("/p2p/borrow");

        return {
            success: true,
            requestId: request.id,
            simulation,
            riskGrade,
            message: "Votre demande a été soumise avec succès !"
        };

    } catch (error) {
        console.error("[Loan Request] Error:", error);
        return { success: false, error: "Erreur lors de la soumission" };
    }
}

// ========================================
// GET BORROWER DASHBOARD DATA
// ========================================

export async function getLoanDashboardData() {
    const user = await getCurrentUser();
    if (!user) return null;

    const [loans, requests, creditScore, projects] = await Promise.all([
        // Active loans where user is borrower
        db.loan.findMany({
            where: { borrowerId: user.id },
            include: {
                repaymentSchedule: {
                    where: { status: "PENDING" },
                    take: 3,
                    orderBy: { dueDate: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        }),

        // Loan requests
        db.loanRequest.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 10
        }),

        // Credit score
        db.creditScore.findUnique({
            where: { userId: user.id }
        }),

        // Loan projects (crowdfunding style)
        db.loanProject.findMany({
            where: { borrowerId: user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { investments: true } }
            }
        })
    ]);

    // Calculate totals
    const totalBorrowed = loans.reduce((sum, l) => sum + l.amount, 0);
    const totalRepaid = 0; // TODO: Calculate from repayment schedule
    const pendingPayments = loans.flatMap(l => l.repaymentSchedule);

    return {
        loans,
        requests,
        creditScore,
        projects,
        stats: {
            totalBorrowed,
            totalRepaid,
            activeLoans: loans.length,
            pendingRequests: requests.filter(r => r.status === "PENDING").length,
            upcomingPayments: pendingPayments.length
        }
    };
}

// ========================================
// GET AVAILABLE PROJECT TYPES
// ========================================

export async function getProjectTypes() {
    return Object.entries(PROJECT_RATES).map(([key, value]) => ({
        value: key,
        label: value.label,
        baseRate: value.baseRate
    }));
}

// ========================================
// CANCEL LOAN REQUEST
// ========================================

export async function cancelLoanRequest(requestId: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const request = await db.loanRequest.findFirst({
        where: { id: requestId, userId: user.id }
    });

    if (!request) {
        return { success: false, error: "Demande introuvable" };
    }

    if (request.status !== "PENDING") {
        return { success: false, error: "Impossible d'annuler une demande déjà traitée" };
    }

    await db.loanRequest.update({
        where: { id: requestId },
        data: { status: "CANCELLED" }
    });

    revalidatePath("/p2p/borrow");
    return { success: true };
}
