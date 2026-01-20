"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Crown, Sparkles, Zap, Building2,
    CreditCard, Calendar, ArrowRight,
    ExternalLink, RefreshCw, Check, Download,
    TrendingUp, Search, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PlanBadge } from "@/components/subscription/PlanBadge";
import { cancelSubscription, resumeSubscription, createPortalSession } from "@/lib/subscription/service";
import type { PlanName } from "@/lib/subscription/plans";
import Link from "next/link";
import { motion } from "framer-motion";

interface SubscriptionSettingsClientProps {
    initialData: {
        planName: PlanName;
        status: string;
        features: any;
        subscription: any;
    };
    userId: string;
}

const PLAN_ICONS: Record<PlanName, React.ReactNode> = {
    FREE: <Zap className="h-6 w-6" />,
    PLUS: <Sparkles className="h-6 w-6" />,
    PRO: <Crown className="h-6 w-6" />,
    BUSINESS: <Building2 className="h-6 w-6" />,
};

const PLAN_COLORS: Record<PlanName, string> = {
    FREE: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
    PLUS: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    PRO: "bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 text-orange-600 dark:text-orange-400",
    BUSINESS: "bg-zinc-900 dark:bg-zinc-800 text-white",
};

// Mock Data for "Plenty of Content"
const MOCK_USAGE = {
    searches: { used: 45, limit: 100, label: "Recherches avancées" },
    contacts: { used: 12, limit: 50, label: "Prises de contact" },
    dossiers: { used: 2, limit: 5, label: "Dossiers partagés" }
};

const MOCK_INVOICES = [
    { id: "INV-2024-001", date: "01 Jan 2026", amount: "29.99€", status: "Payé" },
    { id: "INV-2023-012", date: "01 Dec 2025", amount: "29.99€", status: "Payé" },
    { id: "INV-2023-011", date: "01 Nov 2025", amount: "29.99€", status: "Payé" },
];

