"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const TESTIMONIALS = [
    {
        quote: "Grâce au plan Pro, j'ai pu contacter directement un propriétaire et décrocher l'appartement de mes rêves en 48h.",
        author: "Sophie M.",
        role: "Locataire à Paris",
        rating: 5
    },
    {
        quote: "L'accès anticipé aux projets P2P m'a permis d'investir dans les meilleures opportunités. ROI de 11% cette année !",
        author: "Marc D.",
        role: "Investisseur",
        rating: 5
    },
    {
        quote: "Le dashboard propriétaire me fait gagner 5h par semaine sur la gestion de mes 4 appartements.",
        author: "Jean-Pierre L.",
        role: "Propriétaire",
        rating: 5
    },
    {
        quote: "Une transparence totale qui change tout. Je ne passerai plus jamais par une agence classique.",
        author: "Thomas B.",
        role: "Locataire",
        rating: 5
    },
    {
        quote: "La certification de solvabilité a rassuré mon propriétaire instantanément. Merci Transpareo !",
        author: "Léa P.",
        role: "Locataire",
        rating: 5
    }
];

export function PricingTestimonials() {
    return (
        <section className="py-24 overflow-hidden bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900">
            <div className="max-w-7xl mx-auto px-4 mb-20 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-zinc-900 dark:text-white">
                    Ils nous font confiance
                </h2>
                <div className="flex items-center justify-center gap-2">
                    <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} className="w-4 h-4 fill-orange-500 text-orange-500" />
                        ))}
                    </div>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium ml-2">4.9/5 sur Trustpilot</span>
                </div>
            </div>

            {/* Marquee Container */}
            <div className="relative w-full [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
                <div className="flex overflow-hidden py-4"> {/* Padding for hover effects */}
                    <motion.div
                        className="flex gap-6 px-4"
                        animate={{ x: "-50%" }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 80 // Much slower for premium feel
                        }}
                        style={{ width: "max-content" }}
                    >
                        {[...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                            <div
                                key={i}
                                className="w-[350px] md:w-[400px] flex-shrink-0 p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 transition-all hover:bg-white dark:hover:bg-zinc-900 hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-black/50 hover:-translate-y-1 cursor-default"
                            >
                                <div className="flex mb-4">
                                    {[...Array(t.rating)].map((_, si) => (
                                        <Star key={si} className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                                    ))}
                                </div>
                                <p className="text-base text-zinc-700 dark:text-zinc-300 italic mb-6 leading-relaxed">
                                    "{t.quote}"
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600 flex-shrink-0" />
                                    <div>
                                        <div className="font-bold text-sm text-zinc-900 dark:text-white">{t.author}</div>
                                        <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Fade Edges are handled by mask-image now, which is cleaner */}
            </div>
        </section>
    );
}
