"use server";

import { prisma as db } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { logSecurityEvent } from "@/lib/security";

// ========================================
// INVESTMENT LIMITS BY KYC STATUS
// ========================================

const INVESTMENT_LIMITS = {
    NONE: 0,           // Not verified - cannot invest
    PENDING: 0,        // Verification in progress
    VERIFIED: 100000,  // Full KYC - up to 100k per project
    ENHANCED: 500000   // Enhanced due diligence - up to 500k
};

const ANNUAL_LIMIT_NO_KYC = 1000; // EU regulation: 1000€/year without KYC

// ========================================
// CREATE LOAN APPLICATION (Borrower)
// ========================================

export async function createLoanApplication(data: {
    title: string;
    description: string;
    amount: number | string;
    duration: number | string;
    category: string;
    location?: string;
}) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // Validate input
    const amount = parseFloat(String(data.amount));
    const duration = parseInt(String(data.duration));

    if (isNaN(amount) || amount < 1000) {
        return { success: false, error: "Montant minimum: 1 000€" };
    }
    if (isNaN(duration) || duration < 6 || duration > 60) {
        return { success: false, error: "Durée: 6-60 mois" };
    }

    // Check KYC for borrowers
    const kycProfile = await db.kYCProfile.findUnique({
        where: { userId: user.id }
    });

    if (!kycProfile || kycProfile.status !== "VERIFIED") {
        return { success: false, error: "Vérification d'identité requise pour emprunter" };
    }

    // Risk Engine (simplified)
    const riskGrade = amount > 50000 ? "B" : "A";
    const apr = riskGrade === "A" ? 7.5 : 9.2;

    try {
        const project = await db.loanProject.create({
            data: {
                borrowerId: user.id,
                title: data.title,
                description: data.description,
                amount: amount,
                duration: duration,
                projectType: data.category,
                status: "REVIEW",
                riskGrade: riskGrade,
                apr: apr,
                location: data.location || "France",
                funded: 0
            }
        });

        await logSecurityEvent(user.id, "LOAN_APPLICATION_CREATED", "SUCCESS", {
            projectId: project.id,
            amount: amount
        });

        revalidatePath("/p2p/borrow");
        return { success: true, id: project.id };
    } catch (error) {
        console.error("[Loan Application] Error:", error);
        return { success: false, error: "Erreur lors de la création du projet" };
    }
}

// ========================================
// GET AVAILABLE LOANS (Marketplace)
// ========================================

export async function getAvailableLoans(filters?: {
    projectType?: string;
    minApr?: number;
    maxDuration?: number;
    riskGrade?: string;
}) {
    const where: any = {
        status: { in: ["FUNDING", "REVIEW"] } // Show funding + recently approved
    };

    if (filters?.projectType) where.projectType = filters.projectType;
    if (filters?.minApr) where.apr = { gte: filters.minApr };
    if (filters?.maxDuration) where.duration = { lte: filters.maxDuration };
    if (filters?.riskGrade) where.riskGrade = filters.riskGrade;

    const loans = await db.loanProject.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            borrower: {
                select: { id: true, name: true, avatar: true }
            },
            _count: {
                select: { investments: true }
            }
        }
    });

    // Map to include investorCount directly for marketplace display
    return loans.map(loan => ({
        ...loan,
        investorCount: loan._count?.investments || 0,
        fundingProgress: loan.amount > 0 ? Math.min((loan.funded / loan.amount) * 100, 100) : 0
    }));
}

// ========================================
// GET LOAN DETAILS
// ========================================

export async function getLoanDetails(id: string) {
    const loan = await db.loanProject.findUnique({
        where: { id },
        include: {
            borrower: {
                select: { id: true, name: true, avatar: true }
            },
            investments: {
                select: {
                    id: true,
                    amount: true,
                    createdAt: true,
                    wallet: {
                        select: {
                            user: { select: { name: true } }
                        }
                    }
                }
            },
            updates: { orderBy: { createdAt: 'desc' } }
        }
    });

    if (!loan) return null;

    // Calculate funding progress
    const fundingProgress = loan.amount > 0 ? (loan.funded / loan.amount) * 100 : 0;
    const investorCount = loan.investments.length;

    return {
        ...loan,
        fundingProgress: Math.min(fundingProgress, 100),
        investorCount
    };
}

