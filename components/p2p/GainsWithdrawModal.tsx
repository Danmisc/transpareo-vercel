"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    ArrowUpRight,
    Building2,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    AlertCircle,
    Send,
    Shield
} from "lucide-react";
import { requestWithdrawal } from "@/lib/actions-p2p-wallet";
import { useRouter } from "next/navigation";

interface WithdrawModalProps {
    currentBalance: number;
    kycVerified: boolean;
}

export function WithdrawModal({ currentBalance, kycVerified }: WithdrawModalProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<"form" | "success" | "error">("form");
    const [amount, setAmount] = useState(100);
    const [iban, setIban] = useState("");
    const [bic, setBic] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const router = useRouter();

    const maxWithdrawal = Math.min(currentBalance, kycVerified ? 10000 : 500);

    // Safe IBAN formatter
    const formatIban = (value: string | undefined | null): string => {
        if (!value || typeof value !== 'string') return "";
        const cleaned = value.replace(/\s/g, '').toUpperCase();
        if (!cleaned) return "";
        const parts = [];
        for (let i = 0; i < cleaned.length; i += 4) {
            parts.push(cleaned.slice(i, i + 4));
        }
        return parts.join(' ').slice(0, 42);
    };

    const handleReport = () => {
        window.open(`mailto:support@transpareo.com?subject=Erreur%20Service%20Retrait&body=Erreur%20rencontrée%20lors%20du%20retrait.%20Message:%20${encodeURIComponent(errorMessage)}`, '_blank');
        toast.success("Redirection vers le support...");
    };

    const handleSubmit = async () => {
        if (!kycVerified) {
            setErrorMessage("Vérification d'identité requise pour les retraits");
            setStep("error");
            return;
        }

        if (amount < 10 || amount > maxWithdrawal) {
            toast.error(`Montant invalide (min: 10€, max: ${maxWithdrawal}€)`);
            return;
        }

        const cleanIban = (iban || "").replace(/\s/g, '');
        if (cleanIban.length < 15) {
            toast.error("IBAN invalide");
            return;
        }

        setLoading(true);
        try {
            const result = await requestWithdrawal({
                amount,
                iban: cleanIban,
                bic: bic || undefined
            });

            if (result.success) {
                setStep("success");
                router.refresh();
            } else {
                if (result.requiresKYC) {
                    setErrorMessage("Vérification KYC requise pour les retraits. Veuillez compléter votre vérification d'identité.");
                } else {
                    setErrorMessage(result.error || "Erreur lors de la demande de retrait");
                }
                setStep("error");
            }
        } catch (error: any) {
            setErrorMessage(error?.message || "Erreur lors de la demande de retrait");
            setStep("error");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setTimeout(() => {
            setStep("form");
            setAmount(Math.min(100, currentBalance));
            setIban("");
            setBic("");
            setErrorMessage("");
        }, 300);
    };

    return (
        <Dialog open={open} onOpenChange={(o) => o ? setOpen(true) : handleClose()}>
            <DialogTrigger asChild>
                <Button variant="outline" className="h-11 px-5 rounded-full border-white/20 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 font-bold text-sm">
                    <ArrowUpRight className="mr-2" size={16} />
                    Retirer
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
                {step === "error" && (
                    <div className="p-6 text-center">
                        <div className="w-14 h-14 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                            Erreur de retrait
                        </h3>
                        <p className="text-sm text-zinc-500 mb-4">
                            {errorMessage}
                        </p>
                        <div className="flex gap-2 justify-center">
                            <Button variant="outline" onClick={() => setStep("form")}>
                                Réessayer
                            </Button>
                            <Button onClick={handleReport} className="gap-2 bg-red-600 hover:bg-red-700">
                                <Send size={14} />
                                Signaler
                            </Button>
                            {errorMessage.includes("KYC") && (
                                <Button onClick={() => router.push("/p2p/settings/kyc")} className="bg-amber-600 hover:bg-amber-700">
                                    Vérifier mon identité
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {!kycVerified && step === "form" && (
                    <div className="p-6 text-center">
                        <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                            Vérification requise
                        </h3>
                        <p className="text-sm text-zinc-500 mb-6">
                            Pour retirer vos gains, vous devez d'abord vérifier votre identité (KYC).
                        </p>
                        <div className="flex gap-2 justify-center">
                            <Button variant="outline" onClick={handleClose}>
                                Annuler
                            </Button>
                            <Button
                                onClick={() => router.push("/p2p/settings/kyc")}
                                className="bg-amber-600 hover:bg-amber-700"
                            >
                                Vérifier mon identité
                            </Button>
                        </div>
                    </div>
                )}

                {kycVerified && step === "form" && (
                    <>
                        <DialogHeader className="p-6 pb-4 bg-gradient-to-br from-zinc-100 to-white dark:from-zinc-800 dark:to-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                                    <Building2 className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-black">Retirer mes gains</DialogTitle>
                                    <DialogDescription className="text-xs">
                                        Virement vers votre compte bancaire
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                        <div className="p-6 space-y-5">
                            <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                <span className="text-sm text-emerald-700 dark:text-emerald-300">Gains disponibles</span>
                                <span className="font-bold text-emerald-600">
                                    {currentBalance.toLocaleString('fr-FR')} €
                                </span>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm">Montant à retirer</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        min={10}
                                        max={maxWithdrawal}
                                        value={amount}
                                        onChange={(e) => setAmount(Number(e.target.value) || 0)}
                                        className="pr-10 text-lg font-bold"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">€</span>
                                </div>
                                <p className="text-[10px] text-zinc-400">
                                    Maximum: {maxWithdrawal.toLocaleString('fr-FR')} € / demande
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm">IBAN du compte destinataire</Label>
                                <Input
                                    placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                                    value={iban}
                                    onChange={(e) => setIban(formatIban(e.target.value))}
                                    className="font-mono text-sm tracking-wider"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm text-zinc-500">BIC (optionnel)</Label>
                                <Input
                                    placeholder="BNPAFRPP"
                                    value={bic}
                                    onChange={(e) => setBic((e.target.value || "").toUpperCase())}
                                    className="font-mono text-sm"
                                />
                            </div>

                            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl text-xs text-blue-700 dark:text-blue-300">
                                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                <p>Les retraits sont traités sous 2-3 jours ouvrés. Assurez-vous que l'IBAN est correct.</p>
                            </div>
                        </div>
                        <DialogFooter className="p-6 pt-0">
                            <Button
                                onClick={handleSubmit}
                                disabled={loading || amount < 10 || amount > maxWithdrawal || (iban || "").replace(/\s/g, '').length < 15}
                                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin mr-2" size={16} />
                                ) : (
                                    <ArrowUpRight className="mr-2" size={16} />
                                )}
                                Retirer {amount.toLocaleString('fr-FR')} €
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {step === "success" && (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2">Demande enregistrée</h3>
                        <p className="text-sm text-zinc-500 mb-2">
                            Votre demande de retrait de {amount.toLocaleString('fr-FR')} € a été enregistrée.
                        </p>
                        <p className="text-xs text-zinc-400 mb-6">
                            Traitement sous 2-3 jours ouvrés.
                        </p>
                        <Button onClick={handleClose} className="bg-emerald-600 hover:bg-emerald-700">
                            Fermer
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

