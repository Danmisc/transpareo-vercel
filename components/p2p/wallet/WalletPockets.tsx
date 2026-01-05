"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Plus, PiggyBank, Plane, Umbrella, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export function WalletPockets() {
    const pockets = [
        { id: 1, name: "Impôts 2025", icon: PiggyBank, amount: 2450, goal: 4000, color: "bg-blue-500" },
        { id: 2, name: "Voyage Japon", icon: Plane, amount: 1200, goal: 5000, color: "bg-rose-500" },
        { id: 3, name: "Fonds Urgence", icon: Umbrella, amount: 5000, goal: 10000, color: "bg-amber-500" },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Coffres & Projets</h2>
                <Button variant="link" className="text-orange-600 dark:text-orange-400 md:hidden">
                    Tout voir
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* Create New Pocket */}
                <button className="h-full min-h-[160px] rounded-[32px] border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-3 text-zinc-400 hover:text-orange-500 hover:border-orange-500/50 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all group">
                    <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-orange-100 dark:group-hover:bg-orange-500/20 flex items-center justify-center transition-colors">
                        <Plus size={24} />
                    </div>
                    <span className="font-medium text-sm">Nouveau Coffre</span>
                </button>

                {/* Pocket Cards */}
                {pockets.map((pocket) => (
                    <Card key={pocket.id} className="border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900 rounded-[32px] hover:shadow-lg transition-shadow cursor-pointer group relative overflow-hidden">
                        {/* Background Splash */}
                        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-2xl ${pocket.color}`} />

                        <CardContent className="p-6 flex flex-col justify-between h-full min-h-[160px]">
                            <div className="flex justify-between items-start">
                                <div className={`h-10 w-10 rounded-2xl ${pocket.color.replace('bg-', 'bg-')}/10 ${pocket.color.replace('bg-', 'text-')} flex items-center justify-center`}>
                                    <pocket.icon size={20} />
                                </div>
                                <span className="text-xs font-bold text-zinc-400 bg-zinc-100 dark:bg-white/5 px-2 py-1 rounded-full">{Math.round((pocket.amount / pocket.goal) * 100)}%</span>
                            </div>

                            <div>
                                <h3 className="font-bold text-zinc-900 dark:text-white mb-1 group-hover:text-orange-500 transition-colors">{pocket.name}</h3>
                                <p className="text-2xl font-black text-zinc-900 dark:text-white mb-3">
                                    {pocket.amount.toLocaleString()} <span className="text-sm font-normal text-zinc-400">/ {pocket.goal.toLocaleString()}€</span>
                                </p>
                                <Progress value={(pocket.amount / pocket.goal) * 100} className="h-2 bg-zinc-100 dark:bg-white/5" indicatorClassName={pocket.color} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
