"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { ShieldCheck, TrendingUp, Zap, Globe, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const FEATURES = [
    {
        id: "security",
        label: "Sécurité",
        icon: ShieldCheck,
        title: "Sécurité Maximale",
        subtitle: "Votre capital, sécurisé par le réel.",
        description: "Nous ne laissons rien au hasard. Chaque projet est une forteresse juridique et financière.",
        gradient: "from-emerald-500 to-teal-500",
        // Unsplash: Vault / Lock
        image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        bullets: [
            "Hypothèque de 1er rang inscrite par notaire.",
            "Fonds séquestrés chez MangoPay (agréé ACPR).",
            "Audit rigoureux : 5% des dossiers acceptés."
        ]
    },
    {
        id: "yield",
        label: "Rendement",
        icon: TrendingUp,
        title: "Performance",
        subtitle: "Des rendements qui changent la donne.",
        description: "Dites adieu aux 3% du Livret A. Visez la performance du Private Equity, accessible à tous.",
        gradient: "from-orange-500 to-amber-500",
        // Unsplash: Growth / Chart / Coins
        image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        bullets: [
            "Taux annuel cible entre 8% et 12%.",
            "Intérêts versés mensuellement.",
            "Fiscalité avantageuse (Flat Tax 30%)."
        ]
    },
    {
        id: "speed",
        label: "Vitesse",
        icon: Zap,
        title: "Simplicité",
        subtitle: "L'investissement, sans la paperasse.",
        description: "Nous avons supprimé la complexité administrative. Vous investissez, nous gérons tout le reste.",
        gradient: "from-blue-500 to-indigo-500",
        // Unsplash: Speed / Digital / Contactless
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        bullets: [
            "Souscription 100% en ligne en 2 minutes.",
            "Signature électronique sécurisée.",
            "Tableau de bord de suivi en temps réel."
        ]
    },
    {
        id: "impact",
        label: "Impact",
        icon: Globe,
        title: "Impact Réel",
        subtitle: "Donnez du sens à votre épargne.",
        description: "Ne laissez pas votre argent dormir. Financez l'économie réelle et la transition énergétique.",
        gradient: "from-purple-500 to-pink-500",
        // Unsplash: Green Building / Architecture
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        bullets: [
            "Construction de logements en zone tendue.",
            "Rénovation énergétique (DPE A/B).",
            "Soutien à l'économie locale."
        ]
    }
];

export function StickyFeatures() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeFeature, setActiveFeature] = useState(0);

    // Track scroll progress to trigger active state change
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Update active feature based on scroll position
    useEffect(() => {
        const unsubscribe = scrollYProgress.onChange(v => {
            // Map scroll 0-1 to index 0-3
            const index = Math.min(Math.floor(v * FEATURES.length), FEATURES.length - 1);
            setActiveFeature(index);
        });
        return () => unsubscribe();
    }, [scrollYProgress]);

    return (
        <section ref={containerRef} className="relative bg-zinc-50 dark:bg-black">
            <div className="container mx-auto px-4">
                {/* Header (Top of section) */}
                <div className="py-24 max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-6">
                        Pourquoi <span className="text-orange-600">Transpareo</span> ?
                    </h2>
                    <p className="text-xl text-zinc-500">
                        Une plateforme construite pour allier la sécurité de la pierre à l'agilité du numérique.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-20">
                    {/* Left Column: Scrolling Text */}
                    <div className="lg:w-1/2 flex flex-col pb-24">
                        {FEATURES.map((feature, index) => (
                            <div key={feature.id} className="h-screen flex flex-col justify-center p-6 md:p-12">
                                <motion.div
                                    initial={{ opacity: 0.2 }}
                                    animate={{ opacity: activeFeature === index ? 1 : 0.2 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-white transition-colors duration-500 shadow-lg",
                                        activeFeature === index ? `bg-gradient-to-br ${feature.gradient}` : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400"
                                    )}>
                                        <feature.icon size={24} />
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                                        {feature.title}
                                    </h3>
                                    <h4 className="text-xl font-medium text-orange-600 mb-6">
                                        {feature.subtitle}
                                    </h4>
                                    <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">
                                        {feature.description}
                                    </p>
                                    <ul className="space-y-4">
                                        {feature.bullets.map((bullet, i) => (
                                            <li key={i} className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300">
                                                <CheckCircle2 size={20} className={cn("shrink-0 mt-0.5 transition-colors duration-500", activeFeature === index ? "text-orange-600" : "text-zinc-300")} />
                                                <span>{bullet}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            </div>
                        ))}
                    </div>

                    {/* Right Column: Sticky Visuals */}
                    <div className="lg:w-1/2 hidden lg:block h-screen sticky top-0 flex items-center justify-center py-12">
                        <div className="relative w-full max-w-lg aspect-square rounded-[3rem] overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">

                            {/* Images Stack */}
                            {FEATURES.map((feature, index) => (
                                <motion.div
                                    key={feature.id}
                                    className="absolute inset-0 z-10"
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{
                                        opacity: activeFeature === index ? 1 : 0,
                                        scale: activeFeature === index ? 1 : 1.1
                                    }}
                                    transition={{ duration: 0.7, ease: "easeInOut" }}
                                >
                                    <Image
                                        src={feature.image}
                                        alt={feature.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        priority={index === 0}
                                    />
                                    {/* Overlay Gradient to blend with app theme slightly if needed, or just pure image */}
                                    <div className={cn(
                                        "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"
                                    )} />

                                    {/* Floating Label on Image */}
                                    <div className="absolute bottom-8 left-8 right-8">
                                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-white">
                                            <div className="flex items-center gap-3 mb-2">
                                                <feature.icon size={24} className="text-white" />
                                                <h4 className="font-bold text-lg">{feature.title}</h4>
                                            </div>
                                            <p className="text-sm opacity-90">{feature.subtitle}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

