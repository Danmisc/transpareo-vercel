"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Users, Lock, Globe, Crown, Shield, Check,
    UserPlus, MessageSquare, ImageIcon, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface Community {
    id: string;
    name: string;
    description?: string | null;
    image?: string | null;
    coverImage?: string | null;
    isPrivate?: boolean;
    category?: string | null;
    _count?: {
        members?: number;
        posts?: number;
    };
    members?: {
        id: string;
        avatar?: string | null;
    }[];
    isMember?: boolean;
    isAdmin?: boolean;
}

interface CommunityCardProps {
    community: Community;
    onJoin?: (id: string) => void;
    variant?: "default" | "compact" | "featured";
}

export function CommunityCard({
    community,
    onJoin,
    variant = "default"
}: CommunityCardProps) {
    const [isJoined, setIsJoined] = useState(community.isMember || false);
    const [isLoading, setIsLoading] = useState(false);

    const handleJoin = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (onJoin) {
            setIsLoading(true);
            try {
                await onJoin(community.id);
                setIsJoined(!isJoined);
            } finally {
                setIsLoading(false);
            }
        }
    };

    if (variant === "compact") {
        return (
            <Link href={`/community/${community.id}`}>
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                    <div className="relative flex-shrink-0">
                        <Avatar className="h-12 w-12 rounded-xl">
                            <AvatarImage src={community.image || "/community-default.png"} />
                            <AvatarFallback className="rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 text-white">
                                {community.name?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        {community.isPrivate && (
                            <div className="absolute -bottom-1 -right-1 p-0.5 bg-zinc-900 rounded-full">
                                <Lock size={10} className="text-white" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-orange-500 transition-colors">
                            {community.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                            {community._count?.members?.toLocaleString() || 0} membres
                        </p>
                    </div>
                    <ChevronRight size={16} className="text-zinc-400 group-hover:text-orange-500 transition-colors" />
                </div>
            </Link>
        );
    }

    if (variant === "featured") {
        return (
            <Link href={`/community/${community.id}`}>
                <motion.div
                    whileHover={{ y: -4 }}
                    className="relative overflow-hidden rounded-2xl group cursor-pointer"
                >
                    {/* Cover image */}
                    <div className="aspect-[16/9] relative">
                        {community.coverImage ? (
                            <img
                                src={community.coverImage}
                                alt=""
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-orange-500 via-red-500 to-pink-500" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    </div>

                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex items-end gap-4">
                            <Avatar className="h-16 w-16 rounded-xl border-4 border-white shadow-xl">
                                <AvatarImage src={community.image || "/community-default.png"} />
                                <AvatarFallback className="rounded-xl bg-white text-zinc-900">
                                    {community.name?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-xl font-bold text-white truncate">
                                        {community.name}
                                    </h3>
                                    {community.isPrivate && (
                                        <Lock size={14} className="text-white/70" />
                                    )}
                                </div>
                                <p className="text-white/70 text-sm">
                                    {community._count?.members?.toLocaleString() || 0} membres • {community._count?.posts || 0} posts
                                </p>
                            </div>
                        </div>

                        {/* Member avatars */}
                        {community.members && community.members.length > 0 && (
                            <div className="flex items-center mt-4">
                                <div className="flex -space-x-2">
                                    {community.members.slice(0, 5).map((m, i) => (
                                        <img
                                            key={m.id}
                                            src={m.avatar || "/avatars/default.svg"}
                                            className="w-7 h-7 rounded-full border-2 border-white"
                                            alt=""
                                        />
                                    ))}
                                </div>
                                {(community._count?.members || 0) > 5 && (
                                    <span className="ml-2 text-xs text-white/70">
                                        +{((community._count?.members || 0) - 5).toLocaleString()} autres
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </Link>
        );
    }

    // Default variant
    return (
        <Link href={`/community/${community.id}`}>
            <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-orange-500/50 transition-all group cursor-pointer h-full">
                {/* Cover */}
                <div className="h-24 relative bg-gradient-to-br from-orange-500 to-pink-500">
                    {community.coverImage && (
                        <img
                            src={community.coverImage}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    )}
                    <div className="absolute -bottom-6 left-4">
                        <Avatar className="h-14 w-14 rounded-xl border-4 border-white dark:border-zinc-900 shadow-lg">
                            <AvatarImage src={community.image || "/community-default.png"} />
                            <AvatarFallback className="rounded-xl bg-white text-zinc-900 font-bold">
                                {community.name?.[0]}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>

                <CardContent className="pt-10 pb-4">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-orange-500 transition-colors">
                                    {community.name}
                                </h3>
                                {community.isPrivate && (
                                    <Lock size={12} className="text-zinc-400 flex-shrink-0" />
                                )}
                            </div>
                            {community.category && (
                                <p className="text-xs text-orange-500 font-medium mt-0.5">
                                    {community.category}
                                </p>
                            )}
                        </div>
                        <Button
                            size="sm"
                            variant={isJoined ? "secondary" : "default"}
                            onClick={handleJoin}
                            disabled={isLoading}
                            className={cn(
                                "h-8 text-xs rounded-full flex-shrink-0",
                                !isJoined && "bg-orange-500 hover:bg-orange-600"
                            )}
                        >
                            {isJoined ? (
                                <>
                                    <Check size={12} className="mr-1" />
                                    Membre
                                </>
                            ) : (
                                <>
                                    <UserPlus size={12} className="mr-1" />
                                    Rejoindre
                                </>
                            )}
                        </Button>
                    </div>

                    {community.description && (
                        <p className="text-xs text-zinc-500 mt-2 line-clamp-2">
                            {community.description}
                        </p>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-xs text-zinc-400">
                        <span className="flex items-center gap-1">
                            <Users size={12} />
                            {community._count?.members?.toLocaleString() || 0}
                        </span>
                        <span className="flex items-center gap-1">
                            <MessageSquare size={12} />
                            {community._count?.posts || 0}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

// Community card skeleton
export function CommunityCardSkeleton() {
    return (
        <Card className="overflow-hidden">
            <Skeleton className="h-24 rounded-none" />
            <CardContent className="pt-10 pb-4">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-2/3" />
            </CardContent>
        </Card>
    );
}

// Category chips for communities
const COMMUNITY_CATEGORIES = [
    { id: "all", label: "Toutes", icon: "🌐" },
    { id: "immobilier", label: "Immobilier", icon: "🏠" },
    { id: "investissement", label: "Investissement", icon: "💰" },
    { id: "deco", label: "Déco & Design", icon: "🎨" },
    { id: "juridique", label: "Juridique", icon: "⚖️" },
    { id: "networking", label: "Networking", icon: "🤝" },
    { id: "regional", label: "Régional", icon: "📍" },
];

interface CommunityCategoryFilterProps {
    selected: string;
    onChange: (category: string) => void;
}

export function CommunityCategoryFilter({ selected, onChange }: CommunityCategoryFilterProps) {
    return (
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
            <div className="flex gap-2" style={{ minWidth: "max-content" }}>
                {COMMUNITY_CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => onChange(cat.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                            selected === cat.id
                                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        )}
                    >
                        <span>{cat.icon}</span>
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

// Community grid
interface CommunityGridProps {
    communities: Community[];
    loading?: boolean;
    variant?: "default" | "compact";
}

export function CommunityGrid({ communities, loading = false, variant = "default" }: CommunityGridProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <CommunityCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (!communities.length) {
        return (
            <div className="text-center py-12 text-zinc-500">
                <Users size={48} className="mx-auto mb-4 opacity-20" />
                <p>Aucune communauté trouvée</p>
            </div>
        );
    }

    if (variant === "compact") {
        return (
            <div className="space-y-1">
                {communities.map(community => (
                    <CommunityCard key={community.id} community={community} variant="compact" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {communities.map((community, i) => (
                <motion.div
                    key={community.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                >
                    <CommunityCard community={community} />
                </motion.div>
            ))}
        </div>
    );
}

