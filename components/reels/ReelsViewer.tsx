"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getReels } from "@/lib/actions";
import { Loader2, X, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SingleReel } from "@/components/reels/SingleReel";
import { SkeletonReel } from "@/components/reels/SkeletonReel";
import { cn } from "@/lib/utils";

export function ReelsViewer({ initialReelId, isModal = false }: { initialReelId: string, isModal?: boolean }) {
    const router = useRouter();
    const [reels, setReels] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial Load
    useEffect(() => {
        const fetchReels = async () => {
            setLoading(true);
            const res = await getReels(1, 10);
            if (res.success && res.data) {
                let data = res.data;
                // Find initial reel being opened
                const targetIndex = data.findIndex((r: any) => r.id === initialReelId);

                // Logic: If found, rotate array so it's first
                if (targetIndex > -1) {
                    const target = data[targetIndex];
                    data.splice(targetIndex, 1);
                    data.unshift(target);
                }
                setReels(data);
            }
            setLoading(false);
        };
        fetchReels();
    }, [initialReelId]);

    // Handle Scroll for Active Index
    const handleScroll = () => {
        if (!containerRef.current) return;
        const { scrollTop, clientHeight } = containerRef.current;
        const index = Math.round(scrollTop / clientHeight);
        if (index !== activeIndex) setActiveIndex(index);
    };

    // Close Modal handler
    const handleClose = () => {
        if (isModal) {
            router.back();
        } else {
            router.push('/');
        }
    };

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                containerRef.current?.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
            } else if (e.key === 'ArrowUp') {
                containerRef.current?.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
            } else if (e.key === 'Escape') {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModal]);

    if (loading) return (
        <div className="w-full h-screen bg-black flex justify-center items-center">
            <div className="w-full h-full md:w-[450px]">
                <SkeletonReel />
            </div>
        </div>
    );

    return (
        <div className="relative w-full h-full bg-black flex justify-center">
            {/* Close Button (Absolute Top Right) */}
            <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full hover:bg-black/80 transition text-white"
            >
                <X size={24} />
            </button>

            {/* Desktop Navigation Hints */}
            <div className="fixed right-10 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-4 z-40">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-white/10 hover:bg-white/20 text-white"
                    onClick={() => containerRef.current?.scrollBy({ top: -window.innerHeight, behavior: 'smooth' })}
                >
                    <ChevronUp />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-white/10 hover:bg-white/20 text-white"
                    onClick={() => containerRef.current?.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
                >
                    <ChevronDown />
                </Button>
            </div>


            {/* Snap Container */}
            <div
                ref={containerRef}
                className="w-full h-full md:w-[450px] overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth"
                onScroll={handleScroll}
                style={{ scrollbarWidth: 'none' }} // Firefox
            >
                {reels.map((reel, idx) => (
                    <div key={reel.id} className="w-full h-full snap-start relative bg-zinc-900 border-x border-zinc-800 md:border-none">
                        <SingleReel
                            post={reel}
                            isActive={activeIndex === idx}
                        />
                    </div>
                ))}

                {/* Loading More Indicator */}
                <div className="h-20 flex items-center justify-center snap-start w-full">
                    <Loader2 className="text-white/50 animate-spin" />
                </div>
            </div>
        </div>
    );
}

