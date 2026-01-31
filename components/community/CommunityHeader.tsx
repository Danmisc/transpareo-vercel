"use client";

import React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Users,
    Lock,
    Globe,
    Shield,
    Settings,
    Share2,
    Bell,
    BellOff,
    MoreHorizontal,
    Crown,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { JoinButton } from "./JoinButton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface CommunityHeaderProps {
    community: {
        id: string;
        name: string;
        slug: string;
        description?: string | null;
        type: "PUBLIC" | "PRIVATE";
        image?: string | null;
        coverImage?: string | null;
        _count: {
            members: number;
            posts?: number;
        };
    };
    isMember: boolean;
    isAdmin: boolean;
    userId?: string;
    onSettingsClick?: () => void;
    onNotificationToggle?: () => void;
    isNotificationsEnabled?: boolean;
}

export function CommunityHeader({
    community,
    isMember,
    isAdmin,
    userId,
    onSettingsClick,
    onNotificationToggle,
    isNotificationsEnabled = true
}: CommunityHeaderProps) {
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 300], [0, 100]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-white/20 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-xl overflow-hidden relative group"
        >
            {/* Cover Image with Parallax */}
            <div className="relative h-48 md:h-56 overflow-hidden">
                <motion.div style={{ y, opacity }} className="absolute inset-0 w-full h-full">
                    {community.coverImage ? (
                        <img
                            src={community.coverImage}
                            alt={`${community.name} cover`}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600 relative overflow-hidden">
                            {/* Abstract Pattern */}
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute top-1/4 -left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
                                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/30 rounded-full blur-3xl" />
                            </div>
                            <div className="absolute bottom-4 right-4 flex items-center gap-2 text-white/60 text-sm">
                                <Sparkles className="w-4 h-4" />
                                Communauté Transpareo
                            </div>
                        </div>
                    )}

                </motion.div>

                {/* Overlay gradient for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="relative px-6 pb-6">
                {/* Avatar - positioned to overlap cover */}
                <div className="-mt-16 mb-4 flex items-end justify-between">
                    <Avatar className="h-28 w-28 border-4 border-white dark:border-zinc-950 shadow-xl ring-4 ring-orange-500/20">
                        <AvatarImage src={community.image || undefined} alt={community.name} />
                        <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                            {community.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    {/* Actions - Desktop */}
                    <div className="hidden sm:flex items-center gap-2">
                        {isMember && (
                            <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                    "rounded-full",
                                    isNotificationsEnabled
                                        ? "text-zinc-600 dark:text-zinc-400"
                                        : "text-zinc-400"
                                )}
                                onClick={onNotificationToggle}
                            >
                                {isNotificationsEnabled ? (
                                    <><Bell className="w-4 h-4 mr-2" /> Notifications</>
                                ) : (
                                    <><BellOff className="w-4 h-4 mr-2" /> Désactivées</>
                                )}
                            </Button>
                        )}

                        <Button variant="outline" size="sm" className="rounded-full">
                            <Share2 className="w-4 h-4 mr-2" />
                            Partager
                        </Button>

                        {isAdmin && (
                            <Link href={`/communities/${community.slug}/manage`} passHref>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full text-orange-600 border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950/30"
                                >
                                    <Settings className="w-4 h-4 mr-2" />
                                    Gérer
                                </Button>
                            </Link>
                        )}

                        {userId && (
                            <JoinButton
                                communityId={community.id}
                                userId={userId}
                                isMember={isMember}
                            />
                        )}
                    </div>
                </div>

                {/* Title & Stats */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                {community.name}
                            </h1>
                            {isAdmin && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                    <Crown className="w-3 h-3" />
                                    Admin
                                </span>
                            )}
                        </div>

                        <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-2xl line-clamp-2">
                            {community.description || "Aucune description"}
                        </p>

                        {/* Stats Row */}
                        <div className="flex items-center gap-4 mt-4 text-sm">
                            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                                <Users className="h-4 w-4 text-orange-500" />
                                <strong>{community._count.members.toLocaleString()}</strong> membres
                            </span>
                            <span className="flex items-center gap-1.5">
                                {community.type === "PUBLIC" ? (
                                    <><Globe className="h-4 w-4 text-green-500" /> <span className="text-green-600 dark:text-green-400 font-medium">Public</span></>
                                ) : (
                                    <><Lock className="h-4 w-4 text-amber-500" /> <span className="text-amber-600 dark:text-amber-400 font-medium">Privé</span></>
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Mobile Actions */}
                <div className="flex sm:hidden items-center gap-2 mt-4">
                    {userId && (
                        <JoinButton
                            communityId={community.id}
                            userId={userId}
                            isMember={isMember}
                        />
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="rounded-full">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {isMember && (
                                <DropdownMenuItem onClick={onNotificationToggle}>
                                    {isNotificationsEnabled ? (
                                        <><Bell className="w-4 h-4 mr-2" /> Notifications</>
                                    ) : (
                                        <><BellOff className="w-4 h-4 mr-2" /> Activer notifs</>
                                    )}
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                                <Share2 className="w-4 h-4 mr-2" />
                                Partager
                            </DropdownMenuItem>
                            {isAdmin && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href={`/communities/${community.slug}/manage`}>
                                            <Settings className="w-4 h-4 mr-2" />
                                            Admin Dashboard
                                        </Link>
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </motion.div>
    );
}
