"use client";

import Link from "next/link";
import {
    Home, Hash, PlayCircle, Users, MessageSquare,
    Store, Map, FolderOpen, Calendar, Settings,
    Bell, Search, HelpCircle, User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CatAvatar, DEFAULT_CAT_TRAITS } from "@/components/profile/CatAvatar";

export function SidebarLeft({ className, user, dailyBrief }: { className?: string, user?: any, dailyBrief?: any }) {
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;

    // Mock data if missing
    const currentUser = user || { name: "Altaf", handle: "altaf_ux", image: null }; // Changed default image to null to trigger CatAvatar

    const NAV_ITEMS = [
        { label: "Pour vous", icon: Home, href: "/" },
        { label: "Explorer", icon: Hash, href: "/search" },
        { label: "Reels", icon: PlayCircle, href: "/reels" },
        { label: "Communautés", icon: Users, href: "/communities", badge: "2" },
        { label: "Messages", icon: MessageSquare, href: "/messages", badge: dailyBrief?.unreadNotifications },
    ];

    const MARKET_ITEMS = [
        { label: "Marketplace", icon: Store, href: "/marketplace" },
        { label: "Carte", icon: Map, href: "/map" },
        { label: "Mon Dossier", icon: FolderOpen, href: "/dossier" },
    ];

    return (
        <div className={cn("pb-6 flex flex-col h-[calc(100vh-5.5rem)] sticky top-[5.5rem]", className)}>

            {/* User Profile Snippet (Mobile/Tablet replacement or just top anchor) */}
            <div className="mb-8 px-2">
                <Link href="/profile" className="flex items-center gap-3 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group">
                    {currentUser.image ? (
                        <Avatar className="w-10 h-10 border border-zinc-200 dark:border-zinc-700">
                            <AvatarImage src={currentUser.image} />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                    ) : (
                        <div className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                            <CatAvatar traits={DEFAULT_CAT_TRAITS} size={40} className="w-full h-full" />
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline decoration-zinc-400 underline-offset-4">
                            {currentUser.name}
                        </span>
                        <span className="text-xs text-zinc-500">@{currentUser.handle}</span>
                    </div>
                </Link>
            </div>

            {/* Navigation Groups */}
            <nav className="flex-1 space-y-8 px-2 overflow-y-auto scrollbar-hide">

                {/* Main Nav */}
                <div className="space-y-1">
                    {NAV_ITEMS.map((item) => (
                        <NavItem key={item.href} item={item} isActive={isActive(item.href)} />
                    ))}
                </div>

                {/* Marketplace Segment */}
                <div>
                    <h3 className="px-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Immobilier</h3>
                    <div className="space-y-1">
                        {MARKET_ITEMS.map((item) => (
                            <NavItem key={item.href} item={item} isActive={isActive(item.href)} />
                        ))}
                    </div>
                </div>

                {/* Daily Brief Mini-Card (Redesigned) */}
                {dailyBrief?.nextEvent && (
                    <div className="mt-6 mx-2 p-4 rounded-2xl bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200/50 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
                        <div className="flex items-start justify-between mb-3">
                            <span className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg">
                                <Calendar size={16} />
                            </span>
                            <span className="text-[10px] font-medium text-zinc-400 uppercase">Next Up</span>
                        </div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight mb-1">
                            {dailyBrief.nextEvent.title}
                        </p>
                        <p className="text-xs text-zinc-500">
                            {dailyBrief.nextEvent.time} • {dailyBrief.nextEvent.location}
                        </p>
                    </div>
                )}
            </nav>

            {/* Footer / Utilities */}
            <div className="mt-auto pt-4 px-4 border-t border-zinc-100 dark:border-zinc-800">
                <nav className="flex flex-col gap-1">
                    <NavItem item={{ label: "Paramètres", icon: Settings, href: "/settings" }} isActive={isActive("/settings")} isSmall />
                    <NavItem item={{ label: "Aide", icon: HelpCircle, href: "/help" }} isActive={isActive("/help")} isSmall />
                </nav>
                <div className="mt-6 text-[10px] text-zinc-400">
                    © 2025 Transpareo Social
                </div>
            </div>
        </div>
    );
}

function NavItem({ item, isActive, isSmall }: { item: any, isActive: boolean, isSmall?: boolean }) {
    return (
        <Link href={item.href}>
            <div className={cn(
                "group flex items-center justify-between px-4 py-2.5 rounded-2xl transition-all duration-300 ease-out border border-transparent",
                isActive
                    ? "bg-white/80 dark:bg-white/10 backdrop-blur-md shadow-sm border-zinc-200/50 dark:border-zinc-800 text-zinc-900 dark:text-white"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 hover:pl-5 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}>
                <div className="flex items-center gap-3">
                    <item.icon strokeWidth={isActive ? 2.5 : 2} className={cn(
                        "transition-transform duration-300 group-hover:scale-110",
                        isSmall ? "w-4 h-4" : "w-5 h-5",
                        isActive && "text-orange-600 dark:text-orange-400"
                    )} />
                    <span className={cn(
                        isSmall ? "text-xs" : "text-[15px]",
                        isActive ? "font-bold" : "font-medium"
                    )}>
                        {item.label}
                    </span>
                </div>
                {item.badge && (
                    <span className={cn(
                        "text-[10px] font-bold px-1.5 h-5 min-w-[1.25rem] flex items-center justify-center rounded-full",
                        isActive
                            ? "bg-orange-600 text-white shadow-sm shadow-orange-500/30"
                            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors"
                    )}>
                        {item.badge}
                    </span>
                )}
            </div>
        </Link>
    );
}

