"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Share2, Heart, Star, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ListingHeaderProps {
    listing: any;
}

export function ListingHeader({ listing }: ListingHeaderProps) {
    const [isFavorite, setIsFavorite] = useState(false);

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: listing.title,
                    text: `Regarde ce bien sur Transpareo : ${listing.title}`,
                    url: window.location.href,
                });
            } else {
                await navigator.clipboard.writeText(window.location.href);
                toast.success("Lien copié dans le presse-papier !");
            }
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };

    const handleFavorite = () => {
        setIsFavorite(!isFavorite);
        toast.message(isFavorite ? "Retiré des favoris" : "Ajouté aux favoris", {
            description: "Retrouvez ce bien dans votre espace personnel.",
        });
    };

    return (
        <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight mb-3">
                {listing.title}
            </h1>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">
                        {listing.address}
                    </span>
                    <span className="hidden md:inline text-zinc-300">|</span>

                    {/* Truth Score Badge */}
                    <div className="flex items-center gap-2 px-3 py-1 bg-zinc-50 dark:bg-zinc-900 rounded-full border border-zinc-100 dark:border-zinc-800">
                        <div className="relative flex items-center justify-center w-5 h-5">
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full opacity-20 animate-pulse" />
                            <Star size={12} className="fill-orange-500 text-orange-500 relative z-10" />
                        </div>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">4.8</span>
                        <span className="text-xs text-zinc-400">
                            (12 avis vérifiés)
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-zinc-900 dark:text-zinc-100 font-semibold underline decoration-zinc-300 underline-offset-4 decoration-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg px-3"
                        onClick={handleShare}
                    >
                        <Share2 size={16} className="mr-2" />
                        Partager
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`font-semibold underline decoration-zinc-300 underline-offset-4 decoration-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg px-3 transition-colors ${isFavorite ? "text-red-500 hover:text-red-600" : "text-zinc-900 dark:text-zinc-100"}`}
                        onClick={handleFavorite}
                    >
                        <Heart size={16} className={`mr-2 ${isFavorite ? "fill-current" : ""}`} />
                        {isFavorite ? "Enregistré" : "Enregistrer"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
