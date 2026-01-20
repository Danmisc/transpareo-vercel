"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command as CommandPrimitive } from "cmdk";
import { Search, Clock, User, Building, GraduationCap, X, History, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchHistoryService, RecentSearchItem, RecentProfileItem } from "./SearchHistoryService";

// Custom Hook if not present
function useClickOutside(ref: any, handler: any) {
    React.useEffect(() => {
        const listener = (event: any) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
        };
        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);
        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler]);
}

export function GlobalSearch() {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [suggestions, setSuggestions] = React.useState<any[]>([]);
    const [recentSearches, setRecentSearches] = React.useState<RecentSearchItem[]>([]);
    const [recentViews, setRecentViews] = React.useState<RecentProfileItem[]>([]);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Close on click outside
    useClickOutside(containerRef, () => setOpen(false));

    // Load history on mount/focus
    const loadHistory = React.useCallback(() => {
        setRecentSearches(SearchHistoryService.getRecentSearches());
        setRecentViews(SearchHistoryService.getRecentViews());
    }, []);

    React.useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    // Fetch Suggestions or Show History
    React.useEffect(() => {
        if (query.length === 0) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            try {
                const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                if (Array.isArray(data)) setSuggestions(data);
            } catch (e) {
                console.error(e);
            }
        };
        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [query]);

    // Shortcuts
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runSearch = (term: string) => {
        if (!term.trim()) return;
        SearchHistoryService.addRecentSearch(term);
        loadHistory(); // Refresh local state
        router.push(`/search?q=${encodeURIComponent(term)}`);
        setOpen(false);
    };

    const handleFocus = () => {
        loadHistory();
        setOpen(true);
    };

    const showHistory = query.length === 0 && (recentSearches.length > 0 || recentViews.length > 0);
    const showSuggestions = query.length > 0;

    return (
        <div className="relative w-full max-w-md" ref={containerRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                    ref={inputRef}
                    className="h-10 w-full rounded-md border border-input bg-zinc-100 dark:bg-zinc-800 px-3 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-ring transition-colors"
                    placeholder="Rechercher..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={handleFocus}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") runSearch(query);
                    }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {query && (
                        <button onClick={() => { setQuery(""); inputRef.current?.focus(); }}>
                            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </button>
                    )}
                    {!query && (
                        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex text-muted-foreground">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    )}
                </div>
            </div>

            {open && (showHistory || showSuggestions) && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border bg-popover text-popover-foreground shadow-xl animate-in fade-in zoom-in-95 z-50 overflow-hidden">
                    <CommandPrimitive className="w-full">
                        <CommandPrimitive.List className="max-h-[80vh] overflow-y-auto p-1 py-2">

                            {/* --- HISTORY VIEW (Empty Query) --- */}
                            {showHistory && (
                                <div className="space-y-4 px-2">
                                    {/* 1. Recent Views (Avatars) */}
                                    {recentViews.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-semibold text-muted-foreground mb-3 px-2">Consultés récemment</h4>
                                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide px-2">
                                                {recentViews.map(user => (
                                                    <div key={user.id}
                                                        className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer group"
                                                        onClick={() => {
                                                            router.push(`/profile/${user.id}`);
                                                            setOpen(false);
                                                        }}
                                                    >
                                                        <Avatar className="h-12 w-12 border-2 border-transparent group-hover:border-primary transition-all">
                                                            <AvatarImage src={user.avatar} />
                                                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-[10px] font-medium text-center leading-tight truncate w-full group-hover:text-primary transition-colors">
                                                            {user.name.split(' ')[0]}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 2. Recent Search Terms (List) */}
                                    {recentSearches.length > 0 && (
                                        <div>
                                            <div className="flex justify-between items-center px-2 mb-1">
                                                <h4 className="text-xs font-semibold text-muted-foreground">Recherches récentes</h4>
                                                <button onClick={() => { SearchHistoryService.clearAll(); loadHistory(); }} className="text-[10px] text-muted-foreground hover:text-red-500">
                                                    Effacer
                                                </button>
                                            </div>
                                            {recentSearches.map(item => (
                                                <CommandPrimitive.Item
                                                    key={item.id}
                                                    onSelect={() => runSearch(item.term)}
                                                    className="flex items-center justify-between gap-2 rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">{item.term}</span>
                                                    </div>
                                                    <Button
                                                        variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                                        onClick={(e: React.MouseEvent) => {
                                                            e.stopPropagation();
                                                            SearchHistoryService.removeSearch(item.id);
                                                            loadHistory(); // Force re-render
                                                        }}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </CommandPrimitive.Item>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}


                            {/* --- SUGGESTIONS VIEW (Typing) --- */}
                            {showSuggestions && (
                                <>
                                    {suggestions.length === 0 && (
                                        <div className="py-6 text-center text-sm text-muted-foreground">
                                            Aucun résultat. Appuyez sur Entrée pour chercher.
                                        </div>
                                    )}

                                    <CommandPrimitive.Item
                                        onSelect={() => runSearch(query)}
                                        className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer text-primary font-medium mb-2 border-b"
                                    >
                                        <Search className="mr-2 h-4 w-4" />
                                        Voir tous les résultats pour "{query}"
                                    </CommandPrimitive.Item>

                                    {suggestions.length > 0 && (
                                        <div>
                                            <h4 className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Suggestions</h4>
                                            {suggestions.map((item: any) => (
                                                <CommandPrimitive.Item
                                                    key={item.id}
                                                    onSelect={() => {
                                                        if (item.type === "USER") {
                                                            // Could track view here too if we want
                                                            SearchHistoryService.addRecentView({ id: item.id, name: item.name, avatar: item.avatar, role: item.role });
                                                            router.push(`/profile/${item.id}`);
                                                        }
                                                        else runSearch(item.name);
                                                        setOpen(false);
                                                    }}
                                                    className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer"
                                                >
                                                    {item.avatar ? (
                                                        <Avatar className="h-8 w-8"><AvatarImage src={item.avatar} /><AvatarFallback>{item.name[0]}</AvatarFallback></Avatar>
                                                    ) : (
                                                        <div className="h-8 w-8 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                                            {item.type === "COMPANY" ? <Building className="h-4 w-4 text-zinc-500" /> :
                                                                item.type === "SCHOOL" ? <GraduationCap className="h-4 w-4 text-zinc-500" /> :
                                                                    <User className="h-4 w-4 text-zinc-500" />}
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{item.name}</span>
                                                        <span className="text-xs text-muted-foreground capitalize">
                                                            {item.headline || item.role || item.type?.toLowerCase()}
                                                        </span>
                                                    </div>
                                                </CommandPrimitive.Item>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </CommandPrimitive.List>
                    </CommandPrimitive>
                </div>
            )}
        </div>
    );
}

