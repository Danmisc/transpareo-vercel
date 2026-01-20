"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { followUser, unfollowUser } from "@/lib/follow-actions";
import { UserPlus, Check, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserSuggestion {
    id: string;
    name: string | null;
    avatar: string | null;
    role: string;
    _count?: { followedBy: number };
    reason?: string; // Why we suggest this user
}

interface UserSuggestionsProps {
    currentUserId: string;
    initialSuggestions?: UserSuggestion[];
}

export function UserSuggestions({ currentUserId, initialSuggestions = [] }: UserSuggestionsProps) {
    const [suggestions, setSuggestions] = useState<UserSuggestion[]>(initialSuggestions);
    const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
    const [isPending, startTransition] = useTransition();
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleFollow = (userId: string) => {
        setLoadingId(userId);
        const isCurrentlyFollowed = followedIds.has(userId);

        startTransition(async () => {
            if (isCurrentlyFollowed) {
                await unfollowUser(userId);
                setFollowedIds(prev => {
                    const next = new Set(prev);
                    next.delete(userId);
                    return next;
                });
            } else {
                await followUser(userId);
                setFollowedIds(prev => new Set(prev).add(userId));
            }
            setLoadingId(null);
        });
    };

    if (suggestions.length === 0) {
        return null;
    }

    return (
        <Card className="border-0 shadow-sm bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-500" />
                    Personnes à suivre
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {suggestions.map((user) => {
                    const isFollowed = followedIds.has(user.id);
                    const isLoading = loadingId === user.id;

                    return (
                        <div key={user.id} className="flex items-center gap-3">
                            <Link href={`/profile/${user.id}`} className="shrink-0">
                                <Avatar className="h-10 w-10 border-2 border-white dark:border-zinc-800 shadow-sm">
                                    <AvatarImage src={user.avatar || "/avatars/default.svg"} />
                                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-xs">
                                        {user.name?.[0] || "?"}
                                    </AvatarFallback>
                                </Avatar>
                            </Link>

                            <div className="flex-1 min-w-0">
                                <Link
                                    href={`/profile/${user.id}`}
                                    className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:underline truncate block"
                                >
                                    {user.name || "Utilisateur"}
                                </Link>
                                <p className="text-xs text-zinc-500 truncate">
                                    {user.reason || user.role}
                                    {user._count?.followedBy ? ` • ${user._count.followedBy} abonnés` : ""}
                                </p>
                            </div>

                            <Button
                                size="sm"
                                variant={isFollowed ? "outline" : "default"}
                                className={cn(
                                    "h-8 px-3 text-xs rounded-full transition-all",
                                    isFollowed && "border-green-500 text-green-600"
                                )}
                                onClick={() => handleFollow(user.id)}
                                disabled={isLoading}
                            >
                                {isFollowed ? (
                                    <>
                                        <Check className="h-3 w-3 mr-1" />
                                        Suivi
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-3 w-3 mr-1" />
                                        Suivre
                                    </>
                                )}
                            </Button>
                        </div>
                    );
                })}

                <Link
                    href="/explore/people"
                    className="block text-center text-xs text-orange-600 hover:text-orange-700 font-medium pt-2"
                >
                    Voir plus de suggestions →
                </Link>
            </CardContent>
        </Card>
    );
}

export function UserSuggestionsSkeleton() {
    return (
        <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
                <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1">
                            <Skeleton className="h-4 w-24 mb-1" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-8 w-20 rounded-full" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

