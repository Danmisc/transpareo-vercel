"use server";

import { z } from "zod";

const OVERPASS_API = "https://overpass-api.de/api/interpreter";

// Cache buildings to avoid spamming API
// Simple in-memory cache for the session
const buildingsCache = new Map<string, any[]>();

export async function getBuildings(bbox: { north: number, south: number, east: number, west: number }) {
    // 1. Round coords to create cache keys/grid
    const gridPrecision = 1000; // 3 decimal places
    const key = `${Math.round(bbox.north * gridPrecision)},${Math.round(bbox.east * gridPrecision)},${Math.round(bbox.south * gridPrecision)},${Math.round(bbox.west * gridPrecision)}`;

    if (buildingsCache.has(key)) {
        return buildingsCache.get(key);
    }

    // 2. Query
    // Fetch generic buildings nearby
    const query = `
        [out:json][timeout:10];
        (
          way["building"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
        );
        out geom;
    `;

    try {
        const res = await fetch(OVERPASS_API, {
            method: "POST",
            body: query,
            // Next.js caching usually handles this, but since we POST, we might need to rely on our own or 'force-cache' if key was unique.
            // Let's use standard fetch.
        });

        if (!res.ok) throw new Error("Overpass API error");

        const data = await res.json();

        // 3. Transform
        const buildings = data.elements
            .filter((el: any) => el.type === 'way' && el.geometry)
            .map((el: any) => ({
                id: el.id,
                // Simple Polygon: list of [lat, lon]
                geometry: el.geometry.map((g: any) => [g.lat, g.lon]),
                // Try to get height if available, else default
                levels: parseInt(el.tags?.['building:levels'] || '2', 10),
                height: parseFloat(el.tags?.height || '0')
            }));

        // Limit density if too massive
        const limited = buildings.slice(0, 1000); // safety cap

        buildingsCache.set(key, limited);
        return limited;

    } catch (e) {
        console.error("Failed to fetch buildings:", e);
        return [];
    }
}
