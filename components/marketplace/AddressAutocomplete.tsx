"use client";

import * as React from "react";
import { Check, MapPin, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverAnchor,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export interface AddressSuggestion {
    label: string;
    score: number;
    id: string;
    type: string;
    name: string;
    postcode: string;
    citycode: string;
    city: string;
    context: string;
    importance: number;
    street: string;
    lat: number;
    lon: number;
}

interface AddressAutocompleteProps {
    onSelect: (address: string, context?: any) => void;
    defaultValue?: string;
    placeholder?: string;
}

export function AddressAutocomplete({ onSelect, defaultValue = "", placeholder = "Rechercher une adresse..." }: AddressAutocompleteProps) {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(defaultValue);
    const [suggestions, setSuggestions] = React.useState<AddressSuggestion[]>([]);
    const [loading, setLoading] = React.useState(false);

    // Debounce search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (inputValue && inputValue.length > 0) {
                fetchSuggestions(inputValue);
            } else {
                setSuggestions([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [inputValue]);

    const fetchSuggestions = async (query: string) => {
        setLoading(true);
        try {
            // Limit to 5 results to keep it clean
            const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`);
            if (response.ok) {
                const data = await response.json();
                setSuggestions(data.features.map((f: any) => ({
                    ...f.properties,
                    id: f.properties.id || Math.random().toString(),
                    lat: f.geometry.coordinates[1],
                    lon: f.geometry.coordinates[0]
                })));
            }
        } catch (error) {
            console.error("Error fetching addresses:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (suggestion: AddressSuggestion) => {
        setInputValue(suggestion.label);
        setOpen(false);
        onSelect(suggestion.label, suggestion);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverAnchor asChild>
                <div className="relative w-full max-w-md group cursor-text">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 bg-orange-500 rounded-full p-1.5 text-white shadow-sm transition-transform group-hover:scale-110 z-10">
                        <Search size={14} strokeWidth={2.5} />
                    </div>
                    <Input
                        value={inputValue}
                        onChange={(e) => {
                            const val = e.target.value;
                            setInputValue(val);
                            setOpen(val.length > 0);
                        }}
                        placeholder={placeholder}
                        className="h-12 pl-12 rounded-full border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow text-base w-full cursor-pointer"
                    />
                </div>
            </PopoverAnchor>
            <PopoverContent
                className="p-0 w-[400px] z-[1500] max-h-[300px] overflow-y-auto"
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <div className="p-1">
                    {loading && (
                        <div className="p-4 text-sm text-zinc-500 flex items-center gap-2">
                            <Loader2 className="animate-spin" size={16} /> Recherche en cours...
                        </div>
                    )}

                    {!loading && suggestions.length === 0 && inputValue.length > 0 && (
                        <div className="py-6 text-center text-sm text-zinc-500">
                            Aucune adresse trouvée.
                        </div>
                    )}

                    {suggestions.length > 0 && (
                        <div>
                            <div className="px-2 py-1.5 text-xs font-medium text-zinc-500">
                                Adresses suggérées
                            </div>
                            <ul className="space-y-1">
                                {suggestions.map((suggestion) => (
                                    <li
                                        key={suggestion.id}
                                        onMouseDown={(e) => {
                                            // Prevent focus loss on input
                                            e.preventDefault();
                                            handleSelect(suggestion);
                                        }}
                                        className="flex items-center gap-2 px-2 py-2 rounded-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                                    >
                                        <MapPin className="mr-2 h-4 w-4 text-zinc-400 shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                                                {suggestion.name}
                                            </span>
                                            <span className="text-xs text-zinc-500">
                                                {suggestion.postcode} {suggestion.city}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

