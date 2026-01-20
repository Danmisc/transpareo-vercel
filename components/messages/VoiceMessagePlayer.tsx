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

    useEffect(() => {
        if (!containerRef.current || isOptimistic) return;

        const wavesurfer = WaveSurfer.create({
            container: containerRef.current,
            waveColor: isMe ? "rgba(255, 255, 255, 0.5)" : "#E4E4E7", // Zinc-200
            progressColor: isMe ? "#FFFFFF" : "#F97316", // Orange-500
            cursorColor: "transparent",
            barWidth: 2,
            barGap: 3,
            barRadius: 3,
            height: 32,
            normalize: true,
            backend: "WebAudio",
            url: src,
        });

        wavesurfer.on('ready', () => {
            setDuration(wavesurfer.getDuration());
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

        waveSurferRef.current = wavesurfer;

        return () => {
            wavesurfer.destroy();
        };
    }, [src, isMe, isOptimistic]);

    // Update playback rate
    useEffect(() => {
        if (waveSurferRef.current) {
            waveSurferRef.current.setPlaybackRate(playbackRate);
        }
    }, [playbackRate]);

    const togglePlay = () => {
        if (waveSurferRef.current) {
            waveSurferRef.current.playPause();
        }
    };

    const cycleSpeed = () => {
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
            "flex items-center gap-3 p-2 rounded-2xl min-w-[240px] transition-all",
            "bg-transparent"
        )}>
            <button
                onClick={togglePlay}
                disabled={isOptimistic}
                type="button"
                className={cn(
                    "w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full shadow-sm transition-all active:scale-95",
                    isMe ? "bg-white text-orange-600" : "bg-orange-500 text-white",
                    isOptimistic && "opacity-50 cursor-not-allowed"
                )}
            >
                {isOptimistic ? (
                    <Loader2 size={18} className="animate-spin" />
                ) : isPlaying ? (
                    <Pause size={18} className="fill-current" />
                ) : (
                    <Play size={18} className="fill-current ml-0.5" />
                )}
            </button>

            <div className="flex-1 flex flex-col justify-center gap-1 min-w-[120px]">
                {/* Waveform Container */}
                <div ref={containerRef} className="w-full" />

                <div className="flex items-center justify-between px-1">
                    <span className={cn("text-[10px] font-medium font-mono", isMe ? "text-white/80" : "text-zinc-500")}>
                        {formatTime(isPlaying ? currentTime : duration)}
                    </span>
                    <span className={cn("text-[10px] font-medium font-mono", isMe ? "text-white/80" : "text-zinc-500")}>
                        {formatTime(duration)}
                    </span>
                </div>
            </div>

            {/* Speed Control */}
            <button
                onClick={cycleSpeed}
                type="button"
                className={cn(
                    "h-8 px-2 text-[10px] font-bold rounded-lg transition-colors border",
                    isMe
                        ? "bg-white/20 text-white border-white/20 hover:bg-white/30"
                        : "bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100"
                )}
            >
                {playbackRate}x
            </button>
        </div>
    );
}

