"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LeaderboardUser {
    id: string;
    name: string;
    avatar?: string;
    points: number;
    rank: number;
    trend: 'up' | 'down' | 'stable';
    role?: string;
}

interface CommunityLeaderboardProps {
    users: LeaderboardUser[];
}

export function CommunityLeaderboard({ users }: CommunityLeaderboardProps) {
    if (users.length === 0) return null;

    return (
        <div className="rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <Trophy className="w-3 h-3 text-amber-500" />
                    Top Contributeurs
                </h3>
            </div>

            <div className="space-y-3">
                {users.map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            {/* Rank Badge */}
                            <div className={cn(
                                "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold",
                                user.rank === 1 && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-800",
                                user.rank === 2 && "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 ring-1 ring-zinc-200 dark:ring-zinc-700",
                                user.rank === 3 && "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 ring-1 ring-orange-200 dark:ring-orange-800",
                                user.rank > 3 && "bg-transparent text-zinc-400"
                            )}>
                                {user.rank}
                            </div>

                            <Avatar className="h-8 w-8 border border-zinc-200 dark:border-zinc-700">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback className="text-xs">{user.name[0]}</AvatarFallback>
                            </Avatar>

                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200 line-clamp-1">
                                    {user.name}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-medium">
                                    {user.points.toLocaleString()} pts
                                </span>
                            </div>
                        </div>

                        {/* Trend Indicator */}
                        <div className="text-zinc-400">
                            {user.trend === "up" && <TrendingUp className="w-3 h-3 text-green-500" />}
                            {user.trend === "down" && <TrendingDown className="w-3 h-3 text-red-500" />}
                            {user.trend === "stable" && <Minus className="w-3 h-3 text-zinc-300" />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
