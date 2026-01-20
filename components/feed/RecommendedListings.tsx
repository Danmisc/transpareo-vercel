"use client";

import { useEffect, useState } from "react";
import { getRecommendedListings } from "@/lib/actions-sidebar";
import { MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function RecommendedListings({ userId }: { userId?: string }) {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const data = await getRecommendedListings(userId);
                setListings(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, [userId]);

    if (loading) {
        return (
            <div className="rounded-xl glass-card p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-32 w-full rounded-md" />
            </div>
        );
    }

    if (listings.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="font-semibold text-sm tracking-tight text-foreground/80">Immobilier Proche</h3>
                <Link href="/marketplace" className="text-xs text-primary hover:underline">Voir tout</Link>
            </div>

            <div className="space-y-3">
                {listings.map((listing: any, i) => (
                    <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group relative rounded-xl glass-card overflow-hidden hover:shadow-md transition-all cursor-pointer"
                    >
                        <Link href={`/marketplace/${listing.id}`}>
                            <div className="relative aspect-[16/9] bg-muted">
                                {listing.images?.[0] ? (
                                    <img
                                        src={listing.images[0].url}
                                        alt={listing.title}
                                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(listing.price)}
                                </div>
                            </div>
                            <div className="p-3">
                                <h4 className="font-semibold text-sm truncate">{listing.title}</h4>
                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    <span className="truncate max-w-[150px]">{listing.address} · {listing.surface}m²</span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

