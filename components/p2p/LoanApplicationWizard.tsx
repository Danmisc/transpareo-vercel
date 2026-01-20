"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { MapPin, ArrowRight, CheckCircle2, Loader2, Sparkles, Building2, Wallet, ArrowLeft } from "lucide-react";
import { createLoanApplication } from "@/lib/actions-p2p-loans";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export function LoanApplicationWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        amount: 25000,
        duration: 24,
        category: "REAL_ESTATE",
        description: "",
        location: ""
    });

    const update = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await createLoanApplication(formData);
            toast.success("Votre dossier a été soumis avec succès !");
            setStep(4);
        } catch (e) {
            toast.error("Erreur lors de la soumission");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid lg:grid-cols-12 gap-6 items-start">

            {/* Progress Sidebar */}
            <div className="hidden lg:block lg:col-span-3 sticky top-24">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5">
                    <h3 className="font-bold text-sm mb-6 text-zinc-900 dark:text-white">Votre Demande</h3>
                    <div className="space-y-6 relative">
                        {/* Line */}
                        <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-zinc-100 dark:bg-zinc-800" />

                        {['Financement', 'Le Projet', 'Finalisation'].map((label, i) => {
                            const s = i + 1;
                            const isActive = step >= s;
                            const isCurrent = step === s;

                            return (
                                <div key={s} className="relative flex items-center gap-3">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center relative z-10 transition-all text-xs border ${isActive
                                        ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-500/20'
                                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-400'
                                        }`}>
                                        {isActive ? <CheckCircle2 size={14} /> : s}
                                    </div>
                                    <span className={`text-sm font-medium transition-colors ${isCurrent ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                                        {label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="lg:col-span-9">
                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <CardHeader className="pb-2 pt-6 px-6">
                                    <Badge className="w-fit bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-none mb-2">Étape 1/3</Badge>
                                    <CardTitle className="text-xl font-black">Paramétrez votre emprunt</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-8 px-6 pb-6">
                                    <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-zinc-500">Montant souhaité</Label>
                                            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                                <Wallet size={14} className="text-violet-500" />
                                                <span className="text-lg font-black font-mono text-zinc-900 dark:text-white">{formData.amount.toLocaleString()} €</span>
                                            </div>
                                        </div>
                                        <Slider
                                            value={[formData.amount]}
                                            min={1000}
                                            max={200000}
                                            step={1000}
                                            onValueChange={(v) => update('amount', v[0])}
                                            className="py-2"
                                        />
                                        <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                                            <span>1 000 €</span>
                                            <span>200 000 €</span>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-zinc-500">Durée de remboursement</Label>
                                            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                                <span className="text-lg font-black font-mono text-violet-600">{formData.duration} mois</span>
                                            </div>
                                        </div>
                                        <Slider
                                            value={[formData.duration]}
                                            min={6}
                                            max={60}
                                            step={6}
                                            onValueChange={(v) => update('duration', v[0])}
                                            className="py-2"
                                        />
                                        <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                                            <span>6 mois</span>
                                            <span>5 ans</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end px-6 pb-6 pt-0">
                                    <Button onClick={() => setStep(2)} className="h-10 px-6 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-md shadow-violet-500/20">
                                        Continuer <ArrowRight className="ml-2" size={16} />
                                    </Button>
                                </CardFooter>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <CardHeader className="pb-2 pt-6 px-6">
                                    <Badge className="w-fit bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-none mb-2">Étape 2/3</Badge>
                                    <CardTitle className="text-xl font-black">Détails du Projet</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-5 px-6 pb-6">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Nom du Projet</Label>
                                        <Input
                                            className="bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:ring-violet-500/20"
                                            placeholder="Ex: Rénovation T2 Nantes"
                                            value={formData.title}
                                            onChange={(e) => update('title', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Catégorie</Label>
                                            <Select value={formData.category} onValueChange={(v) => update('category', v)}>
                                                <SelectTrigger className="bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="REAL_ESTATE">Immobilier</SelectItem>
                                                    <SelectItem value="BUSINESS">Entreprise</SelectItem>
                                                    <SelectItem value="ECO">Transition Écologique</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Localisation</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-2.5 text-zinc-400" size={16} />
                                                <Input
                                                    className="pl-9 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700"
                                                    placeholder="Ville, Code Postal"
                                                    value={formData.location}
                                                    onChange={(e) => update('location', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="flex justify-between text-xs">
                                            Description
                                            <span className="text-[10px] text-violet-600 flex items-center gap-1 cursor-pointer hover:underline font-bold">
                                                <Sparkles size={10} /> IA Assistant
                                            </span>
                                        </Label>
                                        <Textarea
                                            className="h-28 resize-none bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:ring-violet-500/20"
                                            placeholder="Décrivez votre projet..."
                                            value={formData.description}
                                            onChange={(e) => update('description', e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between px-6 pb-6 pt-0">
                                    <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-zinc-500">
                                        <ArrowLeft size={16} className="mr-2" /> Retour
                                    </Button>
                                    <Button onClick={() => setStep(3)} className="h-10 px-6 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-md shadow-violet-500/20">
                                        Suivant <ArrowRight className="ml-2" size={16} />
                                    </Button>
                                </CardFooter>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <CardHeader className="pb-2 pt-6 px-6">
                                    <Badge className="w-fit bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-none mb-2">Étape 3/3</Badge>
                                    <CardTitle className="text-xl font-black">Récapitulatif</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6 px-6 pb-6">
                                    <div className="bg-zinc-50 dark:bg-zinc-800/40 p-5 rounded-xl space-y-3 border border-zinc-100 dark:border-zinc-800/50">
                                        <div className="flex justify-between items-center border-b border-zinc-200 dark:border-white/5 pb-3">
                                            <span className="text-sm text-zinc-500">Montant demandé</span>
                                            <span className="text-lg font-black font-mono text-zinc-900 dark:text-white">{formData.amount.toLocaleString()} €</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-zinc-200 dark:border-white/5 pb-3">
                                            <span className="text-sm text-zinc-500">Mensualités estimées</span>
                                            <span className="text-lg font-bold font-mono">~{Math.round(formData.amount / formData.duration * 1.05)} €<span className="text-sm font-normal text-zinc-400">/mois</span></span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-zinc-500">Taux Estimé (APR)</span>
                                            <Badge variant="outline" className="text-violet-600 border-violet-200 bg-violet-50 dark:bg-violet-900/10 dark:border-violet-900/30">
                                                4.5% - 6.2%
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                                        <Building2 size={16} className="shrink-0 mt-0.5" />
                                        <p>En soumettant ce dossier, vous autorisez nos équipes à analyser votre situation financière. Une réponse de principe vous sera donnée sous 48h.</p>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between px-6 pb-6 pt-0">
                                    <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="text-zinc-500">
                                        <ArrowLeft size={16} className="mr-2" /> Modifier
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="h-10 px-8 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-lg shadow-violet-500/20"
                                    >
                                        {loading ? <Loader2 className="animate-spin mr-2" /> : "Soumettre le dossier"}
                                    </Button>
                                </CardFooter>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-10"
                            >
                                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/20">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Dossier reçu !</h2>
                                <p className="text-sm text-zinc-500 max-w-sm mx-auto mb-8">
                                    Votre demande pour <strong>"{formData.title}"</strong> a été transmise à nos analystes.
                                </p>
                                <Button onClick={() => router.push('/p2p/borrow')} variant="outline" className="border-zinc-200 dark:border-zinc-700">
                                    Retour au Tableau de bord
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </div>
        </div>
    );
}