export function SubscriptionSettingsClient({ initialData, userId }: SubscriptionSettingsClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [data] = useState(initialData);

    const { planName, status, subscription } = data;
    const isPaid = planName !== "FREE";
    const isCancelling = subscription?.cancelAtPeriodEnd;

    const handleManageBilling = async () => {
        setIsLoading(true);
        try {
            const result = await createPortalSession();
            if (result.url) window.location.href = result.url;
        } catch (error: any) {
            toast.error(error.message || "Erreur portail");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!confirm("Annuler l'abonnement ?")) return;
        setIsLoading(true);
        try {
            await cancelSubscription();
            toast.success("Abonnement annulé.");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResumeSubscription = async () => {
        setIsLoading(true);
        try {
            await resumeSubscription();
            toast.success("Réactivé !");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Top Section: Current Plan Overview */}
            <Card className="border-none shadow-lg dark:bg-zinc-900/50 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-blue-500/5 dark:from-orange-500/10 dark:to-blue-500/10" />
                <CardHeader className="relative flex flex-row items-center justify-between pb-10">
                    <div className="flex items-center gap-4">
                        <div className={cn("p-4 rounded-2xl shadow-sm", PLAN_COLORS[planName])}>
                            {PLAN_ICONS[planName]}
                        </div>
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-3">
                                {planName === "FREE" ? "Plan Gratuit" : `Plan ${planName}`}
                                <PlanBadge plan={planName} size="sm" showIcon={false} />
                            </CardTitle>
                            <CardDescription className="text-base mt-1">
                                {isPaid
                                    ? `Prochaine facture le ${new Date(subscription?.currentPeriodEnd || Date.now()).toLocaleDateString()}`
                                    : "Passez à la vitesse supérieure"}
                            </CardDescription>
                        </div>
                    </div>
                    {isPaid && (
                        <div className="text-right hidden sm:block">
                            <div className="text-sm text-zinc-500">Montant mensuel</div>
                            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                                {(subscription?.priceId || "").includes("year") ? "299€" : "29.99€"}
                                <span className="text-sm font-normal text-zinc-500">/mois</span>
                            </div>
                        </div>
                    )}
                </CardHeader>

                <CardContent className="relative">
                    {/* Actions Bar */}
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
                        {isPaid ? (
                            <>
                                <Button onClick={handleManageBilling} disabled={isLoading} className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800">
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Gérer mon abonnement
                                </Button>
                                {isCancelling ? (
                                    <Button variant="outline" onClick={handleResumeSubscription} className="text-green-600 border-green-200">
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Réactiver
                                    </Button>
                                ) : (
                                    <Button variant="ghost" onClick={handleCancelSubscription} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                        Annuler
                                    </Button>
                                )}
                            </>
                        ) : (
                            <Link href="/pricing">
                                <Button className="bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20">
                                    <Crown className="w-4 h-4 mr-2" />
                                    Voir les offres Premium
                                </Button>
                            </Link>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Middle Section: Usage & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Usage Stats - Col Span 2 */}
                <Card className="md:col-span-2 border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-zinc-500" />
                            Consommation Mensuelle
                        </CardTitle>
                        <CardDescription>Vos quotas sont réinitialisés le 1er du mois.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <UsageBar
                            icon={<Search className="w-4 h-4" />}
                            label={MOCK_USAGE.searches.label}
                            used={isPaid ? MOCK_USAGE.searches.used : 2}
                            limit={isPaid ? MOCK_USAGE.searches.limit : 5}
                            color="bg-blue-500"
                        />
                        <UsageBar
                            icon={<MessageSquare className="w-4 h-4" />}
                            label={MOCK_USAGE.contacts.label}
                            used={isPaid ? MOCK_USAGE.contacts.used : 0}
                            limit={isPaid ? MOCK_USAGE.contacts.limit : 3}
                            color="bg-purple-500"
                        />
                        <UsageBar
                            icon={<Zap className="w-4 h-4" />}
                            label={MOCK_USAGE.dossiers.label}
                            used={isPaid ? MOCK_USAGE.dossiers.used : 1}
                            limit={isPaid ? MOCK_USAGE.dossiers.limit : 1}
                            color="bg-orange-500"
                        />
                    </CardContent>
                    {!isPaid && (
                        <CardFooter className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-b-xl border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                            <div className="text-sm text-zinc-500">Atteignez plus de bailleurs avec Pro.</div>
                            <Link href="/pricing" className="text-sm font-semibold text-orange-600 hover:underline">Débloquer les limites</Link>
                        </CardFooter>
                    )}
                </Card>

                {/* Payment Method - Col Span 1 */}
                <Card className="border-zinc-200 dark:border-zinc-800 flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-zinc-500" />
                            Moyen de paiement
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-center items-center">
                        {isPaid ? (
                            <div className="w-full max-w-[240px] aspect-[1.586] rounded-xl bg-gradient-to-br from-zinc-800 to-black p-5 shadow-2xl relative overflow-hidden text-white flex flex-col justify-between">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                                <div className="flex justify-between items-start">
                                    <div className="text-xs font-mono opacity-70">Credit Card</div>
                                    <div className="font-bold italic">VISA</div>
                                </div>
                                <div className="font-mono text-lg tracking-widest mt-2">
                                    •••• •••• •••• 4242
                                </div>
                                <div className="flex justify-between items-end mt-4">
                                    <div className="text-[10px] opacity-70">
                                        EXP <br /> 12/28
                                    </div>
                                    <div className="text-xs font-medium opacity-90">Transpareo User</div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <CreditCard className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                                <p className="text-zinc-500 text-sm">Aucun moyen de paiement</p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="border-t border-zinc-100 dark:border-zinc-800 p-4">
                        <Button variant="ghost" size="sm" className="w-full text-zinc-500" onClick={handleManageBilling}>
                            Mettre à jour
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Bottom Section: Invoices */}
            <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                    <CardTitle>Historique de facturation</CardTitle>
                </CardHeader>
                <CardContent>
                    {isPaid ? (
                        <div className="space-y-1">
                            {MOCK_INVOICES.map((inv) => (
                                <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                                            <Check className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm text-zinc-900 dark:text-white">Facture {inv.id}</div>
                                            <div className="text-xs text-zinc-500">{inv.date}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-sm font-medium">{inv.amount}</div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-zinc-500">
                            <p>Aucune facture disponible pour le plan Gratuit.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// Helper Component for Usage Bars
function UsageBar({ icon, label, used, limit, color }: { icon: any, label: string, used: number, limit: number, color: string }) {
    const percent = Math.min((used / limit) * 100, 100);
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {icon} {label}
                </div>
                <div className="text-xs text-zinc-500">
                    {used} / {limit}
                </div>
            </div>
            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn("h-full rounded-full", color)}
                />
            </div>
        </div>
    );
}
