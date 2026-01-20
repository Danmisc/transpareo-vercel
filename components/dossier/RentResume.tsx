"use client";

import { CheckCircle, Clock, XCircle, TrendingUp, Calendar, AlertTriangle, Download, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface RentResumeProps {
    userId: string;
    payments: any[];
}

export function RentResume({ userId, payments }: RentResumeProps) {
    // Mock data processing if payments is empty for demo
    const displayPayments = payments.length > 0 ? payments : [
        { id: 1, month: "Novembre 2025", amount: 850, status: "PAID", date: "2025-11-02" },
        { id: 2, month: "Octobre 2025", amount: 850, status: "PAID", date: "2025-10-01" },
        { id: 3, month: "Septembre 2025", amount: 850, status: "PAID", date: "2025-09-03" },
        { id: 4, month: "Août 2025", amount: 850, status: "PAID", date: "2025-08-01" },
        { id: 5, month: "Juillet 2025", amount: 850, status: "LATE", date: "2025-07-12" }, // Example late
    ];

    const onTimeCount = displayPayments.filter(p => p.status === 'PAID').length;
    const consistencyScore = Math.round((onTimeCount / displayPayments.length) * 100);

    return (
        <div className="space-y-8">
            {/* Header / Stats Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1 md:col-span-2 bg-zinc-900 rounded-3xl p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20 -mr-16 -mt-16 pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                <TrendingUp className="text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Score de Régularité</h2>
                                <p className="text-zinc-400">Basé sur vos 6 derniers mois</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-5xl font-black tracking-tighter text-emerald-400">{consistencyScore}%</span>
                                <span className="text-sm font-medium bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">Excellente Rigueur</span>
                            </div>
                            <Progress value={consistencyScore} className="h-3 bg-zinc-800" />
                            {/* Note: Need to verify if Progress component supports className for color, might need custom styling */}
                            <div className="h-3 w-full bg-zinc-800 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000" style={{ width: `${consistencyScore}%` }} />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="bg-white/5 rounded-lg p-3 flex-1 backdrop-blur-sm border border-white/5">
                                <div className="text-xs text-zinc-400 mb-1">Loyer Moyen</div>
                                <div className="text-xl font-bold">850€</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 flex-1 backdrop-blur-sm border border-white/5">
                                <div className="text-xs text-zinc-400 mb-1">Total Versé</div>
                                <div className="text-xl font-bold">4 250€</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Card */}
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 flex flex-col justify-center gap-4 shadow-sm">
                    <h3 className="font-bold text-lg text-zinc-900">Preuves de paiement</h3>
                    <p className="text-sm text-zinc-500">
                        Un historique clair rassure immédiatement. Téléchargez votre certificat de bon payeur.
                    </p>
                    <Button className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border border-zinc-200 shadow-none">
                        <Download size={16} className="mr-2" /> Certificat PDF
                    </Button>
                    <Button variant="outline" className="w-full border-dashed border-zinc-300 text-zinc-500 hover:text-zinc-900 hover:border-zinc-400">
                        <ArrowUpRight size={16} className="mr-2" /> Ajouter une quittance
                    </Button>
                </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-100/50 p-8">
                <h3 className="font-bold text-xl text-zinc-900 mb-8 flex items-center gap-2">
                    <Calendar size={20} className="text-zinc-400" /> Historique Détaillé
                </h3>

                <div className="relative border-l-2 border-zinc-100 pl-8 space-y-8 ml-4">
                    {displayPayments.map((payment, index) => (
                        <div key={payment.id} className="relative group">
                            {/* Dot on timeline */}
                            <div className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-transform group-hover:scale-125
                                ${payment.status === 'PAID' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            />

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-100">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-zinc-900 text-lg">{payment.month}</h4>
                                        {payment.status === 'PAID' ? (
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                                                <CheckCircle size={10} /> Payé à l'heure
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
                                                <Clock size={10} /> En retard
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-zinc-500 flex items-center gap-2">
                                        Date de virement : <span className="font-mono text-zinc-700 font-medium">{payment.date}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-xl text-zinc-900">{payment.amount} €</div>
                                    <div className="text-xs text-zinc-400">Loyer + Charges</div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Start of Timeline */}
                    <div className="relative">
                        <div className="absolute -left-[39px] top-1 w-4 h-4 rounded-full bg-zinc-200 border-2 border-white" />
                        <p className="text-sm text-zinc-400 italic pt-1">Début de l'historique enregistré</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

