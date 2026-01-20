import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { BorrowerOverview } from "@/components/p2p/BorrowerOverview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calculator, FileText, BadgeCheck, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

import { getLoanDashboardData } from "@/lib/actions-borrow";

export default async function BorrowPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const data = await getLoanDashboardData();
    const { loans = [], requests = [], creditScore } = data || {};

    return (
        <div className="min-h-screen bg-zinc-50/[0.3] dark:bg-black font-sans pb-12 relative">
            {/* Ambient Background - Violet Theme */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">

                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <Badge className="mb-2 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-none px-2.5 py-0.5 text-xs">
                            <BadgeCheck size={12} className="mr-1.5" /> Éligibilité Confirmée
                        </Badge>
                        <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-1">
                            Espace <span className="text-violet-600">Emprunteur</span>
                        </h1>
                        <p className="text-sm text-zinc-500 max-w-xl">
                            Gérez vos financements et suivez l'avancement de vos projets.
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content: Loans & Score */}
                    <div className="lg:col-span-2 space-y-6">
                        <BorrowerOverview loans={loans} requests={requests} creditScore={creditScore?.score} />
                    </div>

                    {/* Sidebar: Tools & Actions */}
                    <div className="space-y-4">
                        {/* Quick Action: New Loan */}
                        <Card className="bg-zinc-900 text-white border-zinc-800 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/30 rounded-full blur-[40px] transition-transform group-hover:scale-110 duration-700" />
                            <CardContent className="p-5 relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-zinc-800 rounded-lg">
                                        <Sparkles className="text-violet-400" size={18} />
                                    </div>
                                    <Badge className="bg-violet-600 text-white border-none text-[10px]">
                                        Jusqu'à 50k€
                                    </Badge>
                                </div>
                                <h3 className="font-bold text-lg mb-1">Nouveau Projet ?</h3>
                                <p className="text-zinc-400 text-xs mb-5 leading-relaxed">
                                    Financez vos travaux ou projets personnels en quelques clics.
                                </p>
                                <Link href="/p2p/borrow/new">
                                    <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold h-10 text-sm shadow-lg shadow-violet-900/20">
                                        <Plus size={16} className="mr-2" /> Démarrer
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Tools */}
                        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                            <CardHeader className="pb-2 pt-4 px-4">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Calculator size={16} className="text-zinc-500" />
                                    Outils
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-2">
                                <Button variant="ghost" className="w-full justify-between h-9 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-2">
                                    <span className="flex items-center gap-2">
                                        Simulateur de Mensualités
                                    </span>
                                    <ArrowRight size={12} className="text-zinc-300" />
                                </Button>
                                <Button variant="ghost" className="w-full justify-between h-9 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-2">
                                    <span className="flex items-center gap-2">
                                        Attestations de fonds
                                    </span>
                                    <ArrowRight size={12} className="text-zinc-300" />
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Advisor */}
                        <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/10 dark:to-violet-900/10 border-indigo-100 dark:border-indigo-900/20">
                            <CardContent className="p-4 flex items-start gap-3">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-800/50 flex items-center justify-center text-lg shrink-0 border border-indigo-200 dark:border-indigo-700/50">
                                    👩‍💼
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-zinc-900 dark:text-white mb-0.5">Conseil Expert</p>
                                    <p className="text-[10px] text-zinc-600 dark:text-zinc-400 mb-2 leading-snug">
                                        "Votre capacité d'emprunt a augmenté de 15%."
                                    </p>
                                    <button className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                                        Contacter Sarah M.
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

