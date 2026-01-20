"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const PARTNERS = [
    { name: "Les Echos", color: "hover:text-red-700" },
    { name: "Forbes", color: "hover:text-zinc-900 dark:hover:text-white" },
    { name: "BFM Business", color: "hover:text-blue-600" },
    { name: "Le Figaro", color: "hover:text-blue-800" },
    { name: "Challenges", color: "hover:text-red-600" },
    { name: "La Tribune", color: "hover:text-purple-700" },
    { name: "Investir", color: "hover:text-orange-600" },
    // Repeat for smoother loop if list is short
    { name: "Les Echos", color: "hover:text-red-700" },
    { name: "Forbes", color: "hover:text-zinc-900 dark:hover:text-white" },
    { name: "BFM Business", color: "hover:text-blue-600" },
    { name: "Le Figaro", color: "hover:text-blue-800" },
    { name: "Challenges", color: "hover:text-red-600" },
    { name: "La Tribune", color: "hover:text-purple-700" },
    { name: "Investir", color: "hover:text-orange-600" },
];

export function TrustMarquee() {
    return (
        <section className="py-12 border-b border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm overflow-hidden">
            <div className="container mx-auto px-4 mb-6">
                <p className="text-center text-sm font-medium text-zinc-400 uppercase tracking-widest">
                    Ils parlent de nous
                </p>
            </div>

            <div className="relative flex w-full overflow-hidden mask-gradient-x">
                {/* Gradient Masks */}
                <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 z-10 bg-gradient-to-r from-white dark:from-zinc-950 to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 z-10 bg-gradient-to-l from-white dark:from-zinc-950 to-transparent pointer-events-none" />

                <motion.div
                    className="flex whitespace-nowrap gap-12 md:gap-24 items-center"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 30, // Adjust speed here
                        repeatType: "loop"
                    }}
                >
                    {/* Render standard set twice for seamless loop - actually already doubled in array above, but let's double render block to be safe if array is modified */}
                    {[...PARTNERS, ...PARTNERS].map((partner, idx) => (
                        <div
                            key={`${partner.name}-${idx}`}
                            className={cn(
                                "text-2xl md:text-3xl font-serif font-bold text-zinc-300 dark:text-zinc-700 cursor-default transition-colors duration-300 select-none flex-shrink-0",
                                partner.color
                            )}
                        >
                            {partner.name}
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

