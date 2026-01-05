"use client";

import Link from "next/link";
import {
    Users, Building, MapPin, Hash, Bookmark, TrendingUp, User, MessageCircle, Home,
    Star, Shield, PlusCircle, Calendar, Zap, Activity, Info, Camera, Key, Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress"; // Ensure this exists or I'll inline it
import { usePathname } from "next/navigation";

// --- Mock Data for "Visionary" Widgets ---
export function SidebarLeft({ className, user, dailyBrief }: { className?: string, user?: any, dailyBrief?: any }) {
    const pathname = usePathname();

    // Dynamic Greeting
    const hour = new Date().getHours();
    const timeGreeting = hour < 18 ? "Bonjour" : "Bonsoir";
    const weatherIcon = hour > 6 && hour < 20 ? "☀️" : "🌙";

    // Mock user for visual structure if undefined
    const currentUser = user || {
        name: "Altaf",
        handle: "altaf_ux",
        image: "/avatars/default.png",
        stats: { reputation: 4.8 }
    };

    const isActive = (path: string) => pathname === path;

    return (
        <div className={cn("pb-6 flex flex-col h-[calc(100vh-5.5rem)] sticky top-[5.5rem]", className)}>
            <div className="flex-1 overflow-y-auto scrollbar-hide pr-2">
                <div className="space-y-6">

                    {/* 1. 🧠 THE DAILY BRIEF (Smart Header) */}
                    <div className="relative overflow-hidden rounded-2xl p-4 glass-card group border-orange-100/50 dark:border-orange-900/20 bg-gradient-to-br from-orange-50/80 to-white/50 dark:from-zinc-900 dark:to-zinc-950">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600/70 dark:text-orange-400/70">
                                    Brief Quotidien • {weatherIcon}
                                </span>
                                <Zap className="w-3 h-3 text-orange-500 fill-orange-500 animate-pulse" />
                            </div>
                            <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 leading-tight">
                                {timeGreeting} {currentUser.name.split(' ')[0]},
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                                {dailyBrief?.newListings
                                    ? `Il y a ${dailyBrief.newListings} nouvelles annonces dans votre secteur.`
                                    : "Aucune nouvelle annonce pour le moment."}
                            </p>
                        </div>
                        {/* Ambient Glow */}
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-orange-400/20 blur-3xl rounded-full" />
                    </div>

                    {/* 2. 🧭 NAVIGATION UNIVERSES */}
                    <nav className="space-y-6">
                        {/* A. SOCIAL */}
                        <div className="space-y-1">
                            <h3 className="px-3 text-[10px] font-black uppercase text-zinc-400/80 tracking-widest mb-2">Social</h3>
                            <NavItem icon={Home} label="Pour vous" href="/" active={isActive("/")} />
                            <NavItem icon={Hash} label="Explorer" href="/search" active={isActive("/search")} />
                            <NavItem icon={Camera} label="Reels" href="/reels" active={isActive("/reels")} />
                            <NavItem icon={Users} label="Communautés" href="/communities" active={isActive("/communities")} badge="2" />
                            <NavItem icon={MessageCircle} label="Messages" href="/messages" active={isActive("/messages")} badge={dailyBrief?.unreadNotifications > 0 ? dailyBrief.unreadNotifications : undefined} />
                        </div>

                        {/* B. REAL ESTATE (Market) */}
                        <div className="space-y-1">
                            <h3 className="px-3 text-[10px] font-black uppercase text-zinc-400/80 tracking-widest mb-2">Immobilier</h3>
                            <NavItem icon={Building} label="Marketplace" href="/marketplace" active={isActive("/marketplace")} color="text-orange-500" />
                            <NavItem icon={MapPin} label="Carte Interactive" href="/map" active={isActive("/map")} color="text-emerald-500" />
                            <NavItem icon={Shield} label="Mon Dossier" href="/dossier" active={isActive("/dossier")} color="text-blue-500" />
                        </div>
                    </nav>

                    {/* 3. ⚡ SMART AGENDA */}
                    {dailyBrief?.nextEvent && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-zinc-900 dark:to-zinc-900 rounded-2xl p-3 border border-blue-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">Prochaine Action</span>
                            </div>
                            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{dailyBrief.nextEvent.title}</p>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{dailyBrief.nextEvent.time} • {dailyBrief.nextEvent.location}</p>
                        </div>
                    )}

                </div>
            </div>

            {/* 5. 🦶 COMPLETE FOOTER */}
            <div className="mt-auto pt-4 px-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex flex-wrap gap-x-3 gap-y-2 mb-3">
                    <Link href="/about" className="text-[10px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">À propos</Link>
                    <Link href="/help" className="text-[10px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">Aide</Link>
                    <Link href="/privacy" className="text-[10px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">Confidentialité</Link>
                    <Link href="/terms" className="text-[10px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">CGU</Link>
                </div>
                <div className="flex justify-between items-center text-[10px] text-zinc-400 dark:text-zinc-600">
                    <span>© 2025 Transpareo</span>
                    <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        v2.4
                    </span>
                </div>
            </div>
        </div>
    );
}

// --- Helper Components ---

function NavItem({ icon: Icon, label, href, active, badge, color }: any) {
    return (
        <Link href={href}>
            <div className={cn(
                "group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200",
                active
                    ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/10 dark:bg-white dark:text-black dark:shadow-white/5"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}>
                <div className="flex items-center gap-3">
                    <Icon className={cn(
                        "w-4 h-4 transition-transform group-hover:scale-110",
                        active ? "text-current" : (color || "text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300")
                    )} />
                    <span className={cn("text-sm font-medium", active ? "font-bold" : "")}>{label}</span>
                </div>
                {badge && (
                    <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                        active ? "bg-white/20 text-white dark:bg-black/10 dark:text-black" : "bg-red-500 text-white"
                    )}>
                        {badge}
                    </span>
                )}
            </div>
        </Link>
    );
}

function ActionButton({ icon: Icon, label }: any) {
    return (
        <button className="w-full flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-zinc-600 dark:text-zinc-400 hover:text-primary dark:hover:text-primary">
            <Icon className="w-4 h-4" />
        </button>
    );
}
