import { getMonthlyCashFlowProjection, getUpcomingRepaymentsCalendar } from "@/lib/actions-portfolio";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaturityCalendar } from "@/components/p2p/MaturityCalendar";
import {
    Calendar,
    Clock,
    TrendingUp,
    PiggyBank,
    ChevronRight,
    AlertCircle,
    ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

export default async function MaturityPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const [projections, upcomingRepayments] = await Promise.all([
        getMonthlyCashFlowProjection(12),
        getUpcomingRepaymentsCalendar(3) // Next 3 months detailed
    ]);

    const nextRepayment = upcomingRepayments[0];
    const totalNext3Months = upcomingRepayments.reduce((sum, r) => sum + r.yourShare, 0);
    const totalInterestNext3Months = upcomingRepayments.reduce((sum, r) => {
        const interestShare = r.interest * (r.yourShare / r.amount);
        return sum + interestShare;
    }, 0);

    return (
        <div className="min-h-screen bg-zinc-50/[0.3] dark:bg-black font-sans pb-12 relative">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-5xl mx-auto px-6 py-6">

                {/* Header */}
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <Badge className="mb-2 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-none px-2.5 py-0.5 text-xs">
                            <Calendar size={12} className="mr-1.5" /> Trésorerie
                        </Badge>
                        <h1 className="text-2xl font-black text-zinc-900 dark:text-white mb-1">Calendrier des Échéances</h1>
                        <p className="text-xs text-zinc-500 max-w-lg">
                            Visualisez vos flux de trésorerie futurs et suivez vos prochains remboursements.
                        </p>
                    </div>
                </div>

                {/* Summary Cards Compact */}
                {nextRepayment && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                        <Card className="bg-zinc-900 text-white border-zinc-800 shadow-lg">
                            <CardContent className="p-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/20 rounded-full blur-[30px]" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                                        <Clock size={12} /> Prochaine Échéance
                                    </div>
                                    <p className="text-xl font-black text-white">
                                        {new Date(nextRepayment.dueDate).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'long'
                                        })}
                                    </p>
                                    <p className="text-orange-400 text-xs mt-0.5 truncate">
                                        {nextRepayment.loanTitle}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-1">
                                    <PiggyBank size={12} /> Total 3 mois
                                </div>
                                <p className="text-xl font-black text-zinc-900 dark:text-white">
                                    {totalNext3Months.toLocaleString('fr-FR')} €
                                </p>
                                <p className="text-xs text-zinc-400 mt-0.5">
                                    {upcomingRepayments.length} versements prévus
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-1">
                                    <TrendingUp size={12} /> Intérêts à recevoir
                                </div>
                                <p className="text-xl font-black text-emerald-600">
                                    +{totalInterestNext3Months.toLocaleString('fr-FR')} €
                                </p>
                                <p className="text-xs text-zinc-400 mt-0.5">
                                    Gain net estimé
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left: Calendar */}
                    <div className="lg:col-span-2">
                        <MaturityCalendar projections={projections} />

                        {/* Info Box */}
                        <div className="mt-4 flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                            <AlertCircle className="text-zinc-400 shrink-0 mt-0.5" size={16} />
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                <strong className="text-zinc-700 dark:text-zinc-300">Note sur les projections :</strong> Les montants affichés sont estimatifs et dépendent du respect des échéances par les emprunteurs. Ils peuvent varier en cas de remboursement anticipé ou de défaut.
                            </div>
                        </div>
                    </div>

                    {/* Right: Upcoming List */}
                    <div className="space-y-4">
                        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-full">
                            <CardHeader className="pb-3 pt-5 px-5">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Clock className="text-blue-500" size={16} />
                                    Prochaines Échéances
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 px-5 pb-5">
                                {upcomingRepayments.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <Calendar className="text-zinc-300" size={18} />
                                        </div>
                                        <p className="text-zinc-400 text-xs">Aucune échéance à venir</p>
                                    </div>
                                ) : (
                                    upcomingRepayments.slice(0, 6).map((rep) => {
                                        const daysUntil = Math.ceil(
                                            (new Date(rep.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                                        );
                                        const isImminent = daysUntil <= 7;

                                        return (
                                            <Link
                                                key={rep.id}
                                                href={`/p2p/market/${rep.loanId}`}
                                                className="block group"
                                            >
                                                <div className={`p-3 rounded-lg transition-all border ${isImminent
                                                    ? "bg-orange-50/50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/20"
                                                    : "bg-zinc-50/50 dark:bg-zinc-800/30 border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800"
                                                    }`}>
                                                    <div className="flex justify-between items-start mb-1.5">
                                                        <p className="font-semibold text-xs truncate max-w-[140px] text-zinc-700 dark:text-zinc-200 group-hover:text-orange-600 transition-colors">
                                                            {rep.loanTitle}
                                                        </p>
                                                        <span className="font-bold text-xs text-zinc-900 dark:text-white">
                                                            {rep.yourShare.toLocaleString('fr-FR')} €
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                                                            {new Date(rep.dueDate).toLocaleDateString('fr-FR')}
                                                        </span>
                                                        {isImminent ? (
                                                            <Badge className="text-[9px] px-1.5 py-0 h-4 bg-orange-100 text-orange-700 pointer-events-none border-none">
                                                                J-{daysUntil}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-[10px] text-blue-500 font-medium">
                                                                Dans {daysUntil} j
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })
                                )}

                                {upcomingRepayments.length > 6 && (
                                    <Button variant="ghost" className="w-full text-xs text-zinc-400 hover:text-zinc-600 h-8 mt-2">
                                        Voir tout
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tax Report Link */}
                        <Card className="border-indigo-100 dark:border-indigo-900/30 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-zinc-900 overflow-hidden">
                            <CardContent className="p-4 relative">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full blur-[20px]" />
                                <h3 className="font-bold text-sm mb-1 flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
                                    <TrendingUp size={14} className="text-indigo-600" />
                                    Rapport Fiscal
                                </h3>
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
                                    Téléchargez votre IFU pour votre déclaration d'impôts.
                                </p>
                                <Button size="sm" variant="secondary" className="w-full h-8 text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 border-none shadow-none">
                                    Générer <ArrowUpRight size={12} className="ml-1" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

