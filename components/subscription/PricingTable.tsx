"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Sparkles, Building2, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PLANS, type PlanName } from "@/lib/subscription/plans";

interface PricingTableProps {
    currentPlan?: PlanName;
    onSelectPlan?: (planName: PlanName, isYearly: boolean) => void;
    isLoading?: boolean;
}

const PLAN_ICONS: Record<PlanName, React.ReactNode> = {
    FREE: <Zap className="h-5 w-5" />,
    PLUS: <Sparkles className="h-5 w-5" />,
    PRO: <Crown className="h-5 w-5" />,
    BUSINESS: <Building2 className="h-5 w-5" />,
};

const KEY_FEATURES: Record<PlanName, string[]> = {
    FREE: [
        "10 messages/jour",
        "3 communautés",
        "3 alertes recherche",
        "Dossier basique (4 docs)",
        "Analytics 7 jours"
    ],
    PLUS: [
        "Messages illimités",
        "Voir qui visite ton profil",
        "10 alertes recherche",
        "Vidéo pitch 30s",
        "Certification solvabilité",
        "Analytics 30 jours"
    ],
    PRO: [
        "Tout de Plus +",
        "Mode invisible",
        "InMails (10/mois)",
        "Candidature prioritaire",
        "Contact direct proprio",
        "Dashboard propriétaire",
        "Projets P2P 24h avant",
        "Commission réduite 1%"
    ],
    BUSINESS: [
        "Tout de Pro +",
        "InMails illimités",
        "Biens illimités",
        "Équipe jusqu'à 5",
        "Projets P2P 48h avant",
        "Commission 0.5%",
        "Support dédié 24h"
    ]
};

export function PricingTable({ currentPlan = "FREE", onSelectPlan, isLoading }: PricingTableProps) {
    const [isYearly, setIsYearly] = useState(false);

    return (
        <div id="pricing" className="w-full relative py-12">

            {/* Billing Toggle - Clean & Minimal */}
            <div className="flex flex-col items-center justify-center mb-16">
                <div className="relative p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg inline-flex items-center gap-1">
                    <motion.div
                        className="absolute inset-y-1 rounded-md bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700"
                        initial={false}
                        animate={{
                            x: isYearly ? "100%" : "0%",
                            width: "50%"
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                    <button
                        onClick={() => setIsYearly(false)}
                        className={cn(
                            "relative z-10 px-6 py-2 rounded-md text-sm font-semibold transition-colors duration-200 w-32 text-center",
                            !isYearly ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400"
                        )}
                    >
                        Mensuel
                    </button>
                    <button
                        onClick={() => setIsYearly(true)}
                        className={cn(
                            "relative z-10 px-6 py-2 rounded-md text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-2 w-32",
                            isYearly ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400"
                        )}
                    >
                        Annuel
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400">
                            -20%
                        </span>
                    </button>
                </div>
            </div>

            {/* Pricing Cards Grid - Clean SaaS Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
                {PLANS.map((plan, index) => {
                    const isCurrent = currentPlan === plan.name;
                    const isPro = plan.name === "PRO";
                    // For the "Clean SaaS" look, we only highlight the Pro plan subtly
                    const isPopular = isPro;

                    const price = isYearly ? plan.yearlyPrice / 12 : plan.price;
                    const features = KEY_FEATURES[plan.name];

                    return (
                        <div
                            key={plan.name}
                            className={cn(
                                "relative flex flex-col rounded-2xl p-6 transition-all duration-300",
                                // Base Styles: White background, subtle border
                                "bg-white dark:bg-zinc-950 border",
                                // Highlight Logic:
                                // Pro: Orange border/ring, very subtle orange tint
                                // Others: Zinc border
                                isPopular
                                    ? "border-orange-200 dark:border-orange-900/50 ring-1 ring-orange-100 dark:ring-orange-900/30 bg-orange-50/30 dark:bg-orange-950/10 z-10"
                                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                            )}
                        >
                            {/* Pro Badge (Pill) */}
                            {isPopular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <span className="bg-orange-500 text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow-sm border border-orange-400">
                                        Recommandé
                                    </span>
                                </div>
                            )}

                            {/* Header */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className={cn("font-bold text-lg", isPopular ? "text-orange-600 dark:text-orange-500" : "text-zinc-900 dark:text-white")}>
                                        {plan.displayName}
                                    </h3>
                                    <div className={cn("p-2 rounded-lg", isPopular ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500")}>
                                        {PLAN_ICONS[plan.name]}
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                                        {price === 0 ? "0€" : `${price.toFixed(0)}€`}
                                    </span>
                                    {price > 0 && (
                                        <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">/mois</span>
                                    )}
                                </div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 h-10 leading-snug">
                                    {plan.description}
                                </p>
                            </div>

                            {/* Separator */}
                            <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800 mb-8" />

                            {/* Features */}
                            <div className="flex-1 space-y-3 mb-8">
                                <span className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wider block mb-2">Inclus :</span>
                                {features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Check className={cn("h-4 w-4 mt-0.5 shrink-0", isPopular ? "text-orange-500" : "text-zinc-400 dark:text-zinc-600")} />
                                        <span className="text-sm text-zinc-600 dark:text-zinc-300 leading-snug">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA */}
                            <Button
                                className={cn(
                                    "w-full h-11 text-sm font-semibold rounded-lg transition-all",
                                    isCurrent
                                        ? "opacity-50 cursor-not-allowed bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                                        : isPopular
                                            ? "bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20"
                                            : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                                )}
                                disabled={isCurrent || isLoading}
                                onClick={() => onSelectPlan?.(plan.name, isYearly)}
                            >
                                {isLoading && isCurrent ? (
                                    "Chargement..."
                                ) : isCurrent ? (
                                    "Plan actuel"
                                ) : (
                                    "Choisir " + plan.displayName
                                )}
                            </Button>
                        </div>
                    );
                })}
            </div>

            <p className="text-center text-xs text-zinc-400 dark:text-zinc-600 mt-12">
                Paiement sécurisé par Stripe. Annulation possible à tout moment.
            </p>
        </div>
    );
}
