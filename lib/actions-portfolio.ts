"use server";

import { prisma as db } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// ========================================
// UPCOMING REPAYMENTS CALENDAR
// ========================================

export interface UpcomingRepayment {
    id: string;
    loanId: string;
    loanTitle: string;
    dueDate: Date;
    amount: number;
    principal: number;
    interest: number;
    status: string;
    investedAmount: number;
    yourShare: number; // Pro-rata share of repayment
}

export async function getUpcomingRepaymentsCalendar(months: number = 12) {
    const user = await getCurrentUser();
    if (!user) return [];

    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    // Get user's investments with loan repayment schedules
    const investments = await db.investment.findMany({
        where: {
            wallet: { userId: user.id },
            status: "ACTIVE"
        },
        include: {
            loan: {
                include: {
                    repayments: {
                        where: {
                            dueDate: { gte: now, lte: endDate },
                            status: { not: "PAID" }
                        },
                        orderBy: { dueDate: "asc" }
                    }
                }
            }
        }
    });

    // Calculate pro-rata share for each repayment
    const upcomingRepayments: UpcomingRepayment[] = [];

    for (const inv of investments) {
        const loan = inv.loan;
        if (!loan || !loan.repayments) continue;

        // Calculate investor's share of the loan
        const investorShare = loan.funded > 0 ? inv.amount / loan.funded : 0;

        for (const repayment of loan.repayments) {
            upcomingRepayments.push({
                id: repayment.id,
                loanId: loan.id,
                loanTitle: loan.title,
                dueDate: repayment.dueDate,
                amount: repayment.amount,
                principal: repayment.principal,
                interest: repayment.interest,
                status: repayment.status,
                investedAmount: inv.amount,
                yourShare: Math.round(repayment.amount * investorShare * 100) / 100
            });
        }
    }

    // Sort by due date
    return upcomingRepayments.sort((a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
}

// ========================================
// MONTHLY CASH FLOW PROJECTION
// ========================================

export interface MonthlyProjection {
    month: string;
    monthDate: Date;
    expectedPrincipal: number;
    expectedInterest: number;
    totalExpected: number;
    repaymentCount: number;
}

export async function getMonthlyCashFlowProjection(months: number = 12) {
    const repayments = await getUpcomingRepaymentsCalendar(months);

    // Group by month
    const monthly: Record<string, MonthlyProjection> = {};

    for (const rep of repayments) {
        const date = new Date(rep.dueDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthly[monthKey]) {
            monthly[monthKey] = {
                month: date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
                monthDate: new Date(date.getFullYear(), date.getMonth(), 1),
                expectedPrincipal: 0,
                expectedInterest: 0,
                totalExpected: 0,
                repaymentCount: 0
            };
        }

        // Use pro-rata shares
        const principalShare = rep.principal * (rep.yourShare / rep.amount);
        const interestShare = rep.interest * (rep.yourShare / rep.amount);

        monthly[monthKey].expectedPrincipal += principalShare;
        monthly[monthKey].expectedInterest += interestShare;
        monthly[monthKey].totalExpected += rep.yourShare;
        monthly[monthKey].repaymentCount += 1;
    }

    return Object.values(monthly).sort((a, b) =>
        a.monthDate.getTime() - b.monthDate.getTime()
    );
}

// ========================================
// TAX REPORT GENERATION
// ========================================

export interface TaxReportData {
    year: number;
    totalInterestReceived: number;
    totalPrincipalReceived: number;
    investmentCount: number;
    completedLoans: number;
    activeLoans: number;
    investments: {
        loanTitle: string;
        investedAmount: number;
        interestReceived: number;
        principalReceived: number;
        status: string;
        startDate: Date;
        endDate?: Date;
    }[];
    // French tax specific fields
    prelevement: number; // 12.8% flat tax
    csg: number; // 17.2% social contributions
    totalTax: number; // 30% total
    netAfterTax: number;
}

export async function generateTaxReport(year: number): Promise<TaxReportData | null> {
    const user = await getCurrentUser();
    if (!user) return null;

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    // Get all investments for the user
    const investments = await db.investment.findMany({
        where: {
            wallet: { userId: user.id }
        },
        include: {
            loan: {
                include: {
                    repayments: {
                        where: {
                            paidAt: { gte: startOfYear, lte: endOfYear }
                        }
                    }
                }
            }
        }
    });

    const wallet = await db.wallet.findUnique({
        where: { userId: user.id }
    });

    if (!wallet) return null;

    // Calculate totals
    let totalInterestReceived = 0;
    let totalPrincipalReceived = 0;
    let completedLoans = 0;
    let activeLoans = 0;

    const investmentDetails: TaxReportData['investments'] = [];

    for (const inv of investments) {
        const loan = inv.loan;
        if (!loan) continue;

        // Calculate investor's share
        const investorShare = loan.funded > 0 ? inv.amount / loan.funded : 0;

        // Calculate received amounts from paid repayments in this year
        let interestReceived = 0;
        let principalReceived = 0;

        for (const rep of loan.repayments) {
            interestReceived += rep.interest * investorShare;
            principalReceived += rep.principal * investorShare;
        }

        totalInterestReceived += interestReceived;
        totalPrincipalReceived += principalReceived;

        if (inv.status === "COMPLETED") completedLoans++;
        if (inv.status === "ACTIVE") activeLoans++;

        investmentDetails.push({
            loanTitle: loan.title,
            investedAmount: inv.amount,
            interestReceived: Math.round(interestReceived * 100) / 100,
            principalReceived: Math.round(principalReceived * 100) / 100,
            status: inv.status,
            startDate: inv.createdAt,
            endDate: inv.status === "COMPLETED" ? inv.updatedAt : undefined
        });
    }

    // French tax calculation (30% flat tax "PFU" = 12.8% IR + 17.2% PS)
    const prelevement = Math.round(totalInterestReceived * 0.128 * 100) / 100;
    const csg = Math.round(totalInterestReceived * 0.172 * 100) / 100;
    const totalTax = Math.round((prelevement + csg) * 100) / 100;
    const netAfterTax = Math.round((totalInterestReceived - totalTax) * 100) / 100;

    return {
        year,
        totalInterestReceived: Math.round(totalInterestReceived * 100) / 100,
        totalPrincipalReceived: Math.round(totalPrincipalReceived * 100) / 100,
        investmentCount: investments.length,
        completedLoans,
        activeLoans,
        investments: investmentDetails,
        prelevement,
        csg,
        totalTax,
        netAfterTax
    };
}

// ========================================
// EXPORT TAX REPORT AS PDF DATA
// ========================================

export async function getTaxReportForExport(year: number) {
    const report = await generateTaxReport(year);
    if (!report) return null;

    const user = await getCurrentUser();
    if (!user) return null;

    return {
        ...report,
        generatedAt: new Date().toISOString(),
        userName: user.name || "Investisseur",
        userEmail: user.email,
        platform: "Transpareo P2P",
        disclaimer: "Ce document est fourni à titre informatif pour votre déclaration fiscale. Veuillez le vérifier avec un conseiller fiscal."
    };
}

// ========================================
// PORTFOLIO PERFORMANCE METRICS
// ========================================

export async function getPortfolioPerformanceMetrics() {
    const user = await getCurrentUser();
    if (!user) return null;

    const wallet = await db.wallet.findUnique({
        where: { userId: user.id }
    });

    if (!wallet) return null;

    const investments = await db.investment.findMany({
        where: { wallet: { userId: user.id } },
        include: {
            loan: {
                select: {
                    apr: true,
                    duration: true,
                    status: true,
                    riskGrade: true,
                    projectType: true
                }
            }
        }
    });

    const activeInvestments = investments.filter(i => i.status === "ACTIVE");
    const totalInvested = investments.reduce((sum, i) => sum + i.amount, 0);
    const totalEarned = investments.reduce((sum, i) => sum + (i.interestEarned || 0), 0);

    // Calculate weighted average APR
    const weightedAPR = totalInvested > 0
        ? investments.reduce((sum, i) => sum + (i.loan?.apr || 0) * i.amount, 0) / totalInvested
        : 0;

    // Calculate IRR approximation (simplified)
    const effectiveReturn = totalInvested > 0 ? (totalEarned / totalInvested) * 100 : 0;

    // Calculate diversification score (0-100)
    const types = new Set(investments.map(i => i.loan?.projectType).filter(Boolean));
    const grades = new Set(investments.map(i => i.loan?.riskGrade).filter(Boolean));
    const diversificationScore = Math.min(100,
        (types.size * 15) + (grades.size * 10) + (Math.min(investments.length, 10) * 5)
    );

    return {
        totalInvested,
        totalEarned,
        activeCount: activeInvestments.length,
        totalCount: investments.length,
        weightedAPR: Math.round(weightedAPR * 100) / 100,
        effectiveReturn: Math.round(effectiveReturn * 100) / 100,
        diversificationScore,
        projectTypesCount: types.size,
        riskGradesCount: grades.size
    };
}
