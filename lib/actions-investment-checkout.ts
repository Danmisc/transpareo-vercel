"use server";

import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { logSecurityEvent } from "@/lib/security";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-12-18.acacia" as any, // Type assertion for version compatibility
});

// ========================================
// RATE LIMITING - Production Security
// ========================================

const investmentRateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string, maxRequests: number = 10, windowMs: number = 3600000): boolean {
    const now = Date.now();
    const key = `investment:${userId}`;
    const limit = investmentRateLimits.get(key);

    if (limit) {
        if (now < limit.resetAt) {
            if (limit.count >= maxRequests) {
                return false; // Rate limited
            }
            limit.count++;
        } else {
            investmentRateLimits.set(key, { count: 1, resetAt: now + windowMs });
        }
    } else {
        investmentRateLimits.set(key, { count: 1, resetAt: now + windowMs });
    }
    return true;
}

// ========================================
// CREATE INVESTMENT CHECKOUT SESSION
// ========================================

export async function createInvestmentCheckout(data: {
    loanId: string;
    amount: number;
}) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const { loanId, amount } = data;

    // ========================================
    // 0. RATE LIMITING (10 attempts/hour)
    // ========================================
    if (!checkRateLimit(user.id, 10, 3600000)) {
        await logSecurityEvent(user.id, "INVESTMENT_RATE_LIMITED", "FAILURE", { loanId, amount });
        return {
            success: false,
            error: "Trop de tentatives d'investissement. Réessayez dans 1 heure."
        };
    }

    // ========================================
    // 1. VALIDATION
    // ========================================

    if (!amount || amount < 10) {
        return { success: false, error: "Montant minimum: 10€" };
    }
    if (amount > 100000) {
        return { success: false, error: "Montant maximum: 100 000€" };
    }

    // Get loan details
    const loan = await prisma.loanProject.findUnique({
        where: { id: loanId },
        select: {
            id: true,
            title: true,
            status: true,
            amount: true,
            funded: true,
            apr: true,
            duration: true,
            borrowerId: true
        }
    });

    if (!loan) {
        return { success: false, error: "Projet introuvable" };
    }
    if (loan.status !== "FUNDING") {
        return { success: false, error: "Ce projet n'accepte plus d'investissements" };
    }

    // Check if investment would exceed loan target
    const remaining = loan.amount - loan.funded;
    if (amount > remaining) {
        return { success: false, error: `Montant maximum disponible: ${remaining.toLocaleString('fr-FR')}€` };
    }

    // Prevent self-investment
    if (loan.borrowerId === user.id) {
        return { success: false, error: "Vous ne pouvez pas investir dans votre propre projet" };
    }

    // ========================================
    // 2. KYC CHECK
    // ========================================

    const kycProfile = await prisma.kYCProfile.findUnique({
        where: { userId: user.id }
    });

    // For amounts > 1000€, require KYC
    if (amount > 1000 && (!kycProfile || kycProfile.status !== "VERIFIED")) {
        return {
            success: false,
            error: "Vérification d'identité requise pour les investissements > 1000€",
            requiresKYC: true
        };
    }

    // ========================================
    // 3. CREATE STRIPE CHECKOUT SESSION
    // ========================================

    try {
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card", "bancontact", "ideal", "sepa_debit"],
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: `Investissement: ${loan.title}`,
                            description: `Prêt participatif - ${loan.apr}% APR sur ${loan.duration} mois`,
                            images: [], // Could add project image
                        },
                        unit_amount: Math.round(amount * 100), // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                type: "p2p_investment",
                userId: user.id,
                loanId: loan.id,
                amount: amount.toString(),
            },
            customer_email: user.email || undefined,
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/p2p/portfolio?invested=success&loan=${loan.id}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/p2p/market/${loan.id}?cancelled=true`,
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
        });

        await logSecurityEvent(user.id, "INVESTMENT_CHECKOUT_CREATED", "SUCCESS", {
            loanId: loan.id,
            amount,
            sessionId: session.id
        });

        return {
            success: true,
            checkoutUrl: session.url,
            sessionId: session.id
        };

    } catch (error: any) {
        console.error("[Investment Checkout] Stripe Error:", error);
        await logSecurityEvent(user.id, "INVESTMENT_CHECKOUT_FAILED", "FAILURE", {
            loanId: loan.id,
            amount,
            error: error.message
        });

        return {
            success: false,
            error: "Erreur lors de la création du paiement. Veuillez réessayer."
        };
    }
}

// ========================================
// VERIFY CHECKOUT STATUS (for polling)
// ========================================

export async function verifyInvestmentCheckout(sessionId: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.metadata?.userId !== user.id) {
            return { success: false, error: "Session invalide" };
        }

        return {
            success: true,
            status: session.payment_status,
            loanId: session.metadata?.loanId,
            amount: parseFloat(session.metadata?.amount || "0")
        };
    } catch (error) {
        return { success: false, error: "Session introuvable" };
    }
}

// ========================================
// GET USER'S GAINS BALANCE
// ========================================

export async function getGainsBalance() {
    const user = await getCurrentUser();
    if (!user) return null;

    // Get wallet (used for gains only now)
    const wallet = await prisma.wallet.findUnique({
        where: { userId: user.id },
        select: {
            id: true,
            balance: true, // This is now "gains balance"
            invested: true
        }
    });

    if (!wallet) {
        // Create wallet if doesn't exist
        const newWallet = await prisma.wallet.create({
            data: {
                userId: user.id,
                balance: 0,
                invested: 0,
                locked: 0,
                currency: "EUR"
            }
        });
        return { balance: 0, invested: 0 };
    }

    // Note: Pending repayments would come from a RepaymentSchedule model
    // For now, return 0 as pending (no repayment tracking model exists yet)
    const pendingAmount = 0;

    return {
        balance: wallet.balance, // Available gains
        invested: wallet.invested, // Currently invested
        pending: pendingAmount // Coming soon (future feature)
    };
}

// ========================================
// REINVEST FROM GAINS
// ========================================

export async function reinvestFromGains(loanId: string, amount: number) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // Get wallet
    const wallet = await prisma.wallet.findUnique({
        where: { userId: user.id }
    });

    if (!wallet || wallet.balance < amount) {
        return { success: false, error: "Solde de gains insuffisant" };
    }

    // Get loan
    const loan = await prisma.loanProject.findUnique({
        where: { id: loanId }
    });

    if (!loan || loan.status !== "FUNDING") {
        return { success: false, error: "Projet non disponible" };
    }

    // Execute investment from gains (atomic transaction)
    try {
        const result = await prisma.$transaction(async (tx) => {
            // Deduct from gains balance
            await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    balance: { decrement: amount },
                    invested: { increment: amount }
                }
            });

            // Create investment
            const investment = await tx.investment.create({
                data: {
                    walletId: wallet.id,
                    loanId: loan.id,
                    amount: amount,
                    status: "ACTIVE"
                }
            });

            // Update loan funded amount
            await tx.loanProject.update({
                where: { id: loan.id },
                data: {
                    funded: { increment: amount }
                }
            });

            // Record transaction
            await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    amount: -amount,
                    type: "INVESTMENT",
                    status: "COMPLETED",
                    category: "INVESTMENT",
                    reference: loan.id,
                    description: `Réinvestissement: ${loan.title}`
                }
            });

            return investment;
        });

        await logSecurityEvent(user.id, "REINVESTMENT_COMPLETED", "SUCCESS", {
            loanId: loan.id,
            amount,
            investmentId: result.id
        });

        return { success: true, investmentId: result.id };

    } catch (error: any) {
        console.error("[Reinvest] Error:", error);
        return { success: false, error: "Erreur lors du réinvestissement" };
    }
}
