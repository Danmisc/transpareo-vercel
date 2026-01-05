"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Home,
    Compass,
    FileText,
    MessageCircle,
    Film,
    Bell,
    Settings,
    LogOut,
    User,
    PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "./UserDropdown"; // Reuse existing if possible or rebuild lightly

interface AppSidebarProps {
    userId?: string;
    userImage?: string | null;
    userName?: string | null;
    className?: string; // Allow custom styling for layout integration
}

export function AppSidebar({ userId, userImage, userName, className }: AppSidebarProps) {
    const pathname = usePathname();

    const NAV_ITEMS = [
        { label: "Social", icon: Home, href: "/", activePattern: /^\/$/ },
        { label: "Immobilier", icon: Compass, href: "/marketplace", activePattern: /^\/marketplace/ },
        { label: "Mon Dossier", icon: FileText, href: "/dossier", activePattern: /^\/dossier/ },
        { label: "Messagerie", icon: MessageCircle, href: "/messages", activePattern: /^\/messages/ },
        { label: "Reels", icon: Film, href: "/reels", activePattern: /^\/reels/ },
    ];

    if (!userId) return null; // Or show public nav

    return (
        <aside className={cn("flex flex-col h-screen sticky top-0 bg-white border-r border-zinc-200 w-[240px] hidden md:flex", className)}>
            {/* Logo Section */}
            <div className="p-6 pb-2">
                <Link href="/" className="flex items-center gap-2">
                    <div className="bg-orange-500 rounded-lg p-1.5 shadow-md shadow-orange-500/20">
                        <Home className="text-white h-5 w-5" />
                    </div>
                    <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
                        Transpareo
                    </span>
                </Link>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-6 space-y-1">
                {NAV_ITEMS.map((item) => {
                    const isActive = item.activePattern.test(pathname);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                                isActive
                                    ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/10"
                                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                            )}
                        >
                            <item.icon size={20} className={cn("", isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-900")} />
                            {item.label}
                            {isActive && (
                                <div className="absolute right-2 w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-zinc-100 space-y-4">
                {/* Quick Action Button */}
                <Button className="w-full justify-start gap-2 bg-zinc-50 text-zinc-900 hover:bg-zinc-100 border border-zinc-200 shadow-sm" variant="ghost">
                    <PlusCircle size={18} className="text-orange-500" />
                    Créer...
                </Button>

                {/* User Profile Mini */}
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer">
                    <div className="w-9 h-9 rounded-full bg-zinc-200 overflow-hidden border border-zinc-100">
                        {userImage ? (
                            <img src={userImage} alt={userName || "User"} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-500">
                                <User size={16} />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 truncate">{userName || "Utilisateur"}</p>
                        <p className="text-xs text-zinc-500 truncate">Voir mon profil</p>
                    </div>
                    <Settings size={16} className="text-zinc-400" />
                </div>
            </div>
        </aside>
    );
}
