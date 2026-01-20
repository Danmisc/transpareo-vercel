"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { IMPACT_COEFFICIENTS, ImpactStats } from "./impact-config";

// Re-export types for convenience
export type { ImpactStats } from "./impact-config";

// ========================================
// IMPACT RSE ACTIONS
// Calculate real environmental & social impact from investments
// ========================================

/**
 * Calculate real impact stats from user's investments
 */
export async function getImpactStats(): Promise<ImpactStats | null> {
    const user = await getCurrentUser();
    if (!user) return null;

    // Get user's wallet
    const wallet = await prisma.wallet.findUnique({
        where: { userId: user.id },
        select: { id: true }
    });

    if (!wallet) {
        return {
            co2Saved: 0,
            jobsSupported: 0,
            housingRenovated: 0,
            totalInvested: 0,
            projectCount: 0,
            impactByCategory: {}
        };
    }

    // Get all investments with loan details
    const investments = await prisma.investment.findMany({
        where: { walletId: wallet.id },
        include: {
            loan: {
                select: {
                    id: true,
                    projectType: true,
                    title: true,
                    amount: true
                }
            }
        }
    });

    // Calculate impact
    let totalCO2 = 0;
    let totalJobs = 0;
    let totalHousing = 0;
    let totalInvested = 0;
    const impactByCategory: Record<string, { amount: number; co2: number; jobs: number }> = {};

    for (const inv of investments) {
        const projectType = (inv.loan?.projectType || "OTHER") as keyof typeof IMPACT_COEFFICIENTS;
        const coefficients = IMPACT_COEFFICIENTS[projectType] || IMPACT_COEFFICIENTS.OTHER;
        const amount = inv.amount;

        // Calculate impact
        const co2 = amount * coefficients.co2PerEuro;
        const jobs = amount * coefficients.jobsPerEuro;
        const housing = (amount / 10000) * coefficients.housingPer10k;

        totalCO2 += co2;
        totalJobs += jobs;
        totalHousing += housing;
        totalInvested += amount;

        // Group by category
        if (!impactByCategory[projectType]) {
            impactByCategory[projectType] = { amount: 0, co2: 0, jobs: 0 };
        }
        impactByCategory[projectType].amount += amount;
        impactByCategory[projectType].co2 += co2;
        impactByCategory[projectType].jobs += jobs;
    }

    return {
        co2Saved: Math.round(totalCO2) / 1000, // Convert to tons
        jobsSupported: Math.round(totalJobs * 10) / 10,
        housingRenovated: Math.round(totalHousing * 10) / 10,
        totalInvested,
        projectCount: investments.length,
        impactByCategory
    };
}

/**
 * Get monthly impact history for charts
 */
export async function getImpactHistory(months: number = 12) {
    const user = await getCurrentUser();
    if (!user) return [];

    const wallet = await prisma.wallet.findUnique({
        where: { userId: user.id },
        select: { id: true }
    });

    if (!wallet) return [];

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const investments = await prisma.investment.findMany({
        where: {
            walletId: wallet.id,
            createdAt: { gte: startDate }
        },
        include: {
            loan: { select: { projectType: true } }
        },
        orderBy: { createdAt: 'asc' }
    });

    // Group by month
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const monthlyData: { name: string; co2: number; invested: number }[] = [];

    let cumulativeCO2 = 0;
    let cumulativeInvested = 0;

    for (let i = 0; i < months; i++) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - (months - 1 - i));
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        const monthInv = investments.filter(inv => {
            const date = new Date(inv.createdAt);
            return date >= monthStart && date < monthEnd;
        });

        for (const inv of monthInv) {
            const projectType = (inv.loan?.projectType || "OTHER") as keyof typeof IMPACT_COEFFICIENTS;
            const coefficients = IMPACT_COEFFICIENTS[projectType] || IMPACT_COEFFICIENTS.OTHER;
            cumulativeCO2 += (inv.amount * coefficients.co2PerEuro) / 1000; // tons
            cumulativeInvested += inv.amount;
        }

        monthlyData.push({
            name: monthNames[monthStart.getMonth()],
            co2: Math.round(cumulativeCO2 * 100) / 100,
            invested: cumulativeInvested
        });
    }

    return monthlyData;
}

/**
 * Generate impact certificate data
 */
export async function getImpactCertificate() {
    const user = await getCurrentUser();
    if (!user) return null;

    const stats = await getImpactStats();
    if (!stats) return null;

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { name: true, createdAt: true }
    });

    const currentYear = new Date().getFullYear();
    const certificateId = `IMP-${currentYear}-${user.id.slice(-6).toUpperCase()}`;

    return {
        certificateId,
        year: currentYear,
        userName: dbUser?.name || "Investisseur",
        memberSince: dbUser?.createdAt,
        stats,
        generatedAt: new Date().toISOString(),
        methodology: "Calcul basé sur les coefficients sectoriels ADEME et les standards ESG européens."
    };
}
