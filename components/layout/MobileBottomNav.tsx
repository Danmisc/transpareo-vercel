"use client";

import Link from "next/link";
import { Home, Search, Plus, Bell, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MobileBottomNav({ userId }: { userId?: string }) {
    const pathname = usePathname();

    const tabs = [
        { label: "Accueil", href: "/", icon: Home },
        { label: "Explorer", href: "/search", icon: Search },
        { label: "Créer", href: "#create", icon: Plus, isFab: true },
        { label: "Activité", href: "/notifications", icon: Bell },
        { label: "Profil", href: userId ? `/profile/${userId}` : "/login", icon: User },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 pb-safe shadow-lg">
            <div className="flex justify-between items-end px-2 h-16 pb-2">
                {tabs.map((tab, i) => {
                    const isActive = pathname === tab.href;

                    if (tab.isFab) {
                        return (
                            <div key={i} className="flex justify-center flex-1 relative -top-5">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            size="icon"
                                            className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl hover:scale-105 transition-transform border-4 border-white dark:border-black"
                                        >
                                            <Plus className="h-6 w-6" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="center" className="mb-2 w-56">
                                        <DropdownMenuItem onClick={() => window.location.href = '/create-post'}>
                                            <span className="cursor-pointer">📝 Nouvelle Publication</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => window.location.href = '/marketplace/create'}>
                                            <span className="cursor-pointer">🏠 Déposer une Annonce</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => window.location.href = '/live/create'}>
                                            <span className="cursor-pointer">📡 Lancer un Live</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={i}
                            href={tab.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200 active:scale-90",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <tab.icon className={cn("h-6 w-6 transition-all", isActive && "fill-current scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                            {/* <span className="text-[10px] font-medium">{tab.label}</span>  Optional text for cleaner look */}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

