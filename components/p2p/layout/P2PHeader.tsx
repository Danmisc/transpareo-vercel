"use client";

import Link from "next/link";
import { MessageCircle, Home, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useScrollDirection } from "@/hooks/use-scroll-direction";

interface P2PHeaderProps {
    user?: {
        name?: string | null;
        image?: string | null;
    } | null;
}

export function P2PHeader({ user }: P2PHeaderProps) {
    const { isAtTop, scrollDirection } = useScrollDirection();
    const isHidden = scrollDirection === "down" && !isAtTop;

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ease-in-out",
                isAtTop
                    ? "bg-transparent py-6 border-b border-transparent"
                    : "bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50 py-3 shadow-sm",
                isHidden ? "-translate-y-full" : "translate-y-0"
            )}
        >
            <div className="container flex items-center justify-between max-w-7xl mx-auto px-6">

                {/* LOGO */}
                <Link
                    href="/p2p"
                    className="flex items-center gap-2 group"
                >
                    <div className={cn(
                        "p-2 rounded-xl transition-all duration-300",
                        isAtTop ? "bg-white/20 text-white group-hover:bg-white/30" : "bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20"
                    )}>
                        <Home size={20} />
                    </div>
                    <span className={cn(
                        "font-bold text-lg tracking-tight transition-colors duration-300",
                        isAtTop ? "text-white" : "text-zinc-900 dark:text-white"
                    )}>
                        Transpareo <span className="font-normal opacity-80">P2P</span>
                    </span>
                </Link>

                {/* DESKTOP NAV */}
                <nav className="hidden md:flex items-center gap-1">
                    {[
                        { name: "Immobilier", href: "/marketplace" },
                        { name: "Prêts P2P", href: "/p2p" },
                        { name: "Statistiques", href: "/p2p/statistiques" },
                        { name: "Entreprises", href: "/p2p/business" },
                    ].map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "text-sm font-medium px-4 py-2 rounded-full transition-all duration-300",
                                isAtTop
                                    ? "text-white/80 hover:text-white hover:bg-white/10"
                                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* ACTIONS */}
                <div className="flex items-center gap-3">
                    <Link href="/login">
                        <Button
                            variant="ghost"
                            className={cn(
                                "transition-colors font-medium",
                                isAtTop ? "text-white hover:bg-white/10 hover:text-white" : "text-zinc-600 dark:text-zinc-400"
                            )}
                        >
                            Se connecter
                        </Button>
                    </Link>
                    <Link href="/register">
                        <Button
                            className={cn(
                                "rounded-full px-6 font-bold transition-all duration-300 shadow-lg",
                                isAtTop
                                    ? "bg-white text-black hover:bg-zinc-100 border-2 border-transparent hover:scale-105"
                                    : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                            )}
                        >
                            Ouvrir un compte
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}

