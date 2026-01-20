import { getOnboardingProgress } from "@/lib/actions-onboarding";
import { OnboardingPath } from "@/components/p2p/dashboard/OnboardingPath";
import { getMyWallet, getKYCStatus, getPortfolio, getPortfolioHistory, getWalletStats } from "@/lib/actions-p2p-wallet";
import { getInvestorReturnsSummary, getUpcomingRepayments } from "@/lib/actions-repayments";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StripeChart } from "@/components/p2p/dashboard/StripeChart";
import { Badge } from "@/components/ui/badge";
import {
    ArrowRight,
    TrendingUp,
    PiggyBank,
    Wallet,
    ShieldCheck,
    Calendar,
    BarChart3,
    Target,
    Sparkles,
    Clock,
    Bell,
    AlertCircle
} from "lucide-react";
import Link from "next/link";

export default async function P2PDashboardPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const [wallet, kyc, portfolio, onboardingData, returnsSummary, chartData, walletStats, upcomingRepayments] = await Promise.all([
        getMyWallet(),
        getKYCStatus(),
        getPortfolio(),
        getOnboardingProgress(),
        getInvestorReturnsSummary(),
        getPortfolioHistory(6),
        getWalletStats(),
        getUpcomingRepayments()
    ]);

    if (!wallet) return redirect("/login?error=stale_session");

    // Calculate metrics from real data
    const investedAmount = returnsSummary?.totalInvested || portfolio.reduce((acc: number, inv: any) => acc + inv.amount, 0);
    const totalVolume = (walletStats?.totalValue || wallet.balance + investedAmount);
    const totalReturns = returnsSummary?.totalReturns || walletStats?.totalReturns || 0;
    const averageAPR = returnsSummary?.averageAPR || 0;
    const activeCount = returnsSummary?.activeCount || portfolio.filter((p: any) => p.status === "ACTIVE").length;

    // Calculate potential annual return
    const potentialAnnualReturn = investedAmount > 0 && averageAPR > 0
        ? investedAmount * (averageAPR / 100)
        : 0;

    // Format chart data - use real data or empty state
    const formattedChartData = chartData.length > 0
        ? chartData
        : [{ name: 'Aujourd\'hui', value: totalVolume }];

    // Upcoming repayments
    const nextRepayments = upcomingRepayments?.slice(0, 3) || [];

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-950 font-sans text-zinc-900 dark:text-zinc-100">
            <div className="max-w-[1400px] mx-auto px-6 py-8">

                {/* Onboarding Path (Top Priority) */}
                <div className="mb-8">
                    <OnboardingPath data={onboardingData} />
                </div>

                {/* Header with Welcome */}
                <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 text-xs font-bold uppercase tracking-wider mb-3">
                            <Sparkles size={12} /> Investisseur
                        </div>
                        <h1 className="text-3xl font-bold mb-1">Bonjour, {user.name?.split(' ')[0] || 'Investisseur'} 👋</h1>
                        <p className="text-zinc-500">Votre portefeuille d'investissement en un coup d'œil.</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/p2p/gains">
                            <Button variant="outline" size="sm">
                                <PiggyBank size={14} className="mr-2" /> Mes Gains
                            </Button>
                        </Link>
                        <Link href="/p2p/market">
                            <Button size="sm" className="bg-orange-600 hover:bg-orange-500">
                                <TrendingUp size={14} className="mr-2" /> Investir
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Main Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {/* Total Value */}
                    <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-black dark:to-zinc-900 text-white border-none overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <CardContent className="p-6 relative z-10">
                            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                                <BarChart3 size={16} /> Valeur Totale
                            </div>
                            <p className="text-3xl font-bold">
                                {totalVolume.toLocaleString('fr-FR')} €
                            </p>
                            {totalReturns > 0 && (
                                <p className="text-emerald-400 text-sm mt-1">
                                    dont +{totalReturns.toLocaleString('fr-FR')} € de gains
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Available Gains Balance */}
                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 text-zinc-500 text-sm mb-2">
                                <PiggyBank size={16} /> Gains disponibles
                            </div>
                            <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                                {wallet.balance.toLocaleString('fr-FR')} €
                            </p>
                        </CardContent>
                    </Card>

                    {/* Invested */}
                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 text-zinc-500 text-sm mb-2">
                                <TrendingUp size={16} /> Investi
                            </div>
                            <p className="text-3xl font-bold text-emerald-600">
                                {investedAmount.toLocaleString('fr-FR')} €
                            </p>
                            <p className="text-sm text-zinc-400 mt-1">
                                {activeCount} projet{activeCount > 1 ? 's' : ''} actif{activeCount > 1 ? 's' : ''}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Returns */}
                    <Card className="bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 text-emerald-600 text-sm mb-2">
                                <PiggyBank size={16} /> Rendements
                            </div>
                            <p className="text-3xl font-bold text-emerald-600">
                                +{totalReturns.toLocaleString('fr-FR')} €
                            </p>
                            {averageAPR > 0 && (
                                <p className="text-sm text-emerald-600/70 mt-1">
                                    Taux moyen {averageAPR.toFixed(1)}%
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Main Content (3/4) */}
                    <div className="lg:col-span-3 space-y-8">

                        {/* Portfolio Performance Chart */}
                        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="font-bold text-lg">Évolution du Portefeuille</h3>
                                        <p className="text-sm text-zinc-500">Performance sur les 6 derniers mois</p>
                                    </div>
                                    {averageAPR > 0 && (
                                        <div className="text-right">
                                            <p className="text-sm text-zinc-500">Rendement moyen</p>
                                            <p className="text-xl font-bold text-emerald-600">{averageAPR.toFixed(1)}%</p>
                                        </div>
                                    )}
                                </div>
                                <div className="h-[250px]">
                                    {formattedChartData.length > 1 ? (
                                        <StripeChart data={formattedChartData} />
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-zinc-400">
                                            <div className="text-center">
                                                <BarChart3 className="mx-auto mb-3 w-12 h-12 text-zinc-300" />
                                                <p>Pas encore assez de données pour le graphique</p>
                                                <p className="text-sm">Commencez à investir pour voir l'évolution</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Active Investments */}
                        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-lg">Investissements Actifs</h3>
                                    <Link href="/p2p/portfolio">
                                        <Button variant="ghost" size="sm" className="text-orange-600">
                                            Voir tout <ArrowRight size={14} className="ml-1" />
                                        </Button>
                                    </Link>
                                </div>

                                {portfolio.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Target className="mx-auto mb-4 w-12 h-12 text-zinc-300" />
                                        <h4 className="font-bold mb-2">Aucun investissement</h4>
                                        <p className="text-zinc-500 text-sm mb-4">
                                            Commencez à diversifier votre portefeuille
                                        </p>
                                        <Link href="/p2p/market">
                                            <Button className="bg-orange-600 hover:bg-orange-500">
                                                Découvrir les projets
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {portfolio.slice(0, 5).map((inv: any) => {
                                            const loan = inv.loan;
                                            const estimatedReturn = inv.amount * (loan?.apr || 7) / 100;
                                            return (
                                                <Link
                                                    key={inv.id}
                                                    href={`/p2p/market/${loan?.id}`}
                                                    className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${loan?.riskGrade === "A" ? "bg-emerald-500" :
                                                            loan?.riskGrade === "B" ? "bg-amber-500" :
                                                                loan?.riskGrade === "C" ? "bg-orange-500" :
                                                                    "bg-red-500"
                                                            }`}>
                                                            {loan?.riskGrade || "?"}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{loan?.title || "Projet"}</p>
                                                            <p className="text-sm text-zinc-500">
                                                                {loan?.duration} mois • {loan?.apr}%
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold">{inv.amount.toLocaleString('fr-FR')} €</p>
                                                        <p className="text-sm text-emerald-600">
                                                            +{Math.round(estimatedReturn).toLocaleString('fr-FR')} €/an
                                                        </p>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Upcoming Repayments */}
                        {nextRepayments.length > 0 && (
                            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                <CardContent className="p-6">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <Calendar size={18} className="text-indigo-500" />
                                        Prochains Remboursements
                                    </h3>
                                    <div className="space-y-3">
                                        {nextRepayments.map((rep: any) => (
                                            <div key={rep.id} className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg">
                                                <div>
                                                    <p className="font-medium">{rep.loan?.title || "Projet"}</p>
                                                    <p className="text-sm text-zinc-500">
                                                        Échéance le {new Date(rep.dueDate).toLocaleDateString('fr-FR')}
                                                    </p>
                                                </div>
                                                <p className="font-bold text-emerald-600">
                                                    +{rep.amount.toLocaleString('fr-FR')} €
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Sidebar (1/4) */}
                    <div className="space-y-6">

                        {/* Account Status */}
                        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                            <CardContent className="p-5">
                                <h3 className="font-semibold text-sm mb-4">Statut du compte</h3>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm text-zinc-500">Identité (KYC)</span>
                                        <Badge className={`text-xs ${kyc?.status === 'VERIFIED'
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                            }`}>
                                            {kyc?.status === 'VERIFIED' ? '✓ Vérifié' : 'En attente'}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm text-zinc-500">Limite annuelle</span>
                                        <span className="text-sm font-medium">
                                            {kyc?.status === 'VERIFIED' ? '100 000 €' : '1 000 €'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm text-zinc-500">Projets actifs</span>
                                        <span className="text-sm font-medium">{activeCount}</span>
                                    </div>
                                </div>

                                {kyc?.status !== 'VERIFIED' && (
                                    <Link href="/p2p/settings/kyc" className="mt-4 block">
                                        <Button size="sm" variant="outline" className="w-full">
                                            <ShieldCheck size={14} className="mr-2" />
                                            Vérifier mon identité
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>

                        {/* Potential Returns */}
                        {potentialAnnualReturn > 0 && (
                            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 border-emerald-200 dark:border-emerald-900/30">
                                <CardContent className="p-5">
                                    <h3 className="font-semibold text-sm text-emerald-800 dark:text-emerald-300 mb-2">
                                        Estimation Annuelle
                                    </h3>
                                    <p className="text-2xl font-bold text-emerald-600 mb-1">
                                        +{potentialAnnualReturn.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                                    </p>
                                    <p className="text-xs text-emerald-600/70">
                                        Basé sur {averageAPR.toFixed(1)}% de rendement moyen
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Monthly Activity */}
                        {walletStats?.monthly && (
                            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                <CardContent className="p-5">
                                    <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                                        <Clock size={14} /> Ce mois-ci
                                    </h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">Dépôts</span>
                                            <span className="font-medium text-emerald-600">
                                                +{walletStats.monthly.deposits.toLocaleString('fr-FR')} €
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">Investissements</span>
                                            <span className="font-medium">
                                                {walletStats.monthly.investments.toLocaleString('fr-FR')} €
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">Rendements</span>
                                            <span className="font-medium text-emerald-600">
                                                +{walletStats.monthly.returns.toLocaleString('fr-FR')} €
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Actions */}
                        <Card className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                            <CardContent className="p-5">
                                <h3 className="font-semibold text-sm mb-4">Actions rapides</h3>
                                <div className="space-y-2">
                                    <Link href="/p2p/market" className="block">
                                        <Button variant="outline" className="w-full justify-start text-sm bg-white dark:bg-black">
                                            <TrendingUp size={14} className="mr-2" /> Explorer les projets
                                        </Button>
                                    </Link>
                                    <Link href="/p2p/gains" className="block">
                                        <Button variant="outline" className="w-full justify-start text-sm bg-white dark:bg-black">
                                            <PiggyBank size={14} className="mr-2" /> Mes gains
                                        </Button>
                                    </Link>
                                    <Link href="/p2p/portfolio" className="block">
                                        <Button variant="outline" className="w-full justify-start text-sm bg-white dark:bg-black">
                                            <PiggyBank size={14} className="mr-2" /> Mon portefeuille
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

