"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Users, Sparkles, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { cn } from "@/lib/utils";
import Link from "next/link";

interface FeaturedCommunityCarouselProps {
    communities: any[];
}

export function FeaturedCommunityCarousel({ communities }: FeaturedCommunityCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    // Use top 3-5 communities for featured
    const featured = communities.slice(0, 5);

    const maxIndex = featured.length - 1;

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
    };

    // Auto-play (optional, paused on hover could be better)
    useEffect(() => {
        const timer = setInterval(nextSlide, 8000);
        return () => clearInterval(timer);
    }, [currentIndex]);

    if (featured.length === 0) return null;

    const current = featured[currentIndex];

    return (
        <div className="w-full relative group">
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                    <Sparkles className="text-orange-500 fill-orange-500/20" size={18} />
                    Tendances du moment
                </h2>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={prevSlide}
                        className="h-8 w-8 rounded-full border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100"
                    >
                        <ChevronLeft size={14} />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={nextSlide}
                        className="h-8 w-8 rounded-full border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100"
                    >
                        <ChevronRight size={14} />
                    </Button>
                </div>
            </div>

            <div className="relative h-56 md:h-72 w-full overflow-hidden rounded-3xl bg-zinc-900 shadow-xl ring-1 ring-white/10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                        className="absolute inset-0"
                    >
                        {/* Background Image with Gradient Overlay */}
                        <div className="absolute inset-0 z-0">
                            {current.coverImage ? (
                                <img src={current.coverImage} className="w-full h-full object-cover opacity-60" alt={current.name} />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-zinc-900 opacity-80" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="max-w-2xl"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none px-3 py-1">
                                        #{currentIndex + 1} Tendance
                                    </Badge>
                                    <Badge variant="outline" className="text-zinc-300 border-white/20 backdrop-blur-md bg-white/5">
                                        {current.category || "Général"}
                                    </Badge>
                                </div>

                                <h3 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight leading-none">
                                    {current.name}
                                </h3>

                                <p className="text-base text-zinc-300 line-clamp-1 mb-4 max-w-lg leading-relaxed">
                                    {current.description || "Rejoignez la discussion dans cette communauté dynamique."}
                                </p>

                                <div className="flex items-center gap-6">
                                    <Button asChild size="default" className="rounded-xl h-10 px-6 bg-white text-black hover:bg-zinc-200 font-bold transition-transform hover:scale-105">
                                        <Link href={`/communities/${current.slug}`}>
                                            Explorer <ArrowRight className="ml-2 w-4 h-4" />
                                        </Link>
                                    </Button>

                                    {/* Member Avatars */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex -space-x-3">
                                            {[...Array(3)].map((_, i) => (
                                                <div key={i} className="h-8 w-8 rounded-full border-2 border-zinc-900 bg-zinc-800" />
                                            ))}
                                        </div>
                                        <div className="text-sm font-medium text-white/80">
                                            <span className="font-bold text-white block">{current._count?.members || "1.2k"}</span>
                                            membres
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Progress Indicators */}
                <div className="absolute bottom-6 right-8 flex gap-2 z-20">
                    {featured.map((_, idx) => (
                        <div
                            key={idx}
                            /* onClick={() => setCurrentIndex(idx)} */
                            className={cn(
                                "h-1 rounded-full transition-all duration-300",
                                idx === currentIndex ? "w-8 bg-white" : "w-2 bg-white/20"
                            )}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Dummy background gradient wrapper for type safety if needed, or import from real path
// Removed usage if not needed or strictly keep it simple first.
