"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Crown, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PlanName } from "@/lib/subscription/plans";

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPlan: PlanName;
    requiredPlan: PlanName;
    feature: string;
    onUpgrade: (plan: PlanName) => void;
}

const PLAN_BENEFITS: Record<PlanName, string[]> = {
    FREE: [],
    PLUS: [
        "Messages illimités",
        "Voir qui visite ton profil (30j)",
        "10 alertes de recherche",
        "Vidéo pitch 30s",
        "Certification solvabilité"
    ],
    PRO: [
        "Tout de Plus +",
        "Mode invisible",
        "InMails (10/mois)",
        "Candidature prioritaire",
        "Contact direct propriétaires",
        "Dashboard propriétaire",
        "Projets P2P 24h avant"
    ],
    BUSINESS: [
        "Tout de Pro +",
        "InMails illimités",
        "Biens illimités",
        "Équipe jusqu'à 5 personnes",
        "Support prioritaire 24h"
    ]
};

const PLAN_PRICES: Record<PlanName, number> = {
    FREE: 0,
    PLUS: 9.99,
    PRO: 24.99,
    BUSINESS: 79.99
};

export function UpgradeModal({ isOpen, onClose, currentPlan, requiredPlan, feature, onUpgrade }: UpgradeModalProps) {
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        setLoading(true);
        await onUpgrade(requiredPlan);
        setLoading(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-x-4 top-[20%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-50"
                    >
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Header with gradient */}
                            <div className={cn(
                                "relative px-6 py-8 text-center",
                                requiredPlan === "PLUS" && "bg-gradient-to-br from-blue-500 to-blue-600",
                                requiredPlan === "PRO" && "bg-gradient-to-br from-orange-500 to-amber-500",
                                requiredPlan === "BUSINESS" && "bg-gradient-to-br from-zinc-800 to-zinc-900"
                            )}>
                                {/* Close button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-1 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>

                                {/* Icon */}
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
                                    {requiredPlan === "PLUS" && <Sparkles className="h-8 w-8 text-white" />}
                                    {requiredPlan === "PRO" && <Crown className="h-8 w-8 text-white" />}
                                    {requiredPlan === "BUSINESS" && <Crown className="h-8 w-8 text-white" />}
                                </div>

                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Passe à {requiredPlan}
                                </h2>
                                <p className="text-white/80 text-sm">
                                    Pour accéder à : <strong>{feature}</strong>
                                </p>
                            </div>

                            {/* Benefits */}
                            <div className="p-6">
                                <h3 className="text-sm font-semibold text-zinc-500 mb-4 uppercase tracking-wide">
                                    Ce que tu obtiens
                                </h3>
                                <ul className="space-y-3">
                                    {PLAN_BENEFITS[requiredPlan].map((benefit, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm">
                                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                            <span className="text-zinc-700 dark:text-zinc-300">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Footer */}
                            <div className="px-6 pb-6">
                                <Button
                                    onClick={handleUpgrade}
                                    disabled={loading}
                                    className={cn(
                                        "w-full h-12 text-base font-semibold",
                                        requiredPlan === "PLUS" && "bg-blue-600 hover:bg-blue-700",
                                        requiredPlan === "PRO" && "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600",
                                        requiredPlan === "BUSINESS" && "bg-zinc-900 hover:bg-zinc-800"
                                    )}
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Passer à {requiredPlan} - {PLAN_PRICES[requiredPlan]}€/mois
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </>
                                    )}
                                </Button>

                                <p className="text-center text-xs text-zinc-500 mt-3">
                                    Annulable à tout moment • Paiement sécurisé par Stripe
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

