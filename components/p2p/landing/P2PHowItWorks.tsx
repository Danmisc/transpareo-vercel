"use client";

import { UserPlus, FileCheck, Coins, TrendingUp } from "lucide-react";

const steps = [
    {
        number: "01",
        icon: UserPlus,
        title: "Créez votre compte",
        description: "Inscription gratuite en 2 minutes. Email, mot de passe, c'est parti !",
        color: "from-blue-500 to-indigo-600"
    },
    {
        number: "02",
        icon: FileCheck,
        title: "Vérifiez votre identité",
        description: "Processus KYC rapide et sécurisé. Pièce d'identité + selfie = validé.",
        color: "from-purple-500 to-violet-600"
    },
    {
        number: "03",
        icon: Coins,
        title: "Investissez",
        description: "Choisissez parmi nos projets sélectionnés. Investissez à partir de 10€.",
        color: "from-orange-500 to-amber-600"
    },
    {
        number: "04",
        icon: TrendingUp,
        title: "Récoltez vos gains",
        description: "Recevez vos intérêts chaque mois. Réinvestissez ou retirez librement.",
        color: "from-emerald-500 to-teal-600"
    }
];

export function P2PHowItWorks() {
    return (
        <section className="py-24 px-4 bg-white dark:bg-zinc-950">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-sm font-semibold mb-4">
                        Simple et rapide
                    </span>
                    <h2 className="text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
                        Comment ça marche ?
                    </h2>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
                        4 étapes simples pour commencer à faire fructifier votre épargne.
                    </p>
                </div>

                <div className="relative">
                    {/* Connection Line */}
                    <div className="hidden lg:block absolute top-24 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 via-orange-500 to-emerald-500 opacity-20" />

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div
                                    key={step.number}
                                    className="relative group"
                                >
                                    {/* Step Card */}
                                    <div className="relative bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 hover:shadow-lg">
                                        {/* Number Badge */}
                                        <div className={`absolute -top-4 left-6 w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform`}>
                                            {step.number}
                                        </div>

                                        <div className="pt-6">
                                            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                                                <Icon size={24} className="text-zinc-600 dark:text-zinc-400" />
                                            </div>
                                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                                                {step.title}
                                            </h3>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Arrow (hidden on last item) */}
                                    {index < steps.length - 1 && (
                                        <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

