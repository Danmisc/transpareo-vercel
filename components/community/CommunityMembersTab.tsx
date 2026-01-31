"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crown, Shield, Search, UserPlus, UserMinus, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommunityMember {
    id: string;
    name: string;
    avatar?: string | null;
    role: "ADMIN" | "MODERATOR" | "MEMBER";
    joinedAt: Date;
    isOnline?: boolean;
}

interface CommunityMembersTabProps {
    members: CommunityMember[];
    currentUserId?: string;
    isAdmin?: boolean;
    totalCount: number;
    onLoadMore?: () => void;
    hasMore?: boolean;
}

const ROLE_BADGES = {
    ADMIN: { icon: Crown, label: "Admin", color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30" },
    MODERATOR: { icon: Shield, label: "Mod", color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30" },
    MEMBER: null
};

export function CommunityMembersTab({
    members,
    currentUserId,
    isAdmin = false,
    totalCount,
    onLoadMore,
    hasMore = false
}: CommunityMembersTabProps) {
    const [searchQuery, setSearchQuery] = React.useState("");

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort: Admins first, then Moderators, then Members
    const sortedMembers = [...filteredMembers].sort((a, b) => {
        const roleOrder = { ADMIN: 0, MODERATOR: 1, MEMBER: 2 };
        return roleOrder[a.role] - roleOrder[b.role];
    });

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                    placeholder="Rechercher un membre..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                />
            </div>

            {/* Member Count */}
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {totalCount.toLocaleString()} membre{totalCount > 1 ? "s" : ""}
            </p>

            {/* Members List */}
            <div className="space-y-2">
                {sortedMembers.map((member, index) => {
                    const roleBadge = ROLE_BADGES[member.role];

                    return (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.03 }}
                        >
                            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors group">
                                <Link href={`/profile/${member.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="relative">
                                        <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-orange-200 dark:group-hover:ring-orange-800 transition-all">
                                            <AvatarImage src={member.avatar || undefined} alt={member.name} />
                                            <AvatarFallback className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 text-orange-700 dark:text-orange-300 font-semibold">
                                                {member.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        {member.isOnline && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                                                {member.name}
                                            </span>
                                            {roleBadge && (
                                                <span className={cn(
                                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                                                    roleBadge.color
                                                )}>
                                                    <roleBadge.icon className="w-3 h-3" />
                                                    {roleBadge.label}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            Membre depuis {new Date(member.joinedAt).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                                        </p>
                                    </div>
                                </Link>

                                {/* Admin Actions */}
                                {isAdmin && member.id !== currentUserId && member.role === "MEMBER" && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-500">
                                        <UserMinus className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Load More */}
            {hasMore && (
                <div className="text-center pt-4">
                    <Button variant="outline" onClick={onLoadMore}>
                        Charger plus de membres
                    </Button>
                </div>
            )}

            {/* Empty State */}
            {filteredMembers.length === 0 && (
                <div className="text-center py-12 text-zinc-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun membre trouvé</p>
                </div>
            )}
        </div>
    );
}
