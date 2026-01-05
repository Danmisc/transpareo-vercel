"use client";

import { useState } from "react";
import { Heart, MapPin, BedDouble, Ruler, ArrowRight, Play, Eye, ChevronLeft, ChevronRight, Video, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function ListingCard({ listing }: { listing: any }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const images = listing.images && listing.images.length > 0 ? listing.images : [{ url: "/placeholder-house.jpg" }];
    const hasMultipleImages = images.length > 1;

    const nextImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const isNew = new Date(listing.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days

    return (
        <div
            className="group bg-transparent cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Carousel Section (Vertical Card) */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 mb-3 relative">
                <img
                    src={images[currentImageIndex]?.url || "https://placehold.co/600x400?text=No+Image"}
                    alt={listing.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Overlays */}
                <div className="absolute top-3 left-3 flex gap-2">
                    {isNew && (
                        <Badge className="bg-white/90 text-zinc-900 border-none shadow-sm font-semibold hover:bg-white">
                            Nouveauté
                        </Badge>
                    )}
                    <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-zinc-900 font-semibold border-none shadow-sm hover:bg-white">
                        {listing.type === "RENT" ? "Location" : "Vente"}
                    </Badge>
                </div>

                {/* Like Button (Top Right) */}
                <button className="absolute top-3 right-3 p-2 rounded-full bg-transparent hover:bg-white/10 text-white/70 hover:text-white transition-all">
                    <Heart size={24} className="drop-shadow-md" strokeWidth={2.5} />
                </button>

                {/* Carousel Controls (Visible on Hover) */}
                {hasMultipleImages && (
                    <>
                        <button
                            onClick={prevImage}
                            className={cn(
                                "absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 dark:bg-black/90 text-black dark:text-white shadow-sm hover:scale-110 transition-all opacity-0 group-hover:opacity-100 z-10",
                                currentImageIndex === 0 && "hidden"
                            )}
                        >
                            <ChevronLeft size={16} strokeWidth={2.5} />
                        </button>
                        <button
                            onClick={nextImage}
                            className={cn(
                                "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 dark:bg-black/90 text-black dark:text-white shadow-sm hover:scale-110 transition-all opacity-0 group-hover:opacity-100 z-10",
                                currentImageIndex === images.length - 1 && "hidden"
                            )}
                        >
                            <ChevronRight size={16} strokeWidth={2.5} />
                        </button>

                        {/* Dots Indicator */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {images.slice(0, 5).map((_: any, idx: number) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "w-1.5 h-1.5 rounded-full shadow-sm transition-all",
                                        idx === currentImageIndex ? "bg-white scale-110" : "bg-white/60"
                                    )}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Content Section (Clean & Minimal) */}
            <div className="space-y-1">
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 truncate max-w-[80%] text-base">{listing.title}</h3>
                    <div className="flex items-center gap-1 text-sm font-light">
                        <Star size={14} className="fill-zinc-900 text-zinc-900 dark:fill-zinc-50 dark:text-zinc-50" />
                        <span>4.8</span>
                    </div>
                </div>

                <p className="text-zinc-500 dark:text-zinc-400 text-sm truncate">
                    {listing.address?.split(',')[0] || "Quartier inconnu"}
                </p>

                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                    {listing.surface} m² · {listing.rooms} pièces
                </p>

                <div className="flex justify-between items-baseline pt-1">
                    <p className="text-zinc-900 dark:text-zinc-50 font-semibold text-lg">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(listing.price)}
                        {listing.type === "RENT" && <span className="text-zinc-500 font-normal text-sm ml-1">/mois</span>}
                    </p>
                    <span className="text-xs text-zinc-400 font-light">
                        {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true, locale: fr })}
                    </span>
                </div>
            </div>
        </div>
    );
}
