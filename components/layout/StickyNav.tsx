"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useScrollDirection } from "@/hooks/use-scroll-direction";

interface StickyNavProps {
    children: React.ReactNode;
    className?: string;
}

export function StickyNav({ children, className }: StickyNavProps) {
    const { scrollDirection, isAtTop } = useScrollDirection();

    // Logic:
    // 1. If at top: Show fully (no glass, big padding).
    // 2. If scrolling UP and NOT at top: Show (glass, small padding).
    // 3. If scrolling DOWN and NOT at top: Hide.

    const isHidden = scrollDirection === "down" && !isAtTop;
    const isScrolled = !isAtTop;

    return (
        <>
            <div className="h-14 w-full" aria-hidden="true" />
            <motion.header
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 w-full border-b transition-colors duration-500",
                    "rounded-b-[2rem]", // Much more pronounced curve
                    isScrolled
                        ? "bg-white/95 dark:bg-black/95 backdrop-blur-md border-zinc-200/50 dark:border-zinc-800/50 shadow-lg shadow-black/5" // Stronger opacity/shadow to make shape visible
                        : "bg-transparent border-transparent backdrop-blur-none", // Disappear at top
                    className
                )}
                initial={{ y: 0 }}
                animate={{
                    y: isHidden ? -100 : 0,
                }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    mass: 1
                }}
            >
                {children}
            </motion.header>
        </>
    );
}

