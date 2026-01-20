"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
    {
        question: "Quel est le montant minimum pour investir ?",
        answer: "Vous pouvez commencer à investir à partir de 10€ seulement. C'est l'un des seuils les plus bas du marché, permettant à chacun de diversifier ses placements."
    },
    {
        question: "Comment sont sécurisés mes fonds ?",
        answer: "Vos fonds sont conservés sur des comptes ségrégés chez notre partenaire bancaire. Ils sont totalement séparés des fonds de Transpareo et protégés par le Fonds de Garantie des Dépôts."
    },
    {
        question: "Quel est le rendement moyen ?",
        answer: "Le rendement moyen de notre portefeuille se situe entre 8% et 12% par an, selon les projets. Chaque projet affiche clairement son taux de rendement attendu avant investissement."
    },
    {
        question: "Puis-je retirer mon argent à tout moment ?",
        answer: "Vos gains disponibles peuvent être retirés à tout moment vers votre compte bancaire. Pour le capital investi, il est généralement bloqué jusqu'à l'échéance du projet (6 à 36 mois selon les projets)."
    },
    {
        question: "Êtes-vous régulé par l'AMF ?",
        answer: "Oui, Transpareo est enregistré auprès de l'Autorité des Marchés Financiers en tant que Prestataire de Services de Financement Participatif (PSFP) conformément au règlement européen."
    },
    {
        question: "Quels sont les risques ?",
        answer: "Comme tout investissement, le crowdfunding immobilier comporte des risques de perte en capital. Nous sélectionnons rigoureusement les projets et fournissons une analyse de risque détaillée pour chaque opportunité."
    }
];

export function P2PFAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-24 px-4 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 text-sm font-semibold mb-4">
                        Questions fréquentes
                    </span>
                    <h2 className="text-4xl font-bold text-zinc-900 dark:text-white">
                        Une question ?
                    </h2>
                </div>

                <div className="space-y-3">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="rounded-xl bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <span className="font-semibold text-zinc-900 dark:text-white pr-4">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    size={20}
                                    className={`flex-shrink-0 text-zinc-400 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-200 ${openIndex === index ? 'max-h-48' : 'max-h-0'
                                    }`}
                            >
                                <p className="px-5 pb-5 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

