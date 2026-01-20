"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    Users, UserPlus, Check, MapPin, Briefcase, UserCheck,
    Sparkles, ChevronRight, RefreshCw, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { followUser, unfollowUser } from "@/lib/actions";
import { toast } from "sonner";

// Types
interface RecommendedUser {
    id: string;
    name: string;
    avatar?: string | null;
    role?: string;
    bio?: string | null;
    location?: string | null;
    company?: string | null;
    headline?: string | null;
    _count?: {
        followedBy?: number;
        posts?: number;
    };
    reason?: string;
    mutualConnections?: number;
    isFollowing?: boolean;
}

interface RecommendedUsersProps {
    users: RecommendedUser[];
    currentUserId?: string;
    title?: string;
    showReason?: boolean;
    compact?: boolean;
    onRefresh?: () => void;
    loading?: boolean;
}

export function RecommendedUsers({
    users,
    currentUserId,
    title = "Suggestions pour vous",
    showReason = true,
    compact = false,
    onRefresh,
    loading = false
}: RecommendedUsersProps) {
    const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

    const handleFollow = async (userId: string) => {
        if (!currentUserId) {
            toast.error("Connectez-vous pour suivre");
            return;
        }

        try {
            const isFollowing = followingIds.has(userId);

            if (isFollowing) {
                await unfollowUser(currentUserId, userId);
                setFollowingIds(prev => {
                    const next = new Set(prev);
                    next.delete(userId);
                    return next;
                });
                toast.success("Vous ne suivez plus cet utilisateur");
            } else {
                await followUser(currentUserId, userId);
                setFollowingIds(prev => new Set(prev).add(userId));
                toast.success("Vous suivez maintenant cet utilisateur");
            }
        } catch (error) {
            toast.error("Erreur lors de l'action");
        }
    };

    const handleDismiss = (userId: string) => {
        setDismissedIds(prev => new Set(prev).add(userId));
    };

    const visibleUsers = users.filter(u => !dismissedIds.has(u.id));

    if (loading) {
        return (
            <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader className="pb-3">
                    <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="w-12 h-12 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-8 w-20 rounded-full" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (!visibleUsers.length) {
        return null;
    }

    return (
        <Card className="border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Sparkles size={14} className="text-orange-500" />
                    {title}
                </CardTitle>
                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                        <RefreshCw size={14} />
                    </button>
                )}
            </CardHeader>
            <CardContent className="space-y-1 px-3 pb-4">
                <AnimatePresence mode="popLayout">
                    {visibleUsers.slice(0, 5).map((user, i) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10, height: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="group relative"
                        >
                            <div className={cn(
                                "flex items-center gap-3 p-2 rounded-xl transition-all",
                                "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                            )}>
                                {/* Avatar */}
                                <Link href={`/profile/${user.id}`} className="flex-shrink-0">
                                    <Avatar className="h-11 w-11 border-2 border-white dark:border-zinc-800 shadow-sm">
                                        <AvatarImage src={user.avatar || "/avatars/default.svg"} />
                                        <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                                    </Avatar>
                                </Link>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <Link
                                        href={`/profile/${user.id}`}
                                        className="block"
                                    >
                                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-orange-500 transition-colors">
                                            {user.name}
                                        </p>
                                        {!compact && (
                                            <p className="text-xs text-zinc-500 truncate">
                                                {user.headline || user.role || "Membre"}
                                            </p>
                                        )}
                                        {showReason && user.reason && (
                                            <p className="text-[10px] text-zinc-400 mt-0.5 truncate">
                                                {user.reason}
                                            </p>
                                        )}
                                        {user.mutualConnections && user.mutualConnections > 0 && (
                                            <p className="text-[10px] text-blue-500 mt-0.5 flex items-center gap-1">
                                                <UserCheck size={10} />
                                                {user.mutualConnections} connexions mutuelles
                                            </p>
                                        )}
                                    </Link>
                                </div>

                                {/* Follow button */}
                                <Button
                                    variant={followingIds.has(user.id) ? "secondary" : "default"}
                                    size="sm"
                                    onClick={() => handleFollow(user.id)}
                                    className={cn(
                                        "h-8 text-xs rounded-full transition-all",
                                        followingIds.has(user.id)
                                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                                            : "bg-orange-500 hover:bg-orange-600 text-white"
                                    )}
                                >
                                    {followingIds.has(user.id) ? (
                                        <>
                                            <Check size={12} className="mr-1" />
                                            Suivi
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={12} className="mr-1" />
                                            Suivre
                                        </>
                                    )}
                                </Button>

                                {/* Dismiss button */}
                                <button
                                    onClick={() => handleDismiss(user.id)}
                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* See all link */}
                {users.length > 5 && (
                    <Link
                        href="/discover/people"
                        className="flex items-center justify-center gap-1 py-2 mt-2 text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors"
                    >
                        Voir tout
                        <ChevronRight size={14} />
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}

// Nearby Users component
interface NearbyUsersProps {
    users: RecommendedUser[];
    currentUserId?: string;
    location?: string;
}

export function NearbyUsers({ users, currentUserId, location }: NearbyUsersProps) {
    if (!users.length) return null;

    return (
        <Card className="border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-900/10 dark:to-cyan-900/10">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MapPin size={14} className="text-blue-500" />
                    Près de {location || "vous"}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {users.slice(0, 4).map(user => (
                    <Link
                        key={user.id}
                        href={`/profile/${user.id}`}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/50 dark:hover:bg-zinc-800/50 transition-colors group"
                    >
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar || "/avatars/default.svg"} />
                            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-500 transition-colors">
                                {user.name}
                            </p>
                            <p className="text-xs text-zinc-500 truncate">
                                {user.company || user.role}
                            </p>
                        </div>
                        <div className="text-xs text-zinc-400 flex items-center gap-1">
                            <MapPin size={10} />
                            {user.location}
                        </div>
                    </Link>
                ))}
            </CardContent>
        </Card>
    );
}

// Users You May Know (mutual connections)
interface UsersYouMayKnowProps {
    users: RecommendedUser[];
    currentUserId?: string;
}

export function UsersYouMayKnow({ users, currentUserId }: UsersYouMayKnowProps) {
    if (!users.length) return null;

    return (
        <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users size={14} className="text-purple-500" />
                    Vous connaissez peut-être
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {users.slice(0, 4).map(user => (
                    <Link
                        key={user.id}
                        href={`/profile/${user.id}`}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                    >
                        <div className="relative">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={user.avatar || "/avatars/default.svg"} />
                                <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                            </Avatar>
                            {user.mutualConnections && user.mutualConnections > 0 && (
                                <div className="absolute -bottom-1 -right-1 bg-purple-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {user.mutualConnections}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-purple-500 transition-colors">
                                {user.name}
                            </p>
                            <p className="text-xs text-zinc-500 truncate">
                                {user.mutualConnections} amis en commun
                            </p>
                        </div>
                    </Link>
                ))}
            </CardContent>
        </Card>
    );
}

// Compact horizontal scroll version for mobile
interface RecommendedUsersCarouselProps {
    users: RecommendedUser[];
    currentUserId?: string;
}

export function RecommendedUsersCarousel({ users, currentUserId }: RecommendedUsersCarouselProps) {
    const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

    const handleFollow = async (userId: string) => {
        if (!currentUserId) return;

        try {
            if (followingIds.has(userId)) {
                await unfollowUser(currentUserId, userId);
                setFollowingIds(prev => {
                    const next = new Set(prev);
                    next.delete(userId);
                    return next;
                });
            } else {
                await followUser(currentUserId, userId);
                setFollowingIds(prev => new Set(prev).add(userId));
            }
        } catch (error) {
            toast.error("Erreur");
        }
    };

    return (
        <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            <div className="flex gap-3" style={{ minWidth: "max-content" }}>
                {users.map(user => (
                    <motion.div
                        key={user.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-shrink-0 w-32"
                    >
                        <div className="flex flex-col items-center p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-center">
                            <Link href={`/profile/${user.id}`}>
                                <Avatar className="h-16 w-16 mb-2 border-2 border-white dark:border-zinc-800 shadow-lg">
                                    <AvatarImage src={user.avatar || "/avatars/default.svg"} />
                                    <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                </Avatar>
                            </Link>
                            <p className="text-xs font-medium truncate w-full mb-2">
                                {user.name}
                            </p>
                            <Button
                                size="sm"
                                variant={followingIds.has(user.id) ? "secondary" : "default"}
                                onClick={() => handleFollow(user.id)}
                                className={cn(
                                    "w-full h-7 text-[10px] rounded-full",
                                    !followingIds.has(user.id) && "bg-orange-500 hover:bg-orange-600"
                                )}
                            >
                                {followingIds.has(user.id) ? "Suivi" : "Suivre"}
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

