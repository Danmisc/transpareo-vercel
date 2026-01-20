"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";

export function ProBanner() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="relative overflow-hidden rounded-xl p-5 mb-6 group cursor-pointer border border-transparent hover:border-amber-500/30 transition-all duration-300">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black dark:from-zinc-100 dark:via-white dark:to-zinc-200" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

            {/* Decoratiive Glows */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl transform -translate-x-1/3 translate-y-1/3" />

            {/* Close Button */}
            <button
                onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
                className="absolute top-2 right-2 p-1 rounded-full text-zinc-500 hover:text-white dark:hover:text-black hover:bg-white/10 dark:hover:bg-black/10 transition-colors z-20"
            >
                <X className="w-3 h-3" />
            </button>

            <div className="relative z-10 flex flex-col gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-900/20">
                    <Sparkles className="h-5 w-5 text-white" />
                </div>

                <div>
                    <h3 className="text-white dark:text-zinc-900 font-bold text-lg leading-tight">
                        Passez au niveau Pro
                    </h3>
                    <p className="text-zinc-400 dark:text-zinc-600 text-xs mt-1">
                        Outils exclusifs, analyses de marché et visibilité boostée.
                    </p>
                </div>

                <Button size="sm" className="w-full bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold shadow-xl border-0 mt-1">
                    Découvrir l'offre
                </Button>
            </div>
        </div>
    );
}

