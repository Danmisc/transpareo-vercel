"use server";

import { prisma as db } from "@/lib/prisma";

// ========================================
// PLATFORM STATISTICS (Public)
// ========================================

export interface PlatformStats {
    // Volume
    totalFundedVolume: number;
    totalProjectsCount: number;
    activeProjectsCount: number;
    completedProjectsCount: number;

    // Performance
    averageApr: number;
    averageDuration: number;
    totalInvestors: number;

    // Default Rates (Critical for transparency)
    defaultRate: number;
    latePaymentRate: number;
    onTimePaymentRate: number;

    // Returns
    totalReturnsDistributed: number;
    averageActualReturn: number;

    // Monthly trends
    monthlyStats: {
        month: string;
        fundedVolume: number;
        projectsCount: number;
        repayments: number;
    }[];
}

export async function getPlatformStatistics(): Promise<PlatformStats> {
    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Get all projects data
    const [
        allProjects,
        activeProjects,
        completedProjects,
        defaultedProjects,
        walletCount,
        repayments,
        investments
    ] = await Promise.all([
        db.loanProject.findMany({
            select: {
                id: true,
                amount: true,
                funded: true,
                apr: true,
                duration: true,
                status: true,
                createdAt: true
            }
        }),
        db.loanProject.count({
            where: { status: "ACTIVE" }
        }),
        db.loanProject.count({
            where: { status: "COMPLETED" }
        }),
        db.loanProject.count({
            where: { status: { in: ["DEFAULTED", "LATE"] } }
        }),
        db.wallet.count(),
        db.loanRepayment.findMany({
            where: { status: "PAID" },
            select: { amount: true, interest: true }
        }),
        db.investment.aggregate({
            _sum: { amount: true, interestEarned: true }
        })
    ]);

    // Calculate key metrics
    const totalFundedVolume = allProjects.reduce((sum, p) => sum + p.funded, 0);
    const totalProjectsCount = allProjects.length;
    const fundedProjects = allProjects.filter(p => p.funded > 0);

    const averageApr = fundedProjects.length > 0
        ? fundedProjects.reduce((sum, p) => sum + p.apr, 0) / fundedProjects.length
        : 0;

    const averageDuration = fundedProjects.length > 0
        ? Math.round(fundedProjects.reduce((sum, p) => sum + p.duration, 0) / fundedProjects.length)
        : 0;

    // Default rate calculation
    const projectsWithRepayments = completedProjects + defaultedProjects;
    const defaultRate = projectsWithRepayments > 0
        ? (defaultedProjects / projectsWithRepayments) * 100
        : 0;

    // Late payment rate from repayments
    const allRepaymentSchedules = await db.loanRepayment.findMany({
        select: { status: true }
    });

    const paidRepayments = allRepaymentSchedules.filter(r => r.status === "PAID").length;
    const lateRepayments = allRepaymentSchedules.filter(r => r.status === "LATE").length;
    const totalRepaymentsDue = allRepaymentSchedules.filter(r => r.status !== "PENDING").length;

    const latePaymentRate = totalRepaymentsDue > 0
        ? (lateRepayments / totalRepaymentsDue) * 100
        : 0;

    const onTimePaymentRate = totalRepaymentsDue > 0
        ? (paidRepayments / totalRepaymentsDue) * 100
        : 100;

    // Total returns distributed
    const totalReturnsDistributed = repayments.reduce((sum, r) => sum + (r.interest || 0), 0);

    // Average actual return
    const totalInvested = investments._sum.amount || 0;
    const totalInterestEarned = investments._sum.interestEarned || 0;
    const averageActualReturn = totalInvested > 0
        ? (totalInterestEarned / totalInvested) * 100
        : 0;

    // Calculate monthly stats for the last 6 months
    const monthlyStats: PlatformStats['monthlyStats'] = [];
    for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const monthProjects = allProjects.filter(p =>
            p.createdAt >= monthStart && p.createdAt <= monthEnd
        );

        const monthRepayments = await db.loanRepayment.aggregate({
            where: {
                paidAt: { gte: monthStart, lte: monthEnd }
            },
            _sum: { amount: true }
        });

        monthlyStats.push({
            month: monthStart.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
            fundedVolume: monthProjects.reduce((sum, p) => sum + p.funded, 0),
            projectsCount: monthProjects.length,
            repayments: monthRepayments._sum.amount || 0
        });
    }

    return {
        totalFundedVolume,
        totalProjectsCount,
        activeProjectsCount: activeProjects,
        completedProjectsCount: completedProjects,
        averageApr: Math.round(averageApr * 10) / 10,
        averageDuration,
        totalInvestors: walletCount,
        defaultRate: Math.round(defaultRate * 100) / 100,
        latePaymentRate: Math.round(latePaymentRate * 100) / 100,
        onTimePaymentRate: Math.round(onTimePaymentRate * 100) / 100,
        totalReturnsDistributed,
        averageActualReturn: Math.round(averageActualReturn * 100) / 100,
        monthlyStats
    };
}

// ========================================
// PROJECT RISK BREAKDOWN
// ========================================

export async function getProjectRiskBreakdown() {
    const projects = await db.loanProject.groupBy({
        by: ['riskGrade'],
        _count: true,
        _sum: { funded: true },
        where: { funded: { gt: 0 } }
    });

    const riskLabels: Record<string, { label: string; color: string }> = {
        A: { label: "Grade A - Faible", color: "#10b981" },
        B: { label: "Grade B - Modéré", color: "#f59e0b" },
        C: { label: "Grade C - Élevé", color: "#f97316" },
        D: { label: "Grade D - Très Élevé", color: "#ef4444" }
    };

    return projects.map(p => ({
        grade: p.riskGrade,
        label: riskLabels[p.riskGrade]?.label || p.riskGrade,
        color: riskLabels[p.riskGrade]?.color || "#6b7280",
        count: p._count,
        volume: p._sum.funded || 0
    }));
}

// ========================================
// PROJECT TYPE BREAKDOWN
// ========================================

export async function getProjectTypeBreakdown() {
    const projects = await db.loanProject.groupBy({
        by: ['projectType'],
        _count: true,
        _sum: { funded: true },
        where: { funded: { gt: 0 } }
    });

    const typeLabels: Record<string, string> = {
        REAL_ESTATE: "Immobilier",
        RENOVATION: "Rénovation",
        BUSINESS: "Commerce",
        GREEN_ENERGY: "Énergie Verte",
        OTHER: "Autre"
    };

    return projects.map(p => ({
        type: p.projectType,
        label: typeLabels[p.projectType || "OTHER"] || p.projectType,
        count: p._count,
        volume: p._sum.funded || 0
    }));
}
