"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Star, GraduationCap, ShoppingBag, TramFront, ShieldCheck, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// --- Custom Marker Styles ---

const createPriceIcon = (price: number, type: string) => {
    return L.divIcon({
        className: 'custom-dot-marker group',
        html: `
        <div style="
            background-color: #f97316;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            cursor: pointer;
        " class="hover:scale-150 hover:border-orange-200">
        </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10]
    });
};

const createReviewIcon = (rating: number) => {
    const colorClass = rating >= 4.5 ? '#10b981' : (rating >= 3 ? '#f59e0b' : '#ef4444');
    return L.divIcon({
        className: 'custom-review-marker',
        html: `
        <div style="
            background-color: ${colorClass};
            width: 32px;
            height: 32px;
            border-radius: 10px;
            transform: rotate(45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            border: 2px solid white;
        ">
            <div style="transform: rotate(-45deg); color: white; font-weight: 800; font-size: 11px;">
                ${rating}
            </div>
        </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
    });
};

const createClusterCustomIcon = function (cluster: any) {
    return L.divIcon({
        html: `<div style="
            background-color: #f97316;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 3px solid white;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 13px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        "><span>${cluster.getChildCount()}</span></div>`,
        className: 'custom-cluster-marker',
        iconSize: L.point(32, 32, true),
    });
};

// --- Micro Cards (Components) ---

const ListingMapCard = ({ listing }: { listing: any }) => (
    <Link href={`/marketplace/${listing.id}`} className="block w-[200px] bg-white dark:bg-zinc-950 font-sans group cursor-pointer hover:bg-zinc-50 transition-colors">
        <div className="relative h-[120px] w-full overflow-hidden">
            {listing.images?.[0] ? (
                <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-300">
                    <MapPin size={24} />
                </div>
            )}
            <div className="absolute top-2 left-2">
                <Badge className="bg-white/90 text-zinc-900 shadow-sm border-0 font-bold backdrop-blur h-5 px-2 text-[10px]">
                    {listing.type === 'RENT' ? 'Location' : 'Vente'}
                </Badge>
            </div>
            <div className="absolute bottom-2 right-2">
                <Badge className="bg-zinc-900/90 text-white shadow-sm border-0 font-bold backdrop-blur h-5 px-2 text-[10px]">
                    {listing.price} €
                </Badge>
            </div>
        </div>
        <div className="p-3">
            <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">{listing.title}</h3>
            <div className="text-[10px] text-zinc-500 flex gap-2">
                <span>{listing.surface} m²</span>
                <span>•</span>
                <span>{listing.rooms} p.</span>
                <span>•</span>
                <span className="truncate max-w-[60px]">{listing.city}</span>
            </div>
        </div>
    </Link>
);

const ReviewMapCard = ({ review }: { review: any }) => (
    <Link href={`/reviews/${review.id}`} className="block w-[200px] bg-white dark:bg-zinc-950 font-sans p-3 cursor-pointer hover:bg-zinc-50 transition-colors">
        <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-xs text-emerald-700">
                {review.rating}
            </div>
            <div>
                <h4 className="font-bold text-xs text-zinc-900">Avis Vérifié</h4>
            </div>
        </div>
        <p className="text-[10px] text-zinc-600 dark:text-zinc-300 italic mb-2 line-clamp-2 leading-relaxed">
            "{review.comment}"
        </p>
        <div className="flex gap-1">
            <Badge variant="outline" className="text-[9px] h-4 px-1 text-zinc-500 border-zinc-200">Certifié</Badge>
        </div>
    </Link>
);

// --- Main Component ---

interface MarketplaceMapProps {
    listings: any[];
    reviews: any[];
    viewState?: { center: [number, number], zoom: number } | null;
    viewMode?: 'listings' | 'reviews';
    onSelectListing?: (listing: any) => void;
    onPolygonChange?: (polygon: [number, number][] | null) => void;
    onBoundsChange?: (bounds: any) => void;
}

const MapController = ({ viewState }: { viewState: { center: [number, number], zoom: number } | null }) => {
    const map = useMap();
    useEffect(() => {
        if (viewState) {
            map.flyTo(viewState.center, viewState.zoom, { duration: 1.5 });
        }
    }, [viewState, map]);
    return null;
};

export default function MarketplaceMap({ listings, reviews, viewState, viewMode = 'listings', onSelectListing, onPolygonChange, onBoundsChange }: MarketplaceMapProps) {
    const defaultCenter: [number, number] = [48.8566, 2.3522]; // Paris
    const router = useRouter();

    const [showPOI, setShowPOI] = useState<Record<string, boolean>>({
        schools: false,
        shops: false,
        transport: false
    });

    // "Search as I move" feature
    const [mapCenter, setMapCenter] = useState<L.LatLng | null>(null);
    const [showSearchButton, setShowSearchButton] = useState(false);
    const [currentBounds, setCurrentBounds] = useState<any>(null);

    // Mock POI Data
    const poiData = [
        { id: 1, type: 'schools', lat: 48.858, lng: 2.352, label: 'École Primaire' },
        { id: 2, type: 'shops', lat: 48.855, lng: 2.355, label: 'Supermarché' },
        { id: 3, type: 'transport', lat: 48.860, lng: 2.350, label: 'Métro' },
        { id: 4, type: 'schools', lat: 48.862, lng: 2.348, label: 'Lycée' },
    ];

    const togglePOI = (type: string) => {
        setShowPOI(prev => ({ ...prev, [type]: !prev[type] }));
    };

    // --- Helper Component for Map Events ---
    interface MapEventsHandlerProps {
        setMapCenter: (center: L.LatLng) => void;
        setCurrentBounds: (bounds: any) => void;
        setShowSearchButton: (show: boolean) => void;
    }

    const MapEventsHandler = ({ setMapCenter, setCurrentBounds, setShowSearchButton }: MapEventsHandlerProps) => {
        const map = useMapEvents({
            moveend: () => {
                setMapCenter(map.getCenter());
                setCurrentBounds(map.getBounds());
                setShowSearchButton(true);
            }
        });
        return null;
    };

    return (
        <div className="relative h-full w-full bg-zinc-50 overflow-hidden group">
            <MapContainer
                center={defaultCenter}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                <MapEventsHandler
                    setMapCenter={setMapCenter}
                    setCurrentBounds={setCurrentBounds}
                    setShowSearchButton={setShowSearchButton}
                />
                <MapController viewState={viewState || null} />

                {/* --- LISTINGS LAYER (Clustered) --- */}
                {viewMode === 'listings' && (
                    <MarkerClusterGroup
                        chunkedLoading
                        iconCreateFunction={createClusterCustomIcon}
                    >
                        {listings.map(listing => (
                            <Marker
                                key={listing.id}
                                position={[listing.latitude, listing.longitude]}
                                icon={createPriceIcon(listing.price, listing.type)}
                                eventHandlers={{
                                    mouseover: (e) => e.target.openPopup(),
                                    click: () => {
                                        // On click, navigate immediately OR just let popup handle it?
                                        // User request: "Making map markers clickable, leading to their respective detail pages"
                                        // Let's support both: Click marker -> Navigate. Link in popup -> Navigate.
                                        router.push(`/marketplace/${listing.id}`);
                                    }
                                }}
                            >
                                <Popup autoPan={false} closeButton={false} className="custom-popup-clean p-0 border-none rounded-xl overflow-hidden shadow-2xl">
                                    <ListingMapCard listing={listing} />
                                </Popup>
                            </Marker>
                        ))}
                    </MarkerClusterGroup>
                )}

                {/* --- REVIEWS LAYER --- */}
                {viewMode === 'reviews' && reviews.map((review) => (
                    <Marker
                        key={review.id}
                        position={[review.latitude, review.longitude]}
                        icon={createReviewIcon(review.rating)}
                        eventHandlers={{
                            mouseover: (e) => e.target.openPopup(),
                            click: () => {
                                // Navigate to review? Or just popup?
                                // Reviews usually don't have detail pages like listings, but assuming they do or link to profile:
                                // router.push(`/reviews/${review.id}`); 
                                // Actually, ReviewMapCard has Link now.
                            }
                        }}
                    >
                        <Popup autoPan={false} closeButton={false} className="custom-popup-clean p-0 border-none rounded-xl overflow-hidden shadow-2xl">
                            <ReviewMapCard review={review} />
                        </Popup>
                    </Marker>
                ))}

                {/* --- POI LAYER --- */}
                {Object.entries(showPOI).map(([type, enabled]) =>
                    enabled && poiData.filter(p => p.type === type).map(poi => (
                        <Marker
                            key={`poi-${poi.id}`}
                            position={[poi.lat, poi.lng]}
                            icon={
                                L.divIcon({
                                    className: 'poi-icon',
                                    html: `<div style="background-color: ${type === 'schools' ? '#3b82f6' : type === 'shops' ? '#10b981' : '#8b5cf6'}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
                                    iconSize: [24, 24]
                                })
                            }
                        >
                            <Popup className="text-xs font-bold">{poi.label}</Popup>
                        </Marker>
                    ))
                )}
            </MapContainer>

            {/* Search Area Button (Moved High) */}
            {showSearchButton && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400]">
                    <Button
                        onClick={() => {
                            setShowSearchButton(false);
                            if (onBoundsChange && currentBounds) {
                                onBoundsChange(currentBounds);
                            }
                        }}
                        className="bg-white text-zinc-900 shadow-xl rounded-full border border-zinc-200 hover:bg-zinc-50 animate-in fade-in zoom-in duration-300 h-9 px-4 text-xs font-semibold"
                    >
                        Chercher dans cette zone
                    </Button>
                </div>
            )}

            {/* POI Toggles (Corner) */}
            <div className="absolute top-4 right-4 z-[400] flex flex-col items-end gap-2">
                <div className="flex bg-white/90 backdrop-blur rounded-lg p-1 shadow-md border border-zinc-200 gap-1">
                    <Button
                        size="sm"
                        variant={showPOI.schools ? "default" : "ghost"}
                        onClick={() => togglePOI('schools')}
                        className={`h-8 w-8 p-0 ${showPOI.schools ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'text-zinc-500'}`}
                        title="Écoles"
                    >
                        <GraduationCap size={16} />
                    </Button>
                    <Button
                        size="sm"
                        variant={showPOI.shops ? "default" : "ghost"}
                        onClick={() => togglePOI('shops')}
                        className={`h-8 w-8 p-0 ${showPOI.shops ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'text-zinc-500'}`}
                        title="Commerces"
                    >
                        <ShoppingBag size={16} />
                    </Button>
                    <Button
                        size="sm"
                        variant={showPOI.transport ? "default" : "ghost"}
                        onClick={() => togglePOI('transport')}
                        className={`h-8 w-8 p-0 ${showPOI.transport ? 'bg-violet-100 text-violet-700 hover:bg-violet-200' : 'text-zinc-500'}`}
                        title="Transports"
                    >
                        <TramFront size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
