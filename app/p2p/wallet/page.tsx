import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { getMyWallet, getKYCStatus } from "@/lib/actions-p2p-wallet";
import { WalletTransactionHistory } from "@/components/p2p/wallet/WalletTransactionHistory";
import { WalletActions } from "@/components/p2p/wallet/WalletActions";
import { WalletCardControls } from "@/components/p2p/wallet/WalletCardControls";
import { VirtualBankCard } from "@/components/p2p/wallet/VirtualBankCard";
import { WalletPockets } from "@/components/p2p/wallet/WalletPockets";
import { BankStatementButton } from "@/components/p2p/wallet/BankStatementButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Info, X, ChevronDown, FileText, ArrowLeftRight } from "lucide-react";
import { TopUpModal } from "@/components/p2p/wallet/TopUpModal";
import { TransferModal } from "@/components/p2p/wallet/TransferModal";
import { RIBComponent } from "@/components/p2p/wallet/RIBComponent";
import { TwoFactorSetup } from "@/components/auth/TwoFactorSetup";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, CreditCard, Banknote, Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getBeneficiaries } from "@/lib/actions-banking";
import { getLinkedAccounts } from "@/lib/actions-banking-plaid";
import { ExternalAccountsList } from "@/components/p2p/wallet/ExternalAccountsList";
export default async function WalletPage() {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) redirect("/auth/login");

    // Fetch fresh user data for security status
    const user = await prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: { id: true, name: true, twoFactorEnabled: true }
    });

    if (!user) redirect("/auth/login");

    // SECURITY BARRIER: Force 2FA
    if (!user.twoFactorEnabled) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans flex items-center justify-center p-4">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">Sécurité Bancaire</h1>
                        <p className="text-zinc-500">
                            L'accès à votre cagnotte nécessite une authentification forte (DSP2).
                        </p>
                    </div>
                    <TwoFactorSetup userId={user.id} />
                </div>
            </div>
        );
    }

    const [walletData, kyc, beneficiaries, linkedAccounts] = await Promise.all([
        getMyWallet(),
        getKYCStatus(),
        getBeneficiaries(),
        getLinkedAccounts()
    ]);

    const wallet = walletData || { balance: 0, transactions: [] };

    return (
        <div className="min-h-screen bg-white dark:bg-black font-sans text-zinc-900 dark:text-zinc-100">
            <div className="max-w-[1400px] mx-auto px-6 py-8">

                {/* Header */}
                <div className="mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-8">
                    <h1 className="text-3xl font-bold mb-6">Soldes</h1>

                    <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div>
                            <p className="text-sm font-medium text-zinc-500 mb-1">Solde disponible</p>
                            <div className="flex items-baseline gap-4">
                                <span className="text-4xl font-bold tracking-tight">
                                    {wallet.balance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                </span>
                                <span className="text-sm font-medium text-zinc-400">
                                    En attente: 0,00 €
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <TopUpModal>
                                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 h-10 rounded-md">
                                    <Banknote size={16} className="mr-2" /> Ajouter des fonds
                                </Button>
                            </TopUpModal>

                            <TransferModal userId={user.id} beneficiaries={beneficiaries} balance={wallet.balance}>
                                <Button variant="outline" className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium px-4 py-2 h-10 rounded-md">
                                    <CreditCard size={16} className="mr-2" /> Virement
                                </Button>
                            </TransferModal>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium h-10 w-10 p-0 rounded-md">
                                        <Building2 size={16} />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-0">
                                    <RIBComponent
                                        holder={user.name || "Utilisateur"}
                                        iban="FR76 1234 5678 9012 3456 7890 123"
                                        bic="TRSPFR2P"
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left Column (Main Content) */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Transaction History */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">Transactions</h2>
                                <Button variant="outline" size="sm" className="h-8 text-xs">Exporter</Button>
                            </div>
                            <WalletTransactionHistory transactions={wallet.transactions} />
                        </div>

                        {/* Pockets (Styled cleanly) */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">Réserves (Pockets)</h2>
                            </div>
                            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-1 border border-zinc-100 dark:border-zinc-800">
                                <WalletPockets />
                            </div>
                        </div>

                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="space-y-8">

                        {/* Virtual Card Container */}
                        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <CreditCard size={16} /> Carte Virtuelle
                            </h3>
                            <div className="mb-6">
                                <VirtualBankCard
                                    iban="FR76 1234 5678 9012 3456 7890 123"
                                    bic="TRSPFR2P"
                                    holder={user.name || "Utilisateur"}
                                    balance={wallet.balance}
                                />
                            </div>
                            <WalletCardControls />
                        </div>

                        {/* External Accounts */}
                        <div>
                            <ExternalAccountsList accounts={linkedAccounts} />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
