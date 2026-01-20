"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
    ClipboardCheck,
    TrendingUp,
    Shield,
    AlertTriangle,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    CheckCircle
} from "lucide-react";
import { submitSuitabilityTest } from "@/lib/actions-compliance";
import { toast } from "sonner";

interface SuitabilityTestProps {
    onComplete: (sophistication: string) => void;
    onSkip?: () => void;
}

export function SuitabilityTest({ onComplete, onSkip }: SuitabilityTestProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [answers, setAnswers] = useState({
        investmentExperience: "" as "NONE" | "SOME" | "EXTENSIVE" | "",
        riskUnderstanding: false,
        canAffordLoss: false,
        investmentHorizon: "" as "SHORT" | "MEDIUM" | "LONG" | "",
        monthlyIncome: undefined as number | undefined,
        totalPatrimony: undefined as number | undefined,
        investmentObjective: "" as "CAPITAL_GROWTH" | "INCOME" | "DIVERSIFICATION" | ""
    });

    const totalSteps = 4;
    const progress = (step / totalSteps) * 100;

    const canProceed = (): boolean => {
        switch (step) {
            case 1:
                return answers.investmentExperience !== "";
            case 2:
                return answers.riskUnderstanding && answers.canAffordLoss;
            case 3:
                return answers.investmentHorizon !== "" && answers.investmentObjective !== "";
            case 4:
                return true;
            default:
                return false;
        }
    };

    const handleSubmit = async () => {
        if (!answers.investmentExperience || !answers.investmentHorizon || !answers.investmentObjective) {
            toast.error("Veuillez compléter toutes les questions obligatoires");
            return;
        }

        setLoading(true);
        try {
            const result = await submitSuitabilityTest({
                investmentExperience: answers.investmentExperience,
                riskUnderstanding: answers.riskUnderstanding,
                canAffordLoss: answers.canAffordLoss,
                investmentHorizon: answers.investmentHorizon,
                monthlyIncome: answers.monthlyIncome,
                totalPatrimony: answers.totalPatrimony,
                investmentObjective: answers.investmentObjective
            });

            if (result.success) {
                toast.success("Profil investisseur enregistré !");
                onComplete(result.sophistication);
            }
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto border-zinc-200 dark:border-zinc-800 shadow-xl">
            <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                            <ClipboardCheck className="text-white" size={24} />
                        </div>
                        <div>
                            <CardTitle className="text-xl">Questionnaire Investisseur</CardTitle>
                            <p className="text-sm text-zinc-500">Conforme à la réglementation EU ECSPR</p>
                        </div>
                    </div>
                    <span className="text-sm font-medium text-zinc-500">
                        Étape {step}/{totalSteps}
                    </span>
                </div>
                <Progress value={progress} className="h-2" />
            </CardHeader>

            <CardContent className="space-y-6 pb-8">

                {/* Step 1: Investment Experience */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <TrendingUp className="mx-auto mb-3 text-orange-500" size={40} />
                            <h3 className="text-lg font-semibold">Votre expérience d'investissement</h3>
                            <p className="text-sm text-zinc-500">Quel est votre niveau d'expérience ?</p>
                        </div>

                        <RadioGroup
                            value={answers.investmentExperience}
                            onValueChange={(v) => setAnswers({ ...answers, investmentExperience: v as any })}
                            className="space-y-3"
                        >
                            <label className={`flex items-center space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${answers.investmentExperience === "NONE"
                                    ? "border-orange-500 bg-orange-50 dark:bg-orange-900/10"
                                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                                }`}>
                                <RadioGroupItem value="NONE" id="exp-none" />
                                <div>
                                    <p className="font-medium">Débutant</p>
                                    <p className="text-sm text-zinc-500">Je n'ai jamais investi</p>
                                </div>
                            </label>

                            <label className={`flex items-center space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${answers.investmentExperience === "SOME"
                                    ? "border-orange-500 bg-orange-50 dark:bg-orange-900/10"
                                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                                }`}>
                                <RadioGroupItem value="SOME" id="exp-some" />
                                <div>
                                    <p className="font-medium">Intermédiaire</p>
                                    <p className="text-sm text-zinc-500">J'ai déjà investi (actions, obligations, etc.)</p>
                                </div>
                            </label>

                            <label className={`flex items-center space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${answers.investmentExperience === "EXTENSIVE"
                                    ? "border-orange-500 bg-orange-50 dark:bg-orange-900/10"
                                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                                }`}>
                                <RadioGroupItem value="EXTENSIVE" id="exp-ext" />
                                <div>
                                    <p className="font-medium">Expérimenté</p>
                                    <p className="text-sm text-zinc-500">Investisseur actif régulier</p>
                                </div>
                            </label>
                        </RadioGroup>
                    </div>
                )}

                {/* Step 2: Risk Understanding */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <AlertTriangle className="mx-auto mb-3 text-amber-500" size={40} />
                            <h3 className="text-lg font-semibold">Compréhension des risques</h3>
                            <p className="text-sm text-zinc-500">Le prêt participatif comporte des risques importants</p>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
                            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">⚠️ Avertissement</h4>
                            <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                                <li>• Risque de perte totale ou partielle du capital</li>
                                <li>• Fonds immobilisés pendant la durée du prêt</li>
                                <li>• Aucune garantie de rendement</li>
                                <li>• Pas de protection par le fonds de garantie des dépôts</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <label className={`flex items-start space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${answers.riskUnderstanding
                                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10"
                                    : "border-zinc-200 dark:border-zinc-700"
                                }`}>
                                <Checkbox
                                    checked={answers.riskUnderstanding}
                                    onCheckedChange={(v) => setAnswers({ ...answers, riskUnderstanding: !!v })}
                                    className="mt-1"
                                />
                                <div>
                                    <p className="font-medium">Je comprends les risques</p>
                                    <p className="text-sm text-zinc-500">J'ai lu et compris que je peux perdre tout ou partie de mon investissement</p>
                                </div>
                            </label>

                            <label className={`flex items-start space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${answers.canAffordLoss
                                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10"
                                    : "border-zinc-200 dark:border-zinc-700"
                                }`}>
                                <Checkbox
                                    checked={answers.canAffordLoss}
                                    onCheckedChange={(v) => setAnswers({ ...answers, canAffordLoss: !!v })}
                                    className="mt-1"
                                />
                                <div>
                                    <p className="font-medium">Je peux supporter une perte</p>
                                    <p className="text-sm text-zinc-500">Une perte totale n'impacterait pas significativement ma situation financière</p>
                                </div>
                            </label>
                        </div>
                    </div>
                )}

                {/* Step 3: Investment Objectives */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <Sparkles className="mx-auto mb-3 text-indigo-500" size={40} />
                            <h3 className="text-lg font-semibold">Vos objectifs d'investissement</h3>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-sm font-medium">Horizon d'investissement</Label>
                            <RadioGroup
                                value={answers.investmentHorizon}
                                onValueChange={(v) => setAnswers({ ...answers, investmentHorizon: v as any })}
                                className="grid grid-cols-3 gap-3"
                            >
                                <label className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${answers.investmentHorizon === "SHORT"
                                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/10"
                                        : "border-zinc-200 dark:border-zinc-700"
                                    }`}>
                                    <RadioGroupItem value="SHORT" id="h-short" className="sr-only" />
                                    <span className="font-medium">Court</span>
                                    <span className="text-xs text-zinc-500">&lt; 1 an</span>
                                </label>
                                <label className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${answers.investmentHorizon === "MEDIUM"
                                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/10"
                                        : "border-zinc-200 dark:border-zinc-700"
                                    }`}>
                                    <RadioGroupItem value="MEDIUM" id="h-med" className="sr-only" />
                                    <span className="font-medium">Moyen</span>
                                    <span className="text-xs text-zinc-500">1-5 ans</span>
                                </label>
                                <label className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${answers.investmentHorizon === "LONG"
                                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/10"
                                        : "border-zinc-200 dark:border-zinc-700"
                                    }`}>
                                    <RadioGroupItem value="LONG" id="h-long" className="sr-only" />
                                    <span className="font-medium">Long</span>
                                    <span className="text-xs text-zinc-500">&gt; 5 ans</span>
                                </label>
                            </RadioGroup>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-sm font-medium">Objectif principal</Label>
                            <RadioGroup
                                value={answers.investmentObjective}
                                onValueChange={(v) => setAnswers({ ...answers, investmentObjective: v as any })}
                                className="space-y-3"
                            >
                                <label className={`flex items-center space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${answers.investmentObjective === "CAPITAL_GROWTH"
                                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/10"
                                        : "border-zinc-200 dark:border-zinc-700"
                                    }`}>
                                    <RadioGroupItem value="CAPITAL_GROWTH" id="obj-growth" />
                                    <span className="font-medium">Croissance du capital</span>
                                </label>
                                <label className={`flex items-center space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${answers.investmentObjective === "INCOME"
                                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/10"
                                        : "border-zinc-200 dark:border-zinc-700"
                                    }`}>
                                    <RadioGroupItem value="INCOME" id="obj-income" />
                                    <span className="font-medium">Revenus réguliers</span>
                                </label>
                                <label className={`flex items-center space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${answers.investmentObjective === "DIVERSIFICATION"
                                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/10"
                                        : "border-zinc-200 dark:border-zinc-700"
                                    }`}>
                                    <RadioGroupItem value="DIVERSIFICATION" id="obj-div" />
                                    <span className="font-medium">Diversification</span>
                                </label>
                            </RadioGroup>
                        </div>
                    </div>
                )}

                {/* Step 4: Financial Info (Optional) */}
                {step === 4 && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <Shield className="mx-auto mb-3 text-emerald-500" size={40} />
                            <h3 className="text-lg font-semibold">Informations financières</h3>
                            <p className="text-sm text-zinc-500">Optionnel - Pour personnaliser votre expérience</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="income">Revenus mensuels nets (€)</Label>
                                <Input
                                    id="income"
                                    type="number"
                                    placeholder="Ex: 3000"
                                    value={answers.monthlyIncome || ""}
                                    onChange={(e) => setAnswers({ ...answers, monthlyIncome: e.target.value ? parseInt(e.target.value) : undefined })}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label htmlFor="patrimony">Patrimoine total estimé (€)</Label>
                                <Input
                                    id="patrimony"
                                    type="number"
                                    placeholder="Ex: 50000"
                                    value={answers.totalPatrimony || ""}
                                    onChange={(e) => setAnswers({ ...answers, totalPatrimony: e.target.value ? parseInt(e.target.value) : undefined })}
                                    className="mt-2"
                                />
                                <p className="text-xs text-zinc-500 mt-1">
                                    Nous utilisons cette information pour vous alerter si un investissement dépasse 5% de votre patrimoine.
                                </p>
                            </div>
                        </div>

                        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="text-emerald-600" size={24} />
                                <div>
                                    <p className="font-medium text-emerald-800 dark:text-emerald-200">Prêt à investir</p>
                                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                        Votre profil sera enregistré conformément aux exigences réglementaires.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-6 border-t border-zinc-100 dark:border-zinc-800">
                    <Button
                        variant="outline"
                        onClick={() => step > 1 ? setStep(step - 1) : onSkip?.()}
                        disabled={loading}
                    >
                        <ChevronLeft size={16} className="mr-1" />
                        {step === 1 ? "Annuler" : "Retour"}
                    </Button>

                    {step < totalSteps ? (
                        <Button
                            onClick={() => setStep(step + 1)}
                            disabled={!canProceed()}
                            className="bg-orange-600 hover:bg-orange-500"
                        >
                            Continuer
                            <ChevronRight size={16} className="ml-1" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-emerald-600 hover:bg-emerald-500"
                        >
                            {loading ? "Enregistrement..." : "Valider mon profil"}
                            <CheckCircle size={16} className="ml-2" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

