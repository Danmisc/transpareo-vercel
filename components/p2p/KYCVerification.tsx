"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, Upload, ScanFace, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { submitKYC } from "@/lib/actions-p2p-wallet";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function KYCVerification({ currentStatus }: { currentStatus: any }) {
    const [step, setStep] = useState(1);
    const [docType, setDocType] = useState("ID_CARD");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    if (currentStatus?.status === 'VERIFIED') {
        return (
            <Card className="bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-500/20">
                <CardContent className="flex items-center gap-4 p-6">
                    <div className="bg-emerald-100 dark:bg-emerald-900/50 p-3 rounded-full text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <h3 className="font-bold text-emerald-800 dark:text-emerald-400">Identité Vérifiée</h3>
                        <p className="text-emerald-600 dark:text-emerald-500 text-sm">Vous avez accès à toutes les fonctionnalités d'investissement.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const handleSubmit = async () => {
        if (!file) {
            toast.error("Veuillez sélectionner un document");
            return;
        }

        setLoading(true);
        // Simulate upload delay
        await new Promise(r => setTimeout(r, 2000));

        try {
            await submitKYC({
                documentType: docType,
                documentUrl: URL.createObjectURL(file) // Mock URL for demo
            });
            toast.success("Documents envoyés pour vérification !");
        } catch (e) {
            toast.error("Erreur lors de l'envoi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden">
            <CardHeader className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-white/5">
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="text-orange-600" />
                    Vérification d'Identité (KYC)
                </CardTitle>
                <CardDescription>
                    Obligatoire pour investir, conformément à la réglementation bancaire.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="flex">
                    {/* Sidebar Steps */}
                    <div className="w-1/3 bg-zinc-50 dark:bg-black/20 border-r border-zinc-200 dark:border-white/5 p-6 space-y-6 hidden md:block">
                        <div className={`flex items-center gap-3 ${step >= 1 ? 'text-orange-600 font-bold' : 'text-zinc-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= 1 ? 'border-orange-600 bg-orange-100 dark:bg-orange-900/20' : 'border-zinc-300'}`}>1</div>
                            Type de document
                        </div>
                        <div className={`flex items-center gap-3 ${step >= 2 ? 'text-orange-600 font-bold' : 'text-zinc-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= 2 ? 'border-orange-600 bg-orange-100 dark:bg-orange-900/20' : 'border-zinc-300'}`}>2</div>
                            Importation
                        </div>
                        <div className={`flex items-center gap-3 ${step >= 3 ? 'text-orange-600 font-bold' : 'text-zinc-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= 3 ? 'border-orange-600 bg-orange-100 dark:bg-orange-900/20' : 'border-zinc-300'}`}>3</div>
                            Vérification Faciale
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-8 min-h-[400px] flex flex-col justify-center">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <Label>Choisissez votre document</Label>
                                        <Select value={docType} onValueChange={setDocType}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ID_CARD">Carte Nationale d'Identité</SelectItem>
                                                <SelectItem value="PASSPORT">Passeport</SelectItem>
                                                <SelectItem value="RESIDENCE_PERMIT">Titre de Séjour</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 text-sm rounded-lg flex gap-2">
                                        <AlertTriangle size={18} />
                                        Le document doit être en cours de validité et non rogné.
                                    </div>
                                    <Button onClick={() => setStep(2)} className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black">Continuer</Button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6 text-center"
                                >
                                    <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-10 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer relative">
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        />
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500">
                                                <Upload size={32} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-zinc-900 dark:text-white mb-1">
                                                    {file ? file.name : "Cliquez pour importer"}
                                                </p>
                                                <p className="text-zinc-500 text-sm">PNG, JPG ou PDF (Max 5Mo)</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Retour</Button>
                                        <Button onClick={() => setStep(3)} disabled={!file} className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-black">Continuer</Button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6 text-center"
                                >
                                    <div className="flex flex-col items-center gap-6 py-8">
                                        <div className="relative">
                                            <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-orange-600 animate-pulse">
                                                <ScanFace size={48} />
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 bg-white dark:bg-zinc-900 p-2 rounded-full shadow-lg">
                                                <CheckCircle2 size={24} className="text-green-500" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Analyse Biométrique simulée</h3>
                                            <p className="text-zinc-500 text-sm mt-2">Nous allons vérifier que vous êtes bien une personne réelle.</p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="w-full h-12 text-lg bg-orange-600 hover:bg-orange-700 text-white rounded-full"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : "Finaliser la vérification"}
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
