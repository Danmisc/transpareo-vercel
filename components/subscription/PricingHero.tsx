"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// --- Components ---

function Spotlight({ className, fill }: { className?: string; fill?: string }) {
    return (
        <svg
            className={cn(
                "animate-spotlight pointer-events-none absolute z-[1]  h-[169%] w-[138%] lg:w-[84%] opacity-0",
                className
            )}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 3787 2842"
            fill="none"
        >
            <g filter="url(#filter)">
                <ellipse
                    cx="1924.71"
                    cy="273.501"
                    rx="1924.71"
                    ry="273.501"
                    transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
                    fill={fill || "white"}
                    fillOpacity="0.21"
                />
            </g>
            <defs>
                <filter
                    id="filter"
                    x="0.860352"
                    y="0.838989"
                    width="3785.16"
                    height="2840.26"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                    />
                    <feGaussianBlur
                        stdDeviation="151"
                        result="effect1_foregroundBlur_1065_8"
                    />
                </filter>
            </defs>
        </svg>
    );
}

// --- Main Hero ---

export function PricingHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    // Parallax only (Removed Opacity fade-out per original request)
    const y = useTransform(scrollYProgress, [0, 1], [0, 100]);

    return (
        <section ref={containerRef} className="relative w-full overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24 bg-zinc-50/50 dark:bg-zinc-950">

            {/* Aurora Background (Dark Mode) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none dark:block hidden">
                <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(249, 115, 22, 0.3)" />
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-orange-500/10 via-transparent to-transparent opacity-40 blur-3xl" />
            </div>

            {/* Light Mode Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none dark:hidden bg-white">
                <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-orange-50/80 via-white to-white" />
            </div>

            <motion.div style={{ y }} className="container relative z-10 px-4 md:px-6 mx-auto flex flex-col items-center text-center">

                {/* Premium Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="mb-8"
                >
                    <Link href="/dashboard" className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/10 backdrop-blur-md shadow-sm hover:bg-white/80 dark:hover:bg-zinc-800/40 transition-all hover:scale-105 active:scale-95 group/badge cursor-pointer">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 tracking-wide">
                            NOUVEAU : Dashboard Pro v2
                        </span>
                        <ChevronRight className="w-3 h-3 text-zinc-400 group-hover/badge:text-orange-500 transition-colors" />
                    </Link>
                </motion.div>

                {/* Hero Typo */}
                <h1 className="max-w-4xl mx-auto text-center font-[800] tracking-tighter text-4xl md:text-6xl lg:text-7xl mb-8 leading-[1.1]">
                    <motion.span
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.6 }}
                        className="block text-zinc-900 dark:text-white"
                    >
                        Investissez dans votre
                    </motion.span>
                    <motion.span
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 dark:from-orange-400 dark:via-amber-300 dark:to-orange-500 animate-gradient-x pb-2"
                    >
                        réussite immobilière
                    </motion.span>
                </h1>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed font-normal"
                >
                    La première plateforme sociale qui connecte propriétaires, locataires et investisseurs pour des transactions <span className="text-zinc-900 dark:text-white font-medium">plus rapides, transparentes et sécurisées.</span>
                </motion.p>

                {/* Advanced CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
                >
                    {/* Shimmer Button (Reverted to V3 style) */}
                    <Link
                        href="#pricing"
                        className="group relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                    >
                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2E8F0_0%,#F97316_50%,#E2E8F0_100%)] dark:bg-[conic-gradient(from_90deg_at_50%_50%,#334155_0%,#F97316_50%,#334155_100%)]" />
                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-white dark:bg-zinc-950 px-8 py-1 text-sm font-semibold text-zinc-900 dark:text-white backdrop-blur-3xl transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
                            Voir les plans
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                    </Link>

                    <Link
                        href="/register"
                        className="px-8 py-3 rounded-full text-zinc-600 dark:text-zinc-400 font-medium text-sm hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                        Comparer les fonctionnalités
                    </Link>
                </motion.div>

                {/* Infinite Ticker (Logos) - Reverted to V3 style */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="mt-20 w-full max-w-4xl border-t border-zinc-200/50 dark:border-white/5 pt-10 overflow-hidden relative"
                >
                    {/* Fade Edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-zinc-50 dark:from-zinc-950 to-transparent" />
                    <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-zinc-50 dark:from-zinc-950 to-transparent" />

                    <p className="text-xs text-center text-zinc-400 dark:text-zinc-600 font-medium mb-6 uppercase tracking-widest">
                        Ils nous font confiance
                    </p>

                    <div className="flex w-full overflow-hidden mask-image-linear-to-r">
                        <motion.div
                            className="flex gap-16 min-w-full items-center justify-around whitespace-nowrap grayscale opacity-50 dark:opacity-40"
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
                        >
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="flex gap-16">
                                    <span className="text-lg font-bold font-serif">ImmoPro</span>
                                    <span className="text-lg font-bold tracking-tighter">NEST</span>
                                    <span className="text-lg font-bold italic">BatiCorp</span>
                                    <span className="text-lg font-bold">Square.</span>
                                    <span className="text-lg font-extrabold">H&L</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
}
