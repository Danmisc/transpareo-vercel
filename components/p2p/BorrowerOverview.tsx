"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { CreditScoreCard } from "@/components/p2p/borrower/CreditScoreCard";

export function BorrowerOverview({ loans }: { loans: any[] }) {
    // Mock Credit Score
    const creditScore = 780;

    return (
        <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
                {/* 1. Credit Score Panel */}
                <CreditScoreCard score={creditScore} />

                {/* 2. New Application CTA */}
                <Card className="bg-zinc-900 border-zinc-800 text-white flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/30 transition-all" />
                    <CardContent className="p-8">
                        <h3 className="text-xl font-bold mb-2">Un projet à financer ?</h3>
                        <p className="text-zinc-400 mb-6 text-sm">
                            Obtenez jusqu'à 50 000 € en moins de 48h. Taux à partir de 2.9%.
                        </p>
                        <Link href="/p2p/borrow">
                            <Button className="w-full bg-white text-black hover:bg-zinc-200 font-bold">
                                <Plus size={16} className="mr-2" /> Nouvelle demande
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* 3. Active Loans Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Mes Emprunts</h3>
                    {loans.length > 0 && <span className="text-sm text-zinc-500">{loans.length} actifs</span>}
                </div>

                {loans.length === 0 ? (
                    <Card className="border-dashed border-2 border-zinc-200 dark:border-zinc-800 bg-transparent text-center py-12">
                        <Clock className="w-12 h-12 mx-auto text-zinc-300 mb-4" />
                        <p className="text-zinc-500 mb-2">Vous n'avez aucun emprunt en cours.</p>
                        <p className="text-xs text-zinc-400">Vos contrats et échéanciers apparaîtront ici.</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {loans.map(loan => (
                            <Card key={loan.id} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 transition-all hover:border-zinc-300 dark:hover:border-white/20">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-zinc-100 dark:bg-white/5 rounded-lg flex items-center justify-center font-bold text-zinc-500">
                                            {loan.projectType === 'REAL_ESTATE' ? '🏠' : '💼'}
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-200">
                                                {loan.title}
                                            </CardTitle>
                                            <p className="text-xs text-zinc-500">N° {loan.id.slice(-8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <Badge className={`${loan.status === 'FUNDING' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                                        loan.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :
                                            'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                        } border-none`}>
                                        {loan.status}
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                        <div>
                                            <p className="text-xs text-zinc-500 uppercase font-bold">Montant</p>
                                            <p className="text-lg font-bold font-mono text-zinc-900 dark:text-white">
                                                {loan.amount.toLocaleString()} €
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-500 uppercase font-bold">Restant Dû</p>
                                            <p className="text-lg font-bold font-mono text-zinc-900 dark:text-white">
                                                {/* Mock Remaining: 80% if Active, 100% if Funding */}
                                                {(loan.status === 'ACTIVE' ? loan.amount * 0.8 : loan.amount).toLocaleString()} €
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-500 uppercase font-bold">Prochaine Échéance</p>
                                            <div className="flex items-center gap-1 font-medium text-orange-600">
                                                <Calendar size={14} />
                                                {loan.repayments?.[0] ? new Date(loan.repayments[0].dueDate).toLocaleDateString() : '--/--'}
                                            </div>
                                        </div>
                                        <div className="flex items-end justify-end">
                                            <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                                                Voir détails <ArrowRight size={14} className="ml-1" />
                                            </Button>
                                        </div>
                                    </div>

                                    {loan.status === 'REVIEW' && (
                                        <div className="mt-4 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg flex gap-3 text-sm text-amber-800 dark:text-amber-400">
                                            <Clock size={18} className="shrink-0" />
                                            <p>Dossier en cours d'analyse par nos experts. Réponse sous 48h.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
