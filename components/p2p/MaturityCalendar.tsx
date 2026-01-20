"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Wallet } from "lucide-react";

interface MonthlyProjection {
    month: string;
    monthDate: Date;
    expectedPrincipal: number;
    expectedInterest: number;
    totalExpected: number;
    repaymentCount: number;
}

interface MaturityCalendarProps {
    projections: MonthlyProjection[];
}

export function MaturityCalendar({ projections }: MaturityCalendarProps) {
    if (projections.length === 0) {
        return (
            <Card className="border-zinc-200 dark:border-zinc-800">
                <CardContent className="py-8 text-center">
                    <Calendar className="mx-auto text-zinc-300 mb-3" size={32} />
                    <p className="text-zinc-500 text-sm font-medium">Aucun remboursement prévu</p>
                    <p className="text-xs text-zinc-400">Investissez dans des projets pour voir vos projections</p>
                </CardContent>
            </Card>
        );
    }

    const maxTotal = Math.max(...projections.map(p => p.totalExpected));
    const totalProjected = projections.reduce((sum, p) => sum + p.totalExpected, 0);
    const totalInterest = projections.reduce((sum, p) => sum + p.expectedInterest, 0);

    return (
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <CardHeader className="pb-3 pt-5 px-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="flex items-center gap-2 text-base font-bold">
                        <Calendar className="text-orange-500" size={18} />
                        Calendrier des Échéances
                    </CardTitle>
                    <div className="flex flex-wrap gap-3 text-xs">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span className="text-zinc-500">
                                Capital: <strong className="text-zinc-900 dark:text-white">{totalProjected.toLocaleString('fr-FR')} €</strong>
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-zinc-500">
                                Intérêts: <strong className="text-emerald-600">{totalInterest.toLocaleString('fr-FR')} €</strong>
                            </span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 px-5 pb-5">
                {projections.map((proj, i) => {
                    const now = new Date();
                    // Just a simple month check logic for UI highlighting
                    const isCurrentMonth = proj.monthDate.getMonth() === now.getMonth() &&
                        proj.monthDate.getFullYear() === now.getFullYear();

                    return (
                        <div
                            key={i}
                            className={`rounded-xl p-3 border transition-colors ${isCurrentMonth
                                ? "bg-orange-50/50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/30"
                                : "bg-zinc-50/50 dark:bg-zinc-800/30 border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm capitalize text-zinc-700 dark:text-zinc-200">{proj.month}</span>
                                    {isCurrentMonth && (
                                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none px-1.5 py-0 text-[10px] h-5">
                                            Ce mois
                                        </Badge>
                                    )}
                                    <span className="text-[10px] text-zinc-400">
                                        • {proj.repaymentCount} échéance{proj.repaymentCount > 1 ? 's' : ''}
                                    </span>
                                </div>
                                <span className="font-bold text-sm text-zinc-900 dark:text-white">
                                    {proj.totalExpected.toLocaleString('fr-FR')} €
                                </span>
                            </div>

                            <div className="relative h-2 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 mb-1.5">
                                {/* Principal bar */}
                                <div
                                    className="absolute h-full bg-blue-500"
                                    style={{
                                        width: `${maxTotal > 0 ? (proj.expectedPrincipal / maxTotal) * 100 : 0}%`
                                    }}
                                />
                                {/* Interest bar - stacked next to principal usually, but here positioned absolutely based on logic */}
                                <div
                                    className="absolute h-full bg-emerald-500"
                                    style={{
                                        left: `${maxTotal > 0 ? (proj.expectedPrincipal / maxTotal) * 100 : 0}%`,
                                        width: `${maxTotal > 0 ? (proj.expectedInterest / maxTotal) * 100 : 0}%`
                                    }}
                                />
                            </div>

                            <div className="flex justify-between text-[10px] text-zinc-400">
                                <span>Capital</span>
                                <span>Intérêts</span>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}

