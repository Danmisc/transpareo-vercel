"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateProperty } from "@/lib/actions-owner";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Settings, Building } from "lucide-react";

interface PropertySettingsDialogProps {
    data: any;
    trigger?: React.ReactNode;
}

export function PropertySettingsDialog({ data, trigger }: PropertySettingsDialogProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Form State (Simplified without react-hook-form for speed/simplicity in this context)
    const [title, setTitle] = useState(data.title);
    const [surface, setSurface] = useState(data.surface?.toString() || "");
    const [acquisitionPrice, setAcquisitionPrice] = useState(data.acquisitionPrice?.toString() || "");
    const [fiscalMode, setFiscalMode] = useState(data.fiscalMode || "LMNP");
    const [type, setType] = useState(data.type || "APARTMENT");

    const handleSubmit = async () => {
        startTransition(async () => {
            const result = await updateProperty(data.id, {
                title,
                surface: parseFloat(surface),
                acquisitionPrice: parseFloat(acquisitionPrice),
                fiscalMode,
                type
            });

            if (result.success) {
                toast.success("Configuration mise à jour");
                setOpen(false);
                router.refresh();
            } else {
                toast.error("Erreur lors de la mise à jour");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline">Gérer</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" /> Configuration du Bien
                    </DialogTitle>
                    <DialogDescription>
                        Modifiez les informations essentielles et le régime fiscal pour affiner les calculs de rentabilité.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Nom du bien (Interne)</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Type de bien</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="APARTMENT">Appartement</SelectItem>
                                    <SelectItem value="HOUSE">Maison</SelectItem>
                                    <SelectItem value="PARKING">Parking / Box</SelectItem>
                                    <SelectItem value="COMMERCIAL">Local Commercial</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Surface (m²)</Label>
                            <Input itemType="number" value={surface} onChange={(e) => setSurface(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Prix d'Acquisition (€)</Label>
                        <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                            <Input
                                type="number"
                                className="pl-9"
                                value={acquisitionPrice}
                                onChange={(e) => setAcquisitionPrice(e.target.value)}
                                placeholder="Pour le calcul de rentabilité"
                            />
                        </div>
                        <p className="text-[10px] text-zinc-500">Incluez les frais de notaire pour une meilleure précision.</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Régime Fiscal</Label>
                        <Select value={fiscalMode} onValueChange={setFiscalMode}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="LMNP">LMNP (Micro-BIC / Réel)</SelectItem>
                                <SelectItem value="FONCIER">Revenus Fonciers (Nu)</SelectItem>
                                <SelectItem value="SCI_IS">SCI à l'IS</SelectItem>
                                <SelectItem value="SCI_IR">SCI à l'IR</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-[10px] text-zinc-500">Impacte les suggestions d'optimisation.</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
                    <Button onClick={handleSubmit} className="bg-zinc-900" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enregistrer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

