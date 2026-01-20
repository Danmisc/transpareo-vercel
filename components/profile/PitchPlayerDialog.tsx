"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X, Play, Pause, Volume2, VolumeX, Edit, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface PitchPlayerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    videoUrl?: string;
    onEdit?: () => void;
    onDelete?: () => Promise<void>; // New prop for delete
}

export function PitchPlayerDialog({ isOpen, onClose, videoUrl, onEdit, onDelete }: PitchPlayerDialogProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    let controlsTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isOpen) {
            setIsPlaying(true);
            setProgress(0);
            setIsMuted(false);
            setShowDeleteConfirm(false);
        }
    }, [isOpen]);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const togglePlay = () => {
        if (showDeleteConfirm) return; // Disable play toggle during confirm
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setProgress(videoRef.current.currentTime);
            setDuration(videoRef.current.duration || 0);
        }
    };

    const handleSeek = (value: number[]) => {
        if (videoRef.current) {
            videoRef.current.currentTime = value[0];
            setProgress(value[0]);
        }
    };

    const handleMouseMove = () => {
        if (showDeleteConfirm) return;
        setShowControls(true);
        if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
        controlsTimeout.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    };

    const handleDeleteClick = () => {
        if (videoRef.current) videoRef.current.pause();
        setIsPlaying(false);
        setShowDeleteConfirm(true);
        setShowControls(false);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        if (videoRef.current) videoRef.current.play();
        setIsPlaying(true);
    };

    const confirmDelete = async () => {
        if (onDelete) {
            setIsDeleting(true);
            await onDelete();
            // Parent usually handles reload/close
        }
    };

    if (!videoUrl) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onClose()}>
            <DialogContent className="max-w-md p-0 bg-transparent border-none shadow-none focus:outline-none overflow-hidden flex items-center justify-center">
                <DialogTitle className="sr-only">Lecture du Pitch</DialogTitle>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative bg-black rounded-[2rem] overflow-hidden shadow-2xl w-full aspect-[9/16] max-h-[80vh] border border-white/10 group"
                    onMouseMove={handleMouseMove}
                    onClick={togglePlay}
                >
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        playsInline
                        onTimeUpdate={handleTimeUpdate}
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Gradient Overlay for controls visibility */}
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

                    {/* DELETE CONFIRMATION OVERLAY */}
                    <AnimatePresence>
                        {showDeleteConfirm && (
                            <motion.div
                                initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                                animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
                                exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                                className="absolute inset-0 bg-black/60 z-[60] flex flex-col items-center justify-center p-6 text-center"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <motion.div
                                    initial={{ scale: 0.9, y: 10 }}
                                    animate={{ scale: 1, y: 0 }}
                                    className="bg-zinc-900 border border-white/10 p-6 rounded-2xl shadow-xl max-w-xs w-full"
                                >
                                    <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Trash2 className="w-6 h-6 text-red-500" />
                                    </div>
                                    <h3 className="text-white font-bold text-lg mb-2">Supprimer le pitch ?</h3>
                                    <p className="text-zinc-400 text-sm mb-6">
                                        Cette action est irréversible. Votre présentation vidéo sera définitivement effacée.
                                    </p>

                                    <div className="flex gap-3">
                                        <Button variant="outline" className="flex-1 border-white/10 hover:bg-white/5 hover:text-white" onClick={cancelDelete} disabled={isDeleting}>
                                            Annuler
                                        </Button>
                                        <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none" onClick={confirmDelete} disabled={isDeleting}>
                                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Supprimer"}
                                        </Button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* TOP CONTROLS */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: (showControls && !showDeleteConfirm) ? 1 : 0 }}
                        className="absolute top-5 inset-x-5 flex items-center justify-between z-50 pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex gap-2">
                            {/* EDIT BUTTON */}
                            {onEdit && (
                                <motion.button
                                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                                    whileTap={{ scale: 0.9 }}
                                    className="bg-black/30 backdrop-blur-md text-white p-2 rounded-full border border-white/10 shadow-lg"
                                    onClick={onEdit}
                                    title="Modifier le pitch"
                                >
                                    <Edit className="w-4 h-4" />
                                </motion.button>
                            )}
                            {/* DELETE BUTTON */}
                            {onDelete && (
                                <motion.button
                                    whileHover={{ scale: 1.1, backgroundColor: "rgba(239,68,68,0.2)" }}
                                    whileTap={{ scale: 0.9 }}
                                    className="bg-black/30 backdrop-blur-md text-red-400 hover:text-red-300 p-2 rounded-full border border-white/10 shadow-lg"
                                    onClick={handleDeleteClick}
                                    title="Supprimer le pitch"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </motion.button>
                            )}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-black/30 backdrop-blur-md text-white p-2 rounded-full border border-white/10 shadow-lg"
                            onClick={onClose}
                        >
                            <X className="w-4 h-4" />
                        </motion.button>

                    </motion.div>

                    {/* CENTER PLAY BUTTON */}
                    <AnimatePresence>
                        {!isPlaying && !showDeleteConfirm && (
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            >
                                <div className="bg-white/10 backdrop-blur-lg p-6 rounded-full border border-white/20 shadow-2xl">
                                    <Play className="w-12 h-12 text-white fill-white ml-1.5" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* CONTROLS */}
                    <motion.div
                        className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-4 z-40"
                        animate={{ opacity: (showControls && !showDeleteConfirm) ? 1 : 0, y: (showControls && !showDeleteConfirm) ? 0 : 20 }}
                        transition={{ duration: 0.3 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Progress Bar */}
                        <div className="flex items-center gap-3 text-xs font-medium text-white/90">
                            <span className="w-9 text-right font-mono">{formatTime(progress)}</span>
                            <Slider
                                value={[progress]}
                                max={duration || 100}
                                step={0.1}
                                onValueChange={handleSeek}
                                className="flex-1 cursor-pointer"
                            />
                            <span className="w-9 font-mono">{formatTime(duration)}</span>
                        </div>

                        {/* Controls Row */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <button onClick={togglePlay} className="text-white hover:text-white/80 transition-colors">
                                    {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
                                </button>
                                <button onClick={() => {
                                    if (videoRef.current) {
                                        videoRef.current.muted = !isMuted;
                                        setIsMuted(!isMuted);
                                    }
                                }} className="text-white/80 hover:text-white transition-colors">
                                    {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                                </button>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-white/70">
                                    Mon Pitch
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
