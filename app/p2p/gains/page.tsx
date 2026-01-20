import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getGainsBalance } from "@/lib/actions-investment-checkout";
import { requestWithdrawal, getTransactionHistory } from "@/lib/actions-p2p-wallet";
import Link from "next/link";
import {
    PiggyBank,
    TrendingUp,
    ArrowUpRight,
    Wallet,
    RefreshCw,
    Calendar,
    ChevronRight,
    CreditCard,
    Clock,
    AlertCircle,
    BadgeEuro
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WithdrawModal } from "@/components/p2p/GainsWithdrawModal";

export const dynamic = "force-dynamic";

export default async function GainsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    // Fetch gains balance
    const gainsData = await getGainsBalance();
    const balance = gainsData?.balance || 0;
    const invested = gainsData?.invested || 0;
    const pending = gainsData?.pending || 0;

    // Fetch recent repayment transactions
    const transactionsResult = await getTransactionHistory({ limit: 10 });
    const transactions = transactionsResult?.transactions || [];

    // Filter to show only gains-related transactions
    const gainsTransactions = transactions.filter((t: any) =>
        t.type === "REPAYMENT" || t.type === "INTEREST" || t.type === "WITHDRAWAL" || t.type === "REINVESTMENT"
    );

    // Get KYC status for withdrawal limits
    const kycProfile = await prisma.kYCProfile.findUnique({
        where: { userId: user.id }
    });
    const kycVerified = kycProfile?.status === "VERIFIED";

    // Calculate total lifetime gains
    const lifetimeGains = await prisma.transaction.aggregate({
        where: {
            wallet: { userId: user.id },
            type: { in: ["REPAYMENT", "INTEREST"] },
            status: "COMPLETED"
        },
        _sum: { amount: true }
    });
    const totalLifetimeGains = lifetimeGains._sum.amount || 0;

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 pb-12">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 pt-6 pb-10">
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-5xl mx-auto px-4">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl">
                            <PiggyBank className="w-6 h-6 text-emerald-300" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white">Mes Gains</h1>
                            <p className="text-emerald-200/80 text-xs">Remboursements & intérêts reçus</p>
                        </div>
                    </div>

                    {/* Main Balance Card */}
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white shadow-2xl">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                <div>
                                    <p className="text-emerald-200/70 text-xs mb-1">Gains disponibles</p>
                                    <p className="text-4xl font-black tracking-tight">
                                        {balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                                    </p>
                                    {pending > 0 && (
                                        <p className="text-emerald-300/70 text-sm mt-1 flex items-center gap-1">
                                            <Clock size={12} />
                                            +{pending.toLocaleString('fr-FR')} € en attente
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <Link href="/p2p/market">
                                        <Button className="h-11 px-5 rounded-full bg-white text-emerald-900 hover:bg-emerald-50 shadow-lg font-bold text-sm">
                                            <RefreshCw className="mr-2" size={16} />
                                            Réinvestir
                                        </Button>
                                    </Link>
                                    <WithdrawModal
                                        currentBalance={balance}
                                        kycVerified={kycVerified}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Stats Row */}
            <div className="max-w-5xl mx-auto px-4 mt-6">
                <div className="grid grid-cols-3 gap-3">
                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-lg">
                        <CardContent className="p-4 text-center">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl w-fit mx-auto mb-2">
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                            </div>
                            <p className="text-xs text-zinc-500">Gains totaux (lifetime)</p>
                            <p className="text-lg font-bold text-emerald-600">
                                +{totalLifetimeGains.toLocaleString('fr-FR')} €
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-lg">
                        <CardContent className="p-4 text-center">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-xl w-fit mx-auto mb-2">
                                <Wallet className="w-5 h-5 text-orange-600" />
                            </div>
                            <p className="text-xs text-zinc-500">Investis actuellement</p>
                            <p className="text-lg font-bold text-zinc-900 dark:text-white">
                                {invested.toLocaleString('fr-FR')} €
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-lg">
                        <CardContent className="p-4 text-center">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl w-fit mx-auto mb-2">
                                <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <p className="text-xs text-zinc-500">Prochains remboursements</p>
                            <p className="text-lg font-bold text-blue-600">
                                +{pending.toLocaleString('fr-FR')} €
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Info Banner */}
            <div className="max-w-5xl mx-auto px-4 mt-6">
                <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-semibold text-emerald-800 dark:text-emerald-200 mb-1">
                            Comment fonctionnent les gains ?
                        </p>
                        <p className="text-emerald-700 dark:text-emerald-300 text-xs">
                            Vos gains proviennent des remboursements (capital + intérêts) de vos investissements.
                            Vous pouvez les <strong>réinvestir</strong> dans de nouveaux projets ou les <strong>retirer</strong> vers votre compte bancaire.
                        </p>
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="max-w-5xl mx-auto px-4 mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <Calendar size={18} className="text-zinc-400" />
                        Historique des gains
                    </h2>
                    <Link href="/p2p/portfolio?tab=history" className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                        Voir tout <ChevronRight size={14} />
                    </Link>
                </div>

                {gainsTransactions.length === 0 ? (
                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <CardContent className="py-12 text-center">
                            <PiggyBank className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                            <p className="text-zinc-500 text-sm">Aucun gain pour le moment</p>
                            <p className="text-zinc-400 text-xs mt-1">
                                Investissez dans des projets pour commencer à recevoir des gains
                            </p>
                            <Link href="/p2p/market" className="mt-4 inline-block">
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-sm">
                                    Découvrir les projets
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {gainsTransactions.map((tx: any) => (
                            <Card key={tx.id} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-shadow">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${tx.type === "WITHDRAWAL"
                                            ? "bg-red-100 dark:bg-red-900/20"
                                            : tx.type === "REINVESTMENT"
                                                ? "bg-orange-100 dark:bg-orange-900/20"
                                                : "bg-emerald-100 dark:bg-emerald-900/20"
                                            }`}>
                                            {tx.type === "WITHDRAWAL" ? (
                                                <ArrowUpRight className="w-4 h-4 text-red-600" />
                                            ) : tx.type === "REINVESTMENT" ? (
                                                <RefreshCw className="w-4 h-4 text-orange-600" />
                                            ) : (
                                                <BadgeEuro className="w-4 h-4 text-emerald-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-zinc-900 dark:text-white">
                                                {tx.type === "REPAYMENT" && "Remboursement"}
                                                {tx.type === "INTEREST" && "Intérêts"}
                                                {tx.type === "WITHDRAWAL" && "Retrait"}
                                                {tx.type === "REINVESTMENT" && "Réinvestissement"}
                                            </p>
                                            <p className="text-xs text-zinc-500">
                                                {new Date(tx.createdAt).toLocaleDateString('fr-FR', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${tx.amount >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                            {tx.amount >= 0 ? "+" : ""}{tx.amount.toLocaleString('fr-FR')} €
                                        </p>
                                        <Badge variant="outline" className={`text-[10px] ${tx.status === "COMPLETED"
                                            ? "border-emerald-200 text-emerald-600"
                                            : "border-amber-200 text-amber-600"
                                            }`}>
                                            {tx.status === "COMPLETED" ? "Terminé" : tx.status === "PENDING" ? "En cours" : tx.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="max-w-5xl mx-auto px-4 mt-8">
                <div className="grid md:grid-cols-2 gap-4">
                    <Link href="/p2p/market">
                        <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/10 dark:to-zinc-900 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-shadow group cursor-pointer">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl group-hover:scale-110 transition-transform">
                                        <TrendingUp className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-900 dark:text-white">Investir dans un projet</p>
                                        <p className="text-xs text-zinc-500">Paiement sécurisé par carte</p>
                                    </div>
                                </div>
                                <ChevronRight className="text-zinc-400 group-hover:text-orange-500 transition-colors" />
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/p2p/portfolio">
                        <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/10 dark:to-zinc-900 border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-shadow group cursor-pointer">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl group-hover:scale-110 transition-transform">
                                        <Wallet className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-900 dark:text-white">Mon portfolio</p>
                                        <p className="text-xs text-zinc-500">Suivre mes investissements</p>
                                    </div>
                                </div>
                                <ChevronRight className="text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    );
}