// ========================================
// INVEST IN LOAN - ATOMIC TRANSACTION
// ========================================

export async function investInLoan(loanId: string, amount: number) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // ========================================
    // 1. VALIDATION CHECKS (Before Transaction)
    // ========================================

    // Validate amount
    if (!amount || amount < 10) {
        return { success: false, error: "Montant minimum: 10€" };
    }
    if (amount > 100000) {
        return { success: false, error: "Montant maximum: 100 000€" };
    }

    // Get loan details
    const loan = await db.loanProject.findUnique({
        where: { id: loanId }
    });

    if (!loan) {
        return { success: false, error: "Projet introuvable" };
    }
    if (loan.status !== "FUNDING") {
        return { success: false, error: "Ce projet n'accepte plus d'investissements" };
    }
    if (loan.borrowerId === user.id) {
        return { success: false, error: "Vous ne pouvez pas investir dans votre propre projet" };
    }

    // Check remaining funding capacity
    const remainingToFund = loan.amount - loan.funded;
    if (amount > remainingToFund) {
        return {
            success: false,
            error: `Montant maximum disponible: ${remainingToFund.toLocaleString('fr-FR')}€`
        };
    }

    // ========================================
    // 2. KYC VERIFICATION
    // ========================================

    const kycProfile = await db.kYCProfile.findUnique({
        where: { userId: user.id }
    });

    const kycStatus = kycProfile?.status || "NONE";
    const investmentLimit = INVESTMENT_LIMITS[kycStatus as keyof typeof INVESTMENT_LIMITS] || 0;

    if (kycStatus === "NONE" || kycStatus === "PENDING") {
        // Check annual limit for non-verified users
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        const yearlyInvestments = await db.investment.aggregate({
            where: {
                wallet: { userId: user.id },
                createdAt: { gte: startOfYear }
            },
            _sum: { amount: true }
        });

        const totalThisYear = yearlyInvestments._sum.amount || 0;
        if (totalThisYear + amount > ANNUAL_LIMIT_NO_KYC) {
            return {
                success: false,
                error: `Limite annuelle de ${ANNUAL_LIMIT_NO_KYC}€ atteinte sans vérification d'identité`,
                requiresKYC: true
            };
        }
    }

    if (amount > investmentLimit && investmentLimit > 0) {
        return {
            success: false,
            error: `Limite d'investissement: ${investmentLimit.toLocaleString('fr-FR')}€`,
            requiresKYC: true
        };
    }

    // ========================================
    // 3. ATOMIC TRANSACTION
    // ========================================

    try {
        const result = await db.$transaction(async (tx) => {
            // Get wallet with lock (re-check balance inside transaction)
            const wallet = await tx.wallet.findUnique({
                where: { userId: user.id }
            });

            if (!wallet) {
                throw new Error("WALLET_NOT_FOUND");
            }
            if (wallet.balance < amount) {
                throw new Error("INSUFFICIENT_FUNDS");
            }

            // Re-check loan status inside transaction
            const currentLoan = await tx.loanProject.findUnique({
                where: { id: loanId }
            });
            if (!currentLoan || currentLoan.status !== "FUNDING") {
                throw new Error("LOAN_NOT_AVAILABLE");
            }

            // 3a. Debit wallet
            await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    balance: { decrement: amount },
                    invested: { increment: amount }
                }
            });

            // 3b. Create transaction record
            const transaction = await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    amount: -amount,
                    type: "INVESTMENT",
                    reference: loanId,
                    status: "COMPLETED",
                    description: `Investissement: ${currentLoan.title}`
                }
            });

            // 3c. Create investment record
            const investment = await tx.investment.create({
                data: {
                    walletId: wallet.id,
                    loanId: loanId,
                    amount: amount,
                    status: "ACTIVE"
                }
            });

            // 3d. Update loan funded amount
            const updatedLoan = await tx.loanProject.update({
                where: { id: loanId },
                data: {
                    funded: { increment: amount }
                }
            });

            // 3e. Check if fully funded
            if (updatedLoan.funded >= updatedLoan.amount) {
                await tx.loanProject.update({
                    where: { id: loanId },
                    data: { status: "FUNDED" }
                });
            }

            return { transactionId: transaction.id, investmentId: investment.id };
        });

        // ========================================
        // 4. AUDIT LOG (Outside transaction)
        // ========================================

        await logSecurityEvent(user.id, "INVESTMENT_COMPLETED", "SUCCESS", {
            loanId,
            amount,
            transactionId: result.transactionId,
            investmentId: result.investmentId
        });

        // ========================================
        // 5. REVALIDATE PATHS
        // ========================================

        revalidatePath(`/p2p/market/${loanId}`);
        revalidatePath('/p2p/dashboard');
        revalidatePath('/p2p/portfolio');
        revalidatePath('/p2p/gains');

        return {
            success: true,
            investmentId: result.investmentId,
            message: `Investissement de ${amount.toLocaleString('fr-FR')}€ confirmé !`
        };

    } catch (error: any) {
        console.error("[Investment] Transaction failed:", error);

        // Log failed attempt
        await logSecurityEvent(user.id, "INVESTMENT_FAILED", "FAILURE", {
            loanId,
            amount,
            error: error.message
        });

        // Return user-friendly error messages
        if (error.message === "WALLET_NOT_FOUND") {
            return { success: false, error: "Portefeuille introuvable. Contactez le support." };
        }
        if (error.message === "INSUFFICIENT_FUNDS") {
            return { success: false, error: "Solde insuffisant" };
        }
        if (error.message === "LOAN_NOT_AVAILABLE") {
            return { success: false, error: "Ce projet n'est plus disponible" };
        }

        return { success: false, error: "Erreur lors de l'investissement. Veuillez réessayer." };
    }
}

