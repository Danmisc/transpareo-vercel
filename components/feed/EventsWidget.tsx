"use client";

import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EventsWidget() {
    return (
        <div className="glass-card rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Événements
                </h3>
                <Button variant="ghost" size="sm" className="h-6 text-[10px] text-muted-foreground">Voir tout</Button>
            </div>

            <div className="space-y-4">
                {/* Event 1 */}
                <div className="flex gap-3 group cursor-pointer">
                    <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex flex-col items-center justify-center shrink-0 border border-orange-200 dark:border-orange-800">
                        <span className="text-[10px] font-bold uppercase">Jan</span>
                        <span className="text-lg font-bold leading-none">12</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">Salon de l'Immobilier</h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" /> Paris Expo
                        </p>
                        <div className="flex -space-x-1.5 mt-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-5 w-5 rounded-full border border-white dark:border-zinc-900 bg-zinc-200 dark:bg-zinc-800" />
                            ))}
                            <span className="text-[9px] text-muted-foreground pl-2 self-center">+42 intéressés</span>
                        </div>
                    </div>
                </div>

                {/* Event 2 */}
                <div className="flex gap-3 group cursor-pointer">
                    <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex flex-col items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
                        <span className="text-[10px] font-bold uppercase">Jan</span>
                        <span className="text-lg font-bold leading-none">15</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">Webinar: Investir en 2026</h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <span className="relative flex h-2 w-2 mr-0.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            En ligne
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
