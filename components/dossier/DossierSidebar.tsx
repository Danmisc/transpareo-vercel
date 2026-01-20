"use client";

import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    Users,
    Briefcase,
    ShieldCheck,
    Calendar,
    Video,
    ThumbsUp,
    User,
    ChevronRight,
    LogOut,
    Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

interface DossierSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function DossierSidebar({ activeTab, onTabChange }: DossierSidebarProps) {

    // Aligned with Owner Dashboard Categories
    const MENU_ITEMS = [
        {
            category: "Principal",
            items: [
                { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
                { id: "cv", label: "Mon CV Locataire", icon: User },
                { id: "videopitch", label: "Video Pitch", icon: Video },
            ]
        },
        {
            category: "Dossier",
            items: [
                { id: "documents", label: "Mes Documents", icon: FileText },
                { id: "history", label: "Historique Loyer", icon: Calendar },
                { id: "guarantors", label: "Garants", icon: Users },
                { id: "groups", label: "Groupe (Couple)", icon: Users },
            ]
        },
        {
            category: "Confiance",
            items: [
                { id: "recommendations", label: "Recommandations", icon: ThumbsUp },
                { id: "security", label: "Sécurité & Vérif.", icon: ShieldCheck },
                { id: "applications", label: "Mes Candidatures", icon: Briefcase },
            ]
        }
    ];

    const NavContent = () => (
        <div className="space-y-6">
            {MENU_ITEMS.map((group, idx) => (
                <div key={idx}>
                    <h4 className="mb-3 px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {group.category}
                    </h4>
                    <div className="space-y-1">
                        {group.items.map((item) => {
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onTabChange(item.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                                        isActive
                                            ? "bg-zinc-900 text-white shadow-md shadow-zinc-200"
                                            : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon
                                            size={18}
                                            className={cn(
                                                isActive ? "text-orange-400" : "text-zinc-400 group-hover:text-zinc-600"
                                            )}
                                        />
                                        {item.label}
                                    </div>
                                    {isActive && (
                                        <ChevronRight size={14} className="text-zinc-500/50" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex flex-col w-[280px] h-[calc(100vh-4rem)] bg-white border-r border-zinc-100 sticky top-20 rounded-2xl shadow-sm overflow-hidden">

                {/* Header: User Profile Simplified */}
                <div className="p-6 border-b border-zinc-50">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Avatar className="h-10 w-10 ring-2 ring-orange-100">
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>MO</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm flex items-center gap-1">
                                <Crown size={8} fill="currentColor" /> Pro
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-zinc-900">Mon Dossier</h3>
                            <p className="text-xs text-zinc-400">Locataire Vérifié</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <ScrollArea className="flex-1 py-6 px-4">
                    <NavContent />
                </ScrollArea>

                {/* Footer Actions */}
                <div className="p-4 border-t border-zinc-50 bg-zinc-50/50">
                    <div className="p-3 bg-white rounded-xl border border-zinc-100 shadow-sm mb-3">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-zinc-500">Complétude</span>
                            <span className="text-xs font-bold text-emerald-600">85%</span>
                        </div>
                        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[85%]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden fixed bottom-20 right-4 z-50">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button size="icon" className="h-14 w-14 rounded-full shadow-xl bg-zinc-900 hover:bg-zinc-800 text-white border-4 border-white">
                            <Menu size={24} />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[85%] max-w-[300px] p-0">
                        <div className="p-6 border-b border-zinc-50">
                            <h3 className="text-lg font-bold text-zinc-900">Menu Dossier</h3>
                        </div>
                        <div className="p-4">
                            <NavContent />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}

