"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Euro, Calendar, MapPin, Building, ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { createLoanApplication } from "@/lib/actions-p2p-loans";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

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
            // Show Success State
            setStep(4);
        } catch (e) {
            toast.error("Erreur lors de la soumission");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid lg:grid-cols-3 gap-8 items-start">

            {/* Progress Sidebar */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 hidden lg:block sticky top-24">
                <div className="space-y-8 relative">
                    {/* Line */}
                    <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-zinc-200 dark:bg-zinc-800" />

                    {['Les Bases', 'Détails du Projet', 'Finalisation'].map((label, i) => {
                        const s = i + 1;
                        const isActive = step >= s;
                        const isCurrent = step === s;

                        return (
                            <div key={s} className="relative flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 transition-colors ${isActive ? 'bg-orange-600 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'}`}>
                                    {isActive ? <CheckCircle2 size={16} /> : s}
                                </div>
                                <span className={`font-medium ${isCurrent ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                                    {label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Form Content */}
            <Card className="lg:col-span-2 border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-xl">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <CardHeader>
                                <CardTitle>Paramétrez votre emprunt</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <Label>Montant demandé</Label>
                                        <span className="text-xl font-bold font-mono text-orange-600">{formData.amount.toLocaleString()} €</span>
                                    </div>
                                    <Slider
                                        value={[formData.amount]}
                                        min={1000}
                                        max={200000}
                                        step={1000}
                                        onValueChange={(v) => update('amount', v[0])}
                                    />
                                    <div className="flex justify-between text-xs text-zinc-500">
                                        <span>1 000 €</span>
                                        <span>200 000 €</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <Label>Durée de remboursement</Label>
                                        <span className="text-xl font-bold font-mono text-blue-600">{formData.duration} mois</span>
                                    </div>
                                    <Slider
                                        value={[formData.duration]}
                                        min={6}
                                        max={60}
                                        step={6}
                                        onValueChange={(v) => update('duration', v[0])}
                                    />
                                    <div className="flex justify-between text-xs text-zinc-500">
                                        <span>6 mois</span>
                                        <span>5 ans</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end">
                                <Button onClick={() => setStep(2)} className="h-12 px-8 bg-zinc-900 dark:bg-white text-white dark:text-black">
                                    Suivant <ArrowRight className="ml-2" size={16} />
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
                            <CardHeader>
                                <CardTitle>Détails du Projet</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Nom du Projet</Label>
                                    <Input
                                        placeholder="Ex: Rénovation T2 Nantes"
                                        value={formData.title}
                                        onChange={(e) => update('title', e.target.value)}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Catégorie</Label>
                                        <Select value={formData.category} onValueChange={(v) => update('category', v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="REAL_ESTATE">Immobilier</SelectItem>
                                                <SelectItem value="BUSINESS">Entreprise</SelectItem>
                                                <SelectItem value="ECO">Transition Écologique</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Localisation</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 text-zinc-400" size={16} />
                                            <Input
                                                className="pl-10"
                                                placeholder="Ville, Code Postal"
                                                value={formData.location}
                                                onChange={(e) => update('location', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex justify-between">
                                        Description
                                        <span className="text-xs text-orange-600 flex items-center gap-1 cursor-pointer hover:underline">
                                            <Sparkles size={12} /> Améliorer avec l'IA
                                        </span>
                                    </Label>
                                    <Textarea
                                        className="h-32 resize-none"
                                        placeholder="Décrivez pourquoi vous empruntez et comment vous comptez rembourser..."
                                        value={formData.description}
                                        onChange={(e) => update('description', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline" onClick={() => setStep(1)}>Retour</Button>
                                <Button onClick={() => setStep(3)} className="h-12 px-8 bg-zinc-900 dark:bg-white text-white dark:text-black">
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
                            <CardHeader>
                                <CardTitle>Récapitulatif</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="bg-zinc-50 dark:bg-black/20 p-6 rounded-xl space-y-4">
                                    <div className="flex justify-between items-center border-b border-zinc-200 dark:border-white/5 pb-4">
                                        <span className="text-zinc-500">Montant</span>
                                        <span className="text-xl font-bold">{formData.amount.toLocaleString()} €</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-zinc-200 dark:border-white/5 pb-4">
                                        <span className="text-zinc-500">Mensualités estimées</span>
                                        <span className="text-xl font-bold">~{Math.round(formData.amount / formData.duration * 1.05)} €/mois</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-500">Taux Estimé (APR)</span>
                                        <span className="text-xl font-bold text-orange-600">4.5% - 6.2%</span>
                                    </div>
                                </div>
                                <p className="text-xs text-zinc-500 text-center">
                                    En cliquant sur soumettre, vous acceptez que notre équipe analyse votre dossier. Une réponse vous sera apportée sous 48h.
                                </p>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline" onClick={() => setStep(2)}>Retour</Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="h-12 px-8 bg-orange-600 hover:bg-orange-700 text-white"
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
                            className="text-center py-12"
                        >
                            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={48} />
                            </div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">Dossier en cours d'analyse !</h2>
                            <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto mb-8">
                                Votre projet <strong>"{formData.title}"</strong> a bien été reçu. Vous recevrez une notification dès qu'il sera validé par nos analystes.
                            </p>
                            <Button onClick={() => router.push('/p2p/dashboard')} variant="outline">
                                Retour au Dashboard
                            </Button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </Card>
        </div>
    );
}
