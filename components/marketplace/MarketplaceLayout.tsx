"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import { ListingList } from "./ListingList";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getListings } from "@/lib/actions/marketplace";
import { getPropertyReviews } from "@/lib/actions/reviews";

import { cn } from "@/lib/utils";

// Dynamically import map to avoid SSR issues with Leaflet
const MarketplaceMap = dynamic(() => import("./MarketplaceMap"), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400">Chargement de la carte...</div>
});



import { OmniSearchBox } from "./OmniSearchBox";
import { StickyFilterHeader } from "./StickyFilterHeader";
import { ReviewList } from "./reviews/ReviewList";
interface MarketplaceLayoutProps {
    header?: React.ReactNode;
}

export function MarketplaceLayout({ header }: MarketplaceLayoutProps) {
    // ... state remains same ...
    const [listings, setListings] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilters, setActiveFilters] = useState({
        minPrice: 0,
        maxPrice: 0, // 0 = No Max
        minSurface: 0,
        maxSurface: 0, // 0 = No Max
        type: "RENT",
        rooms: 0,
        bedrooms: 0,
        energyClass: null,
        pool: false,
        garden: false,
        balcony: false,
        terrace: false,
        parking: false,
        elevator: false,
        isFurnished: false,
    });

    // Selection State
    const [polygonFilter, setPolygonFilter] = useState<[number, number][] | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [mapBounds, setMapBounds] = useState<any>(null);
    const [mapViewState, setMapViewState] = useState<{ center: [number, number], zoom: number } | null>(null);

    const loadData = useCallback(async (filters: any = {}, polygon: any = null, query: string = "", bounds: any = null) => {
        setLoading(true);
        const [listingsRes, reviewsRes] = await Promise.all([
            getListings({ ...filters, polygon, query, bounds }),
            getPropertyReviews()
        ]);

        if (listingsRes.success && listingsRes.data) {
            setListings(listingsRes.data);
        }
        if (reviewsRes.success && reviewsRes.data) {
            setReviews(reviewsRes.data);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadData(activeFilters, polygonFilter, searchQuery, mapBounds);
    }, [loadData, activeFilters, polygonFilter, searchQuery, mapBounds]);

    const handleFilterChange = (newFilters: any) => {
        setActiveFilters(newFilters);
    };

    const handlePolygonChange = (polygon: [number, number][] | null) => {
        setPolygonFilter(polygon);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handleBoundsChange = (bounds: any) => {
        setMapBounds(bounds);
        // Clear polygon when searching by bounds to avoid conflicting geographic filters?
        // For now, let's keep them independent or maybe just clear polygon if bounds used.
        setPolygonFilter(null);
    };

    const handleLocationSelect = (location: any) => {
        if (location && location.lat && location.lon) {
            setMapViewState({ center: [location.lat, location.lon], zoom: 14 });
        }
    };

    // View State for Mobile
    const [mobileView, setMobileView] = useState<'list' | 'map'>('list');

    // Marketplace Mode Switcher (Listings vs Reviews)
    const [viewMode, setViewMode] = useState<'listings' | 'reviews'>('listings');


    return (
        <div className="flex flex-col h-screen w-full bg-white dark:bg-zinc-950 pt-20">
            {/* Desktop Header */}
            <div className="hidden md:block z-50">
                {header}
            </div>

            {/* Mobile Header Override? Or keep separate? Mobile Layout usually handles this. */}

            {/* Main Content Area */}
            <div className="flex-1 flex relative overflow-hidden">
                {/* Left: List Panel */}
                <div className={cn(
                    "w-full md:w-[45%] lg:w-[40%] flex-shrink-0 h-full border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 z-20 flex flex-col transition-transform duration-300 absolute md:relative",
                    mobileView === 'map' ? "-translate-x-full md:translate-x-0" : "translate-x-0"
                )}>
                    <StickyFilterHeader
                        listingCount={listings.length}
                        filters={activeFilters}
                        onFilterChange={handleFilterChange}
                        onRefresh={() => loadData(activeFilters, polygonFilter, searchQuery, mapBounds)}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        onSearch={handleSearch}
                        onLocationSelect={handleLocationSelect}
                    />

                    <div className="h-full flex flex-col overflow-hidden">
                        {viewMode === 'listings' ? (
                            <ListingList
                                listings={listings}
                                loading={loading}
                                onRefresh={() => loadData(activeFilters, polygonFilter, searchQuery, mapBounds)}
                                onFilterChange={handleFilterChange}
                                onSelect={(l) => console.log("Selected", l.id)}
                            />
                        ) : (
                            <div className="h-full flex flex-col overflow-hidden">
                                {/* Review Header or Filters could go here */}
                                <ReviewList mapBounds={mapBounds} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Map Panel */}
                <div className={cn(
                    "flex-1 h-full relative z-10 w-full md:w-auto absolute md:relative transition-transform duration-300",
                    mobileView === 'list' ? "translate-x-full md:translate-x-0" : "translate-x-0"
                )}>
                    {/* We could switch map layers here too if we had a Heatmap component */}
                    <MarketplaceMap
                        listings={listings}
                        reviews={reviews} // Pass reviews to map
                        onSelectListing={(l) => console.log("Selected map", l.id)}
                        onPolygonChange={handlePolygonChange}
                        onBoundsChange={handleBoundsChange}
                        viewState={mapViewState}
                        viewMode={viewMode}
                    />
                </div>
            </div>
        </div>
    );
}

