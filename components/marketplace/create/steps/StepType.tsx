"use client";

import { Home, Building2, Warehouse, Car, Key, Euro } from "lucide-react";
import { cn } from "@/lib/utils";
import { ListingFormData } from "../ListingCreationWizard";

interface StepProps {
    data: ListingFormData;
    update: (data: Partial<ListingFormData>) => void;
    onNext: () => void;
}

export default function StepType({ data, update, onNext }: StepProps) {

    // Auto advance if both selections are made? Or just rely on user clicking next? 
    // Usually auto-advance on the last mandatory choice of the step is smoother.
    const handleTypeSelect = (type: "RENT" | "SALE") => {
        update({ type });
    };

    const handlePropertySelect = (propertyType: ListingFormData["propertyType"]) => {
        update({ propertyType });
        // Delay slightly to show selection then move next
        setTimeout(onNext, 300);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Commençons par l'essentiel</h1>
                <p className="text-zinc-500">Quel type d'annonce souhaitez-vous publier ?</p>
            </div>

            {/* TRANSACTION TYPE */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => handleTypeSelect("RENT")}
                    className={cn(
                        "p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-3 hover:scale-[1.02]",
                        data.type === "RENT"
                            ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-700"
                            : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-200"
                    )}
                >
                    <Key size={32} className={data.type === "RENT" ? "text-emerald-600" : "text-zinc-400"} />
                    <span className="font-bold text-lg">Location</span>
                </button>
                <button
                    onClick={() => handleTypeSelect("SALE")}
                    className={cn(
                        "p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-3 hover:scale-[1.02]",
                        data.type === "SALE"
                            ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-700"
                            : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-200"
                    )}
                >
                    <Euro size={32} className={data.type === "SALE" ? "text-emerald-600" : "text-zinc-400"} />
                    <span className="font-bold text-lg">Vente</span>
                </button>
            </div>

            {/* PROPERTY TYPE */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Type de bien</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { id: "APARTMENT", label: "Appartement", icon: Building2 },
                        { id: "HOUSE", label: "Maison", icon: Home },
                        { id: "STUDIO", label: "Studio", icon: Building2 }, // Using Building2 as placeholder
                        { id: "ROOM", label: "Chambre", icon: Key },
                        { id: "PARKING", label: "Parking", icon: Car },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handlePropertySelect(item.id as any)}
                            className={cn(
                                "p-4 rounded-xl border text-left transition-all hover:border-emerald-500 flex items-center gap-3",
                                data.propertyType === item.id
                                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-500"
                                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-lg",
                                data.propertyType === item.id ? "bg-emerald-200 dark:bg-emerald-800" : "bg-zinc-100 dark:bg-zinc-800"
                            )}>
                                <item.icon size={20} className={data.propertyType === item.id ? "text-emerald-700" : "text-zinc-500"} />
                            </div>
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

