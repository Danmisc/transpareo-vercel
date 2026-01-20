import { prisma } from "@/lib/prisma";
import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { ProjectCarousel } from "./ProjectCarousel";

export async function FeaturedProjects() {
    // 1. Fetch ALL candidate projects (up to 50 to ensure we have pool for randomization)
    const projects = await prisma.loanProject.findMany({
        where: {
            OR: [
                { status: "FUNDING" },
                { status: "ACTIVE" },
                { status: "REVIEW" },
                { status: "PENDING" }
            ]
        },
        take: 50, // Fetch pool
        include: {
            investments: true
        }
    });

    // 2. Randomize & Slice to 10 on the Server
    const shuffled = projects.sort(() => 0.5 - Math.random());
    const selectedProjects = shuffled.slice(0, 10);

    return (
        <section className="py-24 bg-zinc-50 dark:bg-black overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto mb-10 relative">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="max-w-lg">
                            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-3">
                                Opportunités <span className="text-orange-600">Ouvertes</span>
                            </h2>
                            <p className="text-base text-zinc-500">
                                Investissez dans des projets immobiliers rigoureusement audités.
                            </p>
                        </div>
                        {/* Navigation is now inside ProjectCarousel (Absolute Positioned) or handled there */}
                    </div>

                    {/* Carousel Container */}
                    <div className="mt-8">
                        {selectedProjects.length > 0 ? (
                            <ProjectCarousel projects={selectedProjects} />
                        ) : (
                            <div className="rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-16 text-center shadow-sm">
                                <div className="h-20 w-20 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Clock size={32} className="text-zinc-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Aucune collecte en cours</h3>
                                <p className="text-zinc-500 max-w-md mx-auto mb-8 text-lg">
                                    Les meilleures opportunités partent en quelques minutes. Soyez le premier averti.
                                </p>
                                <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transform hover:-translate-y-1">
                                    Créer une alerte mail
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

