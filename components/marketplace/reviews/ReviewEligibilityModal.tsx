"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert, Upload, CheckCircle } from "lucide-react";

interface ReviewEligibilityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    address: string;
}

export function ReviewEligibilityModal({ isOpen, onClose, onSubmit, address }: ReviewEligibilityModalProps) {
    const [step, setStep] = useState(1);
    const [dates, setDates] = useState({ moveIn: "", moveOut: "" });
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = () => {
        // In a real app we'd upload the file first
        onSubmit({
            address,
            moveInDate: dates.moveIn,
            moveOutDate: dates.moveOut,
            documentUrl: "https://fake-url.com/proof.pdf"
        });
        setStep(3); // Show success/pending state
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldAlert className="text-amber-500" />
                        Vérification d'Éligibilité
                    </DialogTitle>
                    <DialogDescription>
                        Pour garantir la fiabilité, nous vérifions que vous avez bien habité ce logement.
                    </DialogDescription>
                </DialogHeader>

                {step === 1 && (
                    <div className="space-y-4 py-4">
                        <Alert variant="default" className="bg-blue-50 border-blue-200">
                            <AlertTitle className="text-blue-800">Critères Transpareo</AlertTitle>
                            <AlertDescription className="text-blue-700 text-xs list-disc pl-4 mt-2">
                                <li>Avoir habité au moins <b>6 mois</b>.</li>
                                <li>Avoir <b>quitté</b> le logement.</li>
                                <li>Fournir une <b>preuve</b> (Bail, Quittance).</li>
                            </AlertDescription>
                        </Alert>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date d'entrée</Label>
                                <Input type="date" onChange={(e) => setDates({ ...dates, moveIn: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Date de sortie</Label>
                                <Input type="date" onChange={(e) => setDates({ ...dates, moveOut: e.target.value })} />
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 py-4 text-center">
                        <div className="border-2 border-dashed border-zinc-200 rounded-xl p-8 flex flex-col items-center hover:bg-zinc-50 transition-colors cursor-pointer">
                            <Upload className="h-10 w-10 text-zinc-400 mb-2" />
                            <p className="text-sm font-medium">Déposer votre Attestation ou Bail</p>
                            <p className="text-xs text-zinc-400 mt-1">PDF, JPG (Max 5MB)</p>
                            <Input type="file" className="hidden" id="proof-upload" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                            <Button variant="outline" size="sm" className="mt-4" onClick={() => document.getElementById('proof-upload')?.click()}>
                                {file ? file.name : "Sélectionner un fichier"}
                            </Button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="py-8 flex flex-col items-center text-center">
                        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="font-bold text-lg">Demande reçue !</h3>
                        <p className="text-sm text-zinc-500 max-w-xs mt-2">
                            Notre équipe va vérifier votre document sous 24h. Vous recevrez une notification quand vous pourrez rédiger votre avis.
                        </p>
                    </div>
                )}

                <DialogFooter>
                    {step === 1 && (
                        <Button onClick={() => setStep(2)} disabled={!dates.moveIn || !dates.moveOut}>Suivant</Button>
                    )}
                    {step === 2 && (
                        <Button onClick={handleSubmit} disabled={!file}>Envoyer pour vérification</Button>
                    )}
                    {step === 3 && (
                        <Button onClick={onClose} variant="outline">Fermer</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
