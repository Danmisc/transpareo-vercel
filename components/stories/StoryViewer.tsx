"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { markStoryAsSeen } from "@/lib/actions-stories";
import Image from "next/image";

interface Story {
    id: string;
    mediaUrl: string;
    mediaType: string;
    caption?: string | null;
    createdAt: Date | string;
    user: {
        id: string;
        name: string | null;
        avatar?: string | null;
        image?: string | null;
    };
    isSeen?: boolean;
}

interface StoryGroup {
    user: {
        id: string;
        name: string | null;
        avatar?: string | null;
        image?: string | null;
    };
    items: Story[];
    hasUnseen: boolean;
}

interface StoryViewerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    stories: Story[];
    initialIndex?: number;
    isOwner?: boolean;
    onDelete?: (storyId: string) => void;
}

const STORY_DURATION = 5000; // 5 seconds per story

export function StoryViewer({ open, onOpenChange, stories, initialIndex = 0, isOwner = false, onDelete }: StoryViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [showViewers, setShowViewers] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const currentStory = stories[currentIndex];

    // Progress bar animation
    useEffect(() => {
        if (!open || isPaused || !currentStory) return;

        // Mark as seen
        markStoryAsSeen(currentStory.id);

        const startTime = Date.now();
        const duration = currentStory.mediaType === "VIDEO" ? 15000 : STORY_DURATION;

        intervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min((elapsed / duration) * 100, 100);
            setProgress(newProgress);

            if (newProgress >= 100) {
                goToNext();
            }
        }, 50);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [currentIndex, open, isPaused]);

    // Reset on open
    useEffect(() => {
        if (open) {
            setCurrentIndex(initialIndex);
            setProgress(0);
        }
    }, [open, initialIndex]);

    const goToNext = () => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setProgress(0);
        } else {
            onOpenChange(false);
        }
    };

    const goToPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setProgress(0);
        }
    };

    const handleTap = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const third = rect.width / 3;

        if (x < third) {
            goToPrev();
        } else if (x > third * 2) {
            goToNext();
        } else {
            setIsPaused(!isPaused);
        }
    };

    if (!currentStory) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[420px] h-[90vh] p-0 bg-black border-none rounded-2xl overflow-hidden">
                {/* Progress Bars */}
                <div className="absolute top-2 left-2 right-2 z-30 flex gap-1">
                    {stories.map((_, i) => (
                        <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-100 ease-linear"
                                style={{
                                    width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="absolute top-6 left-0 right-0 z-20 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border-2 border-white/20">
                            <AvatarImage src={currentStory.user.avatar || currentStory.user.image || "/avatars/default.svg"} />
                            <AvatarFallback>{currentStory.user.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-white font-semibold text-sm">{currentStory.user.name}</p>
                            <p className="text-white/60 text-xs">
                                {formatDistanceToNow(new Date(currentStory.createdAt), { addSuffix: true, locale: fr })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsPaused(!isPaused)}
                            className="text-white hover:bg-white/10"
                        >
                            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                        </Button>
                        {currentStory.mediaType === "VIDEO" && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMuted(!isMuted)}
                                className="text-white hover:bg-white/10"
                            >
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onOpenChange(false)}
                            className="text-white hover:bg-white/10"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Story Content */}
                <div
                    className="relative w-full h-full flex items-center justify-center cursor-pointer"
                    onClick={handleTap}
                >
                    {currentStory.mediaType === "VIDEO" ? (
                        <video
                            ref={videoRef}
                            src={currentStory.mediaUrl}
                            className="w-full h-full object-contain"
                            autoPlay
                            muted={isMuted}
                            playsInline
                            loop={false}
                        />
                    ) : (
                        <Image
                            src={currentStory.mediaUrl}
                            alt="Story"
                            fill
                            className="object-contain"
                            priority
                        />
                    )}

                    {/* Navigation Hints */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity">
                        <ChevronLeft className="w-8 h-8 text-white/70" />
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-8 h-8 text-white/70" />
                    </div>
                </div>

                {/* Caption */}
                {currentStory.caption && (
                    <div className="absolute bottom-16 left-4 right-4 z-20">
                        <p className="text-white text-sm bg-black/40 backdrop-blur-sm px-4 py-2 rounded-xl">
                            {currentStory.caption}
                        </p>
                    </div>
                )}

                {/* Owner Actions */}
                {isOwner && (
                    <div className="absolute bottom-4 left-0 right-0 z-20 px-4 flex justify-between items-center">
                        <button
                            onClick={() => setShowViewers(!showViewers)}
                            className="flex items-center gap-2 text-white/80 text-sm hover:text-white transition-colors"
                        >
                            <Eye className="w-4 h-4" />
                            <span>Vues</span>
                        </button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete?.(currentStory.id)}
                            className="text-white/80 hover:text-red-400 hover:bg-red-500/10"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

// ==========================================
// STORY RING (for showing in feed/profile)
// ==========================================

interface StoryRingProps {
    user: {
        id: string;
        name: string | null;
        avatar?: string | null;
        image?: string | null;
    };
    hasUnseen: boolean;
    onClick: () => void;
    size?: "sm" | "md" | "lg";
}

export function StoryRing({ user, hasUnseen, onClick, size = "md" }: StoryRingProps) {
    const sizes = {
        sm: { ring: "w-12 h-12", avatar: "w-10 h-10" },
        md: { ring: "w-16 h-16", avatar: "w-14 h-14" },
        lg: { ring: "w-20 h-20", avatar: "w-[72px] h-[72px]" }
    };

    return (
        <button onClick={onClick} className="flex flex-col items-center gap-1 group">
            <div className={cn(
                "rounded-full p-[2px]",
                sizes[size].ring,
                hasUnseen
                    ? "bg-gradient-to-tr from-orange-500 via-pink-500 to-purple-500"
                    : "bg-zinc-300 dark:bg-zinc-600"
            )}>
                <div className={cn(
                    "rounded-full bg-white dark:bg-zinc-900 p-[2px]",
                    sizes[size].avatar
                )}>
                    <Avatar className={cn("w-full h-full", sizes[size].avatar)}>
                        <AvatarImage src={user.avatar || user.image || "/avatars/default.svg"} />
                        <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                    </Avatar>
                </div>
            </div>
            <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium truncate max-w-[60px] group-hover:text-orange-500 transition-colors">
                {user.name?.split(" ")[0] || "User"}
            </span>
        </button>
    );
}

