"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Zap, TrendingUp, MapPin, Lock, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";

export function BentoFeatures() {
    return (
        <section className="py-24 bg-zinc-50 dark:bg-black">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-zinc-900 dark:text-white">
                        Pourquoi <span className="text-orange-600">Transpareo</span> ?
                    </h2>
                    <p className="text-zinc-500 max-w-2xl mx-auto">
                        Une plateforme conçue pour la performance, la sécurité et la transparence.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
                    {/* Card 1: Security (Large) */}
                    <BentoCard
                        className="md:col-span-2 md:row-span-2 min-h-[300px]"
                        title="Sécurité Bancaire & Hypothèques"
                        desc="Vos fonds sont séquestrés chez MangoPay (agréé ACPR). Chaque projet est couvert par une hypothèque de 1er rang ou une fiducie."
                        icon={<ShieldCheck size={24} />}
                        delay={0.1}
                    />

                    {/* Card 2: Speed */}
                    <BentoCard
                        className="md:col-span-1 md:row-span-1 min-h-[200px]"
                        title="Investissement Éclair"
                        desc="Processus 100% numérique. Souscrivez en 30 secondes chrono."
                        icon={<Zap size={24} />}
                        delay={0.2}
                    />

                    {/* Card 3: Yield */}
                    <BentoCard
                        className="md:col-span-1 md:row-span-1 min-h-[200px]"
                        title="Rendements Élevés"
                        desc="Ciblez entre 8% et 12% par an, nets de frais de gestion."
                        icon={<TrendingUp size={24} />}
                        delay={0.3}
                    />

                    {/* Card 4: Impact (Long Horizontal) */}
                    <BentoCard
                        className="md:col-span-3 md:row-span-1 min-h-[180px]"
                        title="Impact Local Tangible"
                        desc="Financez la rénovation énergétique et la construction de logements près de chez vous. Vous savez où va votre argent."
                        icon={<MapPin size={24} />}
                        delay={0.4}
                        horizontal
                    >
                        <div className="absolute top-1/2 right-10 -translate-y-1/2 hidden md:flex items-center gap-2 opacity-50">
                            <span className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full text-xs text-zinc-600 dark:text-zinc-400">Paris</span>
                            <span className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full text-xs text-zinc-600 dark:text-zinc-400">Lyon</span>
                            <span className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full text-xs text-zinc-600 dark:text-zinc-400">Bordeaux</span>
                        </div>
                    </BentoCard>
                </div>
            </div>
        </section>
    );
}

function BentoCard({
    className,
    title,
    desc,
    icon,
    children,
    delay,
    horizontal
}: {
    className?: string,
    title: string,
    desc: string,
    icon: React.ReactNode,
    children?: React.ReactNode,
    delay?: number,
    horizontal?: boolean
}) {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;

        const div = divRef.current;
        const rect = div.getBoundingClientRect();

        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <motion.div
            ref={divRef}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: delay }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setOpacity(1)}
            onMouseLeave={() => setOpacity(0)}
            className={cn(
                "relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-hidden group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors duration-500",
                className
            )}
        >
            {/* Spotlight Effect (Monochromatic) */}
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(0,0,0,0.05), transparent 40%)`,
                }}
            />
            {/* Dark mode spotlight */}
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 dark:block hidden"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.05), transparent 40%)`,
                }}
            />

            <div className={cn("relative p-6 h-full flex flex-col z-10", horizontal ? "justify-center" : "justify-between")}>
                <div className={cn("mb-4 w-10 h-10 rounded-lg flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-700 transition-colors duration-300",
                    "text-zinc-700 dark:text-zinc-300"
                )}>
                    {icon}
                </div>

                <div className={cn(horizontal && "max-w-xl")}>
                    <h3 className="text-lg md:text-xl font-semibold text-zinc-900 dark:text-white mb-2">{title}</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm">
                        {desc}
                    </p>
                </div>
            </div>

            {children}
        </motion.div>
    );
}

