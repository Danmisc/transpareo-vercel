"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Star, Thermometer, Volume2, Shield, Wifi, UserCheck, Droplets, Bus } from "lucide-react";
import { createPropertyReview } from "@/lib/actions/reviews";
// import { useToast } from "@/components/ui/use-toast";

interface ReviewFormProps {
    isOpen: boolean;
    onClose: () => void;
    address: string;
    onSuccess: () => void;
}

const CRITERIA = [
    { id: "thermalScore", label: "Isolation Thermique", icon: Thermometer, desc: "Fait-il froid l'hiver / chaud l'été ?" },
    { id: "acousticScore", label: "Isolation Phonique", icon: Volume2, desc: "Entendez-vous les voisins ?" },
    { id: "humidityScore", label: "Humidité & Air", icon: Droplets, desc: "Traces de moisissures ?" },
    { id: "safetyScore", label: "Sécurité Quartier", icon: Shield, desc: "Vous sentez-vous en sécurité ?" },
    { id: "transportScore", label: "Transports", icon: Bus, desc: "Accès facile ?" },
    { id: "networkScore", label: "Internet / 4G", icon: Wifi, desc: "Télétravail possible ?" },
    { id: "responsivenessScore", label: "Propriétaire", icon: UserCheck, desc: "Réactif en cas de problème ?" },
];

export function ReviewForm({ isOpen, onClose, address, onSuccess }: ReviewFormProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    // const { toast } = useToast(); 

    const [formData, setFormData] = useState<any>({
        rating: 3,
        comment: "",
        pros: "",
        cons: "",
        // Detailed scores initialized to 3 (Average)
        thermalScore: 3,
        acousticScore: 3,
        humidityScore: 5,
        safetyScore: 3,
        transportScore: 3,
        networkScore: 4,
        responsivenessScore: 3,
        depositReturnScore: 3,
        commonAreasScore: 3,
    });

    const updateField = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await createPropertyReview({
                ...formData,
                address,
                latitude: 48.8566, // Mock coords for now, in real app populate from address selection
                longitude: 2.3522,
                isVerifiedTenant: true // Simulated passing from eligibility
            }, "current-user-id-mock"); // In action use session user

            if (res.success) {
                onSuccess();
                onClose();
            } else {
                alert("Erreur lors de l'envoi");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Noter ce logement</DialogTitle>
                    <DialogDescription className="truncate">{address}</DialogDescription>
                </DialogHeader>

                {step === 1 && (
                    <div className="space-y-6 py-4">
                        {/* Global Rating */}
                        <div className="flex flex-col items-center gap-2">
                            <Label className="text-lg font-semibold">Note Globale</Label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={32}
                                        className={`cursor-pointer transition-all hover:scale-110 ${star <= formData.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`}
                                        onClick={() => updateField("rating", star)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Votre Avis (Public)</Label>
                            <Textarea
                                placeholder="Racontez votre expérience..."
                                value={formData.comment}
                                onChange={(e) => updateField("comment", e.target.value)}
                                className="h-24"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-emerald-600">Points Forts (+)</Label>
                                <Input
                                    placeholder="Ex: Lumineux, Calme..."
                                    value={formData.pros}
                                    onChange={(e) => updateField("pros", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-red-600">Points Faibles (-)</Label>
                                <Input
                                    placeholder="Ex: Humidité, Bruit..."
                                    value={formData.cons}
                                    onChange={(e) => updateField("cons", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* RENT TRACKER INPUT */}
                        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg space-y-2 border border-zinc-200 dark:border-zinc-700">
                            <Label className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                                Loyer mensuel payé (CC)
                                <span className="text-xs font-normal text-zinc-500 bg-white dark:bg-zinc-900 px-2 py-1 rounded-full border border-zinc-200">Privé & Anonyme</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    placeholder="Ex: 850"
                                    className="pl-8 font-bold text-lg"
                                    value={formData.rentPaid || ""}
                                    onChange={(e) => updateField("rentPaid", e.target.value)}
                                />
                                <span className="absolute left-3 top-2.5 text-zinc-500 font-bold">€</span>
                            </div>
                            <p className="text-xs text-zinc-500">
                                Cette info permet de calculer l'inflation des prix du quartier.
                            </p>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 py-4">
                        <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4">
                            🎯 La vérité est dans les détails. Soyez précis pour aider les futurs locataires.
                        </div>

                        <div className="grid gap-6">
                            {CRITERIA.map((crit) => (
                                <div key={crit.id} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="flex items-center gap-2 font-medium">
                                            <crit.icon size={16} className="text-zinc-500" />
                                            {crit.label}
                                        </Label>
                                        <span className={`text-sm font-bold ${formData[crit.id] >= 4 ? "text-emerald-600" :
                                            formData[crit.id] <= 2 ? "text-red-500" : "text-amber-500"
                                            }`}>
                                            {formData[crit.id]}/5
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-400">{crit.desc}</p>
                                    <Slider
                                        value={[formData[crit.id]]}
                                        min={1}
                                        max={5}
                                        step={1}
                                        onValueChange={(val) => updateField(crit.id, val[0])}
                                        className="py-1"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <DialogFooter className="gap-2">
                    {step === 1 && (
                        <Button onClick={() => setStep(2)} className="w-full sm:w-auto">Continuer (Critères détaillés)</Button>
                    )}
                    {step === 2 && (
                        <>
                            <Button variant="outline" onClick={() => setStep(1)}>Retour</Button>
                            <Button onClick={handleSubmit} disabled={loading} className="bg-zinc-900 text-white">
                                {loading ? "Envoi..." : "Publier l'avis"}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

