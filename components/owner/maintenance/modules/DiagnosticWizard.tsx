"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion, AnimatePresence } from "framer-motion";
import {
    Droplets,
    Zap,
    Thermometer,
    Key,
    Wifi,
    Hammer,
    AlertTriangle,
    Camera,
    Check,
    ArrowRight,
    Loader2
} from "lucide-react";

interface DiagnosticWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (ticket: any) => void;
}

export function DiagnosticWizard({ isOpen, onClose, onSubmit }: DiagnosticWizardProps) {
    const [step, setStep] = useState(1);
    const [category, setCategory] = useState<string>("");
    const [subCategory, setSubCategory] = useState<string>("");
    const [description, setDescription] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [urgency, setUrgency] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");

    // Mock Data for Categories
    const categories = [
        { id: "plumbing", label: "Plomberie", icon: Droplets, color: "text-blue-500", bg: "bg-blue-50" },
        { id: "electric", label: "Électricité", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
        { id: "heating", label: "Chauffage", icon: Thermometer, color: "text-orange-500", bg: "bg-orange-50" },
        { id: "access", label: "Serrurerie", icon: Key, color: "text-zinc-500", bg: "bg-zinc-50" },
        { id: "network", label: "Internet", icon: Wifi, color: "text-indigo-500", bg: "bg-indigo-50" },
        { id: "other", label: "Autre", icon: Hammer, color: "text-slate-500", bg: "bg-slate-50" },
    ];

    const subCategories: Record<string, string[]> = {
        plumbing: ["Fuite d'eau", "Canalisation bouchée", "Plus d'eau chaude", "Toilettes", "Robinetterie"],
        electric: ["Coupure générale", "Prise défectueuse", "Interrupteur", "Appareil en panne"],
        heating: ["Radiateur froid", "Bruit anormal", "Fuite radiateur", "Thermostat"],
        access: ["Clé perdue", "Serrure bloquée", "Porte claquée", "Interphone"],
        network: ["Pas de connexion", "Lenteur", "Problème Box"],
        other: ["Murs/Sols", "Nuisibles", "Voisinage", "Autre"]
    };

    const handleNext = () => {
        if (step === 2) {
            // Simulate AI Analysis
            setIsAnalyzing(true);
            setTimeout(() => {
                setIsAnalyzing(false);
                // Simple keyword matching for urgency simulation
                if (subCategory.includes('Fuite') || subCategory.includes('Coupure') || subCategory.includes('bloquée')) {
                    setUrgency('HIGH');
                } else {
                    setUrgency('MEDIUM');
                }
                setStep(3);
            }, 1500);
        } else {
            setStep(step + 1);
        }
    };

    const handleSubmit = () => {
        onSubmit({
            category,
            subCategory,
            description,
            urgency
        });
        onClose();
        setStep(1); // Reset
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md p-0 overflow-hidden bg-zinc-50">
                <div className="p-6 h-[450px] flex flex-col">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            {step === 1 && "Quel est le problème ?"}
                            {step === 2 && "Détails de l'incident"}
                            {step === 3 && "Analyse & Confirmation"}
                        </DialogTitle>
                    </DialogHeader>

                    {/* STEPS CONTENT */}
                    <div className="flex-1 overflow-y-auto pr-2">
                        <AnimatePresence mode="wait">

                            {/* STEP 1: CATEGORY */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="grid grid-cols-2 gap-3"
                                >
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => { setCategory(cat.id); setStep(2); }}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center hover:bg-white
                                                ${category === cat.id ? 'border-zinc-900 bg-white shadow-md' : 'border-transparent bg-white shadow-sm hover:border-zinc-200'}
                                            `}
                                        >
                                            <div className={`p-3 rounded-full ${cat.bg} ${cat.color}`}>
                                                <cat.icon size={24} />
                                            </div>
                                            <span className="text-sm font-bold text-zinc-700">{cat.label}</span>
                                        </button>
                                    ))}
                                </motion.div>
                            )}

                            {/* STEP 2: SUBCATEGORY & PHOTO */}
                            {step === 2 && !isAnalyzing && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-3">
                                        <Label>Précisez le problème</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {subCategories[category]?.map((sub) => (
                                                <button
                                                    key={sub}
                                                    onClick={() => setSubCategory(sub)}
                                                    className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all text-left
                                                        ${subCategory === sub ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'}
                                                    `}
                                                >
                                                    {sub}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Description (Facultatif)</Label>
                                        <Textarea
                                            placeholder="Expliquez brièvement..."
                                            className="bg-white resize-none"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        />
                                    </div>

                                    <div className="p-4 border-2 border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center text-zinc-400 bg-white cursor-pointer hover:bg-zinc-50 hover:border-zinc-300 transition-colors">
                                        <Camera size={24} className="mb-2" />
                                        <span className="text-xs font-medium">Ajouter une photo (Conseillé)</span>
                                    </div>
                                </motion.div>
                            )}

                            {/* LOADING STATE */}
                            {isAnalyzing && (
                                <motion.div
                                    key="analyzing"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full flex flex-col items-center justify-center text-center space-y-4"
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-indigo-500 rounded-full opacity-20 animate-ping"></div>
                                        <div className="bg-white p-4 rounded-full shadow-xl relative z-10">
                                            <Loader2 size={40} className="text-indigo-600 animate-spin" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-zinc-900">Analyse IA en cours...</h3>
                                        <p className="text-sm text-zinc-500">Qualification de l'urgence et recherche de solutions.</p>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 3: SUMMARY & URGENCY */}
                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-6"
                                >
                                    <div className={`p-4 rounded-xl border flex items-start gap-4 ${urgency === 'HIGH' ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'
                                        }`}>
                                        <div className={`p-2 rounded-full ${urgency === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                            {urgency === 'HIGH' ? <AlertTriangle size={24} /> : <Check size={24} />}
                                        </div>
                                        <div>
                                            <h4 className={`font-bold ${urgency === 'HIGH' ? 'text-red-700' : 'text-emerald-700'}`}>
                                                {urgency === 'HIGH' ? 'Priorité Haute Détectée' : 'Priorité Normale'}
                                            </h4>
                                            <p className={`text-sm mt-1 ${urgency === 'HIGH' ? 'text-red-600' : 'text-emerald-600'}`}>
                                                {urgency === 'HIGH'
                                                    ? "D'après vos réponses (Fuite/Blocage), une intervention rapide est recommandée."
                                                    : "Ce type d'incident ne nécessite pas d'intervention d'urgence."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500">Catégorie</span>
                                            <span className="font-medium">{subCategory} ({category})</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500">Urgence Estimée</span>
                                            <span className="font-bold">{urgency}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>

                    {/* FOOTER ACTIONS */}
                    <div className="mt-4 pt-4 border-t border-zinc-100 flex justify-between items-center">
                        {step > 1 && !isAnalyzing && step < 3 && (
                            <Button variant="ghost" onClick={() => setStep(step - 1)}>Retour</Button>
                        )}
                        <div className="ml-auto">
                            {step === 2 && !isAnalyzing && (
                                <Button onClick={handleNext} disabled={!subCategory} className="bg-zinc-900 text-white">
                                    Analyser <ArrowRight size={16} className="ml-2" />
                                </Button>
                            )}
                            {step === 3 && (
                                <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white w-full">
                                    Envoyer le Ticket
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
