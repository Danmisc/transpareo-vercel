"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Loader2 } from "lucide-react";
import { searchAddress } from "@/lib/actions/marketplace";
import { ListingFormData } from "../ListingCreationWizard";

interface StepProps {
    data: ListingFormData;
    update: (data: Partial<ListingFormData>) => void;
    onNext: () => void;
}

export default function StepLocation({ data, update, onNext }: StepProps) {
    const [query, setQuery] = useState(data.address);
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Debounced Search Effect
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (query.trim().length < 1) {
                setResults([]);
                return;
            }

            // Don't search if the query matches the already selected address (avoids re-triggering on selection)
            if (query === data.address) return;

            setIsSearching(true);
            try {
                const res = await searchAddress(query);
                setResults(res);
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setIsSearching(false);
            }
        }, 300); // 300ms delay

        return () => clearTimeout(timeoutId);
    }, [query, data.address]);

    const handleSelect = (addr: any) => {
        update({
            address: addr.display_name,
            latitude: parseFloat(addr.lat),
            longitude: parseFloat(addr.lon)
        });
        setQuery(addr.display_name);
        setResults([]);
        setTimeout(onNext, 200);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Où se situe votre bien ?</h1>
                <p className="text-zinc-500">Saisissez l'adresse exacte pour une géolocalisation précise (France uniquement).</p>
            </div>

            <div className="relative max-w-lg mx-auto">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ex: 15 rue de Rivoli, Paris..."
                        className="pl-12 h-14 text-lg rounded-2xl shadow-sm border-zinc-200 focus:ring-emerald-500"
                        autoFocus
                    />
                    {isSearching && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Loader2 className="animate-spin text-emerald-500" />
                        </div>
                    )}
                </div>

                {/* Results Dropdown */}
                {query.length > 0 && query !== data.address && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden z-20 max-h-60 overflow-y-auto">
                        {results.length > 0 ? (
                            results.map((addr) => (
                                <button
                                    key={addr.place_id}
                                    onClick={() => handleSelect(addr)}
                                    className="w-full text-left px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-start gap-3 border-b border-zinc-50 last:border-0"
                                >
                                    <div className="mt-1 bg-zinc-100 p-1.5 rounded-full">
                                        <MapPin size={16} className="text-zinc-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{addr.display_name.split(',')[0]}</p>
                                        <p className="text-xs text-zinc-500 truncate max-w-[300px]">{addr.display_name}</p>
                                    </div>
                                </button>
                            ))
                        ) : (
                            !isSearching && (
                                <div className="p-4 text-center text-zinc-500 text-sm">
                                    <p>Continuez à saisir votre adresse...</p>
                                    <p className="text-xs opacity-70 mt-1">Ajoutez le nom de la rue et la ville.</p>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>

            {data.address && data.latitude !== 0 && (
                <div className="max-w-lg mx-auto bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 flex items-center gap-4 border border-emerald-100 text-emerald-800">
                    <MapPin className="shrink-0" />
                    <div>
                        <p className="font-bold">Adresse validée</p>
                        <p className="text-sm opacity-80">{data.address}</p>
                    </div>
                    <Button size="sm" onClick={onNext} className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
                        Continuer
                    </Button>
                </div>
            )}
        </div>
    );
}
