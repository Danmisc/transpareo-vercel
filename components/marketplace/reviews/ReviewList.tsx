"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ReviewCard } from "./ReviewCard";
import { getAllReviews } from "@/lib/actions/reviews";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReviewList({ mapBounds }: { mapBounds: any }) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            try {
                // In a real app, we would pass bounds to filter reviews
                const res = await getAllReviews();
                if (res.success && res.data) {
                    setReviews(res.data);
                }
            } catch (error) {
                console.error("Failed to load reviews", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [mapBounds]);

    return (
        <div className="flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-950/50">
            {/* Header with CTA */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-10 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        Avis Vérifiés
                        <span className="text-xs font-normal text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                            {reviews.length}
                        </span>
                    </h2>
                </div>
                <Link href="/marketplace/reviews/create">
                    <Button
                        size="sm"
                        className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 gap-1.5 shadow-sm"
                    >
                        <PlusCircle size={16} />
                        Déposer un avis
                    </Button>
                </Link>
            </div>

            <div className="p-4 overflow-y-auto flex-1 pb-20 space-y-4">
                {loading && (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-20 w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && reviews.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 px-6 text-center text-zinc-500">
                        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-full mb-4">
                            <MapPin size={32} className="text-zinc-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Aucun avis ici</h3>
                        <p className="max-w-xs mt-2 text-sm">Soyez le premier à révéler la vérité sur ce quartier.</p>
                        <Link href="/marketplace/reviews/create">
                            <Button variant="outline" className="mt-4">
                                Laisser le premier avis
                            </Button>
                        </Link>
                    </div>
                )}

                {!loading && reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                ))}
            </div>
        </div>
    );
}
