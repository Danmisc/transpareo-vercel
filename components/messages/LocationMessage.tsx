"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import { useEffect, useState } from 'react';

// Fix Leaflet Default Icon
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export default function LocationMessage({ metadata }: { metadata: any }) {
    const lat = metadata.lat;
    const lng = metadata.lng;
    const address = metadata.address;

    if (!lat || !lng) return <div className="text-red-500 text-xs">Position invalide</div>;

    return (
        <div className="w-[300px] h-[200px] rounded-lg overflow-hidden border border-zinc-200 mt-2 relative z-0">
            <MapContainer center={[lat, lng]} zoom={15} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Marker position={[lat, lng]} icon={icon}>
                    {address && <Popup>{address}</Popup>}
                </Marker>
            </MapContainer>
            <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-2 text-xs font-medium truncate backdrop-blur-sm z-[500]">
                📍 {address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`}
            </div>
        </div>
    );
}
