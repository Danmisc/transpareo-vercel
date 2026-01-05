"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Users, Home, TrendingUp } from "lucide-react";

export function ImpactDashboard() {
    return (
        <div className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-6">
                <Card className="bg-emerald-900 text-white border-none shadow-xl relative overflow-hidden group">
                    {/* Eco Pattern */}
                    <div className="absolute -right-6 -bottom-6 text-emerald-800/50 group-hover:text-emerald-800/70 transition-colors">
                        <Leaf size={120} />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <p className="text-emerald-300 font-medium mb-1 flex items-center gap-2"><Leaf size={16} /> CO2 Économisé</p>
                        <h3 className="text-4xl font-black">2.4 t</h3>
                        <p className="text-xs text-emerald-400 mt-2 opacity-80">Équivalent à 12 vols Paris-NY</p>
                    </CardContent>
                </Card>

                <Card className="bg-indigo-900 text-white border-none shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-6 -bottom-6 text-indigo-800/50 group-hover:text-indigo-800/70 transition-colors">
                        <Users size={120} />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <p className="text-indigo-300 font-medium mb-1 flex items-center gap-2"><Users size={16} /> Emplois Soutenus</p>
                        <h3 className="text-4xl font-black">14</h3>
                        <p className="text-xs text-indigo-400 mt-2 opacity-80">Dans 3 PME locales</p>
                    </CardContent>
                </Card>

                <Card className="bg-amber-900 text-white border-none shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-6 -bottom-6 text-amber-800/50 group-hover:text-amber-800/70 transition-colors">
                        <Home size={120} />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <p className="text-amber-300 font-medium mb-1 flex items-center gap-2"><Home size={16} /> Logements Rénovés</p>
                        <h3 className="text-4xl font-black">8</h3>
                        <p className="text-xs text-amber-400 mt-2 opacity-80">Passoires thermiques éradiquées</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Votre Empreinte d'Investisseur</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-100 dark:border-white/5 rounded-xl">
                        {/* Placeholder for a detailed Impact Chart/Map */}
                        <div className="text-center">
                            <TrendingUp size={32} className="mx-auto mb-2 text-zinc-300" />
                            <p>Graphique d'évolution annuel (bientôt disponible)</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
