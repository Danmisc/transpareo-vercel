"use client";

import { Shield, TrendingUp, Eye, Clock, Wallet, Award } from "lucide-react";

const features = [
    {
        icon: TrendingUp,
        title: "Rendements attractifs",
        description: "Jusqu'à 12% de rendement annuel sur des projets immobiliers sélectionnés avec soin.",
        highlight: "12%",
        color: "from-emerald-500 to-teal-600"
    },
    {
        icon: Shield,
        title: "Sécurité maximale",
        description: "Fonds ségrégés, KYC renforcé, authentification 2FA obligatoire pour les retraits.",
        highlight: "100%",
        color: "from-blue-500 to-indigo-600"
    },
    {
        icon: Eye,
        title: "Transparence totale",
        description: "Suivi en temps réel de vos investissements, documents accessibles, reporting détaillé.",
        highlight: "24/7",
        color: "from-purple-500 to-violet-600"
    },
    {
        icon: Clock,
        title: "Investissement rapide",
        description: "De l'inscription à votre premier investissement en moins de 10 minutes.",
        highlight: "10 min",
        color: "from-orange-500 to-amber-600"
    },
    {
        icon: Wallet,
        title: "Dès 10€",
        description: "Commencez à investir avec seulement 10€. Accessible à tous les profils d'investisseurs.",
        highlight: "10€",
        color: "from-pink-500 to-rose-600"
    },
    {
        icon: Award,
        title: "Régulé AMF",
        description: "Plateforme agréée par l'Autorité des Marchés Financiers française.",
        highlight: "AMF",
        color: "from-indigo-500 to-blue-600"
    }
];

export function P2PFeatures() {
    return (
        <section className="py-24 px-4 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 text-sm font-semibold mb-4">
                        Pourquoi Transpareo ?
                    </span>
                    <h2 className="text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
                        L'investissement,{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                            réinventé
                        </span>
                    </h2>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                        La puissance du financement participatif, combinée à la sécurité d'une banque.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={feature.title}
                                className="group relative p-6 rounded-2xl bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                                    <Icon size={24} className="text-white" />
                                </div>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                                        {feature.title}
                                    </h3>
                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full">
                                        {feature.highlight}
                                    </span>
                                </div>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

