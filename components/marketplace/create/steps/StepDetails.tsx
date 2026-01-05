"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ListingFormData } from "../ListingCreationWizard";
import { Minus, Plus, Wifi, Sun, Wind, Box, Mountain, Train, Sofa, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface StepProps {
    data: ListingFormData;
    update: (data: Partial<ListingFormData>) => void;
    onNext: () => void;
}

const AMENITIES_LIST = [
    { id: "wifi", label: "Fibre Optique", icon: Wifi },
    { id: "balcony", label: "Balcon / Terrasse", icon: Sun },
    { id: "parking", label: "Parking", icon: CarIcon },
    { id: "elevator", label: "Ascenseur", icon: Box },
    { id: "view", label: "Vue Dégagée", icon: Mountain },
    { id: "transport", label: "Proche transports", icon: Train },
    { id: "ac", label: "Climatisation", icon: Wind },
];

function CarIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" /></svg> }


export default function StepDetails({ data, update, onNext }: StepProps) {

    const handleIncrement = (field: keyof ListingFormData) => {
        update({ [field]: (data[field] as number) + 1 });
    };

    const handleDecrement = (field: keyof ListingFormData) => {
        const current = data[field] as number;
        if (current > 0) update({ [field]: current - 1 });
    };

    const toggleAmenity = (id: string) => {
        const current = data.amenities || [];
        if (current.includes(id)) {
            update({ amenities: current.filter(a => a !== id) });
        } else {
            update({ amenities: [...current, id] });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Détails du bien</h1>
                <p className="text-zinc-500">Précisez les caractéristiques principales.</p>
            </div>

            {/* MEUBLÉ TOGGLE */}
            {data.type === 'RENT' && (
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                            <Sofa size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold">Meublé</span>
                            <span className="text-xs text-zinc-500">Le logement est-il loué meublé ?</span>
                        </div>
                    </div>
                    <Switch
                        checked={data.isFurnished}
                        onCheckedChange={(checked) => update({ isFurnished: checked })}
                    />
                </div>
            )}

            {/* SURFACE & FLOORS */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <Label className="text-xs text-zinc-500 mb-1 block">Surface (m²)</Label>
                    <Input
                        type="number"
                        value={data.surface || ""}
                        onChange={(e) => update({ surface: parseFloat(e.target.value) })}
                        className="text-lg font-bold border-0 p-0 h-auto focus-visible:ring-0"
                        placeholder="0"
                    />
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <Label className="text-xs text-zinc-500 mb-1 block">Étage</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            value={data.floor || ""}
                            onChange={(e) => update({ floor: parseInt(e.target.value) })}
                            className="text-lg font-bold border-0 p-0 h-auto focus-visible:ring-0 w-16"
                            placeholder="0"
                        />
                        <span className="text-zinc-400">/</span>
                        <Input
                            type="number"
                            value={data.totalFloors || ""}
                            onChange={(e) => update({ totalFloors: parseInt(e.target.value) })}
                            className="text-lg font-bold border-0 p-0 h-auto focus-visible:ring-0 w-16"
                            placeholder="Total"
                        />
                    </div>
                </div>
            </div>

            {/* COUNTERS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CounterControl label="Pièces" value={data.rooms} onInc={() => handleIncrement("rooms")} onDec={() => handleDecrement("rooms")} />
                <CounterControl label="Chambres" value={data.bedrooms} onInc={() => handleIncrement("bedrooms")} onDec={() => handleDecrement("bedrooms")} />
            </div>

            {/* HEATING */}
            <div className="space-y-3">
                <Label>Type de chauffage</Label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => update({ heatingType: "INDIVIDUAL" })}
                        className={cn(
                            "p-3 rounded-xl border flex items-center justify-center gap-2 transition-all",
                            data.heatingType === "INDIVIDUAL"
                                ? "border-orange-500 bg-orange-50 text-orange-700 font-medium"
                                : "border-zinc-200 hover:bg-zinc-50"
                        )}
                    >
                        <Flame size={16} /> Individuel
                    </button>
                    <button
                        onClick={() => update({ heatingType: "COLLECTIVE" })}
                        className={cn(
                            "p-3 rounded-xl border flex items-center justify-center gap-2 transition-all",
                            data.heatingType === "COLLECTIVE"
                                ? "border-orange-500 bg-orange-50 text-orange-700 font-medium"
                                : "border-zinc-200 hover:bg-zinc-50"
                        )}
                    >
                        <BuildingIcon size={16} /> Collectif
                    </button>
                </div>
            </div>

            {/* AMENITIES */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Les plus du bien</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {AMENITIES_LIST.map((item) => {
                        const isSelected = data.amenities.includes(item.id);
                        return (
                            <button
                                key={item.id}
                                onClick={() => toggleAmenity(item.id)}
                                className={cn(
                                    "p-3 rounded-xl border flex flex-col items-center gap-2 transition-all duration-200",
                                    isSelected
                                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500"
                                        : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                                )}
                            >
                                <item.icon size={20} />
                                <span className="text-xs font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <Button onClick={onNext} disabled={!data.surface || data.rooms < 1} className="w-full h-12 text-lg bg-orange-600 hover:bg-orange-700 text-white rounded-xl">
                Suivant
            </Button>
        </div>
    );
}

function CounterControl({ label, value, onInc, onDec }: { label: string, value: number, onInc: () => void, onDec: () => void }) {
    return (
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="font-medium">{label}</span>
            <div className="flex items-center gap-4">
                <button onClick={onDec} className="w-8 h-8 rounded-full border border-zinc-300 flex items-center justify-center hover:bg-zinc-100">
                    <Minus size={14} />
                </button>
                <span className="font-bold w-4 text-center">{value}</span>
                <button onClick={onInc} className="w-8 h-8 rounded-full border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:opacity-80">
                    <Plus size={14} />
                </button>
            </div>
        </div>
    );
}

function BuildingIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
            <path d="M9 22v-4h6v4" />
            <path d="M8 6h.01" />
            <path d="M16 6h.01" />
            <path d="M12 6h.01" />
            <path d="M12 10h.01" />
            <path d="M12 14h.01" />
            <path d="M16 10h.01" />
            <path d="M16 14h.01" />
            <path d="M8 10h.01" />
            <path d="M8 14h.01" />
        </svg>
    )
}
