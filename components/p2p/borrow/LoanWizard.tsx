"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { simulateLoan, submitLoanRequest } from "@/lib/actions-borrow";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ChevronRight, ChevronLeft, Calculator, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const PROJECT_TYPES = [
    { value: "PERSONAL", label: "Projet Personnel", emoji: "🎒" },
    { value: "BUSINESS", label: "Entreprise / Pro", emoji: "💼" },
    { value: "REAL_ESTATE", label: "Immobilier", emoji: "🏠" },
    { value: "DEBT_CONSOLIDATION", label: "Rachat de Crédit", emoji: "💳" },
    { value: "VEHICLE", label: "Véhicule", emoji: "🚗" }
];

export function LoanWizard({ onClose, onSuccess }: { onClose?: () => void, onSuccess?: () => void }) {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Form Data
    const [amount, setAmount] = useState(5000);
    const [duration, setDuration] = useState(24);
    const [projectType, setProjectType] = useState("PERSONAL");
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");

    // Simulation Result
    const [simulation, setSimulation] = useState<{ monthlyPayment: number, totalCost: number, apr: number } | null>(null);

    // Live Simulation
    useEffect(() => {
        const runSimulation = async () => {
            const res = await simulateLoan(amount, duration, projectType);
            setSimulation(res);
        };
        const debounce = setTimeout(runSimulation, 300);
        return () => clearTimeout(debounce);
    }, [amount, duration, projectType]);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await submitLoanRequest({
                amount,
                duration,
                category: projectType,
                reason: reason || projectType,
                description
            });
            toast.success("Demande envoyée avec succès !");
            setStep(4); // Success Step
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error("Erreur lors de l'envoi de la demande.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-2 px-1">
                    <span className={cn("text-xs font-bold uppercase tracking-wider", step >= 1 ? "text-violet-600" : "text-zinc-400")}>Projet</span>
                    <span className={cn("text-xs font-bold uppercase tracking-wider", step >= 2 ? "text-violet-600" : "text-zinc-400")}>Détails</span>
                    <span className={cn("text-xs font-bold uppercase tracking-wider", step >= 3 ? "text-violet-600" : "text-zinc-400")}>Validation</span>
                </div>
                <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-violet-600 transition-all duration-500 ease-out"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>
            </div>

            <Card className="border-0 shadow-2xl bg-white dark:bg-zinc-900 overflow-hidden relative">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <CardContent className="p-8 min-h-[500px] flex flex-col relative z-10">

                    {/* STEP 1: SIMULATOR */}
                    {step === 1 && (
                        <div className="space-y-8 flex-1 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="text-center space-y-2">
                                <h2 className="text-3xl font-black text-zinc-900 dark:text-white">Simulez votre projet</h2>
                                <p className="text-zinc-500">Quel montant souhaitez-vous emprunter ?</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-12 mt-8">
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <Label className="text-base font-semibold">Montant</Label>
                                            <span className="text-xl font-bold text-violet-600">{amount.toLocaleString()} €</span>
                                        </div>
                                        <Slider
                                            value={[amount]}
                                            min={500} max={50000} step={500}
                                            onValueChange={([v]) => setAmount(v)}
                                            className="py-4"
                                        />
                                        <div className="flex justify-between text-xs text-zinc-400">
                                            <span>500 €</span>
                                            <span>50 000 €</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <Label className="text-base font-semibold">Durée</Label>
                                            <span className="text-xl font-bold text-violet-600">{duration} mois</span>
                                        </div>
                                        <Slider
                                            value={[duration]}
                                            min={3} max={60} step={3}
                                            onValueChange={([v]) => setDuration(v)}
                                            className="py-4"
                                        />
                                        <div className="flex justify-between text-xs text-zinc-400">
                                            <span>3 mois</span>
                                            <span>5 ans</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Type de Projet</Label>
                                        <Select value={projectType} onValueChange={setProjectType}>
                                            <SelectTrigger className="h-12 border-zinc-200 dark:border-zinc-800">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PROJECT_TYPES.map(t => (
                                                    <SelectItem key={t.value} value={t.value}>
                                                        {t.emoji} {t.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Results Box */}
                                <div className="bg-zinc-50 dark:bg-black/40 rounded-3xl p-6 flex flex-col justify-center border border-zinc-100 dark:border-white/5 space-y-6">
                                    <div className="text-center space-y-1">
                                        <p className="text-zinc-500 text-sm uppercase font-bold tracking-wider">Mensualité estimée</p>
                                        <div className="text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
                                            {simulation ? simulation.monthlyPayment : "..."}
                                            <span className="text-2xl text-zinc-400 font-normal">€</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-white/10">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500">Taux Annuel (TAEG)</span>
                                            <span className="font-bold text-zinc-900 dark:text-white">{simulation?.apr}%</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500">Coût total du crédit</span>
                                            <span className="font-bold text-zinc-900 dark:text-white">{simulation?.totalCost} €</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-emerald-600 font-medium">
                                            <span className="flex items-center gap-1"><ShieldCheck size={14} /> Garantie Transpareo</span>
                                            <span>Inclus</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: DETAILS */}
                    {step === 2 && (
                        <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-right-8 duration-500 max-w-xl mx-auto w-full">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold mb-2">Dites-nous en plus</h2>
                                <p className="text-zinc-500">Ces informations nous aident à valider votre dossier plus vite.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Intitulé du projet</Label>
                                    <Input
                                        placeholder="Ex: Rénovation Cuisine"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description détaillée (Optionnel)</Label>
                                    <Textarea
                                        placeholder="Expliquez votre besoin en quelques lignes..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="min-h-[120px] resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: SUMMARY */}
                    {step === 3 && (
                        <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-right-8 duration-500 max-w-xl mx-auto w-full text-center">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold mb-2">Récapitulatif de la demande</h2>
                                <p className="text-zinc-500">Vérifiez les informations avant l'envoi.</p>
                            </div>

                            <Card className="bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-white/10">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-white/5">
                                        <span className="text-zinc-500">Montant</span>
                                        <span className="font-bold text-lg">{amount.toLocaleString()} €</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-white/5">
                                        <span className="text-zinc-500">Durée</span>
                                        <span className="font-bold">{duration} mois</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-white/5">
                                        <span className="text-zinc-500">Mensualité</span>
                                        <span className="font-bold text-violet-600">{simulation?.monthlyPayment} € / mois</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-zinc-500">Projet</span>
                                        <span className="font-medium">{reason || projectType}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                                En cliquant sur "Confirmer", vous acceptez d'être soumis à une vérification de solvabilité.
                                Aucun frais n'est prélevé avant le déblocage des fonds.
                            </p>
                        </div>
                    )}

                    {/* STEP 4: SUCCESS */}
                    {step === 4 && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 size={40} />
                            </div>
                            <h2 className="text-3xl font-black mb-4">Demande Reçue !</h2>
                            <p className="text-zinc-500 max-w-md mb-8">
                                Votre dossier a été transmis à notre algorithme d'analyse.
                                Vous recevrez une réponse de principe sous <span className="font-bold text-zinc-900 dark:text-white">5 minutes</span>.
                            </p>
                            <Button onClick={onClose} className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 font-bold px-8">
                                Retour au Tableau de Bord
                            </Button>
                        </div>
                    )}

                    {/* Navigation Buttons (Hidden on Success Step) */}
                    {step < 4 && (
                        <div className="flex justify-between mt-8 pt-6 border-t border-zinc-100 dark:border-white/5">
                            {step > 1 ? (
                                <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="text-zinc-500">
                                    <ChevronLeft size={16} className="mr-2" /> Retour
                                </Button>
                            ) : (
                                <div /> /* Spacer */
                            )}

                            {step < 3 ? (
                                <Button onClick={() => setStep(s => s + 1)} className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8">
                                    Suivant <ChevronRight size={16} className="ml-2" />
                                </Button>
                            ) : (
                                <Button onClick={handleSubmit} disabled={isLoading} className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-8">
                                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Confirmer la demande"}
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

