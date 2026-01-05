"use client";

import { useEffect, useState } from "react";
import { getSuggestions, followUser } from "@/lib/follow-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function FeedDiscoveryWidget() {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const loadSuggestions = async () => {
            const res = await getSuggestions();
            if (res.success) {
                setSuggestions(res.data?.slice(0, 5) || []);
            }
            setLoading(false);
        };
        loadSuggestions();
    }, []);

    const handleFollow = async (userId: string) => {
        setSuggestions(prev => prev.filter(u => u.id !== userId));
        await followUser(userId);
    };

    if (!isVisible || (!loading && suggestions.length === 0)) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-xl my-6 relative overflow-hidden p-4"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-purple-500 opacity-50" />

            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-sm">Suggestions pour vous</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => setIsVisible(false)}>
                    <X className="h-3 w-3" />
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
                    {suggestions.map((user) => (
                        <div key={user.id} className="min-w-[140px] snap-center bg-white/50 dark:bg-black/20 rounded-lg p-3 flex flex-col items-center gap-2 border border-white/20">
                            <Avatar className="h-14 w-14 border-2 border-white dark:border-zinc-800">
                                <AvatarImage src={user.avatar || "/avatars/default.png"} />
                                <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="text-center w-full">
                                <Link href={`/profile/${user.id}`} className="text-sm font-bold truncate block hover:underline">
                                    {user.name}
                                </Link>
                                <span className="text-[10px] text-muted-foreground truncate block">
                                    {user.role === "PRO" ? "Pro" : "Membre"}
                                </span>
                            </div>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="w-full text-xs h-7 mt-1 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                onClick={() => handleFollow(user.id)}
                            >
                                <UserPlus className="h-3 w-3 mr-1" />
                                Suivre
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
