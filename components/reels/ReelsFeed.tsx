"use client";

import { useEffect, useState, useRef } from "react";
import { getReels } from "@/lib/actions";
import { ReelItem } from "./ReelItem";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReelsFeed() {
    const [reels, setReels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadReels();
    }, []);

    const loadReels = async () => {
        setLoading(true);
        const res = await getReels(1, 10);
        if (res.success && res.data) {
            setReels(res.data);
        }
        setLoading(false);
    };

    const handleScroll = () => {
        if (!containerRef.current) return;

        // Calculate which index is in view based on scroll position
        const scrollTop = containerRef.current.scrollTop;
        const clientHeight = containerRef.current.clientHeight;
        const index = Math.round(scrollTop / clientHeight);

        if (index !== currentIndex) {
            setCurrentIndex(index);
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (containerRef.current?.scrollTop === 0) {
            // Logic for pull to refresh start could go here
        }
    };

    const refreshFeed = async () => {
        setRefreshing(true);
        await loadReels();
        setRefreshing(false);
    };

    if (loading) {
        return (
            <div className="w-full h-[100dvh] flex items-center justify-center bg-black text-white">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (reels.length === 0) {
        return (
            <div className="w-full h-[100dvh] flex flex-col items-center justify-center bg-black text-white gap-4">
                <p>Aucun reel disponible pour le moment.</p>
                <Button onClick={loadReels} variant="secondary">Actualiser</Button>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-black flex justify-center relative overflow-hidden">
            {/* Desktop Ambient Background (Blurred version of active reel - approximated with gradient for now) */}
            <div className="absolute inset-0 hidden md:block opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900 via-black to-black pointer-events-none" />

            {/* Pull to Refresh Indicator */}
            <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-opacity ${refreshing ? 'opacity-100' : 'opacity-0'}`}>
                <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>

            <div
                ref={containerRef}
                className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-none md:w-[420px] md:mx-auto md:my-6 md:h-[calc(100vh-6rem)] md:rounded-[32px] md:overflow-hidden md:border-[6px] md:border-zinc-800 md:shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)] relative bg-black z-10"
                onScroll={handleScroll}
            >
                {reels.map((reel, index) => {
                    // 3-PLAYER LOGIC:
                    const isActive = index === currentIndex;
                    const shouldLoad = Math.abs(index - currentIndex) <= 1;

                    return (
                        <ReelItem
                            key={reel.id}
                            post={reel}
                            isActive={isActive}
                            shouldLoad={shouldLoad}
                        />
                    );
                })}

                <div className="snap-start h-1 w-full" />
            </div>

            {/* Simple Floating Action Button for Creation (Mobile Only usually, or keep) */}
            <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-20">
                <Button size="icon" className="h-12 w-12 rounded-full shadow-lg bg-pink-600 hover:bg-pink-700 text-white" asChild>
                    <a href="/reels/create">
                        <Plus size={24} />
                    </a>
                </Button>
            </div>
        </div>
    );
}