// ========================================
// GET USER INVESTMENTS
// ========================================

export async function getUserInvestments() {
    const user = await getCurrentUser();
    if (!user) return [];

    const wallet = await db.wallet.findUnique({
        where: { userId: user.id }
    });

    if (!wallet) return [];

    return await db.investment.findMany({
        where: { walletId: wallet.id },
        include: {
            loan: {
                select: {
                    id: true,
                    title: true,
                    apr: true,
                    duration: true,
                    status: true,
                    riskGrade: true,
                    location: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
}

// ========================================
// CHECK INVESTMENT ELIGIBILITY
// ========================================

export async function checkInvestmentEligibility(loanId: string, amount: number) {
    const user = await getCurrentUser();
    if (!user) return { eligible: false, reason: "Non connecté" };

    const wallet = await db.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet) return { eligible: false, reason: "Portefeuille requis" };
    if (wallet.balance < amount) {
        return { eligible: false, reason: "Solde insuffisant", balance: wallet.balance };
    }

    const kycProfile = await db.kYCProfile.findUnique({ where: { userId: user.id } });
    const kycStatus = kycProfile?.status || "NONE";

    const loan = await db.loanProject.findUnique({ where: { id: loanId } });
    if (!loan) return { eligible: false, reason: "Projet introuvable" };
    if (loan.status !== "FUNDING") return { eligible: false, reason: "Projet non disponible" };
    if (loan.borrowerId === user.id) return { eligible: false, reason: "Investissement propre interdit" };

    return {
        eligible: true,
        balance: wallet.balance,
        kycStatus,
        maxAmount: Math.min(wallet.balance, loan.amount - loan.funded)
    };
}
