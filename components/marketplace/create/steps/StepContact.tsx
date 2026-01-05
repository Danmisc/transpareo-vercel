"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ListingFormData } from "../ListingCreationWizard";
import { User, Phone, Mail } from "lucide-react";

interface StepProps {
    data: ListingFormData;
    update: (data: Partial<ListingFormData>) => void;
    onNext: () => void;
}

export default function StepContact({ data, update, onNext }: StepProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Vos Coordonnées</h1>
                <p className="text-zinc-500">Comment les intéressés peuvent-ils vous contacter ?</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">

                {/* NAME */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <User size={16} /> Nom du contact
                    </Label>
                    <Input
                        value={data.contactName || ""}
                        onChange={(e) => update({ contactName: e.target.value })}
                        placeholder="Ex: Jean Dupont"
                        className="h-12 text-lg"
                    />
                </div>

                {/* EMAIL */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Mail size={16} /> Email
                    </Label>
                    <Input
                        value={data.contactEmail || ""}
                        onChange={(e) => update({ contactEmail: e.target.value })}
                        placeholder="Ex: jean.dupont@email.com"
                        className="h-12 text-lg"
                        type="email"
                    />
                </div>

                {/* PHONE */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Phone size={16} /> Téléphone (mobile recommandé)
                    </Label>
                    <Input
                        value={data.contactPhone || ""}
                        onChange={(e) => update({ contactPhone: e.target.value })}
                        placeholder="Ex: 06 12 34 56 78"
                        className="h-12 text-lg"
                        type="tel"
                    />
                    <p className="text-xs text-zinc-500">
                        Votre numéro sera affiché sur l'annonce pour faciliter les contacts.
                    </p>
                </div>

            </div>

            <Button
                onClick={onNext}
                disabled={!data.contactName || (!data.contactEmail && !data.contactPhone)}
                className="w-full h-12 text-lg bg-orange-600 hover:bg-orange-700 text-white rounded-xl"
            >
                Voir le récapitulatif
            </Button>
        </div>
    );
}
