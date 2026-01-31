"use client";

import { useState } from "react";
import { Image as ImageIcon, PlayCircle, Maximize2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CommunityMediaTab({ media = [] }: { media?: any[] }) {
    const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedMediaIndex === null) return;
        setSelectedMediaIndex((prev) => (prev === null || prev === media.length - 1 ? 0 : prev + 1));
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedMediaIndex === null) return;
        setSelectedMediaIndex((prev) => (prev === null || prev === 0 ? media.length - 1 : prev - 1));
    };

    if (media.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white/50 dark:bg-zinc-900/50">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400">
                    <ImageIcon size={32} />
                </div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Galerie vide</h3>
                <p className="text-sm text-zinc-500">Les photos et vidéos partagées apparaîtront ici.</p>
            </div>
        );
    }

    return (
        <>
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 animate-in fade-in duration-500">
                {media.map((item, i) => (
                    <div
                        key={i}
                        className="break-inside-avoid relative group rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 cursor-zoom-in"
                        onClick={() => setSelectedMediaIndex(i)}
                    >
                        <img
                            src={item.src}
                            alt="Media Preview"
                            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            {item.type === "VIDEO" ? (
                                <PlayCircle className="text-white w-10 h-10 drop-shadow-lg scale-95 group-hover:scale-110 transition-transform" />
                            ) : (
                                <Maximize2 className="text-white w-6 h-6 drop-shadow-lg scale-95 group-hover:scale-110 transition-transform" />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox Dialog */}
            <Dialog open={selectedMediaIndex !== null} onOpenChange={(open) => !open && setSelectedMediaIndex(null)}>
                <DialogContent className="max-w-5xl w-full p-0 bg-black/95 border-none shadow-2xl overflow-hidden h-[80vh] flex items-center justify-center focus:outline-none">

                    {/* Close Button defined in DialogContent but customized here if needed, or rely on default X */}

                    <div className="relative w-full h-full flex items-center justify-center group/lightbox">

                        {/* Navigation Buttons */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-4 z-50 text-white/50 hover:text-white hover:bg-white/10 rounded-full h-12 w-12 opacity-0 group-hover/lightbox:opacity-100 transition-opacity"
                            onClick={handlePrev}
                        >
                            <ChevronLeft size={32} />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 z-50 text-white/50 hover:text-white hover:bg-white/10 rounded-full h-12 w-12 opacity-0 group-hover/lightbox:opacity-100 transition-opacity"
                            onClick={handleNext}
                        >
                            <ChevronRight size={32} />
                        </Button>

                        {/* Media Content */}
                        {selectedMediaIndex !== null && (
                            media[selectedMediaIndex].type === "VIDEO" ? (
                                <div className="w-full h-full flex items-center justify-center p-4">
                                    {/* Just a placeholder for video playback logic */}
                                    <video
                                        src={media[selectedMediaIndex].src}
                                        controls
                                        className="max-h-full max-w-full rounded-lg shadow-2xl"
                                        poster={media[selectedMediaIndex].src} // Fallback to image if src is same
                                    >
                                        Votre navigateur ne supporte pas la lecture de vidéos.
                                    </video>
                                </div>
                            ) : (
                                <div className="relative w-full h-full">
                                    <img
                                        src={media[selectedMediaIndex].src}
                                        alt="Full View"
                                        className="w-full h-full object-contain p-4"
                                    />
                                </div>
                            )
                        )}

                        {/* Caption overlay */}
                        {selectedMediaIndex !== null && (
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white opacity-0 group-hover/lightbox:opacity-100 transition-opacity">
                                <p className="text-sm font-medium text-center">Media {selectedMediaIndex + 1} sur {media.length}</p>
                            </div>
                        )}

                    </div>

                </DialogContent>
            </Dialog>
        </>
    );
}
