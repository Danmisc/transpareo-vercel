"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
    {
        q: "Puis-je changer de plan à tout moment ?",
        a: "Oui ! Vous pouvez upgrader ou downgrader à tout moment. Les changements prennent effet immédiatement avec un prorata automatique."
    },
    {
        q: "Comment fonctionne l'annulation ?",
        a: "Vous pouvez annuler à tout moment depuis les paramètres. Vous gardez l'accès jusqu'à la fin de votre période payée. Aucun frais caché."
    },
    {
        q: "Quels moyens de paiement acceptez-vous ?",
        a: "Nous acceptons toutes les cartes bancaires (Visa, Mastercard, Amex) via Stripe, notre partenaire de paiement sécurisé. Vos données sont chiffrées."
    },
    {
        q: "Y a-t-il un engagement ?",
        a: "Aucun engagement sur le plan mensuel. Le plan annuel offre -20% et se renouvelle automatiquement, mais reste annulable à tout moment."
    },
    {
        q: "Comment fonctionnent les commissions P2P ?",
        a: "Les commissions sont prélevées automatiquement sur vos gains. Plus votre plan est élevé, plus la commission est réduite. Business = 0.5% seulement."
    },
    {
        q: "Puis-je essayer avant de payer ?",
        a: "Le plan gratuit vous donne accès à toutes les fonctionnalités de base. Vous pouvez tester la plateforme sans limite de temps avant de passer premium."
    }
];

export function PricingFAQ() {
    // Track open state for each item individually
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-24 px-4 bg-white dark:bg-zinc-950">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4 text-zinc-900 dark:text-white">
                        Questions fréquentes
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Tout ce que vous devez savoir avant de commencer.
                    </p>
                </div>

                {/* Innovative 2-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {FAQ_ITEMS.map((faq, i) => {
                        const isOpen = openIndex === i;

                        return (
                            <motion.div
                                key={i}
                                layout
                                onClick={() => setOpenIndex(isOpen ? null : i)}
                                className={cn(
                                    "group rounded-2xl p-6 cursor-pointer border transition-all duration-300 h-fit",
                                    isOpen
                                        ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 ring-1 ring-zinc-200 dark:ring-zinc-800"
                                        : "bg-zinc-50 dark:bg-zinc-900/30 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
                                )}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <h3 className={cn(
                                        "font-medium text-base transition-colors",
                                        isOpen ? "text-zinc-900 dark:text-white" : "text-zinc-600 dark:text-zinc-300"
                                    )}>
                                        {faq.q}
                                    </h3>
                                    <span className={cn(
                                        "flex-shrink-0 mt-0.5 transition-transform duration-300",
                                        isOpen ? "rotate-45" : "rotate-0"
                                    )}>
                                        <Plus className={cn(
                                            "w-5 h-5",
                                            isOpen ? "text-zinc-900 dark:text-white" : "text-zinc-400"
                                        )} />
                                    </span>
                                </div>

                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                                {faq.a}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
