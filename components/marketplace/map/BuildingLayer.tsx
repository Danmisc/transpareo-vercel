import { useEffect, useRef, useState, useMemo } from 'react';
import { useMap, useMapEvents, Polygon } from 'react-leaflet';
import { Sun } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { getBuildings } from '@/lib/actions/buildings';
import L from 'leaflet';
import Script from 'next/script'; // Ensure this isnt left over if unused, but we are removing OSMBuildings completely.

export const BuildingLayer = ({ enabled, time }: { enabled: boolean, time: number }) => {
    const map = useMap();
    const [buildings, setBuildings] = useState<any[]>([]);

    // Data Fetching
    const fetchBldgs = async () => {
        if (!enabled) return;
        const zoom = map.getZoom();
        if (zoom < 16) { // Optimization: Only fetch at street level
            setBuildings([]);
            return;
        }

        const b = map.getBounds();
        const bbox = {
            north: b.getNorth(),
            south: b.getSouth(),
            east: b.getEast(),
            west: b.getWest()
        };

        const data = await getBuildings(bbox);
        if (data) setBuildings(data);
    };

    useMapEvents({
        moveend: fetchBldgs
    });

    // Trigger fetch on enable
    useEffect(() => {
        if (enabled) {
            console.log("3D Enabled: Fetching Buildings...");
            fetchBldgs();
        } else {
            setBuildings([]);
        }
    }, [enabled]);


    // Shadow Calculation
    const shadowStyle = useMemo(() => {
        const hourNorm = (time - 6) / (20 - 6); // 0 to 1

        // Calculate dynamic shadow offsets
        // 06:00 -> -15px X
        // 20:00 -> +15px X
        const dx = (hourNorm - 0.5) * 30;

        // Y offset (Shadow always South in visual map usually, or based on sun height)
        const sunHeight = Math.sin(hourNorm * Math.PI);
        const dy = (1 - sunHeight) * 20 + 5;

        const opacity = Math.max(0.3, Math.min(0.6, sunHeight));

        return `
            .immersive-building {
                transition: all 0.5s ease;
                fill: #ffffff;
                stroke: #e4e4e7;
                stroke-width: 1px;
                filter: drop-shadow(${dx}px ${dy}px 3px rgba(0,0,0,${opacity}));
            }
            .immersive-building:hover {
                fill: #eff6ff;
                stroke: #3b82f6;
            }
        `;
    }, [time]);

    if (!enabled) return null;

    return (
        <>
            <style>{shadowStyle}</style>
            {buildings.map((b) => (
                <Polygon
                    key={b.id}
                    positions={b.geometry}
                    pathOptions={{ className: 'immersive-building' }}
                />
            ))}
        </>
    );
};


// --- CONTROLS UI ---
export const ImmersiveControls = ({
    is3D,
    setIs3D,
    time,
    setTime
}: {
    is3D: boolean,
    setIs3D: (v: boolean) => void,
    time: number,
    setTime: (v: number) => void
}) => {
    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex flex-col gap-3 items-center w-full max-w-sm px-4 pointer-events-none">

            {/* 3D Toggle */}
            <div className="pointer-events-auto">
                <Button
                    onClick={() => setIs3D(!is3D)}
                    className={`${is3D ? 'bg-zinc-900 text-white shadow-xl' : 'bg-white text-zinc-700 shadow-md'} rounded-full px-6 py-2 h-10 transition-all duration-300 font-medium text-xs border border-zinc-200 hover:scale-105 active:scale-95`}
                >
                    {is3D ? "Vue 3D Active" : "Activer la 3D"}
                </Button>
            </div>

            {/* Time Slider */}
            {is3D && (
                <div className="pointer-events-auto bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/20 w-full animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <div className="flex justify-between items-center text-xs font-bold text-zinc-500 mb-3 uppercase tracking-wider">
                        <span className="flex items-center gap-1"><Sun size={12} /> {Math.floor(time)}:{(time % 1 * 60).toFixed(0).padStart(2, '0')}</span>
                        <span>Ensoleillement</span>
                    </div>
                    <Slider
                        value={[time]}
                        min={6}
                        max={20}
                        step={0.25}
                        onValueChange={(vals) => setTime(vals[0])}
                        className="cursor-pointer"
                    />
                    <div className="flex justify-between mt-2 text-[10px] text-zinc-400 font-medium">
                        <span>06:00</span>
                        <span>12:00</span>
                        <span>20:00</span>
                    </div>
                </div>
            )}
        </div>
    );
}

