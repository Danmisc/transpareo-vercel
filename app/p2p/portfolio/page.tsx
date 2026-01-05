import { Suspense } from "react";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getPortfolio } from "@/lib/actions-p2p-wallet";
import { getTransactions, getTransactionStats } from "@/lib/actions-plaid-transactions";
import { getLinkedAccounts } from "@/lib/actions-banking-plaid";
import { Button } from "@/components/ui/button";
import { TransactionsList } from "@/components/p2p/transactions/TransactionsList";
import { TransactionStats } from "@/components/p2p/transactions/TransactionStats";
import { TransactionAnalytics } from "@/components/p2p/transactions/TransactionAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Plus,
    BarChart2,
    Sparkles,
    X,
    RefreshCw,
    Download,
    AlertTriangle,
    TrendingUp,
    Wallet,
    Receipt,
    CreditCard,
    Activity,
    BarChart3
} from "lucide-react";

export default async function TransactionsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/auth/login");

    // Fetch all data in parallel
    const [portfolio, transactionsData, stats, linkedAccounts] = await Promise.all([
        getPortfolio(),
        getTransactions({}, 1, 50),
        getTransactionStats('month'),
        getLinkedAccounts()
    ]);

    // Combine P2P investments with synced transactions for unified view
    const allTransactions = transactionsData.transactions;

    // Filter by category for tabs
    const investments = allTransactions.filter(t => t.category === "INVESTMENT");
    const transfers = allTransactions.filter(t => t.category === "TRANSFER");
    const fees = allTransactions.filter(t => t.category === "FEE");
    const flagged = allTransactions.filter(t => t.flagged);

    return (
        <div className="min-h-screen bg-white dark:bg-black font-sans text-zinc-900 dark:text-zinc-100">
            <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">

                {/* 1. Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-1">Transactions</h1>
                        <p className="text-zinc-500">
                            Suivez toutes vos opérations financières en un seul endroit.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="border-zinc-200 dark:border-zinc-800">
                            <Download size={16} className="mr-2" /> Exporter
                        </Button>
                        <Button variant="outline" className="border-zinc-200 dark:border-zinc-800">
                            <RefreshCw size={16} className="mr-2" /> Synchroniser
                        </Button>
                        <Link href="/p2p/market">
                            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm">
                                <Plus size={16} className="mr-2" /> Investir
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* 2. Notification Banner (if accounts not connected) */}
                {linkedAccounts.length === 0 && (
                    <div className="flex items-start gap-4 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-sm border border-indigo-100 dark:border-indigo-800/50">
                        <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                            <div>
                                <span className="font-semibold text-indigo-900 dark:text-indigo-300">
                                    Connectez vos comptes bancaires
                                </span>
                                <p className="text-indigo-700 dark:text-indigo-400 mt-0.5">
                                    Synchronisez automatiquement vos transactions et obtenez une vue complète de vos finances.
                                </p>
                            </div>
                            <Link href="/p2p/wallet">
                                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white whitespace-nowrap">
                                    Connecter un compte
                                </Button>
                            </Link>
                        </div>
                        <button className="text-indigo-400 hover:text-indigo-600">
                            <X size={18} />
                        </button>
                    </div>
                )}

                {/* 3. Stats Cards */}
                <TransactionStats stats={stats} />

                {/* 4. Main Content with Tabs */}
                <Tabs defaultValue="all" className="w-full">
                    <div className="border-b border-zinc-200 dark:border-zinc-800 mb-6">
                        <TabsList className="bg-transparent p-0 h-auto space-x-1">
                            <TabsTrigger
                                value="all"
                                className="bg-transparent px-4 py-2.5 border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:shadow-none rounded-none text-sm font-medium text-zinc-500 data-[state=active]:text-indigo-600 hover:text-zinc-800 transition-colors"
                            >
                                <Activity size={14} className="mr-2" />
                                Toutes ({allTransactions.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="investments"
                                className="bg-transparent px-4 py-2.5 border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:shadow-none rounded-none text-sm font-medium text-zinc-500 data-[state=active]:text-indigo-600 hover:text-zinc-800 transition-colors"
                            >
                                <TrendingUp size={14} className="mr-2" />
                                Investissements ({investments.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="transfers"
                                className="bg-transparent px-4 py-2.5 border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:shadow-none rounded-none text-sm font-medium text-zinc-500 data-[state=active]:text-indigo-600 hover:text-zinc-800 transition-colors"
                            >
                                <Wallet size={14} className="mr-2" />
                                Virements ({transfers.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="fees"
                                className="bg-transparent px-4 py-2.5 border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:shadow-none rounded-none text-sm font-medium text-zinc-500 data-[state=active]:text-indigo-600 hover:text-zinc-800 transition-colors"
                            >
                                <Receipt size={14} className="mr-2" />
                                Frais ({fees.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="analytics"
                                className="bg-transparent px-4 py-2.5 border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:shadow-none rounded-none text-sm font-medium text-zinc-500 data-[state=active]:text-indigo-600 hover:text-zinc-800 transition-colors"
                            >
                                <BarChart3 size={14} className="mr-2" />
                                Analytics
                            </TabsTrigger>
                            {flagged.length > 0 && (
                                <TabsTrigger
                                    value="flagged"
                                    className="bg-transparent px-4 py-2.5 border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:shadow-none rounded-none text-sm font-medium text-red-500 data-[state=active]:text-red-600 hover:text-red-700 transition-colors"
                                >
                                    <AlertTriangle size={14} className="mr-2" />
                                    À vérifier ({flagged.length})
                                </TabsTrigger>
                            )}
                        </TabsList>
                    </div>

                    <TabsContent value="all" className="mt-0">
                        <TransactionsList transactions={allTransactions} />
                    </TabsContent>

                    <TabsContent value="investments" className="mt-0">
                        <TransactionsList transactions={investments} />
                    </TabsContent>

                    <TabsContent value="transfers" className="mt-0">
                        <TransactionsList transactions={transfers} />
                    </TabsContent>

                    <TabsContent value="fees" className="mt-0">
                        <TransactionsList transactions={fees} />
                    </TabsContent>

                    <TabsContent value="analytics" className="mt-0">
                        <TransactionAnalytics stats={stats} />
                    </TabsContent>

                    {flagged.length > 0 && (
                        <TabsContent value="flagged" className="mt-0">
                            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                                    <AlertTriangle size={16} />
                                    <span className="font-medium">Transactions nécessitant une vérification</span>
                                </div>
                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                    Ces transactions ont été signalées par notre système de conformité et requièrent votre attention.
                                </p>
                            </div>
                            <TransactionsList transactions={flagged} />
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
    );
}
