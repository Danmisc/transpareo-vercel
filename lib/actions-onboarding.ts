"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { KYCTier } from "@/lib/banking/kyc";

export interface OnboardingStep {
    id: string;
    label: string;
    description: string;
    status: "COMPLETED" | "CURRENT" | "LOCKED";
    actionUrl?: string;
    icon?: string;
}

/**
 * Get onboarding progress with 4-step security verification
 * Flow: Email → 2FA → KYC → Funding
 */
export async function getOnboardingProgress() {
    const user = await getCurrentUser();
    if (!user) return null;

    // Fetch all necessary data in parallel
    const [kyc, wallet, dbUser] = await Promise.all([
        prisma.kYCProfile.findUnique({ where: { userId: user.id } }),
        prisma.wallet.findUnique({ where: { userId: user.id } }),
        prisma.user.findUnique({
            where: { id: user.id },
            select: {
                emailVerified: true,
                twoFactorEnabled: true
            }
        })
    ]);

    const steps: OnboardingStep[] = [];

    // 1. Email Verification
    const isEmailVerified = !!dbUser?.emailVerified;
    steps.push({
        id: "email",
        label: "Identité Numérique",
        description: "Validez votre email pour sécuriser votre compte.",
        status: isEmailVerified ? "COMPLETED" : "CURRENT",
        actionUrl: "/verify",
        icon: "Mail"
    });

    // 2. 2FA (Two-Factor Authentication)
    let status2FA: OnboardingStep["status"] = "LOCKED";
    if (isEmailVerified) {
        status2FA = dbUser?.twoFactorEnabled ? "COMPLETED" : "CURRENT";
    }
    steps.push({
        id: "security",
        label: "Forteresse 2FA",
        description: "Activez la double authentification TOTP.",
        status: status2FA,
        actionUrl: "/p2p/settings/security",
        icon: "ShieldCheck"
    });

    // 3. KYC (Identity Documents)
    let statusKYC: OnboardingStep["status"] = "LOCKED";
    if (dbUser?.twoFactorEnabled) {
        statusKYC = (kyc && (kyc as any).tier >= KYCTier.STANDARD) ? "COMPLETED" : "CURRENT";
    }
    steps.push({
        id: "kyc",
        label: "Identité Légale",
        description: "Vérification biométrique pour conformité LCB-FT.",
        status: statusKYC,
        actionUrl: "/p2p/settings/kyc",
        icon: "FileCheck"
    });

    // 4. First Investment (replaces deposit - we use direct Stripe checkout now)
    let statusInvestment: OnboardingStep["status"] = "LOCKED";
    if (statusKYC === "COMPLETED") {
        // Check if user has made any investment
        const hasInvestments = await prisma.investment.count({
            where: { wallet: { userId: user.id } }
        }) > 0;
        statusInvestment = hasInvestments ? "COMPLETED" : "CURRENT";
    }
    steps.push({
        id: "invest",
        label: "Premier Investissement",
        description: "Investissez dans un projet pour débloquer toutes les fonctionnalités.",
        status: statusInvestment,
        actionUrl: "/p2p/market",
        icon: "TrendingUp"
    });

    // Calculate Global Progress
    const completedCount = steps.filter(s => s.status === "COMPLETED").length;
    const progress = (completedCount / steps.length) * 100;

    return {
        progress,
        steps,
        currentStepIndex: steps.findIndex(s => s.status === "CURRENT")
    };
}
