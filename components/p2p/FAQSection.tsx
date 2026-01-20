"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
    {
        q: "Quel est le ticket d'entrée minimum ?",
        a: "Vous pouvez investir dès 100€ par projet. Nous avons démocratisé l'accès au club deal immobilier (auparavant réservé aux gros capitaux) pour permettre à chacun de diversifier son épargne simplement."
    },
    {
        q: "Les rendements sont-ils garantis ?",
        a: "Non, comme tout investissement financier (actions, obligations), le crowdfunding comporte des risques (perte en capital, illiquidité). Cependant, notre stratégie est défensive : nous ne sélectionnons que 5% des dossiers (les plus solides) et exigeons systématiquement des garanties réelles (hypothèque, fiducie)."
    },
    {
        q: "Quelle est la fiscalité appliquée ?",
        a: "Pour les résidents français, c'est la simplicité du Prélèvement Forfaitaire Unique (Flat Tax) de 30% (12,8% impôt + 17,2% prélèvements sociaux). Tout est prélevé à la source, vous n'avez rien à gérer. Vous recevez votre rendement net."
    },
    {
        q: "Mon argent est-il bloqué ?",
        a: "Oui, durant la durée du projet (12 à 24 mois en moyenne). C'est le principe de l'investissement dans le réel. Toutefois, nous travaillons sur une place de marché secondaire qui pourrait permettre de revendre vos obligations à d'autres investisseurs."
    },
    {
        q: "Qui valide les projets ?",
        a: "Un comité d'investissement composé d'experts indépendants (anciens directeurs de risques bancaires, promoteurs, notaires). Chaque projet subit un audit de plus de 150 points de contrôle avant d'être proposé."
    }
];

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-24 bg-white dark:bg-black">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
                    {/* Header Column */}
                    <div className="lg:w-1/3">
                        <div className="sticky top-24">
                            <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-6">
                                Questions <br /><span className="text-zinc-400 dark:text-zinc-600">Fréquentes</span>
                            </h2>
                            <p className="text-lg text-zinc-500 mb-8 max-w-sm">
                                Tout ce que vous devez savoir pour investir sereinement. Une question spécifique ?
                                <a href="/contact" className="ml-1 text-orange-600 font-medium hover:underline decoration-orange-600/30 underline-offset-4">Contactez-nous</a>.
                            </p>

                            {/* Decorative element */}
                            <div className="hidden lg:block w-16 h-1 bg-orange-600 rounded-full" />
                        </div>
                    </div>

                    {/* FAQ List Column */}
                    <div className="lg:w-2/3">
                        <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border-t border-zinc-200 dark:border-zinc-800">
                            {FAQS.map((faq, i) => {
                                const isOpen = openIndex === i;
                                return (
                                    <div key={i} className="group">
                                        <button
                                            onClick={() => setOpenIndex(isOpen ? null : i)}
                                            className="w-full py-8 flex items-start justify-between text-left focus:outline-none"
                                        >
                                            <span className={cn(
                                                "text-xl md:text-2xl font-medium transition-colors duration-300 pr-8",
                                                isOpen ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200"
                                            )}>
                                                {faq.q}
                                            </span>
                                            <span className={cn(
                                                "shrink-0 p-2 rounded-full border transition-all duration-300",
                                                isOpen
                                                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent"
                                                    : "bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-400 group-hover:border-zinc-400 group-hover:text-zinc-600"
                                            )}>
                                                {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                                            </span>
                                        </button>

                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                    className="overflow-hidden"
                                                >
                                                    <p className="pb-8 text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl">
                                                        {faq.a}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

