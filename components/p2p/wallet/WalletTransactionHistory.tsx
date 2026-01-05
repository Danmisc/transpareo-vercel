"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isToday, isYesterday } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowDownLeft, ArrowUpRight, Search, Coffee, ShoppingBag, Landmark, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface WalletTransactionHistoryProps {
    transactions: any[];
}

// Mock brand detection helper
const getTransactionMeta = (tx: any) => {
    if (tx.type === 'DEPOSIT') return {
        icon: <Landmark size={18} />,
        color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
        label: "Rechargement",
        brand: "Transpareo Bank"
    };
    if (tx.type === 'INVESTMENT') return {
        icon: <Zap size={18} />,
        color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
        label: "Investissement",
        brand: "Immobilier Lyon 3e" // Mock project name
    };
    // Mocking generic spending/withdrawal
    return {
        icon: <ArrowUpRight size={18} />,
        color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
        label: "Virement Sortant",
        brand: "Compte Bancaire"
    };
};

export function WalletTransactionHistory({ transactions }: WalletTransactionHistoryProps) {
    if (transactions.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-zinc-900/50 rounded-[32px] border border-dashed border-zinc-200 dark:border-white/10">
                <p className="text-zinc-500">Aucune transaction.</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="space-y-1">
                {transactions.map((tx) => {
                    const meta = getTransactionMeta(tx);
                    return (
                        <div key={tx.id} className="group flex items-center justify-between py-4 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer px-2 -mx-2 rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${meta.color.replace('bg-', 'bg-opacity-10 bg-')}`}>
                                    {meta.icon}
                                </div>

                                <div className="flex flex-col">
                                    <span className="font-medium text-sm text-zinc-900 dark:text-white">
                                        {meta.brand}
                                    </span>
                                    <span className="text-xs text-zinc-500">
                                        {meta.label} • {isToday(new Date(tx.createdAt)) ? "Aujourd'hui" : format(new Date(tx.createdAt), "d MMM", { locale: fr })}
                                    </span>
                                </div>
                            </div>

                            <div className="text-right">
                                <span className={`font-mono text-sm font-medium ${tx.type === 'DEPOSIT' || tx.type === 'REPAYMENT_RECEIVED'
                                    ? 'text-zinc-900 dark:text-zinc-100'
                                    : 'text-zinc-900 dark:text-zinc-100'
                                    }`}>
                                    {tx.type === 'DEPOSIT' || tx.type === 'REPAYMENT_RECEIVED' ? '+' : '-'}
                                    {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} €
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination / Footer can go here if needed */}
        </div>
    );
}
