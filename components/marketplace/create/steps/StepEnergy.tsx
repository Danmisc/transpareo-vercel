"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ListingFormData } from "../ListingCreationWizard";
import { cn } from "@/lib/utils";
import { Zap, Leaf } from "lucide-react";

interface StepProps {
    data: ListingFormData;
    update: (data: Partial<ListingFormData>) => void;
    onNext: () => void;
}

const DPE_CLASSES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

export default function StepEnergy({ data, update, onNext }: StepProps) {

    // Auto calculate DPE Class based on value (approximate standard values)
    const handleDpeChange = (val: number) => {
        let cls = "G";
        if (val <= 70) cls = "A";
        else if (val <= 110) cls = "B";
        else if (val <= 180) cls = "C";
        else if (val <= 250) cls = "D";
        else if (val <= 330) cls = "E";
        else if (val <= 420) cls = "F";

        update({ dpeValue: val, energyClass: cls });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Performance Énergétique</h1>
                <p className="text-zinc-500">Obligatoire pour toutes les annonces depuis 2011.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* DPE */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-600">
                        <Zap size={24} />
                        <h3 className="font-bold text-lg">DPE (Conso. Énergie)</h3>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                        <Label className="mb-2 block">Valeur (kWh/m²/an)</Label>
                        <Input
                            type="number"
                            value={data.dpeValue || ""}
                            onChange={(e) => handleDpeChange(parseInt(e.target.value))}
                            placeholder="Ex: 150"
                            className="bg-white dark:bg-zinc-800 mb-6"
                        />

                        <div className="flex flex-col gap-1">
                            {DPE_CLASSES.map(cls => (
                                <button
                                    key={cls}
                                    onClick={() => update({ energyClass: cls })}
                                    className={cn(
                                        "w-full text-left px-3 py-1 rounded text-white text-xs font-bold transition-transform hover:scale-105 flex justify-between items-center",
                                        getDpeColor(cls),
                                        data.energyClass === cls ? "ring-2 ring-black dark:ring-white scale-105 z-10 shadow-lg" : "opacity-40 hover:opacity-100"
                                    )}
                                    style={{ width: `${100 - (DPE_CLASSES.indexOf(cls) * 5)}%` }}
                                >
                                    <span>{cls}</span>
                                    {data.energyClass === cls && <span>{data.dpeValue} kWh</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* GES */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-purple-600">
                        <Leaf size={24} />
                        <h3 className="font-bold text-lg">GES (Émissions CO²)</h3>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                        <Label className="mb-2 block">Valeur (kgCO²/m²/an)</Label>
                        <Input
                            type="number"
                            value={data.gesValue || ""}
                            onChange={(e) => update({ gesValue: parseInt(e.target.value) })}
                            placeholder="Ex: 30"
                            className="bg-white dark:bg-zinc-800"
                        />
                        <p className="text-sm text-zinc-500 mt-4">
                            L'indice GES est calculé en fonction des émissions de gaz à effet de serre. Une faible valeur est préférable pour l'environnement.
                        </p>
                    </div>
                </div>
            </div>

            <Button onClick={onNext} className="w-full h-12 text-lg bg-orange-600 hover:bg-orange-700 text-white rounded-xl">
                Suivant
            </Button>
        </div>
    );
}

function getDpeColor(cls: string) {
    switch (cls) {
        case 'A': return "bg-emerald-500";
        case 'B': return "bg-emerald-400";
        case 'C': return "bg-lime-400 text-black";
        case 'D': return "bg-yellow-400 text-black";
        case 'E': return "bg-orange-400";
        case 'F': return "bg-orange-600";
        case 'G': return "bg-red-600";
        default: return "bg-zinc-300";
    }
}

