"use client";

import { useRef, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./ProjectCard";
import { motion, AnimatePresence } from "framer-motion";

export function ProjectCarousel({ projects }: { projects: any[] }) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [isAtEnd, setIsAtEnd] = useState(false);

    const checkScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 10); // Tolerance of 10px
        setIsAtEnd(Math.abs(scrollWidth - clientWidth - scrollLeft) < 10);
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
    }, []);

    const scroll = (direction: "left" | "right") => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const scrollAmount = container.clientWidth * 0.8; // Scroll 80% of view width

        container.scrollBy({
            left: direction === "right" ? scrollAmount : -scrollAmount,
            behavior: "smooth"
        });
    };

    return (
        <div className="relative group">
            {/* Navigation Buttons (Floating) */}
            <div className="absolute -top-16 right-0 flex items-center gap-3">
                <button
                    onClick={() => scroll("left")}
                    disabled={!canScrollLeft}
                    className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-800 transition-all duration-300",
                        canScrollLeft
                            ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white hover:border-orange-500 hover:text-orange-500 shadow-sm"
                            : "bg-zinc-50 dark:bg-zinc-900/50 text-zinc-300 dark:text-zinc-700 cursor-not-allowed opacity-50"
                    )}
                >
                    <ArrowLeft size={18} />
                </button>

                {isAtEnd ? (
                    <Link
                        href="/p2p/market"
                        className="h-10 px-5 rounded-full flex items-center gap-2 bg-orange-600 text-white font-medium hover:bg-orange-700 transition-all shadow-md animate-in fade-in zoom-in duration-300"
                    >
                        <span className="text-sm">Tout voir</span>
                        <ArrowRight size={16} />
                    </Link>
                ) : (
                    <button
                        onClick={() => scroll("right")}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white hover:border-orange-500 hover:text-orange-500 shadow-sm transition-all duration-300"
                    >
                        <ArrowRight size={18} />
                    </button>
                )}
            </div>

            {/* Scroll Container */}
            <div
                ref={scrollContainerRef}
                onScroll={checkScroll}
                className="flex gap-6 overflow-x-auto pb-8 -mx-4 px-4 scroll-smooth hide-scrollbar snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {projects.map((project, i) => (
                    <div key={project.id} className="min-w-[280px] md:min-w-[340px] snap-start">
                        <ProjectCard project={project} index={i} />
                    </div>
                ))}

                {/* "See All" Card at the end for mobile snap or desktop overflow hint */}
                <Link href="/p2p/market" className="min-w-[200px] md:min-w-[250px] snap-center flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-orange-500/50 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-all group/card">
                    <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 group-hover/card:scale-110 transition-transform">
                        <ArrowRight size={20} className="text-zinc-400 group-hover/card:text-orange-500 transition-colors" />
                    </div>
                    <span className="font-semibold text-zinc-900 dark:text-white group-hover/card:text-orange-600 transition-colors">Voir tous les projets</span>
                </Link>
            </div>
        </div>
    );
}

