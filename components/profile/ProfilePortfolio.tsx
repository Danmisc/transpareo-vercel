"use client";

import { ProfileSection } from "./ProfileSection";
import { Badge } from "@/components/ui/badge";
import { Calendar, Layers, MapPin, ArrowUpRight } from "lucide-react";

interface PortfolioItem {
    id: string;
    title: string;
    description: string;
    imageUrl: string | null;
    location: string | null;
    date: string | null;
    featured: boolean;
}

interface ProfilePortfolioProps {
    items: PortfolioItem[];
    isOwner: boolean;
}

export function ProfilePortfolio({ items, isOwner }: ProfilePortfolioProps) {
    if (!items || items.length === 0) {
        if (!isOwner) return null;
        // Optionally show "Add Project" placeholder if owner
        return null;
    }

    return (
        <ProfileSection
            title="Portfolio & Réalisations"
            noPadding
            action={
                isOwner && (
                    <Badge variant="outline" className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        + Ajouter
                    </Badge>
                )
            }
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/30 bg-white/50 dark:bg-zinc-950/30">
                {items.slice(0, 6).map((item, idx) => (
                    <div key={item.id} className="group relative bg-background hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                        <div className="aspect-[4/3] w-full relative overflow-hidden">
                            {item.imageUrl ? (
                                <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                                />
                            ) : (
                                <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-muted-foreground">
                                    <Layers className="w-10 h-10 opacity-20" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                <a href="#" className="inline-flex items-center text-xs font-bold text-white hover:underline">
                                    Voir le détail <ArrowUpRight className="w-3 h-3 ml-1" />
                                </a>
                            </div>
                        </div>
                        <div className="p-4 space-y-2">
                            <h3 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-orange-600 transition-colors">
                                {item.title}
                            </h3>
                            {item.location && (
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <MapPin className="w-3 h-3 mr-1" /> {item.location}
                                </div>
                            )}
                            <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            {items.length > 3 && (
                <div className="p-3 bg-zinc-50/50 dark:bg-zinc-900/20 text-center border-t border-border/30">
                    <button className="text-xs font-bold text-muted-foreground hover:text-orange-600 transition-colors uppercase tracking-wider">
                        Voir tout le portfolio ({items.length})
                    </button>
                </div>
            )}
        </ProfileSection>
    );
}
