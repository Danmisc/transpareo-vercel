"use client";

import { motion } from "framer-motion";
import { DossierScore } from "./DossierScore";
import { DossierIdCard } from "./DossierIdCard";
import { ShareDialog } from "./ShareDialog";
import { DossierCoach } from "./DossierCoach";

interface DossierHeaderProps {
    user: any;
    progress: number;
}

export function DossierHeader({ user, progress }: DossierHeaderProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
            {/* 1. Identity Card */}
            <div className="lg:col-span-1 flex justify-center lg:justify-start">
                <DossierIdCard user={user} isVerified={progress === 100} />
            </div>

            {/* 2. Welcome & Stats */}
            <div className="lg:col-span-1 text-center space-y-2">
                <DossierScore score={progress} />
                <div className="pt-2">
                    <h2 className="text-zinc-900 font-bold">
                        {progress < 100 ? "Complétez votre dossier" : "Dossier validé !"}
                    </h2>
                    <p className="text-sm text-zinc-500">
                        {progress < 100
                            ? "Un dossier complet a 3x plus de chances d'être accepté."
                            : "Vous êtes prêt pour postuler en un clic."}
                    </p>
                </div>
            </div>

            {/* 3. Actions */}
            <div className="lg:col-span-1 bg-zinc-50 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 border border-dashed border-zinc-200 h-full">
                <h3 className="font-semibold text-zinc-700">Partage Rapide</h3>
                <p className="text-xs text-center text-zinc-500 px-4">
                    Générez un lien sécurisé valable 7 jours pour les propriétaires.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <DossierCoach dossierId={user.id!} score={progress} completion={progress} />
                    <ShareDialog userId={user.id!} />
                </div>
            </div>
        </div>
    );
}

