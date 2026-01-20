"use client";

import { useEffect, useState } from "react";
import { getSuggestions, followUser } from "@/lib/follow-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FollowSuggestions() {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSuggestions = async () => {
            const res = await getSuggestions();
            if (res.success) {
                setSuggestions(res.data || []);
            }
            setLoading(false);
        };
        loadSuggestions();
    }, []);

    const handleFollow = async (userId: string) => {
        // Optimistic UI
        setSuggestions(prev => prev.filter(u => u.id !== userId));
        await followUser(userId);
    };

    if (!loading && suggestions.length === 0) return null;

    return (
        <div className="w-full glass-card rounded-xl">
            <div className="p-6 pb-3 pt-4 border-b border-white/10 dark:border-white/5">
                <h3 className="text-base font-semibold">Vous pourriez connaître</h3>
            </div>
            <div className="p-6 pt-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    suggestions.map((user) => (
                        <div key={user.id} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <Avatar className="h-8 w-8 border border-white/20">
                                    <AvatarImage src={user.avatar || "/avatars/default.svg"} />
                                    <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col truncate">
                                    <Link href={`/profile/${user.id}`} className="text-sm font-medium hover:underline truncate">
                                        {user.name}
                                    </Link>
                                    <span className="text-xs text-muted-foreground truncate">
                                        {user.role === "PRO" ? "Pro" : "Membre"}
                                    </span>
                                </div>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10 transition-colors"
                                onClick={() => handleFollow(user.id)}
                                title="Suivre"
                            >
                                <UserPlus className="h-4 w-4" />
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

