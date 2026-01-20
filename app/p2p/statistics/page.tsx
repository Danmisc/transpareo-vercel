import { getPlatformStatistics, getProjectRiskBreakdown, getProjectTypeBreakdown } from "@/lib/actions-statistics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    TrendingUp,
    Users,
    Briefcase,
    Shield,
    AlertTriangle,
    CheckCircle,
    PiggyBank,
    BarChart3,
    Activity,
    Clock,
    ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatisticsCharts } from "@/components/p2p/StatisticsCharts";

export default async function StatisticsPage() {
    const [stats, riskBreakdown, typeBreakdown] = await Promise.all([
        getPlatformStatistics(),
        getProjectRiskBreakdown(),
        getProjectTypeBreakdown()
    ]);

    return (
        <div className="min-h-screen bg-zinc-50/[0.3] dark:bg-black font-sans pb-12 relative">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">

                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
                    <div>
                        <Badge className="mb-3 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-none px-2.5 py-0.5 text-xs">
                            <BarChart3 size={12} className="mr-1.5" /> Transparence
                        </Badge>
                        <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">Statistiques</h1>
                        <p className="text-sm text-zinc-500 max-w-xl">
                            Indicateurs de performance et de risque conformément à la réglementation EU ECSPR.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Clock size={12} />
                        <span>Mise à jour: {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>

                {/* Hero Stats Compact */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-none shadow-lg shadow-emerald-900/10">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-2 text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">
                                <TrendingUp size={14} /> Volume Financé
                            </div>
                            <p className="text-2xl font-black">
                                {Number((stats.totalFundedVolume / 1000000).toFixed(1)).toLocaleString('fr-FR')}M €
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">
                                <Briefcase size={14} /> Projets
                            </div>
                            <p className="text-2xl font-black text-zinc-900 dark:text-white">{stats.totalProjectsCount}</p>
                            <p className="text-[10px] text-zinc-400 mt-1">
                                {stats.activeProjectsCount} en cours
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">
                                <Users size={14} /> Investisseurs
                            </div>
                            <p className="text-2xl font-black text-zinc-900 dark:text-white">{stats.totalInvestors}</p>
                            <p className="text-[10px] text-zinc-400 mt-1">
                                Actifs sur la plateforme
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">
                                <PiggyBank size={14} /> Intérêts Versés
                            </div>
                            <p className="text-2xl font-black text-emerald-600">
                                {Number((stats.totalReturnsDistributed / 1000).toFixed(0)).toLocaleString('fr-FR')}k €
                            </p>
                            <p className="text-[10px] text-zinc-400 mt-1">
                                Aux investisseurs
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Performance & Charts */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Performance Strip */}
                        <div className="grid grid-cols-3 gap-4">
                            <Card className="bg-zinc-900 text-white border-zinc-800">
                                <CardContent className="p-4 text-center">
                                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Rendement Moyen</p>
                                    <p className="text-2xl font-black text-emerald-400">{stats.averageApr}%</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                <CardContent className="p-4 text-center">
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Rendement Réel</p>
                                    <p className="text-2xl font-black text-blue-600">{stats.averageActualReturn}%</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                <CardContent className="p-4 text-center">
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Durée Moyenne</p>
                                    <p className="text-2xl font-black text-zinc-900 dark:text-white">{stats.averageDuration} <span className="text-sm font-normal text-zinc-400">mois</span></p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Visual Charts */}
                        <StatisticsCharts
                            monthlyStats={stats.monthlyStats}
                            riskBreakdown={riskBreakdown}
                            typeBreakdown={typeBreakdown}
                        />

                    </div>

                    {/* Right Column - Risk Indicators (Compliance) */}
                    <div className="space-y-6">

                        {/* Default Rates - Critical Transparency */}
                        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                            <CardHeader className="pb-3 pt-5 px-5">
                                <CardTitle className="flex items-center gap-2 text-base font-bold">
                                    <Shield className="text-indigo-500" size={18} />
                                    Indicateurs de Risque
                                </CardTitle>
                                <p className="text-xs text-zinc-500">
                                    Conformité ECSPR (Maj: Journalière)
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-5 px-5 pb-6">
                                {/* Default Rate */}
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="font-medium flex items-center gap-2 text-sm">
                                            <AlertTriangle size={14} className="text-red-500" />
                                            Taux de défaut
                                        </span>
                                        <span className={`text-lg font-bold ${stats.defaultRate < 2 ? "text-emerald-600" :
                                            stats.defaultRate < 5 ? "text-amber-600" : "text-red-600"
                                            }`}>
                                            {stats.defaultRate.toFixed(2)}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={Math.min(stats.defaultRate * 10, 100)}
                                        className="h-1.5 bg-zinc-100 dark:bg-zinc-800"
                                    />
                                    <p className="text-[10px] text-zinc-400 mt-1">
                                        Projets en défaut de paiement (&gt; 90 jours)
                                    </p>
                                </div>

                                {/* Late Payment Rate */}
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="font-medium flex items-center gap-2 text-sm">
                                            <Clock size={14} className="text-amber-500" />
                                            Taux de retard
                                        </span>
                                        <span className={`text-lg font-bold ${stats.latePaymentRate < 5 ? "text-emerald-600" :
                                            stats.latePaymentRate < 15 ? "text-amber-600" : "text-red-600"
                                            }`}>
                                            {stats.latePaymentRate.toFixed(2)}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={Math.min(stats.latePaymentRate * 5, 100)}
                                        className="h-1.5 bg-zinc-100 dark:bg-zinc-800"
                                    />
                                    <p className="text-[10px] text-zinc-400 mt-1">
                                        Paiements retardés (&lt; 90 jours)
                                    </p>
                                </div>

                                {/* On-Time Rate */}
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="font-medium flex items-center gap-2 text-sm">
                                            <CheckCircle size={14} className="text-emerald-500" />
                                            Paiements à l'heure
                                        </span>
                                        <span className="text-lg font-bold text-emerald-600">
                                            {stats.onTimePaymentRate.toFixed(1)}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={stats.onTimePaymentRate}
                                        className="h-1.5 bg-zinc-100 dark:bg-zinc-800"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* CTA */}
                        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 border-orange-200 dark:border-orange-800 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[40px]" />
                            <CardContent className="p-5 text-center relative z-10">
                                <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1">Convaincu ?</h3>
                                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
                                    Rejoignez nos investisseurs et profitez de rendements attractifs.
                                </p>
                                <Link href="/p2p/market">
                                    <Button className="w-full bg-orange-600 hover:bg-orange-500 text-sm font-bold shadow-lg shadow-orange-500/20">
                                        Investir maintenant <ArrowUpRight size={16} className="ml-2" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Legal Disclaimer */}
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                            <p className="text-[10px] text-zinc-400 text-center leading-relaxed">
                                <strong>Avertissement :</strong> Les performances passées ne préjugent pas des performances futures.
                                Le prêt participatif comporte un risque de perte en capital et d'illiquidité.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

