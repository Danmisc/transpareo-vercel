"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { UserPlus, Search, Wallet, TrendingUp } from "lucide-react";

const STEPS = [
    {
        id: 1,
        title: "Inscription & KYC Instantanés",
        desc: "Créez votre compte investisseur sécurisé en moins de 2 minutes. Notre système de vérification d'identité (KYC) automatisé valide votre dossier instantanément pour vous permettre d'accéder aux offres sans attendre.",
        icon: UserPlus
    },
    {
        id: 2,
        title: "Sélection Rigoureuse des Projets",
        desc: "Accédez à une liste exclusive d'opportunités immobilières auditées. Chaque fiche projet contient une analyse complète : rentabilité, structure juridique, garanties hypothécaires et profil de l'opérateur.",
        icon: Search
    },
    {
        id: 3,
        title: "Investissement 100% Digital",
        desc: "Investissez à partir de 100€ en quelques clics. Signez votre bulletin de souscription électroniquement et effectuez votre paiement par carte ou virement via notre partenaire sécurisé MangoPay.",
        icon: Wallet
    },
    {
        id: 4,
        title: "Suivi & Perception des Intérêts",
        desc: "Pilotez votre portefeuille depuis votre tableau de bord. Recevez vos intérêts mensuels ou in-fine directement sur votre wallet et réinvestissez-les ou virez-les sur votre compte bancaire à tout moment.",
        icon: TrendingUp
    }
];

export function HowItWorks() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 20%", "end 50%"] // Adjusted to ensure line fills as user reads through
    });

    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <section ref={containerRef} className="py-24 relative overflow-hidden bg-zinc-50 dark:bg-black">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-20">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-orange-600 font-semibold tracking-wider uppercase text-sm"
                    >
                        Processus Simplifié
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold mt-2 text-zinc-900 dark:text-white"
                    >
                        Investir n'a jamais été aussi <span className="italic font-serif text-orange-600">simple</span>.
                    </motion.h2>
                </div>

                <div className="relative max-w-4xl mx-auto">
                    {/* Central Line Background */}
                    <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-800 -translate-x-1/2" />

                    {/* Central Line Progress (The "Draw" Effect) */}
                    <motion.div
                        style={{ scaleY, originY: 0 }}
                        className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 via-amber-500 to-orange-500 -translate-x-1/2 z-0"
                    />

                    <div className="space-y-16">
                        {STEPS.map((step, index) => {
                            const isEven = index % 2 === 0;
                            return (
                                <StepCard
                                    key={step.id}
                                    step={step}
                                    index={index}
                                    isEven={isEven}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

function StepCard({ step, index, isEven }: { step: any, index: number, isEven: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-row md:items-center gap-8"
        >
            {/* Left Column (Desktop) */}
            <div className="hidden md:block flex-1 text-right">
                {isEven ? (
                    <div className="pr-12">
                        <h3 className="text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">{step.title}</h3>
                        <p className="text-zinc-500 text-sm">{step.desc}</p>
                    </div>
                ) : (
                    // Empty Spacer for layout balance
                    <div />
                )}
            </div>

            {/* Center Column (Circle) */}
            <div className="relative z-10 shrink-0">
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border-4 border-white dark:border-black shadow-lg flex items-center justify-center relative group">
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-full h-full rounded-full bg-orange-600 flex items-center justify-center text-white"
                    >
                        <step.icon size={18} />
                    </motion.div>

                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity" />
                </div>
            </div>

            {/* Right Column (Desktop) + Mobile Content */}
            <div className="flex-1 md:text-left pt-1 md:pt-0">
                {!isEven ? (
                    <div className="md:pl-12 hidden md:block">
                        <h3 className="text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">{step.title}</h3>
                        <p className="text-zinc-500 text-sm">{step.desc}</p>
                    </div>
                ) : (
                    // Empty Spacer for desktop
                    null
                )}

                {/* Mobile Content Display (Always visible on mobile next to circle) */}
                <div className="md:hidden">
                    <h3 className="text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">{step.title}</h3>
                    <p className="text-zinc-500 text-sm">{step.desc}</p>
                </div>
            </div>
        </motion.div>
    );
}

