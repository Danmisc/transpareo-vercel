"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Bot, Sparkles, AlertTriangle, CheckCircle2, FileText, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { generateCoverLetter } from "@/lib/actions/dossier"; // We will add this later

interface DossierCoachProps {
    dossierId: string;
    score: number;
    completion: number;
}

export function DossierCoach({ dossierId, score, completion }: DossierCoachProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [advice, setAdvice] = useState<any>(null);

    // Mock AI Analysis
    const handleAnalyze = () => {
        setLoading(true);
        setTimeout(() => {
            const analysis = {
                message: completion < 100
                    ? "Votre dossier est incomplet. C'est le facteur #1 de refus."
                    : "Excellent dossier ! Vous êtes prêt à postuler.",
                strengths: [
                    "Identité vérifiée",
                    score > 60 ? "Revenus cohérents détectés (simulé)" : "Documents présents"
                ],
                weaknesses: completion < 100 ? ["Manque justificatif de domicile", "Pas de garants ajoutés"] : [],
                action: completion < 100 ? "Compléter mon dossier" : "Générer une lettre de motivation"
            };
            setAdvice(analysis);
            setLoading(false);
        }, 1500);
    };

    const handleCoverLetter = () => {
        toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
            loading: "Rédaction de votre lettre avec GPT-4...",
            success: "Lettre générée et copiée dans le presse-papier !",
            error: "Erreur"
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="gap-2 border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800"
                >
                    <Bot size={16} />
                    Coach Dossier IA
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="text-amber-500 fill-amber-500" size={20} />
                        Analyse de votre Dossier
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {!advice ? (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                <Bot size={32} className="text-indigo-600" />
                            </div>
                            <p className="text-sm text-zinc-600">
                                Je vais analyser la solidité de votre dossier par rapport aux standards du marché (Loi Alur, Garantie Loyer Impayé).
                            </p>
                            <Button onClick={handleAnalyze} disabled={loading} className="w-full">
                                {loading ? "Analyse en cours..." : "Lancer l'analyse"}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className={`p-4 rounded-xl border ${completion === 100 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                                <h4 className={`font-semibold ${completion === 100 ? 'text-emerald-800' : 'text-amber-800'} mb-1`}>
                                    Diagnostic
                                </h4>
                                <p className="text-sm text-zinc-700">{advice.message}</p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-zinc-900">Points Forts</h4>
                                <ul className="text-sm text-zinc-600 space-y-1">
                                    {advice.strengths.map((s: string, i: number) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <CheckCircle2 size={14} className="text-emerald-500" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {advice.weaknesses.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-zinc-900">À Améliorer</h4>
                                    <ul className="text-sm text-zinc-600 space-y-1">
                                        {advice.weaknesses.map((w: string, i: number) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <AlertTriangle size={14} className="text-amber-500" />
                                                {w}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="pt-4 border-t border-zinc-100">
                                <Button
                                    className="w-full gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-lg"
                                    onClick={handleCoverLetter}
                                >
                                    <FileText size={16} />
                                    Générer une Lettre de Motivation
                                    <ArrowRight size={16} className="opacity-70" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
