"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Home, Hash, PlayCircle, Users, MessageSquare,
    Settings, HelpCircle, Search, Plus, Compass, ChevronDown, Layers, LayoutGrid, ArrowLeft
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CatAvatar, DEFAULT_CAT_TRAITS } from "@/components/profile/CatAvatar";
import { Button } from "@/components/ui/button";
import { CreateCommunityWizard } from "./CreateCommunityWizard";
import { getCommunities } from "@/lib/community-actions";

export function CommunitySidebarLeft({ className, user }: { className?: string, user?: any }) {
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;
    const [communities, setCommunities] = useState<any[]>([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    useEffect(() => {
        async function load() {
            const { data } = await getCommunities();
            if (data) setCommunities(data);
        }
        load();
    }, []);

    const currentUser = user || { name: "Altaf", handle: "altaf_ux", image: null };

    const COMMUNITY_ITEMS = [
        { label: "Découvrir", icon: Compass, href: "/communities" },
        { label: "Mes Communautés", icon: Users, href: "/communities/joined" },
    ];

    return (
        <div className={cn("pb-6 flex flex-col h-[calc(100vh-5.5rem)] sticky top-[5.5rem]", className)}>

            {/* Back Button */}
            <div className="mb-4 px-2">
                <Link href="/" className="flex items-center gap-2 px-3 py-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                    <ArrowLeft size={18} />
                    <span className="font-medium text-sm">Retour</span>
                </Link>
            </div>


            {/* User Profile Snippet */}
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

            <nav className="flex-1 space-y-8 px-2 overflow-y-auto scrollbar-hide">



                {/* Community Controls */}
                <div>
                    <h3 className="px-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Communautés</h3>
                    <div className="space-y-1">
                        {COMMUNITY_ITEMS.map((item) => (
                            <NavItem key={item.href} item={item} isActive={isActive(item.href)} />
                        ))}

                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            variant="ghost"
                            className="w-full justify-start px-4 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl h-10"
                        >
                            <Plus size={20} className="mr-3 text-orange-600" />
                            <span className="text-[15px] font-medium text-orange-600">Créer un groupe</span>
                        </Button>
                    </div>
                </div>


            </nav>

            {/* Footer */}
            <div className="mt-auto pt-4 px-4 border-t border-zinc-100 dark:border-zinc-800">
                <nav className="flex flex-col gap-1">
                    <NavItem item={{ label: "Paramètres", icon: Settings, href: "/settings" }} isActive={isActive("/settings")} isSmall />
                    <NavItem item={{ label: "Aide", icon: HelpCircle, href: "/help" }} isActive={isActive("/help")} isSmall />
                </nav>
                <div className="mt-6 text-[10px] text-zinc-400">
                    © 2025 Transpareo Social
                </div>
            </div>

            <CreateCommunityWizard userId={currentUser.id || "demo"} open={isCreateOpen} onOpenChange={setIsCreateOpen} />
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
            </div>
        </Link>
    );
}
