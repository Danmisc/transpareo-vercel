"use client";

import { useState } from "react";
import ImageLightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Button } from "@/components/ui/button";
import { Grid, ImageIcon } from "lucide-react";

interface ListingImageGalleryProps {
    images: { url: string }[];
    title: string;
}

export function ListingImageGallery({ images, title }: ListingImageGalleryProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const safeImages = images && images.length > 0
        ? images
        : [{ url: "https://placehold.co/600x400?text=No+Image" }];

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    return (
        <>
            <div className="relative rounded-[2rem] overflow-hidden grid grid-cols-1 md:grid-cols-4 grid-rows-2 h-[40vh] md:h-[500px] gap-3 mb-8 group ring-1 ring-black/5 bg-zinc-100 dark:bg-zinc-900">
                {/* Main Large Image */}
                <div
                    className="col-span-2 row-span-2 relative cursor-pointer"
                    onClick={() => openLightbox(0)}
                >
                    <img
                        src={safeImages[0]?.url}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 bg-zinc-100 dark:bg-zinc-900"
                        alt={title}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>

                {/* Side Images (Desktop Only) */}
                {[1, 2, 3, 4].map((idx) => (
                    <div
                        key={idx}
                        className="hidden md:block relative cursor-pointer overflow-hidden"
                        onClick={() => openLightbox(idx < safeImages.length ? idx : 0)}
                    >
                        {safeImages[idx] ? (
                            <img
                                src={safeImages[idx].url}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 bg-zinc-100 dark:bg-zinc-900"
                                alt={`${title} - view ${idx}`}
                            />
                        ) : (
                            <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-300">
                                <ImageIcon size={24} className="opacity-20" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300" />
                    </div>
                ))}

                {/* View All Button - Redesigned */}
                <button
                    onClick={() => setLightboxOpen(true)}
                    className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-zinc-900 px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-black/5 flex items-center gap-2 transition-all hover:scale-105 z-10 ring-1 ring-black/5"
                >
                    <Grid size={16} className="text-orange-600" />
                    <span>Galerie photos</span>
                </button>
            </div>

            {/* Lightbox */}
            {lightboxOpen && (
                <ImageLightbox
                    open={lightboxOpen}
                    close={() => setLightboxOpen(false)}
                    index={lightboxIndex}
                    slides={safeImages.map(img => ({ src: img.url }))}
                />
            )}
        </>
    );
}

