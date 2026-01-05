"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface InfoPageLayoutProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}

export function InfoPageLayout({ title, subtitle, children }: InfoPageLayoutProps) {
    return (
        <div className="min-h-screen bg-background font-sans text-foreground pb-20 md:pb-0 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-indigo-200/20 rounded-full blur-3xl mix-blend-multiply opacity-50 animate-blob" />
                <div className="absolute bottom-0 right-1/4 w-[40rem] h-[40rem] bg-orange-200/20 rounded-full blur-3xl mix-blend-multiply opacity-50 animate-blob animation-delay-2000" />
            </div>

            <div className="container max-w-3xl mx-auto px-6 py-12 md:py-20">
                {/* Header & Back Button */}
                <div className="mb-10">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="mb-6 pl-0 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-transparent transition-colors group">
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Retour à l'accueil
                        </Button>
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white mb-4">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Main Content Card */}
                <div className="glass-card p-8 md:p-12 rounded-3xl border border-white/50 dark:border-zinc-800 shadow-xl shadow-zinc-200/20 dark:shadow-black/20 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl">
                    <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-500 hover:prose-a:text-indigo-600 prose-img:rounded-2xl">
                        {children}
                    </div>
                </div>

                {/* Simple Footer */}
                <div className="mt-12 text-center text-sm text-zinc-400">
                    © 2025 Transpareo. Tous droits réservés.
                </div>
            </div>
        </div>
    );
}
