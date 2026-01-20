"use client";

import { useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, ChevronDown, Search, MapPin, List, Map as MapIcon, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CreateListingDialog } from "./CreateListingDialog";
import { FilterDrawer } from "./FilterDrawer";
import { ListingFilters } from "./ListingFilters";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface StickyFilterHeaderProps {
    listingCount: number;
    filters: any;
    onFilterChange: (filters: any) => void;
    onRefresh: () => void;
    viewMode: 'listings' | 'reviews';
    setViewMode: (mode: 'listings' | 'reviews') => void;
    onSearch: (query: string) => void;
    onLocationSelect?: (location: any) => void;
}

export function StickyFilterHeader({
    listingCount,
    filters,
    onFilterChange,
    onRefresh,
    viewMode,
    setViewMode,

    onSearch,
    onLocationSelect
}: StickyFilterHeaderProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onSearch(searchQuery);
        }
    };

    return (
        <div className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 transition-all duration-300 shadow-sm">
            <div className="px-4 py-4 space-y-4">

                {/* Top Row: Search Pill & Tabs */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                    {/* Search Bar (Address Autocomplete - France only) */}
                    <div className="flex-1 max-w-md">
                        <AddressAutocomplete
                            defaultValue={searchQuery}
                            onSelect={(val, context) => {
                                setSearchQuery(val);
                                onSearch(val);
                                onLocationSelect?.(context);
                            }}
                            placeholder={viewMode === 'listings' ? "Ville, code postal, adresse..." : "Rechercher un avis..."}
                        />
                    </div>

                    {/* View Mode Tabs */}
                    <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 self-start md:self-center">
                        <button
                            onClick={() => setViewMode('listings')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300",
                                viewMode === 'listings' ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                            )}
                        >
                            <MapIcon size={16} />
                            <span>Explorer</span>
                        </button>
                        <button
                            onClick={() => setViewMode('reviews')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300",
                                viewMode === 'reviews' ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                            )}
                        >
                            <Star size={16} className={viewMode === 'reviews' ? "text-amber-500 fill-amber-500" : ""} />
                            <span>Avis Vérifiés</span>
                        </button>
                    </div>

                </div>

                {/* Bottom Section (3-Row Stack) */}
                {viewMode === 'listings' && (
                    <div className="space-y-3 animate-in slide-in-from-top-2 fade-in duration-300">

                        {/* 1. Controls Row: Filter Drawer | Count || Sort | Publish */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FilterDrawer
                                    filters={filters}
                                    onFilterChange={onFilterChange}
                                />
                                <span className="text-zinc-500 text-xs font-medium whitespace-nowrap hidden sm:inline-block">
                                    {listingCount} résultats
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Sort - Visible on mobile too now if we have space, otherwise hidden on very small */}
                                <div className="hidden sm:block">
                                    <Select
                                        value={filters.sort || "date_desc"}
                                        onValueChange={(val) => onFilterChange({ ...filters, sort: val })}
                                    >
                                        <SelectTrigger className="w-[130px] h-9 rounded-full border-none bg-zinc-100 dark:bg-zinc-800 text-xs font-medium shadow-none">
                                            <SelectValue placeholder="Trier par" />
                                        </SelectTrigger>
                                        <SelectContent align="end">
                                            <SelectItem value="date_desc">Nouveautés</SelectItem>
                                            <SelectItem value="price_asc">Prix croissant</SelectItem>
                                            <SelectItem value="price_desc">Prix décroissant</SelectItem>
                                            <SelectItem value="surface_desc">Surface (Grand)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <CreateListingDialog onSuccess={onRefresh} />
                            </div>
                        </div>

                        {/* 2. Filters Row (Wrapped, No Scroll) */}
                        <div className="pb-2">
                            <ListingFilters filters={filters} onFilterChange={onFilterChange} />
                        </div>
                    </div>
                )}

                {/* Reviews View Controls */}

            </div>
        </div>
    );
}

