"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Info, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function CreditScoreCard({ score }: { score: number }) {
    // Score range: 300 - 900
    // Percentage for gauge: (score - 300) / 600 * 100
    const percentage = Math.max(0, Math.min(100, ((score - 300) / 600) * 100));

    let status = "Faible";
    let color = "text-red-500";
    let message = "Améliorez votre profil pour emprunter.";

    if (score >= 600) { status = "Moyen"; color = "text-amber-500"; message = "Vous êtes éligible à de petits montants."; }
    if (score >= 750) { status = "Excellent"; color = "text-emerald-500"; message = "Accès aux meilleurs taux VIP."; }

    return (
        <Card className="border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center text-sm font-medium text-zinc-500 uppercase tracking-widest">
                    Score de Crédit
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger><Info size={14} /></TooltipTrigger>
                            <TooltipContent>Calculé sur la base de vos revenus et de votre historique.</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-6">
                    {/* Gauge Visual */}
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-zinc-100 dark:text-zinc-800" />
                            <circle
                                cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                                strokeDasharray="283" strokeDashoffset={283 - (percentage / 100 * 283)}
                                strokeLinecap="round" className={`transition-all duration-1000 ease-out ${color}`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-3xl font-black ${color}`}>{score}</span>
                            <span className="text-[10px] uppercase font-bold text-zinc-400">{status}</span>
                        </div>
                    </div>

                    {/* Factors and Tips */}
                    <div className="flex-1 space-y-3">
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            {message}
                        </p>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                <CheckCircle2 size={12} className="text-emerald-500" /> Identité vérifiée
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                <CheckCircle2 size={12} className="text-emerald-500" /> Revenus connectés
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                {score > 700 ? <CheckCircle2 size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-zinc-300" />}
                                Historique sans incident
                            </div>
                        </div>

                        <div className="pt-2">
                            <a href="#" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                <TrendingUp size={12} /> Comment améliorer mon score
                            </a>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

