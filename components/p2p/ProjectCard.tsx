"use client";

import { motion } from "framer-motion";
import { ArrowRight, Building2, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Mock data if no real data passed (or could be props)
// We need to fetch data in a Server Component then pass to this Client Component? 
// Actually, sticking to Server Component for data fetching is better for SEO, 
// but we want animations. Let's make this a Client Component that takes `initialProjects` as prop?
// OR: Keep it as Server Component and use a Client Component for the Card.
// Decision: Rewrite file to separating Server logic (fetching) and Client logic (Cards).
// BUT: To keep it simple for now without creating extra files, I'll make the whole component receive data or just animate basic elements.
// Wait, `app/page.tsx` in Next.js App Router can import Server Comps. 
// I will keep `FeaturedProjects` as Server Component but use a inner Client Component `ProjectCard` for animations.

// Actually, let's rewrite the file to export a Server Component `FeaturedProjects` that fetches data, 
// and renders a list of `ProjectCard` (which we define in same file or separate).
// To avoid "module not found" issues with new files, I'll define the client component in a separate file `ProjectCard.tsx` if needed, 
// OR simpler: Just make `FeaturedProjects` a client component that accepts `projects` prop, 
// and the parent `page.tsx` fetches data?
// NO, `page.tsx` is async but `FeaturedProjects` was async too.
// Let's keep `FeaturedProjects` as a CLIENT component that receives data as props? 
// No, the previous file was doing `prisma` calls.
// The best approach: `FeaturedProjects` (Server) -> `FeaturedProjectsList` (Client).
// I will rewrite `FeaturedProjects.tsx` to be the "Client List" and fetch data in `page.tsx`.
// OR: simpler: `FeaturedProjects` stays Server, internal `ProjectCard` is Client.
// Let's create `components/p2p/ProjectCard.tsx` for the fancy animation.

// Wait, I can't create too many small files if I want to be fast.
// Start by creating `ProjectCard.tsx`.

import { useState } from "react";

export function ProjectCard({ project, index }: { project: any, index: number }) {
    const fundedPercent = Math.min(100, Math.round((project.funded / project.amount) * 100));

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group h-full relative flex flex-col rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500"
        >
            <Link href={`/p2p/market/${project.id}`} className="absolute inset-0 z-10">
                <span className="sr-only">Voir le projet {project.title}</span>
            </Link>

            {/* Image Section */}
            <div className="h-48 bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />

                {/* Simulated Image */}
                <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-800 group-hover:scale-105 transition-transform duration-700">
                    <div className="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700" />
                </div>

                <div className="absolute top-4 left-4 z-20">
                    <span /** Badge Type */ className="px-3 py-1 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md text-xs font-bold text-zinc-900 dark:text-white border border-white/20 shadow-sm">
                        {project.projectType || "Immobilier"}
                    </span>
                </div>

                <div className="absolute bottom-4 left-4 z-20 text-white">
                    <div className="flex items-center gap-1.5 text-xs font-medium opacity-90 mb-1">
                        <MapPin size={12} />
                        {project.location || "France"}
                    </div>
                </div>

                <div className="absolute top-4 right-4 z-20">
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white dark:border-zinc-900",
                        project.riskGrade === "A" || project.riskGrade === "A+" ? "bg-emerald-500 text-white" :
                            project.riskGrade === "B" ? "bg-lime-500 text-white" :
                                "bg-orange-500 text-white"
                    )}>
                        {project.riskGrade}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-3 line-clamp-1 group-hover:text-orange-600 transition-colors">
                    {project.title}
                </h3>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                        <p className="text-[10px] text-zinc-500 mb-0.5 uppercase tracking-wider">Rendement</p>
                        <p className="text-lg font-bold text-orange-600">{project.apr}%</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-zinc-500 mb-0.5 uppercase tracking-wider">Durée</p>
                        <p className="text-lg font-bold text-zinc-900 dark:text-white">{project.duration} <span className="text-[10px] font-normal text-zinc-400">mois</span></p>
                    </div>
                </div>

                <div className="mt-auto">
                    <div className="flex justify-between items-end mb-1 text-xs">
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">{fundedPercent}% financé</span>
                        <span className="text-zinc-500">{project.funded.toLocaleString()} €</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${fundedPercent}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                        />
                    </div>
                </div>
            </div>
        </motion.article>
    );
}

// ------------------------------------
// No default export! We will use this in the main file `FeaturedProjects.tsx`

