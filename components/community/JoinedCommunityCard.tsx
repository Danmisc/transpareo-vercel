"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    MoreHorizontal, Bell, BellOff, Pin, PinOff, LogOut,
    Shield, User, MessageSquare, Activity
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface JoinedCommunityCardProps {
    community: any;
    role?: "ADMIN" | "MODERATOR" | "MEMBER";
    isPinned?: boolean;
    hasUnread?: boolean;
}

export function JoinedCommunityCard({ community, role = "MEMBER", isPinned = false, hasUnread = false }: JoinedCommunityCardProps) {
    const isAdmin = role === "ADMIN" || role === "MODERATOR";

    return (
        <div className={cn(
            "group relative flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-2xl border transition-all duration-300",
            isAdmin
                ? "bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-900/50 border-indigo-100 dark:border-indigo-900/30 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800"
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700"
        )}>

            {/* Status Indicators */}
            {hasUnread && (
                <span className="absolute top-4 right-4 md:hidden flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                </span>
            )}

            <Link href={`/communities/${community.slug}`} className="relative shrink-0">
                <Avatar className={cn(
                    "h-16 w-16 md:h-20 md:w-20 rounded-2xl border-2 shadow-sm transition-transform group-hover:scale-105",
                    isAdmin ? "border-indigo-100 dark:border-indigo-900" : "border-zinc-100 dark:border-zinc-800"
                )}>
                    <AvatarImage src={community.image} className="object-cover" />
                    <AvatarFallback className="rounded-2xl text-lg font-bold bg-zinc-100 dark:bg-zinc-800">
                        {community.name[0]}
                    </AvatarFallback>
                </Avatar>
                {isAdmin && (
                    <div className="absolute -bottom-2 -right-2 bg-indigo-500 text-white p-1 rounded-full border-2 border-white dark:border-zinc-900" title="Admin">
                        <Shield size={12} fill="currentColor" />
                    </div>
                )}
            </Link>

            <div className="flex-1 min-w-0 w-full">
                <div className="flex items-start justify-between mb-1">
                    <Link href={`/communities/${community.slug}`} className="group/title">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover/title:text-indigo-600 dark:group-hover/title:text-indigo-400 transition-colors flex items-center gap-2">
                            {community.name}
                            {isPinned && <Pin size={14} className="text-zinc-400 rotate-45" fill="currentColor" />}
                        </h3>
                    </Link>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-2">
                        {hasUnread && (
                            <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-transparent mr-2">
                                3 nouveaux
                            </Badge>
                        )}
                        <Link href={`/communities/${community.slug}`}>
                            <Button variant="outline" size="sm" className="rounded-xl h-9 border-zinc-200 dark:border-zinc-700">
                                Ouvrir
                            </Button>
                        </Link>
                        <CommunityMenu role={role} isPinned={isPinned} />
                    </div>
                    {/* Mobile Menu */}
                    <div className="md:hidden absolute top-3 right-3">
                        <CommunityMenu role={role} isPinned={isPinned} />
                    </div>
                </div>

                <p className="text-sm text-zinc-500 line-clamp-1 mb-3 pr-8 md:pr-0">
                    {community.description || "Une communauté passionnante à découvrir."}
                </p>

                <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium">
                    <div className="flex items-center gap-1.5">
                        <User size={14} className="text-zinc-400" />
                        {community._count?.members || 0} membres
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Activity size={14} className="text-green-500" />
                        Trés actif
                    </div>
                    {role !== "MEMBER" && (
                        <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full">
                            <Shield size={12} />
                            {role === "ADMIN" ? "Administrateur" : "Modérateur"}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Actions Bottom */}
            <div className="md:hidden w-full flex gap-2 mt-2">
                <Link href={`/communities/${community.slug}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full rounded-xl">Ouvrir</Button>
                </Link>
            </div>
        </div>
    );
}

function CommunityMenu({ role, isPinned }: { role: string, isPinned: boolean }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                    <MoreHorizontal size={18} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                    {isPinned ? <PinOff className="mr-2 h-4 w-4" /> : <Pin className="mr-2 h-4 w-4" />}
                    {isPinned ? "Désépingler" : "Épingler"}
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <BellOff className="mr-2 h-4 w-4" />
                    Muter les notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {role === "ADMIN" ? (
                    <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Paramètres Admin
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20">
                        <LogOut className="mr-2 h-4 w-4" />
                        Quitter le groupe
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
// Helper icon import
import { Settings } from "lucide-react";
