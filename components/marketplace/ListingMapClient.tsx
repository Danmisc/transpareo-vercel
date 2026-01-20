"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Define icon strictly on client side to avoid any SSR issues, 
// though this file should only be loaded on client via the wrapper.
const listingIcon = L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: #f97316; width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
           </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
});

interface ListingMapClientProps {
    lat: number;
    lng: number;
    address?: string;
}

export default function ListingMapClient({ lat, lng, address }: ListingMapClientProps) {

    if (!lat || !lng) return <div className="h-full w-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-sm">Coordonnées non disponibles</div>;

    return (
        <div className="h-[300px] w-full rounded-2xl overflow-hidden relative z-0 border border-zinc-200 dark:border-zinc-800">
            <MapContainer center={[lat, lng]} zoom={15} scrollWheelZoom={false} className="h-full w-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <Marker position={[lat, lng]} icon={listingIcon}>
                    <Popup className="font-sans text-sm font-semibold">
                        {address || "Le bien est ici"}
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}

