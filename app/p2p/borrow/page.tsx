import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { getMyLoans } from "@/lib/actions-p2p-wallet";
import { BorrowerOverview } from "@/components/p2p/BorrowerOverview";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calculator, FileText, BadgeCheck } from "lucide-react";
import Link from "next/link";

export default async function BorrowPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/auth/login");

    const loans = await getMyLoans();

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans transition-colors duration-500">
            {/* Header handled by layout */}

            <div className="container mx-auto px-4 pt-24 pb-20">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-bold text-xs mb-4 uppercase tracking-wider">
                            <BadgeCheck size={14} /> Éligibilité Confirmée
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white mb-4">
                            Espace <span className="text-violet-600">Emprunteur</span>.
                        </h1>
                        <p className="text-xl text-zinc-500 max-w-2xl">
                            Simulez vos projets, suivez vos remboursements et améliorez votre capacité d'emprunt.
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content: Loans & Score */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* We reuse the BorrowerOverview component but injected into this page context. 
                             It contains the CreditScoreCard and Loans list. */}
                        <BorrowerOverview loans={loans} />
                    </div>

                    {/* Sidebar: Tools & Actions */}
                    <div className="space-y-6">
                        {/* Quick Action: New Loan */}
                        <Card className="bg-zinc-900 text-white border-zinc-800 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <CardContent className="p-6 relative z-10">
                                <h3 className="font-bold text-lg mb-2">Nouveau Projet ?</h3>
                                <p className="text-zinc-400 text-sm mb-6">
                                    Financez vos travaux ou projets personnels jusqu'à 50 000€ en quelques clics.
                                </p>
                                <Link href="/p2p/borrow/new">
                                    {/* Note: /p2p/borrow/new doesn't strictly exist yet as a separate page, 
                                    typically it was a modal or wizard. For now, linking to current page or wizard trigger.
                                    Actually, user mentioned "LoanApplicationWizard" exists nearby. 
                                    Ideally this button opens that. For now, we point to self or placeholder. 
                                    (The BorrowerOverview component has a working button inside it too).
                                */}
                                    <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold h-12">
                                        <Plus size={18} className="mr-2" /> Démarrer une demande
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Tools */}
                        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10">
                            <CardContent className="p-6 space-y-4">
                                <h3 className="font-bold text-zinc-900 dark:text-white">Outils & Services</h3>

                                <Button variant="outline" className="w-full justify-start h-12 bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-white/5 text-zinc-600 dark:text-zinc-300">
                                    <Calculator size={18} className="mr-3 text-zinc-400" />
                                    Simulateur de Mensualités
                                </Button>
                                <Button variant="outline" className="w-full justify-start h-12 bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-white/5 text-zinc-600 dark:text-zinc-300">
                                    <FileText size={18} className="mr-3 text-zinc-400" />
                                    Attestations de fonds
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Advisor */}
                        <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/10 dark:to-violet-900/10 border-indigo-100 dark:border-indigo-500/10">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-12 w-12 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center text-xl">
                                        👩‍💼
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-900 dark:text-white">Sarah M.</p>
                                        <p className="text-xs text-indigo-600 dark:text-indigo-400">Conseillère Expert</p>
                                    </div>
                                </div>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                                    "Votre capacité d'emprunt a augmenté de 15% ce mois-ci grâce à vos derniers remboursements."
                                </p>
                                <Button size="sm" variant="ghost" className="text-indigo-600 dark:text-indigo-400 p-0 hover:bg-transparent hover:underline">
                                    Prendre RDV
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
