"use client";

import { useState, useEffect, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { searchGifs, getTrendingGifs } from "@/lib/actions-gif";
import { Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

interface GifPickerProps {
    onSelect: (gifUrl: string) => void;
    trigger: React.ReactNode;
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
}

interface GifResult {
    id: string;
    url: string;
    previewUrl: string;
    width: number;
    height: number;
    title: string;
}

export function GifPicker({ onSelect, trigger, side = "top", align = "start" }: GifPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [gifs, setGifs] = useState<GifResult[]>([]);
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(false);

    const debouncedQuery = useDebounce(query, 500);

    // Load trending on first open
    useEffect(() => {
        if (isOpen && gifs.length === 0 && !query) {
            setIsLoading(true);
            startTransition(async () => {
                const res = await getTrendingGifs(16);
                if (res.success && res.data) {
                    setGifs(res.data);
                }
                setIsLoading(false);
            });
        }
    }, [isOpen]);

    // Search when query changes (debounced)
    useEffect(() => {
        if (!debouncedQuery) {
            // Reset to trending
            if (isOpen) {
                setIsLoading(true);
                startTransition(async () => {
                    const res = await getTrendingGifs(16);
                    if (res.success && res.data) {
                        setGifs(res.data);
                    }
                    setIsLoading(false);
                });
            }
            return;
        }

        setIsLoading(true);
        startTransition(async () => {
            const res = await searchGifs(debouncedQuery, 16);
            if (res.success && res.data) {
                setGifs(res.data);
            }
            setIsLoading(false);
        });
    }, [debouncedQuery, isOpen]);

    const handleSelect = (gif: GifResult) => {
        onSelect(gif.url);
        setIsOpen(false);
        setQuery("");
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                {trigger}
            </PopoverTrigger>
            <PopoverContent
                side={side}
                align={align}
                className="w-[320px] p-0 overflow-hidden"
            >
                {/* Search Header */}
                <div className="p-2 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Rechercher un GIF..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-9 pr-8 h-9 text-sm"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                            >
                                <X className="h-3 w-3 text-zinc-400" />
                            </button>
                        )}
                    </div>
                </div>

                {/* GIF Grid */}
                <div className="h-[250px] overflow-y-auto p-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" />
                        </div>
                    ) : gifs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500">
                            <p className="text-sm">Aucun GIF trouvé</p>
                            <p className="text-xs mt-1">Essayez un autre terme de recherche</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-1.5">
                            {gifs.map((gif) => (
                                <button
                                    key={gif.id}
                                    onClick={() => handleSelect(gif)}
                                    className={cn(
                                        "relative aspect-video rounded-md overflow-hidden",
                                        "border-2 border-transparent hover:border-orange-500",
                                        "transition-all group cursor-pointer"
                                    )}
                                    title={gif.title}
                                >
                                    <img
                                        src={gif.previewUrl}
                                        alt={gif.title}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                    <p className="text-[10px] text-zinc-400 text-center">
                        {query ? `Résultats pour "${query}"` : "GIFs tendance"} • Powered by GIPHY
                    </p>
                </div>
            </PopoverContent>
        </Popover>
    );
}

