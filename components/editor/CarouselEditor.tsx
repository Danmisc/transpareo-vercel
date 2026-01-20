"use client";

import { useState, useRef } from "react";
import {
    Plus, X, ChevronLeft, ChevronRight, GripVertical,
    Image as ImageIcon, Trash2, Move
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CarouselSlide {
    id: string;
    url: string;
    caption?: string;
    type: "IMAGE" | "VIDEO";
}

interface CarouselEditorProps {
    slides: CarouselSlide[];
    onChange: (slides: CarouselSlide[]) => void;
    maxSlides?: number;
}

export function CarouselEditor({
    slides,
    onChange,
    maxSlides = 10
}: CarouselEditorProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const addSlide = (url: string, type: "IMAGE" | "VIDEO" = "IMAGE") => {
        if (slides.length >= maxSlides) return;

        const newSlide: CarouselSlide = {
            id: `slide_${Date.now()}`,
            url,
            type,
            caption: "",
        };

        onChange([...slides, newSlide]);
        setCurrentIndex(slides.length);
    };

    const removeSlide = (index: number) => {
        const newSlides = slides.filter((_, i) => i !== index);
        onChange(newSlides);
        if (currentIndex >= newSlides.length) {
            setCurrentIndex(Math.max(0, newSlides.length - 1));
        }
    };

    const updateCaption = (index: number, caption: string) => {
        const newSlides = [...slides];
        newSlides[index] = { ...newSlides[index], caption };
        onChange(newSlides);
    };

    const moveSlide = (fromIndex: number, toIndex: number) => {
        if (toIndex < 0 || toIndex >= slides.length) return;

        const newSlides = [...slides];
        const [removed] = newSlides.splice(fromIndex, 1);
        newSlides.splice(toIndex, 0, removed);
        onChange(newSlides);
        setCurrentIndex(toIndex);
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== index) {
            moveSlide(draggedIndex, index);
            setDraggedIndex(index);
        }
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newSlides: CarouselSlide[] = [];
        const remainingSlots = maxSlides - slides.length;

        Array.from(files).slice(0, remainingSlots).forEach((file) => {
            const type = file.type.startsWith("video/") ? "VIDEO" : "IMAGE";
            const url = URL.createObjectURL(file);
            newSlides.push({
                id: `slide_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                url,
                type,
                caption: "",
            });
        });

        if (newSlides.length > 0) {
            onChange([...slides, ...newSlides]);
            setCurrentIndex(slides.length); // Go to first new slide
        }

        e.target.value = "";
    };

    return (
        <div className="space-y-4">
            {/* Main preview */}
            <div className="relative aspect-[4/3] md:aspect-[4/3] rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                {slides.length > 0 ? (
                    <>
                        {/* Current slide */}
                        <div className="w-full h-full">
                            {slides[currentIndex]?.type === "VIDEO" ? (
                                <video
                                    src={slides[currentIndex].url}
                                    className="w-full h-full object-contain bg-black"
                                    controls
                                />
                            ) : (
                                <img
                                    src={slides[currentIndex]?.url}
                                    alt={`Slide ${currentIndex + 1}`}
                                    className="w-full h-full object-contain"
                                />
                            )}
                        </div>

                        {/* Navigation arrows */}
                        {slides.length > 1 && (
                            <>
                                <button
                                    onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                                    disabled={currentIndex === 0}
                                    className={cn(
                                        "absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors",
                                        currentIndex === 0 && "opacity-30 cursor-not-allowed"
                                    )}
                                >
                                    <ChevronLeft size={20} className="text-white" />
                                </button>
                                <button
                                    onClick={() => setCurrentIndex(Math.min(slides.length - 1, currentIndex + 1))}
                                    disabled={currentIndex === slides.length - 1}
                                    className={cn(
                                        "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors",
                                        currentIndex === slides.length - 1 && "opacity-30 cursor-not-allowed"
                                    )}
                                >
                                    <ChevronRight size={20} className="text-white" />
                                </button>
                            </>
                        )}

                        {/* Slide indicator */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentIndex(i)}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all",
                                        i === currentIndex
                                            ? "bg-white scale-110"
                                            : "bg-white/50 hover:bg-white/75"
                                    )}
                                />
                            ))}
                        </div>

                        {/* Delete current slide */}
                        <button
                            onClick={() => removeSlide(currentIndex)}
                            className="absolute top-2 right-2 p-2 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>

                        {/* Slide counter */}
                        <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-black/50 text-white text-xs">
                            {currentIndex + 1} / {slides.length}
                        </div>
                    </>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 transition-colors"
                    >
                        <ImageIcon size={48} className="text-zinc-300 dark:text-zinc-600 mb-3" />
                        <p className="text-sm text-zinc-500">Cliquez pour ajouter des images</p>
                        <p className="text-xs text-zinc-400 mt-1">Maximum {maxSlides} slides</p>
                    </div>
                )}
            </div>

            {/* Caption input */}
            {slides.length > 0 && (
                <input
                    type="text"
                    value={slides[currentIndex]?.caption || ""}
                    onChange={(e) => updateCaption(currentIndex, e.target.value)}
                    placeholder={`Légende pour la slide ${currentIndex + 1}...`}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50"
                />
            )}

            {/* Thumbnail strip */}
            {slides.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            onClick={() => setCurrentIndex(index)}
                            className={cn(
                                "relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-all group",
                                index === currentIndex
                                    ? "border-orange-500 ring-2 ring-orange-500/20"
                                    : "border-transparent hover:border-zinc-400",
                                draggedIndex === index && "opacity-50"
                            )}
                        >
                            {slide.type === "VIDEO" ? (
                                <video src={slide.url} className="w-full h-full object-cover" />
                            ) : (
                                <img src={slide.url} alt="" className="w-full h-full object-cover" />
                            )}

                            {/* Drag handle */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                <GripVertical size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {/* Index badge */}
                            <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] flex items-center justify-center">
                                {index + 1}
                            </div>
                        </div>
                    ))}

                    {/* Add more button */}
                    {slides.length < maxSlides && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-600 hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-all flex items-center justify-center"
                        >
                            <Plus size={24} className="text-zinc-400" />
                        </button>
                    )}
                </div>
            )}

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Add from URL */}
            {slides.length < maxSlides && (
                <AddFromUrlInput onAdd={(url) => addSlide(url)} />
            )}
        </div>
    );
}

// --- Add from URL Component ---
function AddFromUrlInput({ onAdd }: { onAdd: (url: string) => void }) {
    const [url, setUrl] = useState("");
    const [showInput, setShowInput] = useState(false);

    const handleAdd = () => {
        if (url.trim()) {
            onAdd(url.trim());
            setUrl("");
            setShowInput(false);
        }
    };

    if (!showInput) {
        return (
            <button
                onClick={() => setShowInput(true)}
                className="w-full py-2 text-sm text-zinc-500 hover:text-orange-500 transition-colors"
            >
                + Ajouter depuis une URL
            </button>
        );
    }

    return (
        <div className="flex gap-2">
            <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                autoFocus
            />
            <Button onClick={handleAdd} size="sm">Ajouter</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowInput(false)}>
                <X size={16} />
            </Button>
        </div>
    );
}

