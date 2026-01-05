"use client";

import { useState } from "react";
import { Search, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface OmniSearchBoxProps {
    onSearch?: (query: string) => void;
}

export function OmniSearchBox({ onSearch }: OmniSearchBoxProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [query, setQuery] = useState("");

    const handleSearch = () => {
        if (onSearch) {
            onSearch(query);
            setIsExpanded(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className={cn(
            "absolute top-4 left-1/2 -translate-x-1/2 z-[400] transition-all duration-300 w-[90%] md:w-[60%] lg:w-[50%] max-w-xl",
        )}>
            <div className={cn(
                "bg-white dark:bg-zinc-900 rounded-full shadow-xl border border-zinc-200 dark:border-zinc-800 p-2 flex items-center gap-2 transition-all",
                isExpanded ? "rounded-2xl" : "rounded-full"
            )}>
                <div className="h-10 w-10 bg-emerald-500 rounded-full flex items-center justify-center shrink-0 text-white shadow-md">
                    <Search size={18} />
                </div>

                <Input
                    className="border-0 shadow-none focus-visible:ring-0 bg-transparent text-base h-10 px-2"
                    placeholder="Ville, quartier, métro..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsExpanded(true)}
                    onBlur={() => setTimeout(() => setIsExpanded(false), 200)}
                />

                {query && (
                    <button
                        onClick={() => { setQuery(""); onSearch?.(""); }}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400"
                    >
                        <X size={16} />
                    </button>
                )}

                <Button
                    onClick={handleSearch}
                    className="rounded-full px-6 font-semibold bg-zinc-900 text-white hover:bg-zinc-800 hidden sm:flex"
                >
                    Rechercher
                </Button>
            </div>

            {/* Suggestions Dropdown (Mock) */}
            {isExpanded && (
                <div className="mt-2 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2">
                        <p className="text-xs font-semibold text-zinc-500 px-3 py-2 uppercase tracking-wider">Lieux récents</p>
                        <div className="space-y-1">
                            {["Paris, France", "Lyon, France", "Marseille, France"].map((city) => (
                                <button
                                    key={city}
                                    onClick={() => { setQuery(city); onSearch?.(city); setIsExpanded(false); }}
                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-left text-sm transition-colors"
                                >
                                    <div className="h-8 w-8 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500">
                                        <MapPin size={14} />
                                    </div>
                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{city}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
