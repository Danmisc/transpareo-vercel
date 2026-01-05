"use client";

import { Button } from "@/components/ui/button";
import { ListingFormData } from "../ListingCreationWizard";
import { Check, Loader2, MapPin } from "lucide-react";
import Image from "next/image";

interface StepProps {
    data: ListingFormData;
    onSubmit: () => void;
    isSubmitting: boolean;
}

export default function StepRecap({ data, onSubmit, isSubmitting }: StepProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Récapitulatif</h1>
                <p className="text-zinc-500">Vérifiez les informations avant de publier.</p>
            </div>

            {/* PREVIEW CARD */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl max-w-sm mx-auto">
                <div className="aspect-[4/3] bg-zinc-100 relative">
                    {data.images[0] ? (
                        <img src={data.images[0]} className="w-full h-full object-cover" alt="Cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">Pas d'image</div>
                    )}
                    <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                        {data.type === "RENT" ? "LOCATION" : "VENTE"}
                    </div>
                </div>
                <div className="p-5 space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg leading-tight">{data.title}</h3>
                            <p className="text-sm text-zinc-500 flex items-center gap-1 mt-1">
                                <MapPin size={12} /> {data.address.split(',')[0]}
                            </p>
                        </div>
                        <p className="text-xl font-bold text-emerald-600">
                            {data.price.toLocaleString()} €
                            {data.type === "RENT" && <span className="text-xs text-zinc-400 block font-normal text-right">/mois</span>}
                        </p>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-zinc-100">
                        <span className="text-xs bg-zinc-100 px-2 py-1 rounded">{data.surface} m²</span>
                        <span className="text-xs bg-zinc-100 px-2 py-1 rounded">{data.rooms} pièces</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <Button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="w-full h-14 text-lg bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-lg shadow-orange-500/20"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin mr-2" />
                            Publication en cours...
                        </>
                    ) : (
                        <>
                            <Check className="mr-2" />
                            Confirmer et Publier
                        </>
                    )}
                </Button>
                <p className="text-xs text-center text-zinc-400">
                    En publiant, vous acceptez nos conditions générales de vente et de diffusion.
                </p>
            </div>
        </div>
    );
}
