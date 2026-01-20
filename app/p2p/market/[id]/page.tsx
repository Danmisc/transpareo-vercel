import { getLoanDetails } from "@/lib/actions-p2p-loans";
import { getGainsBalance } from "@/lib/actions-investment-checkout";
import { getSocialTrust } from "@/lib/actions-p2p-social";
import { getCurrentUser } from "@/lib/session";
import { InvestWidget } from "@/components/p2p/InvestWidget";
import { ProjectTimeline } from "@/components/p2p/ProjectTimeline";
import { TrustBadge } from "@/components/p2p/TrustBadge";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
    MapPin,
    ShieldCheck,
    User,
    ArrowLeft,
    Calendar,
    TrendingUp,
    Users,
    FileText,
    Clock,
    Building2,
    BarChart3,
    ChevronRight,
    Target,
    PiggyBank
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getCurrentUser();
    const loan = await getLoanDetails(id);
    const gainsData = await getGainsBalance();

    if (!loan) return notFound();

    const trustData = await getSocialTrust(loan.borrowerId);
    const percentFunded = loan.fundingProgress || (loan.funded / loan.amount) * 100;
    const isOwner = user?.id === loan.borrowerId;
    const investorCount = loan.investorCount || loan.investments?.length || 0;
    const daysLeft = Math.max(0, 30 - Math.floor((Date.now() - new Date(loan.createdAt).getTime()) / (1000 * 60 * 60 * 24)));

    // Project type labels
    const projectTypeLabels: Record<string, { label: string; icon: string; color: string }> = {
        REAL_ESTATE: { label: "Immobilier", icon: "🏠", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
        RENOVATION: { label: "Rénovation", icon: "🔨", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
        BUSINESS: { label: "Commerce", icon: "🏪", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
        GREEN_ENERGY: { label: "Énergie Verte", icon: "🌱", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
        AGRICULTURE: { label: "Agriculture", icon: "🌾", color: "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400" }
    };
    const projectType = projectTypeLabels[loan.projectType || ""] || { label: "Autre", icon: "📋", color: "bg-zinc-100 text-zinc-700" };

    // Risk grade colors
    const riskColors: Record<string, string> = {
        A: "bg-emerald-500 text-white shadow-emerald-500/30",
        B: "bg-amber-500 text-white shadow-amber-500/30",
        C: "bg-orange-500 text-white shadow-orange-500/30",
        D: "bg-red-500 text-white shadow-red-500/30"
    };

    return (
        <div className="min-h-screen bg-zinc-50/[0.3] dark:bg-black font-sans pb-12 relative">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">

                {/* Back Button */}
                <div className="mb-6">
                    <Link href="/p2p/market">
                        <Button variant="ghost" size="sm" className="pl-0 hover:pl-0 hover:bg-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors group">
                            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            Retour aux opportunités
                        </Button>
                    </Link>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Left Column: Project Content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Project Header */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <Badge className={`${projectType.color} border-none px-2.5 py-0.5 text-xs font-semibold`}>
                                    {projectType.icon} {projectType.label}
                                </Badge>
                                {loan.status === "FUNDING" && (
                                    <Badge className="bg-emerald-500 text-white border-none px-2.5 py-0.5 text-xs">
                                        En cours
                                    </Badge>
                                )}
                            </div>

                            <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white mb-3 leading-tight text-balance">
                                {loan.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                                <span className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                                    <MapPin size={14} className="text-zinc-400" /> {loan.location || "France"}
                                </span>
                                <span className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                                    <User size={14} className="text-zinc-400" /> {loan.borrower?.name || "Anonyme"}
                                </span>
                            </div>
                        </div>

                        {/* Hero Image / Banner */}
                        <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden relative shadow-xl">
                            {/* Placeholder Gradient if no image */}
                            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            </div>

                            {/* Overlay Stats */}
                            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                                <div>
                                    <p className="text-white/60 text-xs uppercase font-bold tracking-wider mb-1">Objectif</p>
                                    <p className="text-3xl font-black text-white">{loan.amount.toLocaleString('fr-FR')} €</p>
                                </div>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl backdrop-blur-md shadow-2xl ${riskColors[loan.riskGrade] || "bg-zinc-500 text-white"}`}>
                                    {loan.riskGrade}
                                </div>
                            </div>
                        </div>

                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-colors">
                                <CardContent className="p-4 text-center">
                                    <div className="w-10 h-10 mx-auto mb-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600">
                                        <TrendingUp size={18} />
                                    </div>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Rendement</p>
                                    <p className="text-xl font-black text-emerald-600">{loan.apr}%</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                <CardContent className="p-4 text-center">
                                    <div className="w-10 h-10 mx-auto mb-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-600">
                                        <Calendar size={18} />
                                    </div>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Durée</p>
                                    <p className="text-xl font-black text-zinc-900 dark:text-white">{loan.duration} <span className="text-xs font-medium text-zinc-400">mois</span></p>
                                </CardContent>
                            </Card>
                            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                <CardContent className="p-4 text-center">
                                    <div className="w-10 h-10 mx-auto mb-2 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                                        <Users size={18} />
                                    </div>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Investisseurs</p>
                                    <p className="text-xl font-black text-zinc-900 dark:text-white">{investorCount}</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                <CardContent className="p-4 text-center">
                                    <div className="w-10 h-10 mx-auto mb-2 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-orange-600">
                                        <Clock size={18} />
                                    </div>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Fin</p>
                                    <p className="text-xl font-black text-orange-600">{daysLeft}j</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Tabs Interface */}
                        <Tabs defaultValue="details" className="bg-transparent">
                            <TabsList className="w-full justify-start h-auto bg-transparent border-b border-zinc-200 dark:border-zinc-800 rounded-none p-0 mb-6 gap-6">
                                <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-600 bg-transparent px-0 py-3 text-sm font-medium hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">
                                    Détails du projet
                                </TabsTrigger>
                                <TabsTrigger value="financials" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-600 bg-transparent px-0 py-3 text-sm font-medium hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">
                                    Viabilité Financière
                                </TabsTrigger>
                                <TabsTrigger value="investors" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-600 bg-transparent px-0 py-3 text-sm font-medium hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">
                                    Investisseurs <span className="ml-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] px-1.5 py-0.5 rounded-full">{investorCount}</span>
                                </TabsTrigger>
                                <TabsTrigger value="updates" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-600 bg-transparent px-0 py-3 text-sm font-medium hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">
                                    Mises à jour
                                    {loan.updates?.length > 0 && (
                                        <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                    )}
                                </TabsTrigger>
                            </TabsList>

                            <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 min-h-[400px]">
                                <TabsContent value="details" className="mt-0">
                                    <h3 className="text-lg font-bold mb-4">À propos</h3>
                                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap mb-8 text-sm md:text-base">
                                        {loan.description || "Aucune description fournie pour ce projet."}
                                    </p>

                                    <div className="grid grid-cols-2 gap-y-6 gap-x-12 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                        <div>
                                            <p className="text-xs text-zinc-500 mb-1">Type de remboursement</p>
                                            <p className="font-bold text-sm">Mensuel (constant)</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-500 mb-1">Garantie</p>
                                            <p className="font-bold text-sm flex items-center gap-1">
                                                <ShieldCheck size={14} className="text-emerald-500" /> Caution Personnelle
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-500 mb-1">Montant minimum</p>
                                            <p className="font-bold text-sm">100 €</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-500 mb-1">Fiscalité</p>
                                            <p className="font-bold text-sm">PFU 30% ou IR</p>
                                        </div>
                                    </div>

                                    {/* Trust Badge Integration */}
                                    {trustData && (
                                        <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                                            <h4 className="text-sm font-bold mb-4 text-zinc-900 dark:text-white">Confiance & Réputation</h4>
                                            <TrustBadge
                                                trustData={trustData}
                                                targetUserId={loan.borrowerId}
                                                currentUserId={user?.id || ""}
                                            />
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="financials" className="mt-0 space-y-6">
                                    <h3 className="text-lg font-bold mb-4">Structure Financière</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
                                                    <Target size={16} className="text-zinc-500" />
                                                </div>
                                                <p className="text-sm font-medium">Montant Total</p>
                                            </div>
                                            <p className="text-2xl font-black pl-11">{loan.amount.toLocaleString('fr-FR')} €</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
                                                    <TrendingUp size={16} className="text-emerald-600" />
                                                </div>
                                                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Taux Annuel</p>
                                            </div>
                                            <p className="text-2xl font-black text-emerald-600 pl-11">{loan.apr}%</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
                                                    <PiggyBank size={16} className="text-zinc-500" />
                                                </div>
                                                <p className="text-sm font-medium">Mensualité Emprunteur</p>
                                            </div>
                                            <p className="text-2xl font-black pl-11">
                                                {Math.round(loan.amount * (1 + loan.apr / 100 * loan.duration / 12) / loan.duration).toLocaleString('fr-FR')} €
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shadow-lg ${riskColors[loan.riskGrade]}`}>
                                                {loan.riskGrade}
                                            </div>
                                            <div>
                                                <p className="text-sm text-zinc-500">Note de Risque</p>
                                                <p className="font-bold text-lg leading-tight">
                                                    {loan.riskGrade === "A" && "Faible"}
                                                    {loan.riskGrade === "B" && "Modéré"}
                                                    {loan.riskGrade === "C" && "Élevé"}
                                                    {loan.riskGrade === "D" && "Très éleve"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="investors" className="mt-0">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold">Investisseurs récents</h3>
                                        <Badge variant="outline" className="rounded-full">Total: {investorCount}</Badge>
                                    </div>

                                    {loan.investments && loan.investments.length > 0 ? (
                                        <div className="space-y-2">
                                            {loan.investments.slice(0, 8).map((inv: any, i: number) => (
                                                <div key={inv.id} className="flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="w-8 h-8 ring-2 ring-white dark:ring-zinc-900">
                                                            <AvatarFallback className="bg-gradient-to-br from-orange-100 to-amber-100 text-orange-700 font-bold text-xs">
                                                                {inv.wallet?.user?.name?.[0] || "I"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-semibold text-sm">{inv.wallet?.user?.name || `Investisseur`}</p>
                                                            <p className="text-[10px] text-zinc-500">
                                                                {new Date(inv.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="font-bold text-sm text-emerald-600">+{inv.amount.toLocaleString('fr-FR')} €</p>
                                                </div>
                                            ))}
                                            {loan.investments.length > 8 && (
                                                <Button variant="ghost" className="w-full text-xs text-zinc-500 mt-2 h-8">
                                                    Voir les {loan.investments.length - 8} autres...
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-zinc-500">
                                            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Users className="w-5 h-5 text-zinc-400" />
                                            </div>
                                            <p className="font-medium text-sm">Soyez le premier à investir !</p>
                                            <p className="text-xs">Rejoignez l'aventure dès maintenant.</p>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="updates" className="mt-0">
                                    <ProjectTimeline updates={loan.updates || []} loanId={loan.id} isOwner={isOwner} />
                                </TabsContent>
                            </div>
                        </Tabs>

                    </div>

                    {/* Right Column: Investment Widget (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-4">
                            {/* Funding Progress Card */}
                            <Card className="bg-zinc-900 text-white border-zinc-800 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-[40px]" />
                                <CardContent className="p-5 relative z-10">
                                    <div className="flex justify-between items-end mb-3">
                                        <div>
                                            <p className="text-xs text-zinc-400 font-medium mb-1">Collecté</p>
                                            <p className="text-2xl font-black text-white">{loan.funded.toLocaleString('fr-FR')} €</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-emerald-400 font-bold text-lg">{Math.round(percentFunded)}%</p>
                                        </div>
                                    </div>
                                    <Progress value={percentFunded} className="h-2 bg-zinc-800 mb-3 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-amber-500" />
                                    <p className="text-xs text-zinc-500 text-right">
                                        sur {loan.amount.toLocaleString('fr-FR')} €
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Investment Widget */}
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl shadow-zinc-200/50 dark:shadow-black/50 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                                <div className="p-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500" />
                                <div className="p-0">
                                    <InvestWidget loan={loan} gainsBalance={gainsData?.balance || 0} />
                                </div>
                            </div>

                            {/* Risk Warning */}
                            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 flex gap-3">
                                <ShieldCheck className="shrink-0 text-blue-600 dark:text-blue-400" size={18} />
                                <p className="text-xs text-blue-800 dark:text-blue-300 leading-snug">
                                    <span className="font-bold block mb-0.5">Rappel important</span>
                                    Investir comporte des risques de perte partielle ou totale du capital. Diversifiez vos placements.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
