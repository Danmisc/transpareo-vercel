"use client";

import { ListingCard } from "./ListingCard";
import { ListingSkeleton } from "./ListingSkeleton";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { CreateListingDialog } from "./CreateListingDialog";
import Link from "next/link";
import { CreateReviewDialog } from "./CreateReviewDialog";
import { ListingFilters } from "./ListingFilters";

interface ListingListProps {
    listings: any[];
    loading: boolean;
    onRefresh: () => void;
    onFilterChange: (filters: any) => void;
    onSelect: (listing: any) => void;
}

export function ListingList({ listings, loading, onRefresh, onFilterChange, onSelect }: ListingListProps) {
    return (
        <div className="flex flex-col h-full">
            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20 space-y-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 bg-white dark:bg-zinc-950">
                {loading ? (
                    <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8 pb-20 md:pb-0">
                        {[1, 2, 3, 4].map(i => (
                            <ListingSkeleton key={i} />
                        ))}
                    </div>
                ) : listings.length > 0 ? (
                    <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8 pb-20 md:pb-0">
                        {listings.map((listing) => (
                            <Link key={listing.id} href={`/marketplace/${listing.id}`} className="block">
                                <ListingCard listing={listing} />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-center p-8 animate-in fade-in zoom-in duration-300">
                        <div className="h-20 w-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <SlidersHorizontal className="h-8 w-8 text-zinc-400" />
                        </div>
                        <h3 className="font-bold text-xl text-zinc-900 dark:text-zinc-100 mb-2">Aucun résultat</h3>
                        <p className="text-zinc-500 max-w-xs mx-auto mb-6">
                            Nous n'avons trouvé aucune annonce correspondant à vos critères. Essayez d'élargir votre zone de recherche.
                        </p>
                        <Button
                            variant="outline"
                            onClick={onRefresh} // Actually explicit clear filters would be better, but refresh is ok
                            className="rounded-full border-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                        >
                            Actualiser la recherche
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
