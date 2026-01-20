"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, TrendingUp, Zap, Globe, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const FEATURES = [
    {
        id: "security",
        label: "Sécurité",
        icon: ShieldCheck,
        title: "Sécurité Maximale",
        heading: "Audit & Séquestre",
        description: "Hypothèque de 1er rang et fonds séquestrés. Rien n'est laissé au hasard.",
        longDescription: "Nos ingénieurs et experts juridiques auditent chaque dossier sur plus de 150 points de contrôle. La garantie hypothécaire est prise devant notaire avant tout déblocage de fonds.",
        image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", // Construction/Blueprint/Engineer
        bullets: ["Hypothèque notariée", "Audit strict (5%)", "Fonds séquestrés"]
    },
    {
        id: "yield",
        label: "Performance",
        icon: TrendingUp,
        title: "Rendements Élevés",
        heading: "8% à 12% / an",
        description: "La performance du Private Equity, enfin accessible à partir de 100€.",
        longDescription: "Profitez de rendements historiquement réservés aux investisseurs institutionnels. Les intérêts sont calculés mensuellement et versés directement sur votre wallet.",
        image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        bullets: ["Objectif 10-12%", "Revenus mensuels", "Fiscalité Flat Tax"]
    },
    {
        id: "speed",
        label: "Simplicité",
        icon: Zap,
        title: "100% Digital",
        heading: "Investir en 2 min",
        description: "Fini la paperasse. Souscription ultra-rapide et signature électronique.",
        longDescription: "Notre parcours de souscription est entièrement dématérialisé. Signez vos contrats via DocuSign et suivez l'évolution de vos chantiers en temps réel depuis votre tableau de bord.",
        image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        bullets: ["zéro paperasse", "Signature eIDAS", "Suivi temps réel"]
    },
    {
        id: "impact",
        label: "Impact",
        icon: Globe,
        title: "Économie Réelle",
        heading: "Financez l'avenir",
        description: "Participez concrètement à la construction de logements et à la rénovation.",
        longDescription: "En finançant des marchands de biens locaux, vous contribuez directement à la résorption de la crise du logement et à l'amélioration de la performance énergétique du parc français.",
        image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        bullets: ["Logements neufs", "Rénovation DPE", "Circuit court"]
    }
];

export function ExpandingFeatures() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [expandedCardIndex, setExpandedCardIndex] = useState<number | null>(null);

    const handleMouseLeave = () => {
        setHoveredIndex(null);
        setExpandedCardIndex(null); // Reset "See More" on leave
    };

    return (
        <section className="py-20 bg-zinc-50 dark:bg-black overflow-hidden intro-y">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-3">
                        L'investissement <span className="text-orange-600">Nouvelle Génération</span>
                    </h2>
                    <p className="text-base text-zinc-500">
                        Une expérience repensée pour ceux qui exigent sécurité, rendement et fluidité.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 h-[500px] w-full max-w-6xl mx-auto">
                    {FEATURES.map((feature, index) => {
                        const isHovered = hoveredIndex === index;
                        const isTextExpanded = expandedCardIndex === index;

                        return (
                            <motion.div
                                key={feature.id}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={handleMouseLeave}
                                layout
                                className={cn(
                                    "relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 ease-in-out group",
                                    hoveredIndex === null ? "lg:flex-1" : isHovered ? "lg:flex-[3]" : "lg:flex-[0.5]"
                                )}
                            >
                                {/* Background Image */}
                                <Image
                                    src={feature.image}
                                    alt={feature.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />

                                {/* Overlay - Adjusted for text readability */}
                                <div className={cn(
                                    "absolute inset-0 bg-black/40 transition-colors duration-500",
                                    isHovered ? "bg-black/50" : "bg-black/60"
                                )} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                {/* Content */}
                                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                                    {/* Icon */}
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white backdrop-blur-md bg-white/10 border border-white/20 transition-all duration-300",
                                        isHovered ? "scale-100" : "scale-90"
                                    )}>
                                        <feature.icon size={24} />
                                    </div>

                                    {/* Title */}
                                    <motion.div layout className="mb-2">
                                        <h3 className="text-2xl font-bold text-white leading-tight">
                                            {feature.title}
                                        </h3>
                                        <p className={cn(
                                            "text-white/80 font-medium transition-all duration-300",
                                            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 hidden lg:block"
                                        )}>
                                            {feature.heading}
                                        </p>
                                    </motion.div>

                                    {/* Description Area */}
                                    <div className={cn(
                                        "border-t border-white/20 pt-4 mt-2 overflow-hidden transition-all duration-500",
                                        isHovered || hoveredIndex === null && index === 0 ? "opacity-100 max-h-[400px]" : "lg:opacity-0 lg:max-h-0 opacity-100 max-h-[400px]"
                                    )}>
                                        <p className="text-white/80 text-sm mb-3 leading-relaxed">
                                            {feature.description}
                                        </p>

                                        {/* Expandable Text */}
                                        <div className={cn(
                                            "overflow-hidden transition-all duration-500 ease-in-out",
                                            isTextExpanded ? "max-h-40 opacity-100 mb-4" : "max-h-0 opacity-0"
                                        )}>
                                            <p className="text-white/70 text-xs leading-relaxed">
                                                {feature.longDescription}
                                            </p>
                                        </div>

                                        {/* Toggle Button */}
                                        {isHovered && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setExpandedCardIndex(isTextExpanded ? null : index);
                                                }}
                                                className="text-orange-400 text-xs font-bold hover:text-orange-300 transition-colors mb-4 flex items-center gap-1"
                                            >
                                                {isTextExpanded ? "Voir moins" : "Voir plus"}
                                            </button>
                                        )}

                                        <div className="space-y-2">
                                            {feature.bullets.map((bullet, i) => (
                                                <div key={i} className="flex items-center gap-2 text-white/90 text-sm">
                                                    <CheckCircle2 size={14} className={cn(
                                                        feature.id === "security" ? "text-emerald-400" :
                                                            feature.id === "yield" ? "text-orange-400" :
                                                                feature.id === "speed" ? "text-blue-400" : "text-purple-400"
                                                    )} />
                                                    <span>{bullet}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

