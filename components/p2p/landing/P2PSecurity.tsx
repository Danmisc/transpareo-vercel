"use client";

import { Shield, Lock, Key, Eye, Fingerprint, Server } from "lucide-react";

const securityFeatures = [
    {
        icon: Shield,
        title: "Fonds ségrégés",
        description: "Vos fonds sont conservés sur des comptes séparés chez notre partenaire bancaire, totalement indépendants de Transpareo."
    },
    {
        icon: Lock,
        title: "Chiffrement AES-256",
        description: "Toutes vos données sont chiffrées avec le standard militaire AES-256, le même utilisé par les banques."
    },
    {
        icon: Key,
        title: "Authentification 2FA",
        description: "Double authentification obligatoire pour toute opération sensible (retrait, modification IBAN)."
    },
    {
        icon: Eye,
        title: "KYC renforcé",
        description: "Vérification d'identité en temps réel avec reconnaissance faciale et vérification documentaire."
    },
    {
        icon: Fingerprint,
        title: "Biométrie",
        description: "Connexion par empreinte digitale ou Face ID sur mobile pour une sécurité sans friction."
    },
    {
        icon: Server,
        title: "Infrastructure PCI-DSS",
        description: "Nos serveurs sont certifiés PCI-DSS Niveau 1, la norme la plus stricte du secteur financier."
    }
];

export function P2PSecurity() {
    return (
        <section className="py-24 px-4 bg-gradient-to-b from-zinc-900 to-black text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-semibold mb-4 border border-emerald-500/30">
                        Sécurité maximale
                    </span>
                    <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                        Votre sécurité,{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                            notre priorité
                        </span>
                    </h2>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                        Une infrastructure de niveau bancaire pour protéger votre patrimoine.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {securityFeatures.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={feature.title}
                                className="group p-6 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:bg-zinc-800/80"
                            >
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Icon size={24} className="text-emerald-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Certifications */}
                <div className="mt-16 flex flex-wrap justify-center gap-8 items-center opacity-60">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">PCI-DSS</div>
                        <div className="text-xs text-zinc-500">Niveau 1</div>
                    </div>
                    <div className="w-px h-8 bg-zinc-700" />
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">RGPD</div>
                        <div className="text-xs text-zinc-500">Conforme</div>
                    </div>
                    <div className="w-px h-8 bg-zinc-700" />
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">AMF</div>
                        <div className="text-xs text-zinc-500">Agréé PSFP</div>
                    </div>
                    <div className="w-px h-8 bg-zinc-700" />
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">SSL/TLS</div>
                        <div className="text-xs text-zinc-500">256-bit</div>
                    </div>
                </div>
            </div>
        </section>
    );
}

