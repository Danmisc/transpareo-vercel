"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, ArrowRight, Building2, Wallet, Coins } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Step = 'project' | 'amount' | 'income' | 'result';

export function EligibilityTester() {
    const [step, setStep] = useState<Step>('project');
    const [progress, setProgress] = useState(25);
    const [score, setScore] = useState(0);

    const nextStep = (next: Step, point: number) => {
        setScore(curr => curr + point);
        setStep(next);
        setProgress(curr => curr + 25);
    };

    return (
        <section className="py-20 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-orange-500/5 dark:bg-orange-500/10 blur-[100px] -z-10" />

            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">Éligibilité Express</h2>
                    <p className="text-zinc-600 dark:text-zinc-400">Vérifiez votre solvabilité en 3 clics. Sans engagement, sans trace bancaire.</p>
                </div>

                <Card className="border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-2xl relative overflow-hidden">
                    {/* Top Progress Bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-zinc-100 dark:bg-zinc-800">
                        <motion.div
                            className="h-full bg-orange-500"
                            initial={{ width: "0%" }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>

                    <CardContent className="p-8 md:p-12 min-h-[400px] flex flex-col justify-center">
                        <AnimatePresence mode="wait">

                            {/* STEP 1: PROJECT */}
                            {step === 'project' && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <h3 className="text-2xl font-semibold text-zinc-900 dark:text-white flex items-center gap-3">
                                        <Building2 className="text-orange-500" /> Quel est votre projet ?
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <Button variant="outline" className="h-20 text-lg border-zinc-200 dark:border-zinc-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-600 transition-all font-normal" onClick={() => nextStep('amount', 20)}>
                                            Investissement Locatif
                                        </Button>
                                        <Button variant="outline" className="h-20 text-lg border-zinc-200 dark:border-zinc-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-600 transition-all font-normal" onClick={() => nextStep('amount', 10)}>
                                            Résidence Principale
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 2: AMOUNT */}
                            {step === 'amount' && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <h3 className="text-2xl font-semibold text-zinc-900 dark:text-white flex items-center gap-3">
                                        <Wallet className="text-orange-500" /> Votre apport personnel ?
                                    </h3>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <Button variant="outline" className="h-16 text-lg border-zinc-200 dark:border-zinc-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-600 transition-all font-normal" onClick={() => nextStep('income', 0)}>
                                            Moins de 10%
                                        </Button>
                                        <Button variant="outline" className="h-16 text-lg border-zinc-200 dark:border-zinc-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-600 transition-all font-normal" onClick={() => nextStep('income', 20)}>
                                            10% à 20%
                                        </Button>
                                        <Button variant="outline" className="h-16 text-lg border-zinc-200 dark:border-zinc-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-600 transition-all font-normal" onClick={() => nextStep('income', 40)}>
                                            Plus de 20%
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 3: INCOME */}
                            {step === 'income' && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <h3 className="text-2xl font-semibold text-zinc-900 dark:text-white flex items-center gap-3">
                                        <Coins className="text-orange-500" /> Taux d'endettement actuel ?
                                    </h3>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <Button variant="outline" className="h-16 text-lg border-zinc-200 dark:border-zinc-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-600 transition-all font-normal" onClick={() => nextStep('result', 40)}>
                                            Inférieur à 30%
                                        </Button>
                                        <Button variant="outline" className="h-16 text-lg border-zinc-200 dark:border-zinc-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-600 transition-all font-normal" onClick={() => nextStep('result', 20)}>
                                            Entre 30% et 35%
                                        </Button>
                                        <Button variant="outline" className="h-16 text-lg border-zinc-200 dark:border-zinc-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-600 transition-all font-normal" onClick={() => nextStep('result', 0)}>
                                            Supérieur à 35%
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 4: RESULT */}
                            {step === 'result' && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center space-y-6"
                                >
                                    {score >= 50 ? (
                                        <>
                                            <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <CheckCircle2 className="w-10 h-10 text-orange-600 dark:text-orange-500" />
                                            </div>
                                            <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">Excellente Nouvelle !</h3>
                                            <p className="text-lg text-zinc-600 dark:text-zinc-300 max-w-lg mx-auto">
                                                Votre profil correspond aux critères de nos investisseurs Premium. Vous pourriez obtenir un taux préférentiel dès <span className="font-bold text-orange-600 dark:text-orange-400">4.1%</span>.
                                            </p>
                                            <Button className="h-14 px-8 text-lg bg-orange-600 hover:bg-orange-700 text-white rounded-full mt-4">
                                                Déposer mon dossier (Gratuit) <ArrowRight className="ml-2" size={18} />
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <AlertCircle className="w-10 h-10 text-amber-600 dark:text-amber-500" />
                                            </div>
                                            <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">Dossier à consolider</h3>
                                            <p className="text-lg text-zinc-600 dark:text-zinc-300 max-w-lg mx-auto">
                                                Votre capacité d'emprunt semble limitée pour l'instant. Nous vous conseillons d'augmenter votre apport ou de viser un bien moins onéreux.
                                            </p>
                                            <Button variant="outline" className="mt-4" onClick={() => { setStep('project'); setProgress(25); setScore(0); }}>
                                                Refaire le test
                                            </Button>
                                        </>
                                    )}
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
