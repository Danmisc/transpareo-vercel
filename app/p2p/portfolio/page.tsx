import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getPortfolio } from "@/lib/actions-p2p-wallet";
import { getInvestorReturnsSummary } from "@/lib/actions-repayments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    TrendingUp,
    PiggyBank,
    Building2,
    Calendar,
    Percent,
    Target,
    BarChart3,
    PieChart,
    ArrowUpRight,
    Clock,
    MapPin,
    ExternalLink,
    Filter,
    ShieldCheck,
    Briefcase,
    ChevronRight
} from "lucide-react";

export default async function PortfolioPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const [portfolio, returnsSummary] = await Promise.all([
        getPortfolio(),
        getInvestorReturnsSummary()
    ]);

    // Calculate totals
    const totalInvested = returnsSummary?.totalInvested || portfolio.reduce((acc: number, inv: any) => acc + inv.amount, 0);
    const totalReturns = returnsSummary?.totalReturns || 0;
    const activeCount = returnsSummary?.activeCount || portfolio.filter((p: any) => p.status === "ACTIVE").length;
    const completedCount = returnsSummary?.completedCount || 0;
    const averageAPR = returnsSummary?.averageAPR || 7.5;

    // Group by project type for diversification
    const diversification = portfolio.reduce((acc: any, inv: any) => {
        const type = inv.loan?.projectType || "OTHER";
        if (!acc[type]) acc[type] = { amount: 0, count: 0 };
        acc[type].amount += inv.amount;
        acc[type].count += 1;
        return acc;
    }, {});

    const projectTypeLabels: Record<string, { label: string; color: string }> = {
        REAL_ESTATE: { label: "Immobilier", color: "bg-orange-500" },
        RENOVATION: { label: "Rénovation", color: "bg-amber-500" },
        BUSINESS: { label: "Commerce", color: "bg-blue-500" },
        GREEN_ENERGY: { label: "Énergie Verte", color: "bg-emerald-500" },
        AGRICULTURE: { label: "Agriculture", color: "bg-lime-500" },
        OTHER: { label: "Autre", color: "bg-zinc-500" }
    };

    // Group by risk grade
    const riskDistribution = portfolio.reduce((acc: any, inv: any) => {
        const grade = inv.loan?.riskGrade || "B";
        if (!acc[grade]) acc[grade] = { amount: 0, count: 0 };
        acc[grade].amount += inv.amount;
        acc[grade].count += 1;
        return acc;
    }, {});

    const riskGradeLabels: Record<string, { label: string; color: string }> = {
        A: { label: "Grade A", color: "bg-emerald-500" },
        B: { label: "Grade B", color: "bg-amber-500" },
        C: { label: "Grade C", color: "bg-orange-500" },
        D: { label: "Grade D", color: "bg-red-500" }
    };

    // Calculate average duration from actual portfolio
    const avgDuration = portfolio.length > 0
        ? Math.round(portfolio.reduce((sum: number, inv: any) => sum + (inv.loan?.duration || 12), 0) / portfolio.length)
        : 0;

    // Calculate performance metrics
    const performanceMetrics = {
        irr: averageAPR * 0.85, // Simplified IRR approximation
        netReturn: totalInvested > 0 ? ((totalReturns / totalInvested) * 100) : 0,
        avgDuration,
        diversificationScore: Object.keys(diversification).length >= 3 ? "Excellent" :
            Object.keys(diversification).length >= 2 ? "Bon" : "À améliorer"
    };

    return (
        <div className="min-h-screen bg-zinc-50/[0.3] dark:bg-black font-sans pb-12">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">

                {/* Header */}
                <div className="mb-8 flex flex-col items-center text-center gap-4">
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Portfolio Live
                    </div>
                    <div className="max-w-2xl">
                        <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">
                            Mes Investissements
                        </h1>
                        <p className="text-base text-zinc-500">
                            Analysez la performance de votre portefeuille et suivez vos placements en temps réel.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/p2p/market">
                            <Button size="sm" className="rounded-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                                <TrendingUp size={16} className="mr-2" /> Explorer le marché
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

                    {/* Capital Invested - Hero Style */}
                    <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-none relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[60px] group-hover:bg-white/20 transition-all duration-700" />
                        <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
                            <div className="flex items-start justify-between mb-6">
                                <div className="p-2.5 bg-white/10 rounded-lg backdrop-blur-md">
                                    <Target className="w-5 h-5 text-white" />
                                </div>
                                <Badge className="bg-emerald-950/30 hover:bg-emerald-950/40 text-emerald-100 border-none backdrop-blur-sm px-2 py-0.5 text-[10px]">
                                    {activeCount} projets actifs
                                </Badge>
                            </div>
                            <div>
                                <p className="text-emerald-100 text-xs font-medium mb-1 uppercase tracking-wider">Capital Investi</p>
                                <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                                    {totalInvested.toLocaleString('fr-FR')} €
                                </h2>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Returns */}
                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-colors group">
                        <CardContent className="p-6 h-full flex flex-col justify-between">
                            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <PiggyBank className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-zinc-500 text-xs font-medium mb-1 uppercase tracking-wider">Gains générés</p>
                                <h2 className="text-2xl font-bold text-emerald-600 mb-1.5">
                                    +{totalReturns.toLocaleString('fr-FR')} €
                                </h2>
                                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                                    <ArrowUpRight size={12} className="text-emerald-500" />
                                    <span>Rentabilité nette</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Average APR */}
                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors group">
                        <CardContent className="p-6 h-full flex flex-col justify-between">
                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Percent className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-zinc-500 text-xs font-medium mb-1 uppercase tracking-wider">Rendement Moyen</p>
                                <h2 className="text-2xl font-bold text-indigo-600 mb-1.5">
                                    {averageAPR}%
                                </h2>
                                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                                    <Target size={12} className="text-indigo-500" />
                                    <span>Objectif annuel</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {portfolio.length === 0 ? (
                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <CardContent className="py-16 text-center">
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Target className="w-8 h-8 text-zinc-400" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                                Votre portefeuille est vide
                            </h3>
                            <p className="text-zinc-500 mb-6 max-w-sm mx-auto text-sm leading-relaxed">
                                C'est le moment idéal pour commencer. Explorez nos opportunités d'investissement vérifiées.
                            </p>
                            <Link href="/p2p/market">
                                <Button size="default" className="rounded-full bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/20">
                                    Découvrir les opportunités
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-6">

                        {/* Left: Investments List */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Tabs Navigation */}
                            <Tabs defaultValue="active" className="w-full">
                                <div className="flex items-center justify-between mb-4">
                                    <TabsList className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full p-1 h-auto">
                                        <TabsTrigger value="active" className="rounded-full px-3 py-1.5 text-xs data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800">
                                            Actifs <span className="ml-1.5 text-[10px] bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded-full">{activeCount}</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="completed" className="rounded-full px-3 py-1.5 text-xs data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800">
                                            Terminés <span className="ml-1.5 text-[10px] bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded-full">{completedCount}</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="all" className="rounded-full px-3 py-1.5 text-xs data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800">
                                            Tout
                                        </TabsTrigger>
                                    </TabsList>
                                    <Button variant="outline" size="sm" className="hidden sm:flex rounded-full text-xs h-8">
                                        <Filter size={12} className="mr-1.5" /> Filtrer
                                    </Button>
                                </div>

                                <TabsContent value="active" className="space-y-3 m-0">
                                    {portfolio.filter((inv: any) => inv.status === "ACTIVE").map((inv: any) => (
                                        <InvestmentCard key={inv.id} investment={inv} />
                                    ))}
                                    {portfolio.filter((inv: any) => inv.status === "ACTIVE").length === 0 && (
                                        <EmptyState message="Aucun investissement actif" />
                                    )}
                                </TabsContent>

                                <TabsContent value="completed" className="space-y-3 m-0">
                                    {portfolio.filter((inv: any) => inv.status === "COMPLETED").map((inv: any) => (
                                        <InvestmentCard key={inv.id} investment={inv} />
                                    ))}
                                    {portfolio.filter((inv: any) => inv.status === "COMPLETED").length === 0 && (
                                        <EmptyState message="Aucun investissement terminé" />
                                    )}
                                </TabsContent>

                                <TabsContent value="all" className="space-y-3 m-0">
                                    {portfolio.map((inv: any) => (
                                        <InvestmentCard key={inv.id} investment={inv} />
                                    ))}
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Right: Analytics */}
                        <div className="space-y-6">

                            {/* Diversification by Type */}
                            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-bold flex items-center gap-2">
                                        <PieChart size={14} className="text-orange-500" />
                                        Répartition par Type
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {Object.entries(diversification).map(([type, data]: [string, any]) => {
                                        const config = projectTypeLabels[type] || projectTypeLabels.OTHER;
                                        const percentage = totalInvested > 0 ? (data.amount / totalInvested) * 100 : 0;
                                        return (
                                            <div key={type}>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-zinc-600 dark:text-zinc-400 font-medium">{config.label}</span>
                                                    <span className="font-bold text-zinc-900 dark:text-white">{Math.round(percentage)}%</span>
                                                </div>
                                                <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${config.color} transition-all duration-1000 ease-out`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>

                            {/* Risk Distribution */}
                            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-bold flex items-center gap-2">
                                        <BarChart3 size={14} className="text-indigo-500" />
                                        Exposition au Risque
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {Object.entries(riskDistribution).sort().map(([grade, data]: [string, any]) => {
                                        const config = riskGradeLabels[grade] || riskGradeLabels.B;
                                        const percentage = totalInvested > 0 ? (data.amount / totalInvested) * 100 : 0;
                                        return (
                                            <div key={grade}>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-zinc-600 dark:text-zinc-400 font-medium">{config.label}</span>
                                                    <span className="font-bold text-zinc-900 dark:text-white">{Math.round(percentage)}%</span>
                                                </div>
                                                <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${config.color} transition-all duration-1000 ease-out`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>

                            {/* Performance Metrics */}
                            <Card className="bg-gradient-to-br from-zinc-900 to-black text-white border-zinc-800 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[40px]" />
                                <CardHeader className="pb-2 relative z-10">
                                    <CardTitle className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                                        <Target size={14} /> Performance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-center p-2.5 bg-white/5 rounded-lg border border-white/5">
                                        <span className="text-zinc-400 text-xs">Rendement Net</span>
                                        <span className="font-bold text-emerald-400 text-sm">
                                            {performanceMetrics.netReturn.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-2.5 bg-white/5 rounded-lg border border-white/5">
                                        <span className="text-zinc-400 text-xs">TRI Estimé</span>
                                        <span className="font-bold text-white text-sm">
                                            {performanceMetrics.irr.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-2.5 bg-white/5 rounded-lg border border-white/5">
                                        <span className="text-zinc-400 text-xs">Diversification</span>
                                        <Badge className={`${performanceMetrics.diversificationScore === "Excellent"
                                            ? "bg-emerald-500"
                                            : performanceMetrics.diversificationScore === "Bon"
                                                ? "bg-amber-500"
                                                : "bg-red-500"
                                            } text-white border-none hover:opacity-90 text-[10px] px-1.5 py-0`}>
                                            {performanceMetrics.diversificationScore}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper: Empty State
function EmptyState({ message }: { message: string }) {
    return (
        <div className="py-8 bg-zinc-50 dark:bg-zinc-800/30 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-700 text-center">
            <p className="text-zinc-500 text-sm">{message}</p>
        </div>
    );
}

// Investment Card Component
function InvestmentCard({ investment }: { investment: any }) {
    const loan = investment.loan;
    const estimatedReturn = investment.amount * (loan?.apr || 7) / 100;

    const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
        ACTIVE: { label: "Actif", bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400" },
        COMPLETED: { label: "Terminé", bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400" },
        PENDING: { label: "En cours", bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400" }
    };

    const status = statusConfig[investment.status] || statusConfig.PENDING;

    const riskColors: Record<string, string> = {
        A: "bg-emerald-500 text-white shadow-emerald-500/30",
        B: "bg-amber-500 text-white shadow-amber-500/30",
        C: "bg-orange-500 text-white shadow-orange-500/30",
        D: "bg-red-500 text-white shadow-red-500/30"
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:shadow-lg dark:hover:shadow-zinc-900/50 hover:border-orange-200 dark:hover:border-zinc-700 transition-all duration-300 group relative overflow-hidden">
            <div className="flex items-start gap-4 relatie z-10">
                {/* Risk Badge */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base flex-shrink-0 shadow-lg ${riskColors[loan?.riskGrade] || "bg-zinc-500 text-white"}`}>
                    {loan?.riskGrade || "?"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-zinc-900 dark:text-white truncate text-base group-hover:text-orange-600 transition-colors">
                            {loan?.title || "Projet"}
                        </h4>
                        <Badge className={`text-[9px] px-1.5 py-0 border-none ${status.bg} ${status.text}`}>
                            {status.label}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                            <MapPin size={10} className="text-zinc-400" /> {loan?.location || "France"}
                        </span>
                        <span className="w-0.5 h-0.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                        <span className="flex items-center gap-1">
                            <Clock size={10} className="text-zinc-400" /> {loan?.duration || 12} mois
                        </span>
                        <span className="w-0.5 h-0.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                        <span className="flex items-center gap-1">
                            <Calendar size={10} className="text-zinc-400" /> {new Date(investment.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                    </div>
                </div>

                {/* Amount & Return */}
                <div className="text-right flex-shrink-0 hidden sm:block">
                    <p className="text-lg font-bold text-zinc-900 dark:text-white mb-0.5">
                        {investment.amount.toLocaleString('fr-FR')} €
                    </p>
                    <p className="text-xs text-emerald-600 flex items-center justify-end gap-1 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0 rounded-md">
                        <ArrowUpRight size={12} />
                        +{Math.round(estimatedReturn)} €/an
                    </p>
                </div>

                {/* Mobile Link Arrow */}
                <div className="sm:hidden flex items-center justify-center h-10">
                    <ChevronRight className="text-zinc-300" size={16} />
                </div>
            </div>

            {/* Mobile Amount (visible only on small screens) */}
            <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 sm:hidden flex justify-between items-center">
                <span className="text-xs text-zinc-500">Investissement</span>
                <strong className="text-sm text-zinc-900 dark:text-white">{investment.amount.toLocaleString('fr-FR')} €</strong>
            </div>

            {/* Link Overlay */}
            <Link href={`/p2p/market/${loan?.id}`} className="absolute inset-0 z-20" />
        </div>
    );
}

