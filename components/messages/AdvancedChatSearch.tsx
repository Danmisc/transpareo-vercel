"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, Filter, User, Calendar, Link as LinkIcon, Image as ImageIcon, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AdvancedChatSearchProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (query: string) => void;
    initialQuery?: string;
}

export function AdvancedChatSearch({ isOpen, onClose, onSearch, initialQuery = "" }: AdvancedChatSearchProps) {
    const [query, setQuery] = useState(initialQuery);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [activeFilters, setActiveFilters] = useState<{ type: string, label: string, value: string }[]>([]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Real-time Search Debounce
    useEffect(() => {
        const timeout = setTimeout(() => {
            const filterPart = activeFilters.map(f => f.value).join(" "); // simplistic for now: filters are just appended keywords or specific formatted strings
            // If filter is "type:image", value is "contient:image" (as per backend expectation or text search)
            // Let's assume backend parses text for now, or we construct the string.
            // Our previous `handleSearch` just sends raw query.
            // So we combine:
            const fullQuery = `${query} ${activeFilters.map(f => f.value).join(" ")}`.trim();
            onSearch(fullQuery);
        }, 300);
        return () => clearTimeout(timeout);
    }, [query, activeFilters, onSearch]);

    const addFilter = (type: string, label: string, value: string) => {
        if (!activeFilters.find(f => f.type === type)) {
            setActiveFilters([...activeFilters, { type, label, value }]);
        }
        inputRef.current?.focus();
    };

    const removeFilter = (type: string) => {
        setActiveFilters(activeFilters.filter(f => f.type !== type));
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="absolute top-2 right-4 left-4 z-40"
        >
            <div className={`bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col transition-all ${isFocused ? 'ring-2 ring-orange-500/20' : ''}`}>
                <div className="flex items-center px-3 py-2.5">
                    <Search className="flex-shrink-0 h-4 w-4 text-zinc-400 mr-2" />

                    {/* Visual Pills Area */}
                    <div className="flex flex-wrap gap-1 items-center flex-1">
                        {activeFilters.map(filter => (
                            <div key={filter.type} className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full text-xs font-medium">
                                <span>{filter.label}</span>
                                <button onClick={() => removeFilter(filter.type)} className="hover:text-orange-900 dark:hover:text-orange-100">
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            // onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                            placeholder={activeFilters.length > 0 ? "" : "Rechercher..."}
                            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-zinc-400 min-w-[100px]"
                        />
                    </div>

                    {query && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 ml-1 text-zinc-400 hover:text-zinc-600" onClick={() => setQuery("")}>
                            <X size={14} />
                        </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-7 text-xs ml-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={onClose}>
                        Fermer
                    </Button>
                </div>

                {isFocused && (
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 block border-t border-zinc-100 dark:border-zinc-800 p-2">
                        <div className="text-[10px] uppercase font-bold text-zinc-400 mb-2 px-1 tracking-wider">Filtres suggérés</div>
                        <div className="flex flex-wrap gap-2">
                            <BadgeButton onClick={() => addFilter("image", "Image", "contient:image")} icon={<ImageIcon size={14} />} label="Images" active={!!activeFilters.find(f => f.type === 'image')} />
                            <BadgeButton onClick={() => addFilter("file", "Fichiers", "contient:fichier")} icon={<FileText size={14} />} label="Fichiers" active={!!activeFilters.find(f => f.type === 'file')} />
                            <BadgeButton onClick={() => addFilter("link", "Liens", "contient:lien")} icon={<LinkIcon size={14} />} label="Liens" active={!!activeFilters.find(f => f.type === 'link')} />
                            <BadgeButton onClick={() => addFilter("date", "Date", "date:")} icon={<Calendar size={14} />} label="Date" active={!!activeFilters.find(f => f.type === 'date')} />
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function BadgeButton({ onClick, icon, label, active }: { onClick: () => void, icon?: React.ReactNode, label: string, active?: boolean }) {
    if (active) return null;
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all shadow-sm"
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}
