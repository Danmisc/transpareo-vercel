"use client";

import { TrendingUp, TrendingDown, AlertTriangle, Clock, DollarSign, PieChart } from "lucide-react";

interface CategoryStat {
    category: string;
    count: number;
    amount: number;
}

interface TypeStat {
    type: string;
    count: number;
    amount: number;
}

interface TransactionStatsProps {
    stats: {
        period: string;
        totalCount: number;
        totalVolume: number;
        byCategory: CategoryStat[];
        byType: TypeStat[];
        flaggedCount: number;
    } | null;
}

const PERIOD_LABELS: Record<string, string> = {
    day: "Aujourd'hui",
    week: "Cette semaine",
    month: "Ce mois",
    year: "Cette année"
};

export function TransactionStats({ stats }: TransactionStatsProps) {
    if (!stats) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-zinc-100 dark:bg-zinc-800 rounded-xl h-24 animate-pulse" />
                ))}
            </div>
        );
    }

    const deposits = stats.byType.find(t => t.type === "DEPOSIT");
    const withdrawals = stats.byType.filter(t =>
        ["WITHDRAWAL", "FEE", "INVESTMENT"].includes(t.type)
    ).reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Volume */}
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-indigo-100 text-sm font-medium">Volume Total</span>
                    <DollarSign size={18} className="text-indigo-200" />
                </div>
                <p className="text-2xl font-bold tracking-tight">
                    {Math.abs(stats.totalVolume).toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0
                    })}
                </p>
                <p className="text-indigo-200 text-xs mt-1">{PERIOD_LABELS[stats.period]}</p>
            </div>

            {/* Transactions Count */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-zinc-500 text-sm font-medium">Transactions</span>
                    <PieChart size={18} className="text-zinc-400" />
                </div>
                <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    {stats.totalCount}
                </p>
                <p className="text-zinc-400 text-xs mt-1">{stats.byCategory.length} catégories</p>
            </div>

            {/* Entrées */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-zinc-500 text-sm font-medium">Entrées</span>
                    <TrendingUp size={18} className="text-emerald-500" />
                </div>
                <p className="text-2xl font-bold tracking-tight text-emerald-600">
                    +{(deposits?.amount || 0).toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0
                    })}
                </p>
                <p className="text-zinc-400 text-xs mt-1">{deposits?.count || 0} opérations</p>
            </div>

            {/* Sorties */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-zinc-500 text-sm font-medium">Sorties</span>
                    <TrendingDown size={18} className="text-red-500" />
                </div>
                <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    -{withdrawals.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0
                    })}
                </p>
                <p className="text-zinc-400 text-xs mt-1">Dépenses & Frais</p>
            </div>

            {/* Flagged */}
            <div className={`rounded-xl p-4 ${stats.flaggedCount > 0
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'}`}
            >
                <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${stats.flaggedCount > 0 ? 'text-red-600' : 'text-zinc-500'}`}>
                        À vérifier
                    </span>
                    <AlertTriangle size={18} className={stats.flaggedCount > 0 ? "text-red-500" : "text-zinc-400"} />
                </div>
                <p className={`text-2xl font-bold tracking-tight ${stats.flaggedCount > 0 ? 'text-red-600' : 'text-zinc-900 dark:text-white'}`}>
                    {stats.flaggedCount}
                </p>
                <p className={`text-xs mt-1 ${stats.flaggedCount > 0 ? 'text-red-500' : 'text-zinc-400'}`}>
                    {stats.flaggedCount > 0 ? 'Revue requise' : 'Aucune alerte'}
                </p>
            </div>
        </div>
    );
}
