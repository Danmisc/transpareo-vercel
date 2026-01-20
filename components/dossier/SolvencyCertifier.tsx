"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, Building, CheckCircle, Smartphone, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { connectOpenBanking } from "@/lib/actions/dossier";

interface SolvencyCertifierProps {
    userId: string;
    dossier: any;
}

export function SolvencyCertifier({ userId, dossier }: SolvencyCertifierProps) {
    const [isConnecting, setIsConnecting] = useState(false);
    const [status, setStatus] = useState(dossier?.openBankingStatus || "NOT_CONNECTED");

    const handleConnect = async () => {
        setIsConnecting(true);
        toast.info("Connexion sécurisée à la banque en cours...");
        
        const res = await connectOpenBanking(userId);
        
        setIsConnecting(false);
        if (res.success) {
            setStatus("CONNECTED");
            toast.success("Compte connecté et solvabilité vérifiée !");
        } else {
            toast.error("Erreur de connexion.");
        }
    };

    if (status === "CONNECTED") {
        return (
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <ShieldCheck size={120} />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 bg-white/20 w-fit px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                        <CheckCircle size={16} /> Certifié Open Banking
                    </div>
                    <h3 className="text-2xl font-bold mb-6">Solvabilité Certifiée</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                            <div className="text-sm text-emerald-100 mb-1">Revenus Vérifiés</div>
                            <div className="text-3xl font-bold">{dossier.verifiedIncome}€<span className="text-lg opacity-80">/mois</span></div>
                        </div>
                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                            <div className="text-sm text-emerald-100 mb-1">Score Transpareo</div>
                            <div className="text-3xl font-bold">{dossier.solvencyScore}<span className="text-lg opacity-80">/100</span></div>
                        </div>
                    </div>
                    
                    <p className="mt-4 text-sm text-emerald-100 flex items-center gap-2">
                        <Lock size={14} /> Données chiffrées de bout en bout. Aucun accès à vos identifiants.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Building size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-lg text-zinc-900">Certifiez vos revenus automatiquement</h3>
                    <p className="text-zinc-500 text-sm mt-1 leading-relaxed">
                        Plus besoin de télécharger vos relevés de compte. Connectez votre banque pour générer un 
                        <span className="font-semibold text-zinc-900"> Certificat de Solvabilité</span> instantané.
                        Rassure les propriétaires à 100%.
                    </p>
                    
                    <div className="mt-6 flex flex-wrap gap-4">
                         <div className="flex -space-x-3">
                             {[1,2,3,4].map(i => (
                                 <div key={i} className="w-8 h-8 rounded-full bg-zinc-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-zinc-400">
                                     Bank
                                 </div>
                             ))}
                         </div>
                         <div className="text-xs text-zinc-400 flex items-center">
                             +150 banques supportées via <span className="font-bold ml-1 flex items-center gap-1"><ShieldCheck size={12}/> Bridge/Plaid</span>
                         </div>
                    </div>

                    <div className="mt-6">
                        <Button 
                            onClick={handleConnect} 
                            disabled={isConnecting}
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
                        >
                            {isConnecting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyse sécurisée...</>
                            ) : (
                                <><Lock className="mr-2 h-4 w-4" /> Connecter ma banque (Sécurisé)</>
                            )}
                        </Button>
                        <p className="mt-3 text-xs text-zinc-400 flex items-center justify-center sm:justify-start gap-1">
                            <Lock size={10} /> Connexion chiffrée SSL 256-bit. Lecture seule uniquement.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

