"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import WaveSurfer from "wavesurfer.js";

interface VoiceMessagePlayerProps {
    src: string;
    isMe: boolean;
    isOptimistic?: boolean;
}

export function VoiceMessagePlayer({ src, isMe, isOptimistic }: VoiceMessagePlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const waveSurferRef = useRef<WaveSurfer | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!containerRef.current || isOptimistic) return;

        const wavesurfer = WaveSurfer.create({
            container: containerRef.current,
            waveColor: isMe ? "#fed7aa" : "#E4E4E7",
            progressColor: isMe ? "#FFFFFF" : "#F97316",
            cursorColor: "transparent",
            barWidth: 2,
            barGap: 2,
            barRadius: 2,
            height: 26,
            normalize: true,
            backend: "WebAudio",
            url: src,
            minPxPerSec: 1,
            fillParent: true,
            interact: true,
        });

        wavesurfer.on('ready', () => {
            setDuration(wavesurfer.getDuration());
            setIsReady(true);
        });

        wavesurfer.on('audioprocess', () => {
            setCurrentTime(wavesurfer.getCurrentTime());
        });

        wavesurfer.on('finish', () => {
            setIsPlaying(false);
            wavesurfer.seekTo(0);
        });

        wavesurfer.on('play', () => setIsPlaying(true));
        wavesurfer.on('pause', () => setIsPlaying(false));

        wavesurfer.on('interaction', () => {
            setCurrentTime(wavesurfer.getCurrentTime());
        });

        waveSurferRef.current = wavesurfer;

        return () => {
            wavesurfer.destroy();
        };
    }, [src, isMe, isOptimistic]);

    // Update playback rate
    useEffect(() => {
        if (waveSurferRef.current && isReady) {
            waveSurferRef.current.setPlaybackRate(playbackRate);
        }
    }, [playbackRate, isReady]);

    const togglePlay = () => {
        if (waveSurferRef.current) {
            waveSurferRef.current.playPause();
        }
    };

    const cycleSpeed = (e: React.MouseEvent) => {
        e.stopPropagation();
        const speeds = [1, 1.5, 2];
        const nextIndex = (speeds.indexOf(playbackRate) + 1) % speeds.length;
        setPlaybackRate(speeds[nextIndex]);
    };

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className={cn(
            "flex items-center gap-3 px-1 py-0.5 min-w-[200px] select-none group",
            // Parent handles background
        )}>
            {/* Play Button */}
            <button
                onClick={togglePlay}
                disabled={isOptimistic}
                type="button"
                className={cn(
                    "w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full shadow-sm transition-all active:scale-95 relative",
                    isMe ? "bg-white text-orange-600 hover:bg-orange-50" : "bg-white dark:bg-zinc-800 text-orange-500 hover:bg-zinc-50 dark:hover:bg-zinc-700",
                    isOptimistic && "opacity-50 cursor-not-allowed"
                )}
            >
                {isOptimistic ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : isPlaying ? (
                    <Pause size={16} className="fill-current" />
                ) : (
                    <Play size={16} className="fill-current ml-0.5" />
                )}
            </button>

            {/* Waveform & Metadata */}
            <div className="flex-1 flex flex-col gap-0.5 min-w-[140px]">
                {/* Waveform */}
                <div ref={containerRef} className="w-full h-[26px] cursor-pointer" />

                {/* Info Row: Time & Speed */}
                <div className="flex items-center justify-between text-[11px] font-medium tabular-nums px-0.5 h-4 mt-0.5">
                    <span className={cn(isMe ? "text-white/90" : "text-zinc-500 dark:text-zinc-400")}>
                        {formatTime(isPlaying ? currentTime : duration)}
                    </span>

                    <button
                        onClick={cycleSpeed}
                        type="button"
                        className={cn(
                            "px-1.5 rounded text-[10px] font-bold transition-all opacity-0 group-hover:opacity-100 cursor-pointer relative z-10",
                            isMe
                                ? "text-white/90 hover:bg-white/20"
                                : "text-zinc-500 hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-zinc-800"
                        )}
                    >
                        {playbackRate}x
                    </button>
                </div>
            </div>
        </div>
    );
}
