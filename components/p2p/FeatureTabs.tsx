"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, TrendingUp, Zap, Globe, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
    {
        id: "security",
        label: "Sécurité Maximale",
        icon: ShieldCheck,
        title: "Votre capital, sécurisé par le réel.",
        description: "Nous ne laissons rien au hasard. Chaque projet est une forteresse juridique et financière.",
        bullets: [
            "Hypothèque de 1er rang inscrite par notaire sur chaque bien.",
            "Fonds séquestrés chez un prestataire agréé (MangoPay).",
            "Audit rigoureux : seulement 5% des dossiers acceptés.",
            "Transparence totale sur les risques (Note A à C)."
        ],
        gradient: "from-emerald-500 to-teal-500"
    },
    {
        id: "yield",
        label: "Performance",
        icon: TrendingUp,
        title: "Des rendements qui changent la donne.",
        description: "Dites adieu aux 3% du Livret A. Visez la performance du Private Equity, accessible à tous.",
        bullets: [
            "Taux annuel cible entre 8% et 12%.",
            "Intérêts versés mensuellement ou in fine.",
            "Aucun frais d'entrée ni de sortie pour l'investisseur.",
            "Fiscalité avantageuse (Flat Tax 30%)."
        ],
        gradient: "from-orange-500 to-amber-500"
    },
    {
        id: "speed",
        label: "Simplicité",
        icon: Zap,
        title: "L'investissement immobilier, sans les notaires.",
        description: "Nous avons supprimé la complexité administrative. Vous investissez, nous gérons tout le reste.",
        bullets: [
            "Souscription 100% en ligne en 2 minutes.",
            "Signature électronique sécurisée.",
            "Tableau de bord de suivi en temps réel.",
            "Remboursements automatisés sur votre wallet."
        ],
        gradient: "from-blue-500 to-indigo-500"
    },
    {
        id: "impact",
        label: "Impact Réel",
        icon: Globe,
        title: "Donnez du sens à votre épargne.",
        description: "Ne laissez pas votre argent dormir. Financez l'économie réelle et la transition énergétique.",
        bullets: [
            "Construction de logements neufs en zone tendue.",
            "Rénovation énergétique de bâtiments anciens (DPE A/B).",
            "Soutien aux marchands de biens locaux.",
            "Vous savez exactement où va chaque euro."
        ],
        gradient: "from-purple-500 to-pink-500"
    }
];

export function FeatureTabs() {
    const [activeTab, setActiveTab] = useState(FEATURES[0]);

    return (
        <section className="py-32 bg-zinc-50 dark:bg-black">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-16 md:text-center max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                            Pourquoi choisir <span className="text-orange-600">Transpareo</span> ?
                        </h2>
                        <p className="text-zinc-500 text-lg">
                            Une plateforme construite pour allier la sécurité de la pierre à la agilité du numérique.
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Left Column: Navigation Tabs */}
                        <div className="lg:w-1/3 flex flex-col gap-2">
                            {FEATURES.map((feature) => (
                                <button
                                    key={feature.id}
                                    onClick={() => setActiveTab(feature)}
                                    className={cn(
                                        "group text-left p-6 rounded-2xl transition-all duration-300 border border-transparent relative overflow-hidden",
                                        activeTab.id === feature.id
                                            ? "bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-200/50 dark:shadow-zinc-900/50 border-zinc-200 dark:border-zinc-800"
                                            : "hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
                                    )}
                                >
                                    <div className="relative z-10 flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300",
                                            activeTab.id === feature.id
                                                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                                                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white"
                                        )}>
                                            <feature.icon size={20} />
                                        </div>
                                        <span className={cn(
                                            "font-bold text-lg transition-colors",
                                            activeTab.id === feature.id ? "text-zinc-900 dark:text-white" : "text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300"
                                        )}>
                                            {feature.label}
                                        </span>
                                    </div>

                                    {/* Progress line for active tab */}
                                    {activeTab.id === feature.id && (
                                        <motion.div
                                            layoutId="active-pill"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-orange-600 rounded-r-full"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Right Column: Dynamic Content */}
                        <div className="lg:w-2/3">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="h-full bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 md:p-12 shadow-2xl relative overflow-hidden"
                                >
                                    {/* Gradient Blob Background */}
                                    <div className={cn("absolute top-0 right-0 w-96 h-96 bg-gradient-to-br opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none", activeTab.gradient)} />

                                    <div className="relative z-10">
                                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 bg-gradient-to-br text-white shadow-lg", activeTab.gradient)}>
                                            <activeTab.icon size={28} />
                                        </div>

                                        <h3 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-6 leading-tight">
                                            {activeTab.title}
                                        </h3>

                                        <div className="space-y-6">
                                            <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed">
                                                {activeTab.description}
                                            </p>

                                            <ul className="space-y-4 pt-4">
                                                {activeTab.bullets.map((bullet, i) => (
                                                    <motion.li
                                                        key={i}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.1 + (i * 0.1) }}
                                                        className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300"
                                                    >
                                                        <CheckCircle2 size={20} className="text-orange-500 shrink-0 mt-0.5" />
                                                        <span>{bullet}</span>
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

