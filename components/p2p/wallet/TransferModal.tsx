"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, Send, Plus, Search } from "lucide-react";
import { addBeneficiary, transferFunds } from "@/lib/actions-banking";
import { NewBeneficiaryModal } from "./NewBeneficiaryModal";
import { toast } from "sonner";

interface TransferModalProps {
    children: React.ReactNode;
    userId: string;
    beneficiaries: any[];
    balance: number;
}

export function TransferModal({ children, userId, beneficiaries, balance }: TransferModalProps) {
    const [step, setStep] = useState<"SELECT_BENEFICIARY" | "AMOUNT" | "CONFIRM">("SELECT_BENEFICIARY");
    const [selectedBeneficiary, setSelectedBeneficiary] = useState<any | null>(null);
    const [amount, setAmount] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (b: any) => {
        setSelectedBeneficiary(b);
        setStep("AMOUNT");
    };

    const handleTransfer = async () => {
        if (!selectedBeneficiary || !amount) return;
        setIsProcessing(true);

        try {
            const result = await transferFunds(selectedBeneficiary.id, Number(amount));

            if (result.success) {
                toast.success(`Virement de ${amount}€ envoyé à ${selectedBeneficiary.name}`);
                setIsOpen(false);
                setStep("SELECT_BENEFICIARY");
                setAmount("");
            } else {
                toast.error("Échec du virement", { description: result.error });
            }
        } catch (err) {
            toast.error("Erreur technique");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/10 rounded-[24px]">
                {step === "SELECT_BENEFICIARY" && (
                    <div className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>Virement à...</DialogTitle>
                        </DialogHeader>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-zinc-400 w-4 h-4" />
                            <Input placeholder="Rechercher un bénéficiaire" className="pl-9 bg-zinc-50 dark:bg-zinc-900 border-none" />
                        </div>

                        <div className="max-h-[300px] overflow-y-auto space-y-2">
                            <NewBeneficiaryModal userId={userId}>
                                <button className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl transition-colors text-left group">
                                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                                        <Plus className="w-5 h-5 text-zinc-600 dark:text-zinc-400 group-hover:text-emerald-600" />
                                    </div>
                                    <span className="font-medium text-sm">Ajouter un bénéficiaire</span>
                                </button>
                            </NewBeneficiaryModal>

                            {beneficiaries.map((b) => (
                                <button
                                    key={b.id}
                                    onClick={() => handleSelect(b)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl transition-colors text-left"
                                >
                                    <Avatar className="w-10 h-10 border border-zinc-100 dark:border-zinc-800">
                                        <AvatarFallback className="bg-orange-50 text-orange-600 text-xs font-bold">
                                            {b.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm text-zinc-900 dark:text-white">{b.name}</p>
                                        <p className="text-xs text-zinc-500">{b.iban}</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-zinc-300" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === "AMOUNT" && selectedBeneficiary && (
                    <div className="space-y-6 text-center py-4">
                        <DialogHeader>
                            <DialogTitle className="text-center">{selectedBeneficiary.name}</DialogTitle>
                            <p className="text-xs text-zinc-500">{selectedBeneficiary.iban}</p>
                        </DialogHeader>

                        <div className="relative flex justify-center items-center">
                            <span className="text-3xl font-bold text-zinc-400 mr-2">€</span>
                            <Input
                                autoFocus
                                type="number"
                                className="text-5xl font-black text-center border-none focus-visible:ring-0 p-0 w-[200px] h-auto bg-transparent placeholder:text-zinc-200"
                                placeholder="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <p className="text-xs text-zinc-500">Solde disponible: {balance.toFixed(2)} €</p>

                        <Button
                            className="w-full h-12 text-lg font-bold bg-black dark:bg-white text-white dark:text-black rounded-xl"
                            onClick={() => setStep("CONFIRM")}
                            disabled={!amount || Number(amount) <= 0}
                        >
                            Continuer
                        </Button>
                    </div>
                )}

                {step === "CONFIRM" && (
                    <div className="space-y-6 text-center py-4">
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                            <Send className="w-6 h-6 text-zinc-900 dark:text-white ml-1" />
                            <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                Instant
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-zinc-500 text-sm">Vous envoyez</p>
                            <h2 className="text-4xl font-black text-zinc-900 dark:text-white">{amount} €</h2>
                            <p className="text-zinc-500 text-sm">à <span className="text-zinc-900 dark:text-white font-bold">{selectedBeneficiary?.name}</span></p>
                        </div>

                        <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl text-left space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Frais</span>
                                <span className="font-bold text-emerald-500">Gratuit</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Arrivée estimée</span>
                                <span className="font-bold">Immédiat</span>
                            </div>
                        </div>

                        <Button
                            className="w-full h-12 text-lg font-bold bg-orange-600 hover:bg-orange-500 text-white rounded-xl"
                            onClick={handleTransfer}
                            disabled={isProcessing}
                        >
                            {isProcessing ? "Envoi en cours..." : "Confirmer le virement"}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
