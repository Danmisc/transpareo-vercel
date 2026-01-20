"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, PictureInPicture, Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VideoPlayerProps {
    src: string;
    poster?: string;
    autoPlay?: boolean; // legacy, initial only
    shouldPlay?: boolean; // dynamic control
    className?: string;
}

export function VideoPlayer({ src, poster, autoPlay = false, shouldPlay = false, className }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(true); // Default muted for autoplay
    const [duration, setDuration] = useState(0);
    const [isBuffering, setIsBuffering] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showControls, setShowControls] = useState(true);
    const controlsTimeoutRef = useRef<NodeJS.Timeout>(null);

    const [isSeeking, setIsSeeking] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onTimeUpdate = () => {
            if (!isSeeking) {
                setProgress((video.currentTime / video.duration) * 100);
            }
        };
        const onLoadedMetadata = () => setDuration(video.duration);
        const onWaiting = () => setIsBuffering(true);
        const onPlaying = () => setIsBuffering(false);
        const onEnded = () => setIsPlaying(false);

        video.addEventListener("timeupdate", onTimeUpdate);
        video.addEventListener("loadedmetadata", onLoadedMetadata);
        video.addEventListener("waiting", onWaiting);
        video.addEventListener("playing", onPlaying);
        video.addEventListener("ended", onEnded);

        return () => {
            video.removeEventListener("timeupdate", onTimeUpdate);
            video.removeEventListener("loadedmetadata", onLoadedMetadata);
            video.removeEventListener("waiting", onWaiting);
            video.removeEventListener("playing", onPlaying);
            video.removeEventListener("ended", onEnded);
        };
    }, [isSeeking]);

    // React to shouldPlay prop change (from Intersection Observer)
    useEffect(() => {
        if (!videoRef.current) return;

        if (shouldPlay) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    setIsPlaying(true);
                }).catch((error) => {
                    console.log("Autoplay prevented:", error);
                    setIsPlaying(false);
                });
            }
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [shouldPlay]);

    // Initial Autoplay (Legacy support)
    useEffect(() => {
        if (autoPlay && videoRef.current && shouldPlay) {
            // Only if both are true or just autoPlay? 
            // Actually if we use IntersectionObserver, autoPlay prop is less relevant for feed.
        }
    }, []);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleSeekChange = (val: number[]) => {
        setIsSeeking(true);
        setProgress(val[0]);
    };

    const handleSeekCommit = (val: number[]) => {
        if (!videoRef.current) return;
        const newTime = (val[0] / 100) * duration;
        videoRef.current.currentTime = newTime;
        // Small delay to allow value to settle before resuming updates
        setTimeout(() => setIsSeeking(false), 100);
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleVolumeChange = (val: number[]) => {
        if (!videoRef.current) return;
        const newVol = val[0];
        videoRef.current.volume = newVol;
        setVolume(newVol);
        setIsMuted(newVol === 0);
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            containerRef.current.requestFullscreen();
        }
    };

    const togglePiP = async () => {
        if (!videoRef.current) return;
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
        } else {
            await videoRef.current.requestPictureInPicture();
        }
    };

    const changeSpeed = (speed: number) => {
        if (!videoRef.current) return;
        videoRef.current.playbackRate = speed;
        setPlaybackRate(speed);
    };

    const formatTime = (seconds: number) => {
        if (!seconds) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        // @ts-ignore
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    };

    return (
        <div
            ref={containerRef}
            className={cn("relative group bg-black rounded-lg overflow-hidden aspect-video", className)}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
                playsInline
            />

            {/* Loading Spinner */}
            {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Loader2 className="h-10 w-10 text-white animate-spin opacity-80" />
                </div>
            )}

            {/* Play/Pause Overlay (Center) */}
            {!isPlaying && !isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/50 rounded-full p-4 backdrop-blur-sm">
                        <Play className="h-8 w-8 text-white fill-white ml-1" />
                    </div>
                </div>
            )}

            {/* Controls Gradient */}
            <div className={cn(
                "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pb-2 pt-12 transition-opacity duration-300",
                showControls ? "opacity-100" : "opacity-0"
            )}>
                {/* Progress Bar */}
                <div className="mb-2 group/slider">
                    <Slider
                        value={[progress]}
                        max={100}
                        step={0.1}
                        onValueChange={handleSeekChange}
                        onValueCommit={handleSeekCommit}
                        className="cursor-pointer"
                    />
                </div>

                <div className="flex items-center justify-between gap-2 text-white">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={togglePlay}>
                            {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
                        </Button>

                        <div className="flex items-center gap-2 group/volume">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={toggleMute}>
                                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                            </Button>
                            <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300">
                                <Slider
                                    value={[isMuted ? 0 : volume]}
                                    max={1}
                                    step={0.1}
                                    onValueChange={handleVolumeChange}
                                    className="w-20"
                                />
                            </div>
                        </div>

                        <span className="text-xs font-medium tabular-nums ml-2">
                            {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                                    <Settings className="h-4 w-4" />
                                    <span className="sr-only">Settings</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32">
                                <DropdownMenuItem disabled className="text-xs font-semibold opacity-50">Vitesse</DropdownMenuItem>
                                {[0.5, 1, 1.5, 2].map(rate => (
                                    <DropdownMenuItem key={rate} onClick={() => changeSpeed(rate)} className="justify-between">
                                        {rate}x
                                        {playbackRate === rate && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={togglePiP}>
                            <PictureInPicture className="h-4 w-4" />
                        </Button>

                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={toggleFullscreen}>
                            <Maximize className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

