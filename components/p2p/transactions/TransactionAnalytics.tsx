"use client";

import { useMemo } from "react";
import {
    TrendingUp,
    TrendingDown,
    PieChart as PieChartIcon,
    BarChart3,
    Repeat,
    Building2,
    ShoppingCart,
    Zap,
    Receipt,
    Wallet,
    CreditCard
} from "lucide-react";

// Category config
const CATEGORY_CONFIG: Record<string, { icon: any; label: string; color: string; chartColor: string }> = {
    INVESTMENT: { icon: TrendingUp, label: "Investissement", color: "text-indigo-600", chartColor: "#6366f1" },
    SALARY: { icon: Building2, label: "Salaire", color: "text-emerald-600", chartColor: "#10b981" },
    SUBSCRIPTION: { icon: Repeat, label: "Abonnement", color: "text-purple-600", chartColor: "#a855f7" },
    TRANSFER: { icon: Wallet, label: "Virement", color: "text-blue-600", chartColor: "#3b82f6" },
    FEE: { icon: Receipt, label: "Frais", color: "text-red-600", chartColor: "#ef4444" },
    INTEREST: { icon: TrendingUp, label: "Intérêts", color: "text-emerald-600", chartColor: "#059669" },
    SHOPPING: { icon: ShoppingCart, label: "Achats", color: "text-orange-600", chartColor: "#f97316" },
    UTILITIES: { icon: Zap, label: "Services", color: "text-amber-600", chartColor: "#f59e0b" },
    LOAN: { icon: CreditCard, label: "Prêt", color: "text-cyan-600", chartColor: "#06b6d4" },
    OTHER: { icon: Wallet, label: "Autre", color: "text-zinc-600", chartColor: "#71717a" },
};

interface CategoryStat {
    category: string;
    count: number;
    amount: number;
}

interface TransactionAnalyticsProps {
    stats: {
        period: string;
        totalCount: number;
        totalVolume: number;
        byCategory: CategoryStat[];
        byType: { type: string; count: number; amount: number }[];
        flaggedCount: number;
    } | null;
}

export function TransactionAnalytics({ stats }: TransactionAnalyticsProps) {
    // Calculate category percentages
    const categoryData = useMemo(() => {
        if (!stats || !stats.byCategory.length) return [];

        const totalSpent = stats.byCategory
            .filter(c => c.amount < 0)
            .reduce((sum, c) => sum + Math.abs(c.amount), 0);

        return stats.byCategory
            .filter(c => c.amount < 0) // Only show expenses
            .map(c => ({
                ...c,
                config: CATEGORY_CONFIG[c.category] || CATEGORY_CONFIG.OTHER,
                percentage: totalSpent > 0 ? (Math.abs(c.amount) / totalSpent) * 100 : 0
            }))
            .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
    }, [stats]);

    // Income vs Expense
    const incomeVsExpense = useMemo(() => {
        if (!stats) return { income: 0, expense: 0 };

        const income = stats.byCategory
            .filter(c => c.amount > 0)
            .reduce((sum, c) => sum + c.amount, 0);

        const expense = stats.byCategory
            .filter(c => c.amount < 0)
            .reduce((sum, c) => sum + Math.abs(c.amount), 0);

        return { income, expense };
    }, [stats]);

    if (!stats) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl h-64 animate-pulse" />
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl h-64 animate-pulse" />
            </div>
        );
    }

    const balance = incomeVsExpense.income - incomeVsExpense.expense;
    const total = incomeVsExpense.income + incomeVsExpense.expense;
    const incomePercent = total > 0 ? (incomeVsExpense.income / total) * 100 : 50;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income vs Expense Card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                        <BarChart3 size={18} className="text-indigo-500" />
                        Revenus vs Dépenses
                    </h3>
                    <span className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                        {stats.period === 'month' ? 'Ce mois' : stats.period === 'week' ? 'Cette semaine' : stats.period}
                    </span>
                </div>

                <div className="space-y-4">
                    {/* Balance Summary */}
                    <div className="text-center p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                        <p className="text-sm text-zinc-500 mb-1">Solde net</p>
                        <p className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {balance >= 0 ? '+' : ''}{balance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-emerald-600 flex items-center gap-1">
                                <TrendingUp size={14} />
                                Revenus
                            </span>
                            <span className="font-medium">
                                {incomeVsExpense.income.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                            </span>
                        </div>
                        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                                style={{ width: `${incomePercent}%` }}
                            />
                            <div
                                className="h-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500"
                                style={{ width: `${100 - incomePercent}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-red-600 flex items-center gap-1">
                                <TrendingDown size={14} />
                                Dépenses
                            </span>
                            <span className="font-medium">
                                {incomeVsExpense.expense.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Breakdown Card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                        <PieChartIcon size={18} className="text-purple-500" />
                        Répartition des dépenses
                    </h3>
                </div>

                {categoryData.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-zinc-400">
                        <p className="text-sm">Aucune dépense ce mois</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {categoryData.slice(0, 5).map((cat) => {
                            const Icon = cat.config.icon;
                            return (
                                <div key={cat.category} className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: `${cat.config.chartColor}15` }}
                                    >
                                        <Icon size={16} style={{ color: cat.config.chartColor }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                                {cat.config.label}
                                            </span>
                                            <span className="text-zinc-600 dark:text-zinc-400">
                                                {Math.abs(cat.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${cat.percentage}%`,
                                                    backgroundColor: cat.config.chartColor
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-xs text-zinc-500 font-medium w-10 text-right">
                                        {cat.percentage.toFixed(0)}%
                                    </span>
                                </div>
                            );
                        })}

                        {categoryData.length > 5 && (
                            <p className="text-xs text-zinc-400 text-center pt-2">
                                +{categoryData.length - 5} autres catégories
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

