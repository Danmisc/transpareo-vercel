"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Search, ArrowLeft, Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-orange-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-6">
            {/* Animated Background Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-200/30 dark:bg-orange-500/10 rounded-full blur-3xl animate-blob" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 text-center max-w-md"
            >
                {/* Ghost Icon */}
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="mb-8"
                >
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 shadow-xl">
                        <Ghost className="w-16 h-16 text-orange-500" />
                    </div>
                </motion.div>

                {/* 404 Text */}
                <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 mb-4">
                    404
                </h1>

                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                    Page introuvable
                </h2>

                <p className="text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
                    Oups ! La page que vous cherchez semble avoir disparu dans les méandres du web.
                    Peut-être s&apos;est-elle évaporée, ou n&apos;a-t-elle jamais existé.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/20">
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Retour à l&apos;accueil
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-xl border-zinc-200 dark:border-zinc-700">
                        <Link href="/explore">
                            <Search className="mr-2 h-4 w-4" />
                            Explorer
                        </Link>
                    </Button>
                </div>

                {/* Back Link */}
                <button
                    onClick={() => window.history.back()}
                    className="mt-6 text-sm text-zinc-400 hover:text-orange-500 transition-colors inline-flex items-center gap-1"
                >
                    <ArrowLeft className="w-3 h-3" />
                    Revenir en arrière
                </button>
            </motion.div>
        </div>
    );
}
