"use client";

import { useState, useCallback, useEffect } from "react";
import { MapPin, Search, X, Loader2, Navigation, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";

interface MapLocation {
    latitude: number;
    longitude: number;
    address?: string;
    zoomLevel?: number;
}

interface MapEmbedPickerProps {
    value?: MapLocation;
    onChange: (location: MapLocation) => void;
    onRemove?: () => void;
}

// Nominatim search result type
interface SearchResult {
    place_id: number;
    lat: string;
    lon: string;
    display_name: string;
    type: string;
}

export function MapEmbedPicker({ value, onChange, onRemove }: MapEmbedPickerProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [showSearch, setShowSearch] = useState(!value);
    const [zoom, setZoom] = useState(value?.zoomLevel || 15);

    const debouncedQuery = useDebounce(searchQuery, 500);

    // Search using Nominatim (OpenStreetMap)
    const searchLocation = useCallback(async (query: string) => {
        if (!query || query.length < 3) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=fr,be,ch,ca`,
                {
                    headers: {
                        'Accept-Language': 'fr',
                    }
                }
            );

            if (response.ok) {
                const results: SearchResult[] = await response.json();
                setSearchResults(results);
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setSearching(false);
        }
    }, []);

    // Effect for debounced search
    useEffect(() => {
        if (debouncedQuery && debouncedQuery.length >= 3) {
            searchLocation(debouncedQuery);
        } else {
            setSearchResults([]);
        }
    }, [debouncedQuery, searchLocation]);

    const handleSelectResult = (result: SearchResult) => {
        const location: MapLocation = {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            address: result.display_name,
            zoomLevel: zoom,
        };
        onChange(location);
        setShowSearch(false);
        setSearchQuery("");
        setSearchResults([]);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchLocation(searchQuery);
    };

    const updateZoom = (newZoom: number) => {
        const clampedZoom = Math.max(1, Math.min(18, newZoom));
        setZoom(clampedZoom);
        if (value) {
            onChange({ ...value, zoomLevel: clampedZoom });
        }
    };

    // Generate static map URL (using OpenStreetMap tiles via geoapify free tier)
    const getMapUrl = (lat: number, lon: number, z: number) => {
        // Use OpenStreetMap's simple static tile approach
        return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lon}`;
    };

    // For image preview, use a simple placeholder with coordinates
    const getMapImageUrl = (lat: number, lon: number, z: number) => {
        // Use tile.openstreetmap.org for reliable image loading
        const tileZ = Math.min(z, 18);
        const n = Math.pow(2, tileZ);
        const x = Math.floor((lon + 180) / 360 * n);
        const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n);
        return `https://tile.openstreetmap.org/${tileZ}/${x}/${y}.png`;
    };

    return (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-zinc-50 dark:bg-zinc-800/50">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-700">
                <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-orange-500" />
                    <span className="text-sm font-medium">Localisation</span>
                </div>
                <div className="flex items-center gap-1">
                    {value && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowSearch(!showSearch)}
                            className="h-7 text-xs"
                        >
                            {showSearch ? "Annuler" : "Modifier"}
                        </Button>
                    )}
                    {onRemove && (
                        <button
                            onClick={onRemove}
                            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Search */}
            {showSearch && (
                <div className="p-3 space-y-3 border-b border-zinc-100 dark:border-zinc-700">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    searchLocation(e.target.value);
                                }}
                                placeholder="Rechercher une adresse..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50"
                            />
                            {searching && (
                                <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 animate-spin" />
                            )}
                        </div>
                    </form>

                    {/* Search results */}
                    {searchResults.length > 0 && (
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                            {searchResults.map((result) => (
                                <button
                                    key={result.place_id}
                                    onClick={() => handleSelectResult(result)}
                                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    <div className="flex items-start gap-2">
                                        <MapPin size={14} className="text-orange-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2">
                                            {result.display_name}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Use current location */}
                    <button
                        onClick={() => {
                            if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(
                                    (position) => {
                                        onChange({
                                            latitude: position.coords.latitude,
                                            longitude: position.coords.longitude,
                                            zoomLevel: zoom,
                                        });
                                        setShowSearch(false);
                                    },
                                    (error) => console.error("Geolocation error:", error)
                                );
                            }
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm"
                    >
                        <Navigation size={14} />
                        Utiliser ma position actuelle
                    </button>
                </div>
            )}

            {/* Map preview */}
            {value && (
                <div className="relative bg-zinc-200 dark:bg-zinc-700">
                    <iframe
                        src={getMapUrl(value.latitude, value.longitude, zoom)}
                        className="w-full h-48 border-0"
                        loading="lazy"
                        title="Aperçu carte"
                    />

                    {/* Zoom controls */}
                    <div className="absolute bottom-2 right-2 flex flex-col gap-1">
                        <button
                            onClick={() => updateZoom(zoom + 1)}
                            className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                        >
                            <ZoomIn size={16} />
                        </button>
                        <button
                            onClick={() => updateZoom(zoom - 1)}
                            className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                        >
                            <ZoomOut size={16} />
                        </button>
                    </div>

                    {/* Coordinates badge */}
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded-lg text-white text-[10px] font-mono">
                        📍 {value.latitude.toFixed(4)}, {value.longitude.toFixed(4)}
                    </div>
                </div>
            )}

            {/* Address display */}
            {value?.address && (
                <div className="px-3 py-2 bg-white dark:bg-zinc-800 border-t border-zinc-100 dark:border-zinc-700">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                        {value.address}
                    </p>
                </div>
            )}
        </div>
    );
}

// --- Display-only Map Embed (for PostCard) ---
interface MapEmbedDisplayProps {
    latitude: number;
    longitude: number;
    address?: string;
    zoomLevel?: number;
}

export function MapEmbedDisplay({ latitude, longitude, address, zoomLevel = 15 }: MapEmbedDisplayProps) {
    const mapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=${zoomLevel}&size=400x150&maptype=osmarenderer&markers=${latitude},${longitude},red-pushpin`;
    const osmUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${zoomLevel}/${latitude}/${longitude}`;

    return (
        <a
            href={osmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 hover:border-orange-500/50 transition-colors my-3 group"
        >
            <div className="relative">
                <img
                    src={mapUrl}
                    alt="Location map"
                    className="w-full h-36 object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
            {address && (
                <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-800">
                    <MapPin size={14} className="text-orange-500 flex-shrink-0" />
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                        {address}
                    </p>
                </div>
            )}
        </a>
    );
}

