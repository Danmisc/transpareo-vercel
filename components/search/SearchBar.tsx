"use client";

import { Search, Clock, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { getSearchHistoryAction, addToSearchHistoryAction } from "@/app/actions/search";
import { cn } from "@/lib/utils";

export function SearchBar() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [history, setHistory] = useState<any[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Fetch history on mount
        getSearchHistoryAction().then(setHistory);
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowHistory(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = async (e: React.FormEvent<HTMLFormElement> | React.FormEvent, searchQuery?: string) => {
        e.preventDefault();
        const finalQuery = searchQuery || query;

        if (finalQuery.trim()) {
            setShowHistory(false);
            router.push(`/search?q=${encodeURIComponent(finalQuery)}`);

            // Add to history and update local state optimistically
            addToSearchHistoryAction(finalQuery);
            setHistory(prev => {
                const filtered = prev.filter(h => h.query !== finalQuery);
                return [{ query: finalQuery, createdAt: new Date() }, ...filtered].slice(0, 5);
            });
        }
    };

    return (
        <div ref={containerRef} className="relative w-full max-w-sm">
            <form onSubmit={handleSearch} className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Rechercher..."
                    className="pl-9 w-full bg-muted/50 border-none focus-visible:ring-1"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setShowHistory(true)}
                />
            </form>

            {/* Recent Searches Dropdown */}
            {showHistory && history.length > 0 && !query && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wider">Récent</h4>
                    <ul className="space-y-1">
                        {history.map((item, idx) => (
                            <li key={idx}>
                                <button
                                    onClick={(e) => {
                                        setQuery(item.query);
                                        handleSearch(e, item.query);
                                    }}
                                    className="flex items-center w-full px-2 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors text-left"
                                >
                                    <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                                    <span className="flex-1 truncate">{item.query}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
