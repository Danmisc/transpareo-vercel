"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    ShieldCheck,
    TrendingUp,
    CreditCard,
    Calendar,
    AlertCircle,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Sparkles,
    PiggyBank,
    Clock,
    RefreshCw,
    Info,
    ExternalLink,
    Crown
} from "lucide-react";
import { checkInvestmentCompliance } from "@/lib/actions-compliance";
import { createInvestmentCheckout, getGainsBalance, reinvestFromGains } from "@/lib/actions-investment-checkout";
import { COMPLIANCE_LIMITS } from "@/lib/compliance-constants";
import { RiskWarningModal, BlockerModal } from "@/components/p2p/RiskWarningModal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSubscription } from "@/hooks/use-subscription";

interface InvestWidgetProps {
    loan: any;
    suitabilityCompleted?: boolean;
    gainsBalance?: number; // Optional: for reinvestment from gains
}

type Step = "AMOUNT" | "SUMMARY" | "CONFIRM" | "REDIRECTING";

// Minimum investment per plan
const MIN_INVESTMENT_BY_PLAN: Record<string, number> = {
    FREE: 100,
    PLUS: 50,
    PRO: 20,
    BUSINESS: 1
};

export function InvestWidget({ loan, suitabilityCompleted = true, gainsBalance = 0 }: InvestWidgetProps) {
    const [step, setStep] = useState<Step>("AMOUNT");
    const [amount, setAmount] = useState(100);
    const [loading, setLoading] = useState(false);
    const [checkingCompliance, setCheckingCompliance] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [useGains, setUseGains] = useState(false); // Use gains balance instead of Stripe
    const router = useRouter();

    // Subscription for minimum investment limits
    const { plan, isPro, isLoading: subLoading } = useSubscription();
    const minInvestment = MIN_INVESTMENT_BY_PLAN[plan] || 100;

    // Set initial amount to minimum for user's plan
    useEffect(() => {
        if (!subLoading && amount < minInvestment) {
            setAmount(minInvestment);
        }
    }, [minInvestment, subLoading]);

    // Compliance modals
    const [showBlockerModal, setShowBlockerModal] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [complianceResult, setComplianceResult] = useState<any>(null);

    const remaining = loan.amount - loan.funded;
    const effectiveMax = Math.min(100000, remaining); // Max per investment
    const canInvest = remaining >= minInvestment;

    // Calculate returns
    const simulation = useMemo(() => {
        const annualReturn = amount * (loan.apr / 100);
        const totalReturn = (annualReturn * loan.duration) / 12;
        const monthlyReturn = totalReturn / loan.duration;

        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + loan.duration);

        const coolingOffEnd = new Date();
        coolingOffEnd.setDate(coolingOffEnd.getDate() + COMPLIANCE_LIMITS.COOLING_OFF_DAYS);

        return {
            monthlyReturn: Math.round(monthlyReturn * 100) / 100,
            totalReturn: Math.round(totalReturn * 100) / 100,
            annualReturn: Math.round(annualReturn * 100) / 100,
            endDate: endDate.toLocaleDateString('fr-FR', {
                month: 'long',
                year: 'numeric'
            }),
            totalAtEnd: Math.round((amount + totalReturn) * 100) / 100,
            coolingOffEnd: coolingOffEnd.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long'
            })
        };
    }, [amount, loan.apr, loan.duration]);

    // Check compliance before proceeding
    const handleProceedWithCompliance = async () => {
        if (!suitabilityCompleted) {
            toast.info("Veuillez compléter le questionnaire investisseur", {
                action: {
                    label: "Compléter",
                    onClick: () => router.push("/p2p/suitability")
                }
            });
            return;
        }

        setCheckingCompliance(true);
        try {
            const result = await checkInvestmentCompliance(amount, loan.id);
            setComplianceResult(result);

            if (!result.canInvest) {
                setShowBlockerModal(true);
            } else if (result.requiresConfirmation && result.warnings.length > 0) {
                setShowWarningModal(true);
            } else {
                setStep("SUMMARY");
            }
        } catch (error) {
            toast.error("Erreur lors de la vérification");
        } finally {
            setCheckingCompliance(false);
        }
    };

    const handleWarningAccepted = () => {
        setShowWarningModal(false);
        setStep("SUMMARY");
    };

    const handleNext = () => {
        if (step === "AMOUNT") {
            handleProceedWithCompliance();
        } else if (step === "SUMMARY") {
            setStep("CONFIRM");
        }
    };

    const handleBack = () => {
        if (step === "SUMMARY") setStep("AMOUNT");
        else if (step === "CONFIRM") setStep("SUMMARY");
    };

    // Main investment action - redirects to Stripe Checkout
    const handleInvest = async () => {
        if (!acceptTerms) {
            toast.error("Veuillez accepter les conditions d'utilisation");
            return;
        }

        setLoading(true);

        try {
            // Option 1: Reinvest from gains (no Stripe needed)
            if (useGains && gainsBalance >= amount) {
                const result = await reinvestFromGains(loan.id, amount);
                if (result.success) {
                    toast.success("Réinvestissement effectué !");
                    router.push(`/p2p/portfolio?invested=success&loan=${loan.id}`);
                    return;
                } else {
                    toast.error(result.error || "Erreur lors du réinvestissement");
                    setLoading(false);
                    return;
                }
            }

            // Option 2: Stripe Checkout for new payment
            const response = await createInvestmentCheckout({
                loanId: loan.id,
                amount
            });

            if (!response.success) {
                toast.error(response.error || "Erreur lors de la création du paiement");
                if (response.requiresKYC) {
                    toast.info("Vérification d'identité requise", {
                        action: {
                            label: "Vérifier",
                            onClick: () => router.push("/p2p/settings/kyc")
                        }
                    });
                }
                setLoading(false);
                return;
            }

            // Redirect to Stripe Checkout
            if (response.checkoutUrl) {
                setStep("REDIRECTING");
                window.location.href = response.checkoutUrl;
            }
        } catch (e: any) {
            toast.error(e.message || "Erreur, veuillez réessayer");
            setLoading(false);
        }
    };

    if (!canInvest) {
        return (
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl">
                <CardContent className="py-6 text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                    <h3 className="font-bold text-base mb-1">Projet financé !</h3>
                    <p className="text-zinc-500 text-xs mb-3">
                        Ce projet a atteint son objectif de financement.
                    </p>
                    <Link href="/p2p/market">
                        <Button variant="outline" size="sm">Voir d'autres projets</Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            {/* Blocker Modal */}
            <BlockerModal
                isOpen={showBlockerModal}
                onClose={() => setShowBlockerModal(false)}
                blockers={complianceResult?.blockers || []}
                onGoToKYC={() => router.push("/p2p/settings/kyc")}
                onGoToSuitability={() => router.push("/p2p/suitability")}
            />

            {/* Risk Warning Modal */}
            <RiskWarningModal
                isOpen={showWarningModal}
                onClose={() => setShowWarningModal(false)}
                onAccept={handleWarningAccepted}
                warnings={complianceResult?.warnings || []}
                amount={amount}
                projectTitle={loan.title}
            />

            <Card className="border-orange-200 dark:border-orange-900/30 bg-white dark:bg-zinc-900 shadow-xl border-t-0 rounded-t-none">
                {/* Step Progress */}
                {step !== "REDIRECTING" && (
                    <div className="px-5 pt-4 pb-2">
                        <div className="flex items-center gap-2">
                            {["AMOUNT", "SUMMARY", "CONFIRM"].map((s, i) => (
                                <div key={s} className="flex items-center flex-1">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${step === s
                                        ? "bg-orange-600 text-white"
                                        : ["SUMMARY", "CONFIRM"].indexOf(step) > i - 1
                                            ? "bg-emerald-500 text-white"
                                            : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                                        }`}>
                                        {["SUMMARY", "CONFIRM"].indexOf(step) > i ? "✓" : i + 1}
                                    </div>
                                    {i < 2 && (
                                        <div className={`flex-1 h-0.5 mx-1.5 ${["SUMMARY", "CONFIRM"].indexOf(step) > i
                                            ? "bg-emerald-500"
                                            : "bg-zinc-200 dark:bg-zinc-800"
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <CardHeader className="pb-2 pt-2 px-5">
                    <CardTitle className="flex justify-between items-center text-sm font-bold">
                        <span className="flex items-center gap-2">
                            {step === "REDIRECTING" ? <Loader2 className="text-orange-500 animate-spin" size={16} /> : <TrendingUp className="text-orange-500" size={16} />}
                            {step === "AMOUNT" && "Montant"}
                            {step === "SUMMARY" && "Simulation"}
                            {step === "CONFIRM" && "Confirmation"}
                            {step === "REDIRECTING" && "Redirection vers le paiement..."}
                        </span>
                        {step === "AMOUNT" && gainsBalance > 0 && (
                            <span className="text-xs font-normal text-emerald-600 flex items-center gap-1">
                                <PiggyBank size={12} /> {gainsBalance.toLocaleString('fr-FR')} € de gains
                            </span>
                        )}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 px-5 pb-6">
                    {/* STEP 1: Amount Selection */}
                    {step === "AMOUNT" && (
                        <>
                            {/* Upgrade Banner for Free Users */}
                            {plan === "FREE" && minInvestment > 20 && (
                                <Link href="/pricing" className="block">
                                    <div className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-lg border border-orange-200 dark:border-orange-800 cursor-pointer hover:border-orange-400 transition-colors">
                                        <Crown size={14} className="text-orange-500" />
                                        <span className="text-xs text-orange-700 dark:text-orange-300">
                                            <strong>Pro:</strong> Investissez dès 20€ au lieu de 100€
                                        </span>
                                    </div>
                                </Link>
                            )}

                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <Label className="text-zinc-500 text-xs">Montant à investir</Label>
                                    <span className="text-2xl font-black text-orange-600">{amount.toLocaleString('fr-FR')} €</span>
                                </div>
                                <Slider
                                    value={[amount]}
                                    min={minInvestment}
                                    max={Math.min(effectiveMax, gainsBalance > 0 && useGains ? gainsBalance : 100000)}
                                    step={minInvestment <= 10 ? 1 : 10}
                                    onValueChange={(v) => setAmount(v[0])}
                                    className="py-2"
                                />
                                <div className="flex justify-between text-[10px] text-zinc-400">
                                    <span>{minInvestment} € min</span>
                                    <span>{Math.min(effectiveMax, remaining).toLocaleString('fr-FR')} € restants</span>
                                </div>
                            </div>

                            {/* Quick Select */}
                            <div className="flex gap-1.5 flex-wrap">
                                {[minInvestment, 50, 100, 250, 500, 1000]
                                    .filter((v, i, arr) => v >= minInvestment && v <= effectiveMax && arr.indexOf(v) === i)
                                    .slice(0, 5)
                                    .map((v) => (
                                        <Button
                                            key={v}
                                            variant={amount === v ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setAmount(v)}
                                            className={`h-7 text-xs ${amount === v ? "bg-orange-600 hover:bg-orange-700" : "hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
                                        >
                                            {v} €
                                        </Button>
                                    ))}
                            </div>

                            {/* Use Gains Toggle (if available) */}
                            {gainsBalance >= minInvestment && (
                                <div className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                    <Checkbox
                                        id="useGains"
                                        checked={useGains}
                                        onCheckedChange={(checked) => {
                                            setUseGains(!!checked);
                                            if (checked && amount > gainsBalance) {
                                                setAmount(Math.min(gainsBalance, effectiveMax));
                                            }
                                        }}
                                    />
                                    <label htmlFor="useGains" className="text-xs text-emerald-700 dark:text-emerald-300 cursor-pointer">
                                        Utiliser mes gains ({gainsBalance.toLocaleString('fr-FR')} € disponibles)
                                    </label>
                                </div>
                            )}

                            {/* Warning if > €1000 */}
                            {amount > COMPLIANCE_LIMITS.WARNING_THRESHOLD && (
                                <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
                                    <Info size={14} className="text-amber-600 mt-0.5 shrink-0" />
                                    <p className="text-[10px] text-amber-700 dark:text-amber-300">
                                        &gt;{COMPLIANCE_LIMITS.WARNING_THRESHOLD}€ : une vérification d'identité sera requise.
                                    </p>
                                </div>
                            )}

                            {/* Quick Preview */}
                            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                                <div className="flex items-center justify-between">
                                    <span className="text-emerald-700 dark:text-emerald-300 text-xs">
                                        Gain estimé ({loan.duration} mois)
                                    </span>
                                    <span className="text-lg font-bold text-emerald-600">
                                        +{simulation.totalReturn.toLocaleString('fr-FR')} €
                                    </span>
                                </div>
                            </div>

                            <Button
                                onClick={handleNext}
                                disabled={checkingCompliance}
                                className="w-full h-10 bg-orange-600 hover:bg-orange-700 text-sm font-bold"
                            >
                                {checkingCompliance ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" size={16} />
                                        Vérification...
                                    </>
                                ) : (
                                    <>
                                        Continuer <ArrowRight className="ml-2" size={16} />
                                    </>
                                )}
                            </Button>
                        </>
                    )}

                    {/* STEP 2: Summary & Simulation */}
                    {step === "SUMMARY" && (
                        <>
                            <div className="text-center py-1">
                                <p className="text-2xl font-black text-zinc-900 dark:text-white">
                                    {amount.toLocaleString('fr-FR')} €
                                </p>
                                <p className="text-zinc-500 text-xs">dans {loan.title}</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg text-sm">
                                    <span className="text-zinc-500 flex items-center gap-2 text-xs">
                                        <TrendingUp size={12} /> Taux annuel
                                    </span>
                                    <span className="font-bold text-emerald-600 text-xs">{loan.apr}%</span>
                                </div>
                                <div className="flex justify-between p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg text-sm">
                                    <span className="text-zinc-500 flex items-center gap-2 text-xs">
                                        <Calendar size={12} /> Durée
                                    </span>
                                    <span className="font-bold text-xs">{loan.duration} mois</span>
                                </div>
                                <div className="flex justify-between p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg text-sm">
                                    <span className="text-zinc-500 flex items-center gap-2 text-xs">
                                        <PiggyBank size={12} /> Gain total
                                    </span>
                                    <span className="font-bold text-emerald-600 text-xs">+{simulation.totalReturn.toLocaleString('fr-FR')} €</span>
                                </div>
                                <div className="flex justify-between p-2.5 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-900/20 text-sm">
                                    <span className="text-orange-700 dark:text-orange-300 font-medium text-xs">
                                        Capital + intérêts
                                    </span>
                                    <span className="font-black text-orange-600 text-xs">{simulation.totalAtEnd.toLocaleString('fr-FR')} €</span>
                                </div>
                            </div>

                            {/* Payment Method Info */}
                            <div className="flex items-center gap-2 p-2.5 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-200 dark:border-indigo-800">
                                {useGains ? (
                                    <>
                                        <PiggyBank size={14} className="text-emerald-600" />
                                        <span className="text-xs text-emerald-700 dark:text-emerald-300">Paiement depuis vos gains</span>
                                    </>
                                ) : (
                                    <>
                                        <CreditCard size={14} className="text-indigo-600" />
                                        <span className="text-xs text-indigo-700 dark:text-indigo-300">Paiement sécurisé par carte (Stripe)</span>
                                    </>
                                )}
                            </div>

                            <p className="text-zinc-400 text-[10px] text-center">
                                Remboursement prévu: {simulation.endDate}
                            </p>

                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handleBack} className="flex-1 h-9 text-xs">
                                    <ArrowLeft size={14} className="mr-2" /> Modifier
                                </Button>
                                <Button onClick={handleNext} className="flex-1 bg-orange-600 hover:bg-orange-700 h-9 text-xs">
                                    Confirmer <ArrowRight size={14} className="ml-2" />
                                </Button>
                            </div>
                        </>
                    )}

                    {/* STEP 3: Final Confirmation */}
                    {step === "CONFIRM" && (
                        <>
                            <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-200 dark:border-amber-900/30">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
                                    <div className="text-xs">
                                        <p className="font-bold text-amber-800 dark:text-amber-200 mb-0.5">
                                            Risque de perte en capital
                                        </p>
                                        <p className="text-amber-700 dark:text-amber-300">
                                            Cet investissement comporte un risque. Ne placez que des fonds dont vous n'avez pas besoin à court terme.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Cooling-off Notice */}
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-2.5 rounded-lg border border-blue-200 dark:border-blue-800">
                                <p className="text-[10px] text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                                    <RefreshCw size={12} />
                                    <span>
                                        <strong>Rétractation:</strong> {COMPLIANCE_LIMITS.COOLING_OFF_DAYS} jours pour annuler.
                                    </span>
                                </p>
                            </div>

                            <div className="text-center py-2">
                                <p className="text-3xl font-black text-orange-600 mb-1">
                                    {amount.toLocaleString('fr-FR')} €
                                </p>
                                <p className="text-zinc-500 text-xs">
                                    Rendement: <strong className="text-emerald-600">+{simulation.totalReturn.toLocaleString('fr-FR')} €</strong>
                                </p>
                            </div>

                            <div className="flex items-start gap-2 mt-2">
                                <Checkbox
                                    id="terms"
                                    checked={acceptTerms}
                                    onCheckedChange={(checked) => setAcceptTerms(!!checked)}
                                    className="mt-0.5"
                                />
                                <label htmlFor="terms" className="text-[10px] text-zinc-600 dark:text-zinc-400 cursor-pointer leading-tight">
                                    J'accepte les <a href="/legal/terms" className="text-orange-600 underline">conditions</a>,
                                    la <a href="/p2p/legal/risks" className="text-orange-600 underline">notice des risques</a> et
                                    je comprends le risque de perte.
                                </label>
                            </div>

                            <div className="flex gap-2.5 mt-2">
                                <Button variant="outline" onClick={handleBack} className="flex-1 h-10 text-xs" disabled={loading}>
                                    <ArrowLeft size={14} className="mr-2" /> Retour
                                </Button>
                                <Button
                                    onClick={handleInvest}
                                    disabled={!acceptTerms || loading}
                                    className="flex-1 bg-orange-600 hover:bg-orange-700 h-10 text-xs font-bold"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" />
                                    ) : useGains ? (
                                        <>Investir {amount} € <PiggyBank size={14} className="ml-2" /></>
                                    ) : (
                                        <>Payer {amount} € <CreditCard size={14} className="ml-2" /></>
                                    )}
                                </Button>
                            </div>
                        </>
                    )}

                    {/* Redirecting State */}
                    {step === "REDIRECTING" && (
                        <div className="text-center py-8">
                            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
                            <h3 className="font-bold text-base mb-2">Redirection vers Stripe...</h3>
                            <p className="text-zinc-500 text-xs">
                                Vous allez être redirigé vers la page de paiement sécurisé.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}

