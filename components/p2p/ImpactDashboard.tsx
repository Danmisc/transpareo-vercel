"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Users, Home, TrendingUp, BarChart3 } from "lucide-react";
import { ImpactStats } from "@/lib/impact-config";

interface ImpactDashboardProps {
    stats: ImpactStats;
    history?: { name: string; co2: number; invested: number }[];
}

export function ImpactDashboard({ stats, history = [] }: ImpactDashboardProps) {
    // Format CO2 with comparison
    const co2Comparison = stats.co2Saved > 0
        ? `Équivalent à ${Math.round(stats.co2Saved * 5)} vols Paris-NY`
        : "Investissez pour générer de l'impact";

    const jobsComparison = stats.jobsSupported > 0
        ? `Dans ${Math.ceil(stats.jobsSupported / 3)} PME locales`
        : "Soutenez l'emploi local";

    const housingComparison = stats.housingRenovated > 0
        ? "Passoires thermiques éradiquées"
        : "Rénovez des logements";

    return (
        <div className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-6">
                {/* CO2 Saved */}
                <Card className="bg-emerald-900 text-white border-none shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-6 -bottom-6 text-emerald-800/50 group-hover:text-emerald-800/70 transition-colors">
                        <Leaf size={120} />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <p className="text-emerald-300 font-medium mb-1 flex items-center gap-2">
                            <Leaf size={16} /> CO2 Économisé
                        </p>
                        <h3 className="text-4xl font-black">
                            {stats.co2Saved > 0 ? stats.co2Saved.toFixed(1) : "0"} t
                        </h3>
                        <p className="text-xs text-emerald-400 mt-2 opacity-80">
                            {co2Comparison}
                        </p>
                    </CardContent>
                </Card>

                {/* Jobs Supported */}
                <Card className="bg-indigo-900 text-white border-none shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-6 -bottom-6 text-indigo-800/50 group-hover:text-indigo-800/70 transition-colors">
                        <Users size={120} />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <p className="text-indigo-300 font-medium mb-1 flex items-center gap-2">
                            <Users size={16} /> Emplois Soutenus
                        </p>
                        <h3 className="text-4xl font-black">
                            {stats.jobsSupported > 0 ? Math.round(stats.jobsSupported) : "0"}
                        </h3>
                        <p className="text-xs text-indigo-400 mt-2 opacity-80">
                            {jobsComparison}
                        </p>
                    </CardContent>
                </Card>

                {/* Housing Renovated */}
                <Card className="bg-amber-900 text-white border-none shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-6 -bottom-6 text-amber-800/50 group-hover:text-amber-800/70 transition-colors">
                        <Home size={120} />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <p className="text-amber-300 font-medium mb-1 flex items-center gap-2">
                            <Home size={16} /> Logements Rénovés
                        </p>
                        <h3 className="text-4xl font-black">
                            {stats.housingRenovated > 0 ? Math.round(stats.housingRenovated) : "0"}
                        </h3>
                        <p className="text-xs text-amber-400 mt-2 opacity-80">
                            {housingComparison}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Impact Evolution Chart */}
            <Card className="border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900">
                <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <BarChart3 size={20} className="text-emerald-500" />
                        Évolution de votre Impact
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {history.length > 0 && stats.projectCount > 0 ? (
                        <div className="space-y-4">
                            {/* Simple bar chart representation */}
                            <div className="grid grid-cols-12 gap-1 h-32 items-end">
                                {history.slice(-12).map((month, idx) => {
                                    const maxCO2 = Math.max(...history.map(h => h.co2), 0.1);
                                    const height = (month.co2 / maxCO2) * 100;
                                    return (
                                        <div key={idx} className="flex flex-col items-center gap-1">
                                            <div
                                                className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t transition-all hover:from-emerald-500 hover:to-emerald-300"
                                                style={{ height: `${Math.max(height, 5)}%` }}
                                                title={`${month.co2}t CO2 - ${month.name}`}
                                            />
                                            <span className="text-[9px] text-zinc-400">{month.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex justify-between text-xs text-zinc-500 pt-2 border-t">
                                <span>{stats.projectCount} projets financés</span>
                                <span>Total investi: {stats.totalInvested.toLocaleString('fr-FR')} €</span>
                            </div>
                        </div>
                    ) : (
                        <div className="h-48 flex items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl">
                            <div className="text-center">
                                <TrendingUp size={32} className="mx-auto mb-2 text-zinc-300" />
                                <p className="font-medium">Aucun investissement pour le moment</p>
                                <p className="text-sm mt-1">Investissez pour voir votre impact grandir</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Methodology Note */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    <strong>Méthodologie :</strong> Impact calculé selon les coefficients sectoriels ADEME et les standards ESG européens.
                    CO2 estimé par type de projet (immobilier, rénovation, énergie verte).
                </p>
            </div>
        </div>
    );
}

