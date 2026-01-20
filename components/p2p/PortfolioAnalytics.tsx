"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { ArrowUpRight, TrendingUp, Wallet, PieChart as PieChartIcon, Activity } from "lucide-react";

interface PortfolioAnalyticsProps {
    portfolio: any[];
}

const COLORS = ['#f97316', '#10b981', '#3b82f6', '#8b5cf6'];

export function PortfolioAnalytics({ portfolio }: PortfolioAnalyticsProps) {

    // --- Metrics Calculation ---
    const metrics = useMemo(() => {
        const totalInvested = portfolio.reduce((sum, item) => sum + item.amount, 0);
        const activeInvestments = portfolio.filter(i => i.status === 'ACTIVE').length;
        // Mocking "Interest Earned" as simple calculation for demo (e.g., 5% of invested)
        const interestEarned = totalInvested * 0.042;
        const avgYield = portfolio.length > 0
            ? portfolio.reduce((sum, item) => sum + item.loan.apr, 0) / portfolio.length
            : 0;

        return { totalInvested, activeInvestments, interestEarned, avgYield };
    }, [portfolio]);

    // --- Chart Data Preparation ---
    const allocationData = useMemo(() => {
        const grouped = portfolio.reduce((acc, item) => {
            const type = item.loan.projectType === 'REAL_ESTATE' ? 'Immobilier' : 'Entreprise';
            acc[type] = (acc[type] || 0) + item.amount;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(grouped).map(([name, value]) => ({ name, value }));
    }, [portfolio]);

    const yieldDistributionData = useMemo(() => {
        // Group by APR ranges: 0-5%, 5-8%, 8-10%, 10%+
        const ranges = { "0-5%": 0, "5-8%": 0, "8-10%": 0, "10%+": 0 };
        portfolio.forEach(item => {
            const apr = item.loan.apr;
            if (apr < 5) ranges["0-5%"] += item.amount;
            else if (apr < 8) ranges["5-8%"] += item.amount;
            else if (apr < 10) ranges["8-10%"] += item.amount;
            else ranges["10%+"] += item.amount;
        });
        return Object.entries(ranges).map(([name, value]) => ({ name, value }));
    }, [portfolio]);

    if (portfolio.length === 0) return null;

    return (
        <div className="space-y-6">

            {/* KPI Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-xl">
                            <Wallet size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 uppercase font-bold">Total Investi</p>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{metrics.totalInvested.toLocaleString()} €</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 rounded-xl">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 uppercase font-bold">Intérêts Générés</p>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-white">+{metrics.interestEarned.toFixed(2)} €</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 uppercase font-bold">Rendement Moyen</p>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{metrics.avgYield.toFixed(2)}%</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-xl">
                            <PieChartIcon size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 uppercase font-bold">Projets Actifs</p>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{metrics.activeInvestments}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-6">

                {/* Allocation Chart */}
                <Card className="border-zinc-200 dark:border-white/10">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Allocation par Secteur</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={allocationData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {allocationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Yield Distribution Chart */}
                <Card className="border-zinc-200 dark:border-white/10">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Distribution du Rendement</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={yieldDistributionData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <RechartsTooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}

