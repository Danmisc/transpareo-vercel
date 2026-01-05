"use client";

import { Handshake, FileCheck, Landmark, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HowItWorks() {
    const steps = [
        {
            icon: <Users className="h-8 w-8 text-blue-600" />,
            title: "1. Déposez votre projet",
            desc: "Décrivez votre achat immobilier. Transpareo analyse votre solvabilité et attribue un Score de Confiance."
        },
        {
            icon: <Landmark className="h-8 w-8 text-emerald-600" />,
            title: "2. Les Investisseurs financent",
            desc: "Votre dossier est proposé à notre communauté d'investisseurs privés qui financent votre prêt en parts (Crowdlending)."
        },
        {
            icon: <Handshake className="h-8 w-8 text-indigo-600" />,
            title: "3. Déblocage des fonds",
            desc: "Une fois les 100% atteints, le contrat est généré, signé électroniquement et les fonds sont virés chez le notaire."
        }
    ];

    return (
        <section className="py-20 bg-white dark:bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-zinc-900 dark:text-zinc-100">
                        Comment ça marche ?
                    </h2>
                    <p className="text-lg text-zinc-500">
                        Un processus simplifié, transparent et 100% digitalisé pour contourner la rigidité bancaire.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-200 via-emerald-200 to-indigo-200 -z-0" />

                    {steps.map((step, i) => (
                        <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                            <div className="w-24 h-24 bg-white dark:bg-zinc-900 rounded-full border-4 border-zinc-50 dark:border-zinc-800 shadow-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:border-zinc-100 dark:group-hover:border-zinc-700">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                            <p className="text-zinc-500 leading-relaxed px-4">
                                {step.desc}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Button size="lg" className="rounded-full px-8 h-12 text-base font-medium gap-2">
                        Commencer mon dossier <ArrowRight size={18} />
                    </Button>
                </div>
            </div>
        </section>
    );
}
