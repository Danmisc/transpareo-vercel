"use client";

import { Button } from "@/components/ui/button";
import { Download, MessageCircle, Share2, ShieldCheck, Star } from "lucide-react";
import { toast } from "sonner";

interface OwnerDossierHeaderProps {
    user: {
        name: string | null;
        image: string | null;
        email: string | null;
    };
    score: number;
}

export function OwnerDossierHeader({ user, score }: OwnerDossierHeaderProps) {

    const handleDownloadAll = () => {
        toast.success("Téléchargement du dossier complet (ZIP) lancé...");
    };

    const handleContact = () => {
        toast.info("Fonctionnalité de chat direct bientôt disponible.");
    };

    return (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 relative overflow-hidden">

            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-50 to-transparent rounded-bl-full opacity-50 pointer-events-none" />

            {/* Avatar & Score */}
            <div className="relative shrink-0 flex flex-col items-center">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg overflow-hidden relative z-10">
                    <img src={user.image || "/avatars/default.png"} alt={user.name || "Candidat"} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-3 z-20 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <ShieldCheck size={12} />
                    VÉRIFIÉ
                </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left z-10 w-full">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">
                            {user.name || "Candidat Anonyme"}
                        </h1>
                        <p className="text-zinc-500 flex items-center justify-center md:justify-start gap-2 mt-1">
                            Dossier de Location Complet &bull; Mis à jour récemment
                        </p>

                        {/* Trust Badges */}
                        <div className="flex items-center justify-center md:justify-start gap-3 mt-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 text-orange-700 text-sm font-medium border border-orange-100">
                                <Star size={14} className="fill-orange-600" />
                                Score Dossier: {score}/100
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 text-sm font-medium border border-zinc-200">
                                Revenus 3x Loyer
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4 md:mt-0">
                        <Button onClick={handleContact} variant="outline" className="gap-2 border-zinc-300">
                            <MessageCircle size={18} />
                            Contacter
                        </Button>
                        <Button onClick={handleDownloadAll} className="gap-2 bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-900/10">
                            <Download size={18} />
                            Télécharger PDF
                        </Button>
                    </div>
                </div>

                {/* Intro Text */}
                <p className="mt-6 text-zinc-600 max-w-2xl leading-relaxed">
                    Ce dossier a été vérifié automatiquement par Transpareo. Tous les documents sont certifiés conformes aux originaux et protégés contre la falsification via filigrane numérique.
                </p>
            </div>
        </div>
    );
}
