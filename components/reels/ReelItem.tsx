"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";
import { ReelOverlay } from "./ReelOverlay";
import { Loader2 } from "lucide-react";

interface ReelItemProps {
    post: any;
    isActive: boolean;
    shouldLoad: boolean; // For preloading thumbnail/metadata
    isDesktop?: boolean;
}

export function ReelItem({ post, isActive, shouldLoad, isDesktop = false }: ReelItemProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showHeartAnimation, setShowHeartAnimation] = useState(false);
    const lastTapRef = useRef<number>(0);

    // Effect to handle Play/Pause based on Active state
    useEffect(() => {
        if (isActive) {
            // Slight delay to allow smooth scroll finish
            const timer = setTimeout(() => {
                videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
            }, 300);
            return () => clearTimeout(timer);
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
            if (videoRef.current) {
                videoRef.current.currentTime = 0;
                setProgress(0);
            }
        }
    }, [isActive]);

    const togglePlay = () => {
        if (videoRef.current?.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!videoRef.current) return;
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(videoRef.current.muted);
    };

    const handleVideoClick = (e: React.MouseEvent) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
            // Double Tap Detected
            handleLike();
        } else {
            // Single Tap (Wait to see if double tap happens? Or just toggle play immediately?)
            // For snappiness, we toggle play immediately. Double tap will just re-toggle or we can ignore play toggle on double tap 
            // if we really want to separate them, but standard behavior usually accepts the "pause-like-play" glitch or handles it.
            // Let's just toggle play.
            togglePlay();
        }
        lastTapRef.current = now;
    };

    const handleLike = () => {
        setShowHeartAnimation(true);
        setTimeout(() => setShowHeartAnimation(false), 800);
        // Call backend like API here
        console.log("Liked video:", post.id);
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const duration = videoRef.current.duration;
            if (duration > 0) {
                setProgress((current / duration) * 100);
            }
        }
    };

    return (
        <div
            className="relative w-full h-full md:h-full snap-start bg-black flex items-center justify-center overflow-hidden touch-manipulation"
            onClick={handleVideoClick}
        >
            {/* 3-PLAYER RECYCLING PATTERN */}
            {shouldLoad ? (
                <>
                    <video
                        ref={videoRef}
                        src={post.video?.url || post.image} // Fallback?
                        className="w-full h-full object-cover"
                        loop
                        playsInline
                        muted={isMuted}
                        onTimeUpdate={handleTimeUpdate}
                    />
                    {/* Overlay */}
                    <ReelOverlay
                        post={post}
                        isPlaying={isPlaying}
                        isMuted={isMuted}
                        onToggleMute={toggleMute}
                        progress={progress}
                        showHeartAnimation={showHeartAnimation}
                        isDesktop={isDesktop}
                    />
                </>
            ) : (
                // Placeholder unloading
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                    <Loader2 className="h-10 w-10 text-zinc-700 animate-spin" />
                </div>
            )}
        </div>
    );
}
