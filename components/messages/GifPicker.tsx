"use client";

import { useState, useRef, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, TrendingUp, Smile, Frown, ThumbsUp, Heart, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Mock Data ---
const CATEGORIES = [
    { id: "trending", label: "Tendances", icon: TrendingUp },
    { id: "happy", label: "Joie", icon: Smile },
    { id: "love", label: "Amour", icon: Heart },
    { id: "sad", label: "Triste", icon: Frown },
    { id: "yes", label: "Oui", icon: ThumbsUp },
    { id: "fire", label: "Feu", icon: Flame },
];

// --- Tenor API Integration ---
const TENOR_KEY = "LIVDSRZULELA"; // Public Test Key
const API_URL = "https://g.tenor.com/v1";

interface TenorResult {
    media: {
        gif: { url: string; dims: number[] };
        tinygif: { url: string; dims: number[] };
    }[];
    content_description: string;
}

interface GifPickerProps {
    onGifSelect: (url: string) => void;
    children: React.ReactNode;
}

export function GifPicker({ onGifSelect, children }: GifPickerProps) {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("trending");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<{ url: string; aspectRatio: number; title: string; fullUrl?: string }[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchGifs = async () => {
            setLoading(true);
            try {
                let endpoint = `${API_URL}/trending?key=${TENOR_KEY}&limit=20`;

                if (search) {
                    endpoint = `${API_URL}/search?q=${encodeURIComponent(search)}&key=${TENOR_KEY}&limit=20`;
                } else if (category && category !== "trending") {
                    // Map categories to search terms
                    const catMap: Record<string, string> = {
                        happy: "happy",
                        love: "love",
                        sad: "sad",
                        yes: "yes",
                        fire: "fire",
                    };
                    if (catMap[category]) {
                        endpoint = `${API_URL}/search?q=${catMap[category]}&key=${TENOR_KEY}&limit=20`;
                    }
                }

                const res = await fetch(endpoint);
                const data = await res.json();

                if (data.results) {
                    const mapped = data.results.map((item: TenorResult) => {
                        const media = item.media[0];
                        const gif = media.gif;
                        // Use full gif for better quality or tinygif for bandwidth? 
                        // Let's use tinygif for the grid preview to be fast, but we might want high quality.
                        // Actually, let's use tinygif for the Grid and pass the full GIF URL to onGifSelect?
                        // For now, let's just use 'gif' (medium quality) to ensure it looks good as requested.
                        // Or 'tinygif' is usually good enough for small previews. 
                        // Let's use 'tinygif' for the grid to keep it snappy.
                        const preview = media.tinygif;

                        return {
                            url: preview.url, // For display
                            fullUrl: media.gif.url, // For sending
                            aspectRatio: preview.dims[0] / preview.dims[1],
                            title: item.content_description
                        };
                    });
                    setResults(mapped);
                }
            } catch (error) {
                console.error("Failed to fetch GIFs", error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchGifs();
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [search, category]);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent className="w-[360px] p-0 overflow-hidden shadow-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900" align="end" side="top" sideOffset={10}>
                {/* Search Header */}
                <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-10">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                        <Input
                            placeholder="Rechercher des GIFs..."
                            className="pl-9 h-9 text-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus-visible:ring-offset-0 focus-visible:ring-orange-500/20 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus={false}
                        />
                    </div>
                </div>

                {/* Categories - Hide if searching */}
                {!search && (
                    <div className="px-2 py-2 flex gap-1 overflow-x-auto scrollbar-hide border-b border-zinc-50 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                        {CATEGORIES.map(cat => {
                            const Icon = cat.icon;
                            const isActive = category === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(cat.id)}
                                    className={cn(
                                        "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                                        isActive
                                            ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                    )}
                                >
                                    <Icon size={12} />
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* GIF Grid - Masonry Style */}
                <div className="h-[350px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700 bg-zinc-50/50 dark:bg-black/20">
                    {loading ? (
                        <div className="columns-2 gap-2 space-y-2">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="w-full rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" style={{ height: `${Math.random() * 100 + 100}px` }} />
                            ))}
                        </div>
                    ) : (
                        <div className="columns-2 gap-2 space-y-2">
                            {results.length > 0 ? (
                                results.map((gif) => (
                                    <button
                                        key={gif.url}
                                        onClick={() => {
                                            onGifSelect(gif.fullUrl || gif.url);
                                            setIsOpen(false);
                                        }}
                                        className="w-full relative rounded-lg overflow-hidden group cursor-pointer break-inside-avoid"
                                    >
                                        <img
                                            src={gif.url}
                                            alt={gif.title}
                                            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110"
                                            style={{ aspectRatio: gif.aspectRatio }}
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))
                            ) : (
                                <div className="col-span-2 text-center py-12 text-zinc-400 text-sm">
                                    Aucun résultat trouvé 😕
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Removed as requested */}
            </PopoverContent>
        </Popover>
    );
}

