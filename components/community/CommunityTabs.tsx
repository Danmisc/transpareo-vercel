"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, MessageSquare, Users, Image as ImageIcon, Calendar, FolderOpen, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommunityTabsProps {
    children: React.ReactNode;
    defaultTab?: string;
    className?: string;
    isAdmin?: boolean;
}

const TAB_CONFIG = [
    { id: "feed", label: "Publications", icon: MessageSquare },
    { id: "resources", label: "Ressources", icon: FolderOpen },
    { id: "about", label: "À propos", icon: FileText },
    { id: "members", label: "Membres", icon: Users },
    { id: "media", label: "Média", icon: ImageIcon },
    { id: "events", label: "Événements", icon: Calendar },
    { id: "admin", label: "Admin", icon: Shield, adminOnly: true },
];

export function CommunityTabs({ children, defaultTab = "feed", className, isAdmin = false }: CommunityTabsProps) {
    const visibleTabs = TAB_CONFIG.filter(tab => !tab.adminOnly || isAdmin);

    return (
        <Tabs defaultValue={defaultTab} className={cn("w-full", className)}>
            <TabsList className="w-full justify-start h-auto p-1.5 bg-zinc-100/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/20 dark:border-zinc-800 overflow-x-auto scrollbar-hide">
                {visibleTabs.map((tab) => (
                    <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className={cn(
                            "flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300",
                            "data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800",
                            "data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400",
                            "data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/10",
                            "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-white/50 dark:hover:bg-zinc-800/50"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span className="whitespace-nowrap">{tab.label}</span>
                    </TabsTrigger>
                ))}
            </TabsList>

            {children}
        </Tabs>
    );
}

export function CommunityTabContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
    return (
        <TabsContent value={value} className={cn("mt-6", className)}>
            {children}
        </TabsContent>
    );
}

// Re-export tabs content for convenience
export { TabsContent } from "@/components/ui/tabs";
