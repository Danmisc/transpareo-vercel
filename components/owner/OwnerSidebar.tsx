"use client";

import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Building2,
    Users,
    Wallet,
    Wrench,
    Scale,
    FileText,
    MessageSquare,
    Settings,
    LogOut,
    Crown,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface OwnerSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    user: any;
}

export function OwnerSidebar({ activeTab, onTabChange, user }: OwnerSidebarProps) {

    // High-end navigation structure
    const MENU_ITEMS = [
        {
            category: "Gestion",
            items: [
                { id: "overview", label: "Cockpit", icon: LayoutDashboard },
                { id: "properties", label: "Mes Biens", icon: Building2 },
                { id: "tenants", label: "Locataires", icon: Users },
            ]
        },
        {
            category: "Performance",
            items: [
                { id: "finance", label: "Finance & Fiscalité", icon: Wallet },
                { id: "maintenance", label: "Travaux & Tickets", icon: Wrench },
            ]
        },
        {
            category: "Ecosystème",
            items: [
                { id: "legal", label: "Juridique IA", icon: Scale },
                { id: "documents", label: "Coffre-fort", icon: FileText },
            ]
        }
    ];

    const userInitials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        : 'MP';

    return (
        <div className="hidden lg:flex flex-col w-[280px] h-[calc(100vh-4rem)] bg-white border-r border-zinc-100 sticky top-20 rounded-2xl shadow-sm overflow-hidden">

            {/* Header: User Profile Simplified */}
            <div className="p-6 border-b border-zinc-50">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="h-10 w-10 ring-2 ring-emerald-100">
                            <AvatarImage src={user?.image} />
                            <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm flex items-center gap-1">
                            <Crown size={8} fill="currentColor" /> Pro
                        </div>
                    </div>
                    <div className="overflow-hidden">
                        <h3 className="text-sm font-bold text-zinc-900 truncate">{user?.name || "Mon Profil"}</h3>
                        <p className="text-xs text-zinc-400 truncate">{user?.email || "Investisseur"}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 py-6 px-4">
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
                                                        isActive ? "text-emerald-400" : "text-zinc-400 group-hover:text-zinc-600"
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
            </ScrollArea>

            {/* Footer Actions */}
            <div className="p-4 border-t border-zinc-50 bg-zinc-50/50">
                <Button variant="outline" className="w-full justify-start text-zinc-500 hover:text-red-500 hover:bg-red-50 border-zinc-200 hover:border-red-100">
                    <LogOut size={16} className="mr-2" /> Déconnexion
                </Button>
            </div>
        </div>
    );
}

