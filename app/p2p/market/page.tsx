import { DealMarketplace } from "@/components/p2p/DealMarketplace";
import { getAvailableLoans } from "@/lib/actions-p2p-loans";
import { getMyWallet } from "@/lib/actions-p2p-wallet";
import { getCurrentUser } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    TrendingUp,
    Users,
    PiggyBank,
    ShieldCheck,
    ArrowRight,
    Sparkles,
    Building2,
    Wallet
} from "lucide-react";
import Link from "next/link";

export default async function P2PMarketplacePage() {
    const user = await getCurrentUser();
    const loans = await getAvailableLoans();
    const wallet = user ? await getMyWallet() : null;

    // Calculate statistics
    const totalVolume = loans.reduce((sum, l: any) => sum + l.amount, 0);
    const totalFunded = loans.reduce((sum, l: any) => sum + l.funded, 0);
    const avgAPR = loans.length > 0
        ? loans.reduce((sum, l: any) => sum + l.apr, 0) / loans.length
        : 0;
    const projectCount = loans.filter((l: any) => l.status === "FUNDING").length;

    return (
        <div className="min-h-screen bg-zinc-50/[0.3] dark:bg-black font-sans pb-20 relative">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* Hero Stats Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-black p-8 md:p-12 mb-12 border border-zinc-800 shadow-2xl">
                    {/* Background Effects */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-50" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 opacity-50" />

                    <div className="relative z-10">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
                            <div className="max-w-2xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-6">
                                    <Sparkles size={14} /> Investissement Participatif
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                                    Opportunités <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">Exclusives</span>
                                </h1>
                                <p className="text-lg text-zinc-400 leading-relaxed">
                                    Accédez à une sélection rigoureuse de projets immobiliers et commerciaux.
                                    Investissez dès 100€ et percevez des intérêts mensuels.
                                </p>
                            </div>

                            {wallet && (
                                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 min-w-[240px] shadow-xl">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                                            <PiggyBank size={20} className="text-emerald-400" />
                                        </div>
                                        <p className="text-zinc-300 text-sm font-medium">Gains disponibles</p>
                                    </div>
                                    <p className="text-3xl font-black text-white mb-3">
                                        {wallet.balance.toLocaleString('fr-FR')} €
                                    </p>
                                    <Link href="/p2p/gains" className="block">
                                        <Button size="sm" className="w-full bg-white/10 hover:bg-white/20 text-white border-none">
                                            Voir mes gains
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Volume Total", value: `${(totalVolume / 1000000).toFixed(1)}M €`, icon: PiggyBank, color: "text-white" },
                                { label: "Rendement Moyen", value: `${avgAPR.toFixed(1)}%`, icon: TrendingUp, color: "text-emerald-400" },
                                { label: "Projets Actifs", value: projectCount, icon: ShieldCheck, color: "text-white" },
                                { label: "Taux Financement", value: `${((totalFunded / totalVolume) * 100 || 0).toFixed(0)}%`, icon: Users, color: "text-orange-400" },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/5 hover:border-white/10 transition-colors rounded-xl p-5">
                                    <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">
                                        <stat.icon size={14} /> {stat.label}
                                    </div>
                                    <p className={`text-2xl md:text-3xl font-black ${stat.color}`}>
                                        {stat.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Info Banner (if not logged in) */}
                {!user && (
                    <Card className="mb-12 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 border-orange-200 dark:border-orange-900/30 overflow-hidden">
                        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                            <div className="flex items-start gap-6 relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                    <ShieldCheck className="text-white" size={28} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-zinc-900 dark:text-white mb-2">S'inscrire pour investir</h3>
                                    <p className="text-zinc-600 dark:text-zinc-400 max-w-lg">
                                        Rejoignez plus de 5000 investisseurs et accédez aux détails complets des projets,
                                        aux documents financiers et à la souscription en ligne.
                                    </p>
                                </div>
                            </div>
                            <Link href="/register" className="relative z-10">
                                <Button size="lg" className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-xl">
                                    Créer mon compte
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* Marketplace with Filters */}
                <div className="mb-20">
                    <DealMarketplace loans={loans as any[]} />
                </div>

                {/* Bottom CTA */}
                <div className="relative overflow-hidden rounded-3xl bg-zinc-900 dark:bg-black border border-zinc-800 p-8 md:p-16 text-center md:text-left">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-transparent to-transparent opacity-50" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="max-w-2xl">
                            <h2 className="text-3xl font-black text-white mb-4">Vous êtes porteur de projet ?</h2>
                            <p className="text-lg text-zinc-400">
                                Obtenez un financement rapide et flexible pour vos opérations de promotion immobilière ou de développement commercial.
                            </p>
                        </div>
                        <Link href="/p2p/borrow">
                            <Button size="lg" className="h-14 px-8 rounded-full bg-white text-black hover:bg-zinc-100 font-bold text-lg pointer-events-auto">
                                Soumettre un dossier <ArrowRight className="ml-2" size={20} />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

