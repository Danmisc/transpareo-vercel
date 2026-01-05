"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Check, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { addBeneficiary } from "@/lib/actions-banking";

export function NewBeneficiaryModal({ children, userId }: { children: React.ReactNode, userId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<"DETAILS" | "2FA">("DETAILS");
    const [form, setForm] = useState({ name: "", holder: "", iban: "", bic: "" });
    const [code, setCode] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitDetails = async () => {
        if (!form.name || !form.iban) {
            toast.error("Veuillez remplir les champs obligatoires");
            return;
        }
        setStep("2FA");
    };

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            const result = await addBeneficiary(form, code);
            if (result.success) {
                toast.success("Bénéficiaire ajouté avec succès");
                setIsOpen(false);
                setStep("DETAILS");
                setForm({ name: "", holder: "", iban: "", bic: "" });
                setCode("");
            } else if (result.requires2FA) {
                // If we didn't send code but needed to (should rely on step flow though)
                setStep("2FA");
                toast.info("Validation 2FA requise");
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erreur serveur");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/10 rounded-[24px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="w-5 h-5 text-emerald-500" />
                        Nouveau Bénéficiaire
                    </DialogTitle>
                </DialogHeader>

                {step === "DETAILS" ? (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nom du Bénéficiaire (Alias)</Label>
                            <Input
                                placeholder="ex: Propriétaire, Maman..."
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Titulaire du Compte</Label>
                            <Input
                                placeholder="Nom et Prénom"
                                value={form.holder}
                                onChange={(e) => setForm({ ...form, holder: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>IBAN</Label>
                            <Input
                                placeholder="FR76 ..."
                                value={form.iban}
                                onChange={(e) => setForm({ ...form, iban: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>BIC</Label>
                            <Input
                                placeholder="TRSP..."
                                value={form.bic}
                                onChange={(e) => setForm({ ...form, bic: e.target.value })}
                            />
                        </div>
                        <Button className="w-full mt-4" onClick={handleSubmitDetails}>
                            Suivant
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4 py-4 text-center">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                            <ShieldCheck className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h3 className="font-bold">Validation de Sécurité</h3>
                        <p className="text-sm text-zinc-500">Un nouveau bénéficiaire est une action sensible. Saisissez votre code 2FA pour confirmer.</p>

                        <Input
                            className="text-center font-mono text-2xl tracking-widest"
                            placeholder="000 000"
                            maxLength={6}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            autoFocus
                        />

                        <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={handleConfirm}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Validation..." : "Confirmer l'ajout"}
                        </Button>
                        <Button variant="ghost" onClick={() => setStep("DETAILS")}>
                            Retour
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
