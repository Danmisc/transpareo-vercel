"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface LightboxItem {
    url: string;
    type: "IMAGE" | "VIDEO";
    alt?: string;
}

interface LightboxProps {
    open: boolean;
    onClose: () => void;
    items: LightboxItem[];
    initialIndex?: number;
}

export function Lightbox({ open, onClose, items, initialIndex = 0 }: LightboxProps) {
    const [index, setIndex] = useState(initialIndex);

    useEffect(() => {
        if (open) {
            setIndex(initialIndex);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => { document.body.style.overflow = "auto"; };
    }, [open, initialIndex]);

    const handleNext = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIndex((prev) => (prev + 1) % items.length);
    }, [items.length]);

    const handlePrev = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIndex((prev) => (prev - 1 + items.length) % items.length);
    }, [items.length]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!open) return;
        if (e.key === "Escape") onClose();
        if (e.key === "ArrowRight") handleNext();
        if (e.key === "ArrowLeft") handlePrev();
    }, [open, onClose, handleNext, handlePrev]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    if (!open || items.length === 0) return null;

    const currentItem = items[index];

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8"
                    onClick={onClose}
                >
                    {/* Controls */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10 rounded-full"
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(currentItem.url, "_blank");
                            }}
                            title="Ouvrir l'original"
                        >
                            <ExternalLink size={20} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10 rounded-full"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                        >
                            <X size={24} />
                        </Button>
                    </div>

                    {/* Navigation */}
                    {items.length > 1 && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white hover:bg-white/10 rounded-full h-12 w-12 z-50 hidden sm:flex"
                                onClick={handlePrev}
                            >
                                <ChevronLeft size={32} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white hover:bg-white/10 rounded-full h-12 w-12 z-50 hidden sm:flex"
                                onClick={handleNext}
                            >
                                <ChevronRight size={32} />
                            </Button>
                        </>
                    )}

                    {/* Footer Info */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center text-white/50 text-sm pointer-events-none">
                        <span>{index + 1} / {items.length}</span>
                    </div>

                    {/* Content */}
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="relative max-w-full max-h-full flex items-center justify-center overflow-hidden"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                    >
                        {currentItem.type === "VIDEO" ? (
                            <video
                                src={currentItem.url}
                                controls
                                autoPlay
                                className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
                            />
                        ) : (
                            <div className="relative w-full h-full">
                                {/* We use standard img for full control over rendering and aspect ratio in lightbox context, avoiding next/image complexity with unknown dimensions */}
                                <img
                                    src={currentItem.url}
                                    alt={currentItem.alt || "media"}
                                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl select-none"
                                />
                            </div>
                        )}
                    </motion.div>

                </motion.div>
            )}
        </AnimatePresence>
    );
}
