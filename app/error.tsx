"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, RefreshCw, AlertTriangle, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Application Error:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-red-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-6">
            {/* Animated Background Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-200/30 dark:bg-red-500/10 rounded-full blur-3xl animate-blob" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-200/30 dark:bg-orange-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 text-center max-w-md"
            >
                {/* Error Icon */}
                <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="mb-8"
                >
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 shadow-xl">
                        <AlertTriangle className="w-16 h-16 text-red-500" />
                    </div>
                </motion.div>

                {/* Error Text */}
                <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 mb-4">
                    Oops !
                </h1>

                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                    Une erreur s&apos;est produite
                </h2>

                <p className="text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
                    Quelque chose s&apos;est mal passé de notre côté.
                    Nos développeurs ont été notifiés et travaillent dessus.
                </p>

                {/* Error Details (only in development) */}
                {process.env.NODE_ENV === 'development' && error.message && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/30 text-left">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium mb-2">
                            <Bug className="w-4 h-4" />
                            Détails de l&apos;erreur
                        </div>
                        <code className="text-xs text-red-800 dark:text-red-300 break-all">
                            {error.message}
                        </code>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        onClick={reset}
                        size="lg"
                        className="bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg shadow-red-500/20"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Réessayer
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-xl border-zinc-200 dark:border-zinc-700">
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Retour à l&apos;accueil
                        </Link>
                    </Button>
                </div>

                {/* Error Digest */}
                {error.digest && (
                    <p className="mt-6 text-xs text-zinc-400">
                        Code erreur: {error.digest}
                    </p>
                )}
            </motion.div>
        </div>
    );
}
