"use client";

import { motion } from "framer-motion";
import { Eye, Crown, Search, MessageCircle, TrendingUp, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
    {
        icon: Eye,
        title: "Qui a vu ton profil",
        description: "Accédez à la liste complète des propriétaires et agences qui consultent votre dossier. Transformez chaque vue en opportunité.",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        colSpan: "lg:col-span-2"
    },
    {
        icon: Crown,
        title: "Badge Pro Vérifié",
        description: "Multipliez votre crédibilité par trois avec un badge certifié qui rassure instantanément les bailleurs et investisseurs.",
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        colSpan: "lg:col-span-1"
    },
    {
        icon: Search,
        title: "Candidature Prioritaire",
        description: "Votre dossier apparaît systématiquement en haut de la pile. Soyez le premier vu, le premier rappelé.",
        color: "text-green-500",
        bg: "bg-green-500/10",
        colSpan: "lg:col-span-1"
    },
    {
        icon: MessageCircle,
        title: "Contact Direct",
        description: "Échangez directement avec les propriétaires sans intermédiaire. Zéro friction, zéro attente.",
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        colSpan: "lg:col-span-1"
    },
    {
        icon: TrendingUp,
        title: "P2P Avant-Première",
        description: "Accédez aux opportunités d'investissement P2P les plus rentables 48h avant tout le monde.",
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        colSpan: "lg:col-span-1"
    }
];

export function PricingFeatures() {
    return (
        <section className="pt-12 pb-24 px-4 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-16">
                    <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">
                        Tout inclus dans votre réussite.
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl text-lg">
                        Des outils puissants conçus pour accélérer vos transactions immobilières.
                    </p>
                </div>

                {/* Clean Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: idx * 0.1, duration: 0.4 }}
                            className={cn(
                                "group p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 flex flex-col items-start",
                                feature.colSpan
                            )}
                        >
                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-5 transition-colors group-hover:bg-white dark:group-hover:bg-zinc-800", feature.bg)}>
                                <feature.icon className={cn("w-5 h-5", feature.color)} />
                            </div>

                            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">
                                {feature.title}
                            </h3>

                            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                {feature.description}
                            </p>

                            {/* Optional: Subtle Arrow interaction */}
                            {idx === 0 && ( // Example for the main feature
                                <div className="mt-auto pt-4 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                    En savoir plus <ArrowRight className="w-4 h-4 ml-1" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
