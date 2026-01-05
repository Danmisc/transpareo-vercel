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

const GIF_DB: Record<string, { url: string, aspectRatio: number, title: string }[]> = {
    trending: [
        { url: "https://media.tenor.com/p0G_kqK5iikAAAAM/cat-driving-driving.gif", aspectRatio: 1.3, title: "Cat Driving" },
        { url: "https://media.tenor.com/_4YgA77ExHEAAAAM/thumbs-up.gif", aspectRatio: 1.4, title: "Thumbs Up" },
        { url: "https://media.tenor.com/2s90sZlZwSAAAAAM/excited-minion.gif", aspectRatio: 1.0, title: "Excited" },
        { url: "https://media.tenor.com/QW62XJ_GkC8AAAAM/shocked-face.gif", aspectRatio: 1.5, title: "Shocked" },
        { url: "https://media.tenor.com/D_X-J2Xq710AAAAM/party-parrot.gif", aspectRatio: 1, title: "Party" },
        { url: "https://media.tenor.com/7j4g6h5k76oAAAAM/laughing-laugh.gif", aspectRatio: 1.4, title: "Laughing" },
        { url: "https://media.tenor.com/11270154/cool-dog.gif", aspectRatio: 1.2, title: "Cool Dog" },
        { url: "https://media.tenor.com/15989728/dancing-baby.gif", aspectRatio: 0.9, title: "Dancing" },
    ],
    happy: [
        { url: "https://media.tenor.com/D_X-J2Xq710AAAAM/party-parrot.gif", aspectRatio: 1, title: "Party" },
        { url: "https://media.tenor.com/2s90sZlZwSAAAAAM/excited-minion.gif", aspectRatio: 1.0, title: "Excited" },
        { url: "https://media.tenor.com/GfSXTxln8ykAAAAM/yes-baby.gif", aspectRatio: 1.2, title: "Yes Baby" },
    ],
    love: [
        { url: "https://media.tenor.com/L7w7i8R2qM4AAAAM/cat-love.gif", aspectRatio: 1.1, title: "Cat Love" },
        { url: "https://media.tenor.com/23126781/heart-beat.gif", aspectRatio: 1.0, title: "Heart" },
    ],
    sad: [
        { url: "https://media.tenor.com/13824967/sad-cat.gif", aspectRatio: 1.3, title: "Sad Cat" },
        { url: "https://media.tenor.com/5176212/crying-sad.gif", aspectRatio: 1.5, title: "Crying" },
    ],
    yes: [
        { url: "https://media.tenor.com/_4YgA77ExHEAAAAM/thumbs-up.gif", aspectRatio: 1.4, title: "Thumbs Up" },
        { url: "https://media.tenor.com/5938564/obama-yes.gif", aspectRatio: 1.4, title: "Obama Yes" },
    ],
    fire: [
        { url: "https://media.tenor.com/15263451/elmo-fire.gif", aspectRatio: 1.2, title: "Elmo Fire" },
    ]
};

interface GifPickerProps {
    onGifSelect: (url: string) => void;
    children: React.ReactNode;
}

export function GifPicker({ onGifSelect, children }: GifPickerProps) {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("trending");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(GIF_DB.trending);
    const [isOpen, setIsOpen] = useState(false);

    // Debounce search simulation
    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            if (search) {
                // Simulate global search from all categories
                const allGifs = Object.values(GIF_DB).flat();
                const filtered = allGifs.filter(g => g.title.toLowerCase().includes(search.toLowerCase()));
                // Remove duplicates by URL
                const unique = Array.from(new Map(filtered.map(item => [item.url, item])).values());
                setResults(unique);
            } else {
                setResults(GIF_DB[category] || []);
            }
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [search, category]);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent className="w-[360px] p-0 overflow-hidden shadow-2xl border-zinc-200" align="start" side="top" sideOffset={10}>
                {/* Search Header */}
                <div className="p-3 border-b border-zinc-100 bg-white z-10">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                        <Input
                            placeholder="Rechercher des GIFs..."
                            className="pl-9 h-9 text-sm bg-zinc-50 border-zinc-200 focus-visible:ring-offset-0 focus-visible:ring-orange-500/20"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus={false} // Avoid auto-zoom on mobile or jumps
                        />
                    </div>
                </div>

                {/* Categories - Hide if searching */}
                {!search && (
                    <div className="px-2 py-2 flex gap-1 overflow-x-auto scrollbar-hide border-b border-zinc-50">
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
                                            ? "bg-zinc-900 text-white"
                                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
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
                <div className="h-[350px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-zinc-200 bg-zinc-50/50">
                    {loading ? (
                        <div className="columns-2 gap-2 space-y-2">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="w-full rounded-lg bg-zinc-200 animate-pulse" style={{ height: `${Math.random() * 100 + 100}px` }} />
                            ))}
                        </div>
                    ) : (
                        <div className="columns-2 gap-2 space-y-2">
                            {results.length > 0 ? (
                                results.map((gif) => (
                                    <button
                                        key={gif.url}
                                        onClick={() => {
                                            onGifSelect(gif.url);
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

                {/* Footer */}
                <div className="p-2 border-t border-zinc-100 bg-white text-[10px] text-zinc-400 flex justify-between items-center px-4">
                    <span>Powered by Tenor</span>
                    <span className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-green-500"></span> Pro
                    </span>
                </div>
            </PopoverContent>
        </Popover>
    );
}
