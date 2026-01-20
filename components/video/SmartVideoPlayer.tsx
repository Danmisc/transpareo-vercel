"use client";

import { useRef, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useVideo } from "@/components/video/VideoProvider";
import { cn } from "@/lib/utils";
import { Volume2, VolumeX, Play, Heart } from "lucide-react";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface SmartVideoPlayerProps {
    src: string | null | undefined;
    className?: string;
    aspectRatio?: "square" | "vertical" | "auto";
    isPlayingProp?: boolean; // Manual override
    poster?: string;
    autoPlayInView?: boolean;
    onDoubleTap?: () => void;
}

export function SmartVideoPlayer({
    src,
    className,
    aspectRatio = "auto",
    isPlayingProp,
    poster,
    autoPlayInView = true,
    onDoubleTap
}: SmartVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { isMuted, toggleMute } = useVideo();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showHeartAnimation, setShowHeartAnimation] = useState(false);
    const lastTapRef = useRef<number>(0);

    // Intersection Observer
    // threshold 0.6 means 60% of video must be visible to play
    const { ref, inView } = useInView({
        threshold: 0.6,
    });

    // Combine refs
    const setRefs = (element: HTMLVideoElement) => {
        // @ts-ignore
        ref(element);
        // @ts-ignore
        videoRef.current = element;
    };

    // Auto Play/Pause Logic
    useEffect(() => {
        if (!videoRef.current) return;

        if (isPlayingProp !== undefined) {
            // Manual Override Mode (e.g., in a Reels Feed where parent controls exact active slide)
            if (isPlayingProp) {
                videoRef.current.play().catch(() => { });
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        } else if (autoPlayInView) {
            // Auto In-View Mode (Feed)
            if (inView) {
                const playPromise = videoRef.current.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => setIsPlaying(true))
                        .catch(() => setIsPlaying(false));
                }
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    }, [inView, isPlayingProp, autoPlayInView]);

    // Handle Loading State
    const handleCanPlay = () => {
        setIsLoading(false);
    };

    const handleWaiting = () => {
        setIsLoading(true);
    };

    const handleContainerClick = (e: React.MouseEvent) => {
        e.stopPropagation();

        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
            // Double Tap
            if (onDoubleTap) onDoubleTap();
            setShowHeartAnimation(true);
            setTimeout(() => setShowHeartAnimation(false), 800);

            // Ensure playing if paused
            if (!isPlaying && videoRef.current) {
                videoRef.current.play();
                setIsPlaying(true);
            }
        } else {
            // Single Tap (Toggle Play)
            // Ideally should wait, but we toggle for speed
            if (videoRef.current) {
                if (isPlaying) {
                    videoRef.current.pause();
                    setIsPlaying(false);
                } else {
                    videoRef.current.play();
                    setIsPlaying(true);
                }
            }
        }
        lastTapRef.current = now;
    };

    const handleMuteToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleMute();
    };

    return (
        <div
            className={cn(
                "relative bg-black overflow-hidden group cursor-pointer",
                aspectRatio === "vertical" ? "aspect-[9/16]" :
                    aspectRatio === "square" ? "aspect-square" : "",
                className
            )}
            onClick={handleContainerClick}
        >
            {src ? (
                <video
                    ref={setRefs}
                    src={src}
                    className="w-full h-full object-cover"
                    muted={isMuted}
                    loop
                    playsInline
                    poster={poster}
                    onCanPlay={handleCanPlay}
                    onWaiting={handleWaiting}
                />
            ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700">
                    No Media
                </div>
            )}

            {/* Loading Spinner */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10 pointer-events-none">
                    <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
                </div>
            )}

            {/* Heart Burst Animation */}
            <AnimatePresence>
                {showHeartAnimation && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                        <motion.div
                            initial={{ scale: 0, opacity: 0, rotate: -30 }}
                            animate={{ scale: 1.5, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                            <Heart size={80} className="fill-white text-white drop-shadow-xl opacity-90" />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Controls Overlay (Visible on Hover / Tap) */}
            {/* Volume Toggle */}
            <button
                onClick={handleMuteToggle}
                className="absolute bottom-3 right-3 p-2 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md text-white transition-opacity opacity-0 group-hover:opacity-100 touch-available:opacity-100 z-20"
            >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            {/* Center Play Button (only when paused and NOT loading) */}
            {!isPlaying && !isLoading && !showHeartAnimation && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/30 p-4 rounded-full backdrop-blur-sm">
                        <Play size={32} className="fill-white text-white ml-1" />
                    </div>
                </div>
            )}
        </div>
    );
}

