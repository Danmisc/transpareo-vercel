"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Briefcase, MapPin, ExternalLink, Plus, MoreHorizontal, Star, Home, Key, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AddPortfolioModal } from "./ProfileModals";

interface PortfolioItem {
    id: string;
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    category: string;
    price?: number | null;
    location?: string | null;
    link?: string | null;
    featured: boolean;
}

interface PortfolioSectionProps {
    items: PortfolioItem[];
    isOwner: boolean;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    SOLD: { label: "Vendu", icon: Home, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    RENTED: { label: "Loué", icon: Key, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    PROJECT: { label: "Projet", icon: Hammer, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    SERVICE: { label: "Service", icon: Briefcase, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
};

export function PortfolioSection({ items, isOwner }: PortfolioSectionProps) {
    const [showAll, setShowAll] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const displayedItems = showAll ? items : items.slice(0, 4);

    if (items.length === 0 && !isOwner) {
        return null;
    }

    return (
        <>
            <div className="bg-white/50 dark:bg-zinc-900/30 backdrop-blur-xl rounded-2xl p-6 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-orange-500" />
                        <h3 className="font-bold text-lg">Portfolio</h3>
                    </div>
                    {isOwner && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setModalOpen(true)}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Ajouter
                        </Button>
                    )}
                </div>

                {items.length === 0 ? (
                    <div
                        className="text-center py-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 cursor-pointer hover:border-orange-300 hover:bg-orange-50/50 transition-colors"
                        onClick={() => isOwner && setModalOpen(true)}
                    >
                        <Briefcase className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
                        <p className="text-zinc-500 text-sm">Aucun élément dans le portfolio</p>
                        {isOwner && <p className="text-orange-500 text-xs mt-1 font-medium">Cliquez pour ajouter</p>}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            {displayedItems.map((item) => (
                                <PortfolioCard key={item.id} item={item} />
                            ))}
                        </div>
                        {items.length > 4 && (
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className="mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium"
                            >
                                {showAll ? "Voir moins" : `Voir tout (${items.length})`}
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Modal */}
            <AddPortfolioModal open={modalOpen} onOpenChange={setModalOpen} />
        </>
    );
}

function PortfolioCard({ item }: { item: PortfolioItem }) {
    const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.PROJECT;
    const Icon = config.icon;

    return (
        <div className="group relative bg-white dark:bg-zinc-800 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 hover:shadow-lg transition-shadow">
            {/* Image */}
            <div className="aspect-[4/3] relative bg-zinc-100 dark:bg-zinc-700">
                {item.imageUrl ? (
                    <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Icon className="w-8 h-8 text-zinc-400" />
                    </div>
                )}

                {/* Featured badge */}
                {item.featured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white p-1 rounded-full">
                        <Star className="w-3 h-3 fill-white" />
                    </div>
                )}

                {/* Category badge */}
                <div className={cn("absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium", config.color)}>
                    {config.label}
                </div>
            </div>

            {/* Content */}
            <div className="p-3">
                <h4 className="font-semibold text-sm truncate">{item.title}</h4>

                {item.location && (
                    <div className="flex items-center gap-1 text-xs text-zinc-500 mt-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{item.location}</span>
                    </div>
                )}

                {item.price && (
                    <p className="text-orange-600 font-bold text-sm mt-1">
                        {item.price.toLocaleString('fr-FR')} €
                    </p>
                )}

                {item.link && (
                    <Link
                        href={item.link}
                        target="_blank"
                        className="absolute inset-0 z-10"
                    >
                        <span className="sr-only">Voir le détail</span>
                    </Link>
                )}
            </div>
        </div>
    );
}

