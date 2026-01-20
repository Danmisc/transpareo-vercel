"use client";

import { useState } from "react";
import { Plus, Play, MoreVertical, Trash, Edit, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PitchPlayerDialog } from "./PitchPlayerDialog";
import { PitchRecorder } from "./PitchRecorder";

interface ProfilePitchProps {
    isOwner: boolean;
    videoUrl?: string | null;
    thumbnailUrl?: string | null;
    duration?: number | null;
    userName?: string;
}

export function ProfilePitch({ isOwner, videoUrl, thumbnailUrl, duration, userName }: ProfilePitchProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [showPlayer, setShowPlayer] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    // Formatted duration 0:00
    const formatDuration = (seconds?: number | null) => {
        if (!seconds) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!videoUrl && !isOwner) {
        return null; // Visitor sees nothing if no pitch
    }

    // EMPTY STATE (Owner only)
    if (!videoUrl && isOwner) {
        return (
            <div className="group relative w-full aspect-video rounded-2xl bg-gradient-to-br from-zinc-100 to-white dark:from-zinc-900 dark:to-zinc-950 border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all cursor-pointer overflow-hidden">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Plus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Ajouter mon Pitch</h3>
                    <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">
                        Présentez-vous en vidéo pour booster votre profil et votre confiance.
                    </p>
                </div>

                {/* Click entire area to trigger recording */}
                <div className="absolute inset-0 z-10" onClick={() => setIsRecording(true)} />

                <PitchRecorder
                    isOpen={isRecording}
                    onClose={() => setIsRecording(false)}
                    onSave={async (file) => {
                        console.log("Saving file:", file);
                        setIsRecording(false);
                    }}
                />
            </div>
        );
    }

    // VIDEO PRESENT STATE
    return (
        <div
            className="group relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-zinc-200 dark:border-zinc-800 shadow-sm"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Thumbnail / Cover */}
            {thumbnailUrl ? (
                <img
                    src={thumbnailUrl}
                    alt={`Pitch de ${userName}`}
                    className={cn(
                        "w-full h-full object-cover transition-transform duration-700",
                        isHovering ? "scale-105" : "scale-100"
                    )}
                />
            ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                    <span className="text-zinc-700 font-medium">No Thumbnail</span>
                </div>
            )}

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* Play Button (Center) */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className={cn(
                    "w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300",
                    isHovering ? "scale-110 bg-white/20" : "scale-100"
                )}>
                    <Play className="w-6 h-6 text-white fill-white ml-1" />
                </div>
            </div>

            {/* Duration Badge (Bottom Right) */}
            <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-white/10">
                <span className="text-[10px] font-bold text-white font-mono">
                    {formatDuration(duration)}
                </span>
            </div>

            {/* Title / Badge (Bottom Left) */}
            <div className="absolute bottom-3 left-3">
                <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-md bg-indigo-500/90 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/20">
                        My Pitch
                    </span>
                </div>
            </div>

            {/* Owner Actions (Top Right) */}
            {isOwner && (
                <div className="absolute top-3 right-3 z-20">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm border border-white/10">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem className="cursor-pointer" onClick={() => setIsRecording(true)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => setIsRecording(true)}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Remplacer
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 focus:text-red-700 cursor-pointer">
                                <Trash className="w-4 h-4 mr-2" />
                                Supprimer
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            {/* CLICK TO PLAY */}
            <div className="absolute inset-0 z-10 cursor-pointer" onClick={() => setShowPlayer(true)} />

            {/* PLAYER DIALOG */}
            {videoUrl && (
                <PitchPlayerDialog
                    isOpen={showPlayer}
                    onClose={() => setShowPlayer(false)}
                    videoUrl={videoUrl}
                />
            )}

            {/* RECORDER DIALOG */}
            {isOwner && (
                <PitchRecorder
                    isOpen={isRecording}
                    onClose={() => setIsRecording(false)}
                    onSave={async (file) => {
                        console.log("Saving file:", file);
                        setIsRecording(false);
                    }}
                />
            )}
        </div>
    );
}
