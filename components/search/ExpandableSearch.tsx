"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock, User, Building, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchHistoryService, RecentSearchItem, RecentProfileItem } from "./SearchHistoryService";
import { motion, AnimatePresence } from "framer-motion";

export function ExpandableSearch() {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [suggestions, setSuggestions] = React.useState<any[]>([]);
    const [recentSearches, setRecentSearches] = React.useState<RecentSearchItem[]>([]);
    const [recentViews, setRecentViews] = React.useState<RecentProfileItem[]>([]);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Close on click outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Load history
    const loadHistory = React.useCallback(() => {
        setRecentSearches(SearchHistoryService.getRecentSearches());
        setRecentViews(SearchHistoryService.getRecentViews());
    }, []);

    React.useEffect(() => {
        if (open) loadHistory();
    }, [open, loadHistory]);

    // Fetch Suggestions
    React.useEffect(() => {
        if (query.length === 0) {
            setSuggestions([]);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                if (Array.isArray(data)) setSuggestions(data);
            } catch (e) { console.error(e); }
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const runSearch = (term: string) => {
        if (!term.trim()) return;
        SearchHistoryService.addRecentSearch(term);
        router.push(`/search?q=${encodeURIComponent(term)}`);
        setOpen(false);
    };

    return (
        <div ref={containerRef} className={cn("relative transition-all duration-300 ease-in-out z-50", open ? "w-[450px]" : "w-[250px]")}>
            <div className={cn(
                "relative flex items-center h-10 rounded-full transition-all duration-300",
                open ? "bg-white dark:bg-zinc-900 shadow-xl ring-2 ring-primary/10" : "bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            )}>
                <Search className="absolute left-3.5 h-4 w-4 text-zinc-500" />
                <input
                    ref={inputRef}
                    className="w-full h-full bg-transparent border-none outline-none px-10 text-sm placeholder:text-zinc-500"
                    placeholder="Rechercher..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setOpen(true)}
                    onKeyDown={(e) => e.key === "Enter" && runSearch(query)}
                />
                {query && (
                    <button
                        onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                        className="absolute right-3 p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    >
                        <X className="h-3 w-3 text-zinc-500" />
                    </button>
                )}
            </div>

            {/* DROPDOWN RESULTS */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-12 left-0 right-0 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden z-50 p-2"
                    >
                        {/* History Views */}
                        {!query && recentViews.length > 0 && (
                            <div className="mb-4">
                                <div className="text-xs font-semibold text-zinc-400 px-3 py-2">Consultés récemment</div>
                                <div className="flex gap-2 overflow-x-auto pb-2 px-2 scrollbar-hide">
                                    {recentViews.map(item => (
                                        <div key={item.id} onClick={() => router.push(`/profile/${item.id}`)} className="flex flex-col items-center gap-1 cursor-pointer min-w-[60px]">
                                            <Avatar className="h-10 w-10 border shadow-sm">
                                                <AvatarImage src={item.avatar} />
                                                <AvatarFallback>{item.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-[10px] text-center truncate w-full">{item.name.split(' ')[0]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Suggestions List */}
                        <div className="max-h-[300px] overflow-y-auto">
                            {suggestions.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        if (item.type === "USER") router.push(`/profile/${item.id}`);
                                        else runSearch(item.name);
                                        setOpen(false);
                                    }}
                                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
                                >
                                    {item.avatar ? (
                                        <Avatar className="h-8 w-8"><AvatarImage src={item.avatar} /><AvatarFallback>{item.name[0]}</AvatarFallback></Avatar>
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                                            <Search className="h-4 w-4 text-zinc-400" />
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-zinc-900 dark:text-white">{item.name}</span>
                                        <span className="text-xs text-zinc-500 capitalize">{item.type?.toLowerCase()}</span>
                                    </div>
                                </div>
                            ))}

                            {!query && recentSearches.length > 0 && recentSearches.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => runSearch(item.term)}
                                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors group"
                                >
                                    <Clock className="h-4 w-4 text-zinc-400" />
                                    <span className="text-sm text-zinc-600 dark:text-zinc-300 flex-1">{item.term}</span>
                                    <button onClick={(e) => { e.stopPropagation(); SearchHistoryService.removeSearch(item.id); loadHistory(); }} className="opacity-0 group-hover:opacity-100">
                                        <X className="h-3 w-3 text-zinc-400 hover:text-red-500" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

