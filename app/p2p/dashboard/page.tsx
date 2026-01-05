import { getMyWallet, getKYCStatus, getPortfolio } from "@/lib/actions-p2p-wallet";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StripeChart } from "@/components/p2p/dashboard/StripeChart";
import { ArrowRight, Plus, ExternalLink, ShieldCheck, Banknote, CreditCard } from "lucide-react";
import Link from "next/link";
import { TopUpModal } from "@/components/p2p/wallet/TopUpModal";
import { TransferModal } from "@/components/p2p/wallet/TransferModal";

// Mock Data for Chart
const CHART_DATA = [
    { name: '00:00', value: 4000 },
    { name: '04:00', value: 4000 },
    { name: '08:00', value: 4200 },
    { name: '12:00', value: 4100 },
    { name: '16:00', value: 5500 }, // Deposit
    { name: '20:00', value: 5500 },
    { name: '23:59', value: 5500 },
];

export default async function P2PDashboardPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/auth/login");

    const [wallet, kyc, portfolio] = await Promise.all([
        getMyWallet(),
        getKYCStatus(),
        getPortfolio()
    ]);

    // Calculate Total Volume (Cash + Investments)
    const investedAmount = portfolio.reduce((acc, inv) => acc + inv.amount, 0);
    const totalVolume = wallet.balance + investedAmount;

    return (
        <div className="min-h-screen bg-white dark:bg-black font-sans text-zinc-900 dark:text-zinc-100">
            <div className="max-w-[1400px] mx-auto px-6 py-8">

                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-3xl font-bold mb-2">Aujourd'hui</h1>
                    <p className="text-zinc-500">Vue d'ensemble de vos finances P2P.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

                    {/* Main Content (3/4) */}
                    <div className="lg:col-span-3 space-y-10">

                        {/* Metrics & Chart */}
                        <div>
                            <div className="flex gap-12 mb-6">
                                <div>
                                    <p className="text-sm font-medium text-zinc-500 mb-1">Volume brut</p>
                                    <p className="text-3xl font-semibold tracking-tight">
                                        {totalVolume.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-zinc-500 mb-1">Hier</p>
                                    <p className="text-3xl font-semibold tracking-tight text-zinc-400">
                                        {(totalVolume * 0.95).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                    </p>
                                </div>
                            </div>

                            <div className="h-[300px] w-full border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                <StripeChart data={CHART_DATA} />
                            </div>
                        </div>

                        {/* Recent Activity / Overview */}
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Votre aperçu</h2>
                                <div className="flex gap-2">
                                    <TopUpModal>
                                        <Button variant="outline" size="sm" className="rounded-md border-zinc-200 text-zinc-600 bg-white hover:bg-zinc-50">
                                            <Banknote size={14} className="mr-2" /> Déposer
                                        </Button>
                                    </TopUpModal>
                                    <TransferModal userId={user.id} beneficiaries={[]} balance={wallet.balance}>
                                        <Button variant="outline" size="sm" className="rounded-md border-zinc-200 text-zinc-600 bg-white hover:bg-zinc-50">
                                            <CreditCard size={14} className="mr-2" /> Virer
                                        </Button>
                                    </TransferModal>
                                </div>
                            </div>

                            {/* Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Solde Card */}
                                <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:shadow-sm transition-shadow">
                                    <p className="text-sm font-medium text-zinc-500 mb-2">Solde en EUR</p>
                                    <p className="text-2xl font-bold mb-4">{wallet.balance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
                                    <div className="flex gap-4">
                                        <Link href="/p2p/wallet" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center">
                                            Afficher les détails <ArrowRight size={14} className="ml-1" />
                                        </Link>
                                    </div>
                                </div>

                                {/* Active Investments Card */}
                                <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:shadow-sm transition-shadow">
                                    <p className="text-sm font-medium text-zinc-500 mb-2">Investissements Actifs</p>
                                    <p className="text-2xl font-bold mb-4">{investedAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
                                    <div className="flex gap-4">
                                        <Link href="/p2p/portfolio" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center">
                                            Gérer le portefeuille <ArrowRight size={14} className="ml-1" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Sidebar (1/4) */}
                    <div className="space-y-6">

                        {/* Recommendations */}
                        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-5">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Recommandations</h3>
                                <button className="text-zinc-400 hover:text-zinc-600">×</button>
                            </div>
                            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
                                Utilisez <span className="text-indigo-600 font-medium">Connect Accounts</span> pour centraliser vos banques externes et avoir une vision globale.
                            </p>
                            <Link href="/p2p/wallet">
                                <Button variant="outline" className="w-full justify-start text-xs h-8 bg-white dark:bg-black border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                                    <Plus size={12} className="mr-2" /> Connecter une banque
                                </Button>
                            </Link>
                        </div>

                        {/* Quick Status */}
                        <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg p-5">
                            <h3 className="font-semibold text-sm mb-4">Statut Compte</h3>
                            <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/50">
                                <span className="text-xs text-zinc-500">Identité</span>
                                <span className="text-xs font-medium flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    <ShieldCheck size={10} /> {kyc?.status || 'Incomplet'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-xs text-zinc-500">Clé API</span>
                                <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 rounded text-zinc-600 dark:text-zinc-400">pk_live_...</span>
                            </div>
                            <div className="mt-4 pt-2">
                                <Link href="#" className="text-xs text-indigo-600 hover:underline">Consulter la documentation</Link>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
