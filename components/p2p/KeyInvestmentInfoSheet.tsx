"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    AlertTriangle,
    TrendingUp,
    Clock,
    Shield,
    MapPin,
    Building2,
    ChevronDown,
    ChevronUp,
    Calculator,
    Calendar,
    Target,
    Scale,
    Info
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface LoanData {
    id: string;
    title: string;
    amount: number;
    funded: number;
    apr: number;
    duration: number;
    riskGrade: string;
    projectType?: string;
    location?: string;
    description?: string;
    borrower?: {
        name?: string;
        id: string;
    };
}

interface KeyInvestmentInfoSheetProps {
    loan: LoanData;
}

export function KeyInvestmentInfoSheet({ loan }: KeyInvestmentInfoSheetProps) {
    const [expanded, setExpanded] = useState(false);

    // Risk grade descriptions (EU ECSPR compliant)
    const riskDescriptions: Record<string, { level: string; description: string; defaultRate: string }> = {
        A: {
            level: "Faible",
            description: "Emprunteur avec solide historique, garanties significatives",
            defaultRate: "< 1%"
        },
        B: {
            level: "Modéré",
            description: "Profil équilibré avec quelques facteurs de risque",
            defaultRate: "1-3%"
        },
        C: {
            level: "Élevé",
            description: "Risque supérieur à la moyenne, rendement accru",
            defaultRate: "3-7%"
        },
        D: {
            level: "Très Élevé",
            description: "Projet risqué, risque de perte significatif",
            defaultRate: "> 7%"
        }
    };

    const risk = riskDescriptions[loan.riskGrade] || riskDescriptions.B;

    // Simulate estimated returns
    const investAmount = 1000; // For calculation example
    const monthlyInterest = (investAmount * loan.apr / 100) / 12;
    const totalInterest = monthlyInterest * loan.duration;

    return (
        <Card className="border-2 border-indigo-200 dark:border-indigo-800 bg-white dark:bg-zinc-900">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Info className="text-indigo-500" size={20} />
                        Fiche d'Information Clé
                    </CardTitle>
                    <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                        EU ECSPR
                    </Badge>
                </div>
                <p className="text-xs text-zinc-500">
                    Document d'information standardisé conforme au règlement UE 2020/1503
                </p>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Essential Information */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                        <p className="text-xs text-zinc-500 mb-1">Montant demandé</p>
                        <p className="font-bold">{loan.amount.toLocaleString('fr-FR')} €</p>
                    </div>
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                        <p className="text-xs text-zinc-500 mb-1">Durée</p>
                        <p className="font-bold">{loan.duration} mois</p>
                    </div>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
                        <p className="text-xs text-emerald-600 mb-1">Taux annuel brut</p>
                        <p className="font-bold text-emerald-600">{loan.apr}%</p>
                    </div>
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                        <p className="text-xs text-zinc-500 mb-1">Type de remboursement</p>
                        <p className="font-bold text-sm">In fine</p>
                    </div>
                </div>

                {/* Risk Assessment Box */}
                <div className={`rounded-xl p-4 border-2 ${loan.riskGrade === "A" ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-900/10" :
                        loan.riskGrade === "B" ? "border-amber-300 bg-amber-50 dark:bg-amber-900/10" :
                            loan.riskGrade === "C" ? "border-orange-300 bg-orange-50 dark:bg-orange-900/10" :
                                "border-red-300 bg-red-50 dark:bg-red-900/10"
                    }`}>
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${loan.riskGrade === "A" ? "bg-emerald-500" :
                                loan.riskGrade === "B" ? "bg-amber-500" :
                                    loan.riskGrade === "C" ? "bg-orange-500" :
                                        "bg-red-500"
                            }`}>
                            {loan.riskGrade}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold">Niveau de Risque: {risk.level}</h4>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">{risk.description}</p>
                            <p className="text-xs text-zinc-500 mt-1">
                                Taux de défaut historique pour cette catégorie: {risk.defaultRate}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Simulation Example */}
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                        <Calculator size={16} /> Exemple pour {investAmount.toLocaleString('fr-FR')} € investis
                    </h4>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                            <p className="text-xs text-blue-600 mb-1">Intérêts mensuels</p>
                            <p className="font-bold text-blue-700">{monthlyInterest.toFixed(2)} €</p>
                        </div>
                        <div>
                            <p className="text-xs text-blue-600 mb-1">Total intérêts</p>
                            <p className="font-bold text-blue-700">+{totalInterest.toFixed(2)} €</p>
                        </div>
                        <div>
                            <p className="text-xs text-blue-600 mb-1">À l'échéance</p>
                            <p className="font-bold text-blue-700">{(investAmount + totalInterest).toFixed(2)} €</p>
                        </div>
                    </div>
                </div>

                {/* Expandable Risk Warning */}
                <div>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800 text-left"
                    >
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="text-red-600" size={18} />
                            <span className="font-semibold text-red-800 dark:text-red-200">
                                Risques principaux
                            </span>
                        </div>
                        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    {expanded && (
                        <div className="mt-2 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800 space-y-3">
                            <div className="flex items-start gap-2">
                                <span className="text-red-600 font-bold">1.</span>
                                <div>
                                    <p className="font-medium text-red-800 dark:text-red-200">Risque de perte en capital</p>
                                    <p className="text-sm text-red-700 dark:text-red-300">
                                        Vous pouvez perdre tout ou partie de votre investissement en cas de défaillance de l'emprunteur.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-red-600 font-bold">2.</span>
                                <div>
                                    <p className="font-medium text-red-800 dark:text-red-200">Risque de liquidité</p>
                                    <p className="text-sm text-red-700 dark:text-red-300">
                                        Vos fonds sont immobilisés pendant {loan.duration} mois. Il n'existe pas de marché secondaire garanti.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-red-600 font-bold">3.</span>
                                <div>
                                    <p className="font-medium text-red-800 dark:text-red-200">Absence de garantie</p>
                                    <p className="text-sm text-red-700 dark:text-red-300">
                                        Cet investissement n'est pas couvert par le Fonds de Garantie des Dépôts.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Legal Links */}
                <div className="flex flex-wrap gap-2 pt-2">
                    <Link href="/p2p/legal/risks">
                        <Badge variant="outline" className="cursor-pointer hover:bg-zinc-100">
                            <Shield size={12} className="mr-1" /> Notice des risques
                        </Badge>
                    </Link>
                    <Link href="/p2p/legal/fees">
                        <Badge variant="outline" className="cursor-pointer hover:bg-zinc-100">
                            <Scale size={12} className="mr-1" /> Frais applicables
                        </Badge>
                    </Link>
                    <Link href="/p2p/statistics">
                        <Badge variant="outline" className="cursor-pointer hover:bg-zinc-100">
                            <TrendingUp size={12} className="mr-1" /> Statistiques plateforme
                        </Badge>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

