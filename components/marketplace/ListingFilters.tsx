"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ChevronDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ListingFiltersProps {
    filters: any;
    onFilterChange: (filters: any) => void;
}

export function ListingFilters({ filters, onFilterChange }: ListingFiltersProps) {
    // Helper to update a single filter
    const updateFilter = (key: string, value: any) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const activeFilterCount = Object.values(filters || {}).filter(v => v !== 0 && v !== false && v !== "" && v !== "RENT").length;

    return (

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">

            {/* Type Toggle - Micro Style */}
            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg mr-2 shrink-0 h-7 items-center">
                <button
                    onClick={() => updateFilter("type", "RENT")}
                    className={cn(
                        "px-2.5 h-6 rounded-md text-[10px] uppercase font-bold tracking-wide transition-all",
                        filters.type === "RENT"
                            ? "bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow-sm"
                            : "text-zinc-500 hover:text-zinc-900"
                    )}
                >
                    Louer
                </button>
                <button
                    onClick={() => updateFilter("type", "SALE")}
                    className={cn(
                        "px-2.5 h-6 rounded-md text-[10px] uppercase font-bold tracking-wide transition-all",
                        filters.type === "SALE"
                            ? "bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow-sm"
                            : "text-zinc-500 hover:text-zinc-900"
                    )}
                >
                    Acheter
                </button>
            </div>

            {/* Separator */}
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 shrink-0 mx-0.5" />

            {/* Price Filter */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn("h-7 px-2.5 rounded-full border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 shrink-0 text-xs transition-all", (filters.minPrice > 0 || filters.maxPrice < 3000) && "border-zinc-400 bg-zinc-50 font-medium")}
                    >
                        Prix
                        {(filters.minPrice > 0 || filters.maxPrice < 3000) && (
                            <span className="ml-1 text-[10px] font-normal text-zinc-500">
                                {filters.minPrice > 0 ? `${filters.minPrice / 1000}k` : ''}-
                                {filters.maxPrice < 3000 ? `${filters.maxPrice}` : ''}
                            </span>
                        )}
                        <ChevronDown size={12} className="ml-1 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-5 rounded-2xl shadow-xl border-zinc-100">
                    {/* ... Content same as before ... */}
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-1">Fourchette de prix</h4>
                            <p className="text-sm text-zinc-500">Prix mensuel pour {filters.type === 'RENT' ? 'louer' : 'acheter'}</p>
                        </div>
                        <div className="h-16 flex items-end gap-1 px-4 mb-4 opacity-50">
                            {[10, 30, 50, 70, 40, 60, 80, 50, 30, 20].map((h, i) => (
                                <div key={i} className="flex-1 bg-zinc-200 rounded-t-sm" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                        <Slider
                            defaultValue={[0, 3000]}
                            value={[filters.minPrice, filters.maxPrice]}
                            max={3000}
                            step={50}
                            className="py-4"
                            onValueChange={(val) => {
                                onFilterChange({ ...filters, minPrice: val[0], maxPrice: val[1] });
                            }}
                        />
                        <div className="flex items-center justify-between">
                            <div className="p-2 border rounded-lg min-w-[100px]">
                                <span className="text-xs text-zinc-500 block">Min</span>
                                <span className="font-medium">{filters.minPrice} €</span>
                            </div>
                            <div className="text-zinc-400">-</div>
                            <div className="p-2 border rounded-lg min-w-[100px]">
                                <span className="text-xs text-zinc-500 block">Max</span>
                                <span className="font-medium">{filters.maxPrice}+ €</span>
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Surface Filter */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn("h-7 px-2.5 rounded-full border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 shrink-0 text-xs transition-all", (filters.minSurface > 0 || filters.maxSurface < 150) && "border-zinc-400 bg-zinc-50 font-medium")}
                    >
                        Surface
                        {(filters.minSurface > 0 || filters.maxSurface < 150) && (
                            <span className="ml-1 text-[10px] font-normal text-zinc-500">{filters.minSurface}-{filters.maxSurface}</span>
                        )}
                        <ChevronDown size={12} className="ml-1 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-5 rounded-2xl shadow-xl border-zinc-100">
                    {/* ... Content same as before ... */}
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-1">Surface minimum</h4>
                        </div>
                        <Slider
                            defaultValue={[0, 150]}
                            value={[filters.minSurface, filters.maxSurface]}
                            max={150}
                            step={5}
                            onValueChange={(val) => {
                                onFilterChange({ ...filters, minSurface: val[0], maxSurface: val[1] });
                            }}
                        />
                        <div className="flex justify-between text-sm text-zinc-600 font-medium">
                            <span>{filters.minSurface} m²</span>
                            <span>{filters.maxSurface}+ m²</span>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Rooms Filter */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn("h-7 px-2.5 rounded-full border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 shrink-0 text-xs transition-all", filters.rooms > 0 && "border-zinc-400 bg-zinc-50 font-medium")}
                    >
                        Pièces {filters.rooms > 0 && <span className="ml-1 text-[10px] font-normal text-zinc-500">{filters.rooms}+</span>}
                        <ChevronDown size={12} className="ml-1 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-5 rounded-2xl shadow-xl border-zinc-100">
                    {/* ... Content same as before ... */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Nombre de pièces</h4>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {[0, 1, 2, 3, 4, 5].map(num => (
                                <button
                                    key={num}
                                    onClick={() => updateFilter("rooms", num)}
                                    className={cn(
                                        "h-10 w-10 flex items-center justify-center rounded-full border transition-all shrink-0",
                                        filters.rooms === num
                                            ? "bg-zinc-900 text-white border-zinc-900"
                                            : "border-zinc-200 hover:border-zinc-800 text-zinc-600"
                                    )}
                                >
                                    {num === 0 ? "Tout" : `${num}+`}
                                </button>
                            ))}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Quick Filters - Tiny */}
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 shrink-0 mx-0.5" />

            <Button
                variant={filters.balcony ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter("balcony", !filters.balcony)}
                className={cn("h-7 px-2.5 rounded-full border-zinc-200 bg-transparent hover:bg-zinc-50 text-zinc-600 shrink-0 text-xs", filters.balcony && "bg-zinc-100 border-zinc-900")}
            >
                Balcon
            </Button>
            <Button
                variant={filters.pool ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter("pool", !filters.pool)}
                className={cn("h-7 px-2.5 rounded-full border-zinc-200 bg-transparent hover:bg-zinc-50 text-zinc-600 shrink-0 text-xs", filters.pool && "bg-zinc-100 border-zinc-900")}
            >
                Piscine
            </Button>
        </div>
    );
}

