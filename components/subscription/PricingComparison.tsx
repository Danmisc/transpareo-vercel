"use client";

import { motion } from "framer-motion";
import { Check, Minus, HelpCircle, Zap, Sparkles, Crown, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const COMPARISON_DATA = [
    {
        category: "Social & Réseau", features: [
            { name: "Messages / jour", free: "10", plus: "Illimité", pro: "Illimité", business: "Illimité" },
            { name: "Rejoindre des communautés", free: "3", plus: "Illimité", pro: "Illimité", business: "Illimité" },
            { name: "Qui a vu votre profil", free: false, plus: "30 jours", pro: "Illimité", business: "Illimité" },
            { name: "Mode invisible", free: false, plus: false, pro: true, business: true },
            { name: "InMails (contact direct)", free: false, plus: false, pro: "10 / mois", business: "Illimité" },
        ]
    },
    {
        category: "Logement & Candidature", features: [
            { name: "Alertes de recherche", free: "3", plus: "10", pro: "Illimité", business: "Illimité" },
            { name: "Dossier locataire", free: "Basique", plus: "Complet", pro: "Certifié", business: "Certifié" },
            { name: "Vidéo pitch", free: false, plus: "30 sec", pro: "2 min", business: "5 min" },
            { name: "Candidature prioritaire", free: false, plus: false, pro: true, business: true },
            { name: "Contact propriétaire direct", free: false, plus: false, pro: true, business: true },
        ]
    },
    {
        category: "Investissement & Gestion", features: [
            { name: "Accès P2P", free: "Standard", plus: "Standard", pro: "Avant-première 24h", business: "Avant-première 48h" },
            { name: "Dashboard Propriétaire", free: false, plus: false, pro: "5 biens", business: "Illimité" },
            { name: "Commission sur gains", free: "2%", plus: "1.5%", pro: "1%", business: "0.5%" },
            { name: "Auto-invest", free: false, plus: "Basique", pro: "Avancé", business: "Expert" },
            { name: "Export comptable", free: false, plus: false, pro: true, business: true },
        ]
    },
    {
        category: "Support & Équipe", features: [
            { name: "Membres équipe", free: "1", plus: "1", pro: "1", business: "5" },
            { name: "Support client", free: "Forum", plus: "Email", pro: "Prioritaire", business: "Dédié 24/7" },
        ]
    }
];

export function PricingComparison() {
    return (
        <section className="py-24 px-4 overflow-x-auto bg-white dark:bg-zinc-950">
            <div className="max-w-6xl mx-auto min-w-[800px]">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-4">
                        Comparaison détaillée
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Visualisez exactement ce qui différencient nos offres.
                    </p>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
                    {/* Heder Row - Sticky */}
                    <div className="grid grid-cols-5 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20 border-b border-zinc-200 dark:border-zinc-800">
                        <div className="p-6 font-semibold text-zinc-900 dark:text-zinc-100 flex items-end">Fonctionnalités</div>
                        <div className="p-6 text-center flex flex-col items-center justify-end">
                            <span className="font-bold text-zinc-900 dark:text-white mb-2">Gratuit</span>
                            <Zap className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div className="p-6 text-center flex flex-col items-center justify-end">
                            <span className="font-bold text-zinc-900 dark:text-white mb-2">Plus</span>
                            <Sparkles className="w-5 h-5 text-blue-500" />
                        </div>
                        {/* Pro Header Highlight */}
                        <div className="p-6 text-center flex flex-col items-center justify-end bg-orange-50/50 dark:bg-orange-900/10 border-x border-dashed border-orange-200 dark:border-orange-900/30">
                            <span className="font-bold text-orange-600 dark:text-orange-500 mb-2">Pro</span>
                            <Crown className="w-5 h-5 text-orange-500" />
                        </div>
                        <div className="p-6 text-center flex flex-col items-center justify-end">
                            <span className="font-bold text-zinc-900 dark:text-white mb-2">Business</span>
                            <Building2 className="w-5 h-5 text-zinc-500" />
                        </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {COMPARISON_DATA.map((section, sIdx) => (
                            <div key={sIdx}>
                                {/* Category Header */}
                                <div className="bg-zinc-50 dark:bg-zinc-900/50 px-6 py-3 border-y border-zinc-100 dark:border-zinc-800">
                                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{section.category}</span>
                                </div>
                                {/* Rows */}
                                {section.features.map((row, rIdx) => (
                                    <div
                                        key={rIdx}
                                        className="grid grid-cols-5 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors group"
                                    >
                                        <div className="p-4 px-6 text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center">
                                            {row.name}
                                            <HelpCircle className="w-3 h-3 ml-2 text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-help" />
                                        </div>

                                        {/* Render Cells */}
                                        {[row.free, row.plus, row.pro, row.business].map((val, cIdx) => (
                                            <div
                                                key={cIdx}
                                                className={cn(
                                                    "p-4 flex items-center justify-center text-sm",
                                                    cIdx !== 0 && "border-l border-zinc-100/50 dark:border-zinc-800/50",
                                                    cIdx === 2 && "bg-orange-50/10 dark:bg-orange-900/5 border-l-orange-100/50 dark:border-l-orange-900/20" // Pro Column Subtlety
                                                )}
                                            >
                                                {val === true ? (
                                                    <Check className={cn("w-5 h-5", cIdx === 2 ? "text-orange-500" : "text-zinc-900 dark:text-white")} />
                                                ) : val === false ? (
                                                    <Minus className="w-4 h-4 text-zinc-200 dark:text-zinc-700" />
                                                ) : (
                                                    <span className={cn(
                                                        "font-medium",
                                                        cIdx === 2 ? "text-orange-700 dark:text-orange-400" : "text-zinc-600 dark:text-zinc-400"
                                                    )}>
                                                        {val}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
