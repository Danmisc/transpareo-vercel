"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Check, SlidersHorizontal, ArrowRight, Euro, Ruler, BedDouble, LayoutGrid, Zap, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterDrawerProps {
    filters: any;
    onFilterChange: (filters: any) => void;
    trigger?: React.ReactNode;
}

export function FilterDrawer({ filters, onFilterChange, trigger }: FilterDrawerProps) {
    const [localFilters, setLocalFilters] = useState(filters);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLocalFilters(filters);
        }
    }, [isOpen, filters]);

    const handleApply = () => {
        onFilterChange(localFilters);
        setIsOpen(false);
    };

    const handleReset = () => {
        const resetFilters = {
            ...localFilters,
            minPrice: 0,
            maxPrice: 5000,
            minSurface: 0,
            maxSurface: 200,
            rooms: 0,
            bedrooms: 0,
            energyClass: null,
            pool: false,
            garden: false,
            balcony: false,
            terrace: false,
            parking: false,
            elevator: false,
            isFurnished: false,
        };
        setLocalFilters(resetFilters);
    };

    const updateFilter = (key: string, value: any) => {
        setLocalFilters((prev: any) => ({ ...prev, [key]: value }));
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="rounded-full gap-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 transition-colors">
                        <SlidersHorizontal size={14} />
                        <span className="font-medium">Tous les filtres</span>
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="w-full sm:w-[500px] overflow-hidden flex flex-col bg-white dark:bg-zinc-950 p-0 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl">

                {/* Header */}
                <SheetHeader className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-950 z-10">
                    <SheetTitle className="text-xl font-bold flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5 text-zinc-500" />
                        Filtres
                    </SheetTitle>
                    <SheetDescription className="hidden">Filtres avancés</SheetDescription>
                </SheetHeader>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">

                    {/* BUDGET */}
                    <section className="space-y-5 animate-in slide-in-from-right-4 duration-500 delay-100">
                        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 mb-2">
                            <div className="bg-zinc-100 p-2 rounded-lg"><Euro className="w-4 h-4" /></div>
                            <h3 className="font-bold text-base">Budget</h3>
                        </div>

                        <div className="px-2">
                            <Slider
                                defaultValue={[0, 5000]}
                                value={[localFilters.minPrice || 0, localFilters.maxPrice || 5000]}
                                max={5000}
                                step={50}
                                onValueChange={(val) => {
                                    updateFilter('minPrice', val[0]);
                                    updateFilter('maxPrice', val[1]);
                                }}
                                className="py-2"
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1 space-y-1">
                                <Label className="text-xs text-zinc-500 ml-1">Minimum</Label>
                                <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900 font-semibold text-center shadow-sm">
                                    {localFilters.minPrice || 0} €
                                </div>
                            </div>
                            <div className="flex-1 space-y-1">
                                <Label className="text-xs text-zinc-500 ml-1">Maximum</Label>
                                <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900 font-semibold text-center shadow-sm">
                                    {localFilters.maxPrice >= 5000 ? '5000+' : localFilters.maxPrice} €
                                </div>
                            </div>
                        </div>
                    </section>

                    <Separator />

                    {/* SURFACE */}
                    <section className="space-y-5 animate-in slide-in-from-right-4 duration-500 delay-200">
                        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 mb-2">
                            <div className="bg-zinc-100 p-2 rounded-lg"><Ruler className="w-4 h-4" /></div>
                            <h3 className="font-bold text-base">Surface</h3>
                        </div>

                        <div className="px-2">
                            <Slider
                                defaultValue={[0, 200]}
                                value={[localFilters.minSurface || 0, localFilters.maxSurface || 200]}
                                max={200}
                                step={5}
                                onValueChange={(val) => {
                                    updateFilter('minSurface', val[0]);
                                    updateFilter('maxSurface', val[1]);
                                }}
                                className="py-2"
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1 space-y-1">
                                <Label className="text-xs text-zinc-500 ml-1">Minimum</Label>
                                <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900 font-semibold text-center shadow-sm">
                                    {localFilters.minSurface || 0} m²
                                </div>
                            </div>
                            <div className="flex-1 space-y-1">
                                <Label className="text-xs text-zinc-500 ml-1">Maximum</Label>
                                <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900 font-semibold text-center shadow-sm">
                                    {localFilters.maxSurface >= 200 ? '200+' : localFilters.maxSurface} m²
                                </div>
                            </div>
                        </div>
                    </section>

                    <Separator />

                    {/* ROOMS */}
                    <section className="space-y-5 animate-in slide-in-from-right-4 duration-500 delay-300">
                        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 mb-2">
                            <div className="bg-zinc-100 p-2 rounded-lg"><LayoutGrid className="w-4 h-4" /></div>
                            <h3 className="font-bold text-base">Pièces</h3>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                            {[1, 2, 3, 4, 5].map(num => (
                                <button
                                    key={`rooms-${num}`}
                                    onClick={() => updateFilter('rooms', localFilters.rooms === num ? 0 : num)}
                                    className={cn(
                                        "flex-1 h-12 rounded-xl border transition-all font-semibold shadow-sm hover:shadow-md",
                                        localFilters.rooms === num
                                            ? "bg-zinc-900 text-white border-zinc-900 ring-2 ring-zinc-900 ring-offset-1"
                                            : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
                                    )}
                                >
                                    {num === 5 ? "5+" : num}
                                </button>
                            ))}
                        </div>
                    </section>

                    <Separator />

                    {/* DPE */}
                    <section className="space-y-5 animate-in slide-in-from-right-4 duration-500 delay-300">
                        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 mb-2">
                            <div className="bg-zinc-100 p-2 rounded-lg"><Zap className="w-4 h-4" /></div>
                            <h3 className="font-bold text-base">DPE (Diagnostic)</h3>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                            {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(grade => (
                                <button
                                    key={grade}
                                    onClick={() => updateFilter('energyClass', localFilters.energyClass === grade ? null : grade)}
                                    className={cn(
                                        "h-10 w-10 shrink-0 flex items-center justify-center rounded-lg border transition-all font-bold shadow-sm",
                                        localFilters.energyClass === grade
                                            ? "bg-emerald-500 text-white border-emerald-500 shadow-md scale-110"
                                            : "bg-white border-zinc-200 text-zinc-600 hover:border-emerald-200"
                                    )}
                                >
                                    {grade}
                                </button>
                            ))}
                        </div>
                    </section>

                    <Separator />

                    {/* FEATURES */}
                    <section className="space-y-5 animate-in slide-in-from-right-4 duration-500 delay-400">
                        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 mb-2">
                            <div className="bg-zinc-100 p-2 rounded-lg"><Home className="w-4 h-4" /></div>
                            <h3 className="font-bold text-base">Commodités</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { id: 'isFurnished', label: 'Meublé' },
                                { id: 'parking', label: 'Parking / Garage' },
                                { id: 'terrace', label: 'Terrasse' },
                                { id: 'balcony', label: 'Balcon' },
                                { id: 'garden', label: 'Jardin' },
                                { id: 'elevator', label: 'Ascenseur' },
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer group"
                                    onClick={() => updateFilter(item.id, !localFilters[item.id])}>
                                    <Label className="cursor-pointer font-medium group-hover:text-zinc-900 text-zinc-600">{item.label}</Label>
                                    <Switch
                                        checked={localFilters[item.id] || false}
                                        onCheckedChange={(checked) => updateFilter(item.id, checked)}
                                        className="data-[state=checked]:bg-zinc-900"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                </div>

                {/* Footer */}
                <SheetFooter className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md shrink-0 flex flex-row gap-4 items-center justify-between">
                    <Button variant="ghost" onClick={handleReset} className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl">
                        Tout effacer
                    </Button>
                    <Button onClick={handleApply} className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all h-12 text-base font-semibold group">
                        Voir les résultats
                        <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </SheetFooter>

            </SheetContent>
        </Sheet>
    );
}

