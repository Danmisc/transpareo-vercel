"use client";

import { useEffect, useState } from "react";
import { usePresence } from "@/components/providers/PresenceProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { getNetwork } from "@/lib/follow-actions";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

interface OnlineUser {
    id: string;
    name: string | null;
    avatar: string | null;
}

export function OnlineFriendsWidget() {
    const { data: session } = useSession();
    const { onlineUsers } = usePresence();
    const [friends, setFriends] = useState<OnlineUser[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch friends list once on mount
    useEffect(() => {
        const fetchFriends = async () => {
            if (!session?.user?.id) return;

            try {
                const res = await getNetwork(session.user.id, "FOLLOWING");
                if (res.success && res.data) {
                    setFriends(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch friends for presence", err);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user?.id) {
            fetchFriends();
        }
    }, [session?.user?.id]);

    // Filter friends who are in onlineUsers set
    // Note: onlineUsers contains IDs (string)
    const onlineFriends = friends.filter(friend => onlineUsers.has(friend.id));

    if (loading) return (
        <div className="glass-card rounded-xl p-4 space-y-3 mb-6">
            <div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="flex gap-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-10 rounded-full" />)}
            </div>
        </div>
    );

    if (onlineFriends.length === 0) return null;

    return (
        <div className="glass-card rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                En ligne ({onlineFriends.length})
            </h3>

            <div className="flex flex-wrap gap-3">
                <AnimatePresence>
                    {onlineFriends.map(user => (
                        <motion.div
                            key={user.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="relative group cursor-pointer"
                        >
                            <Link href={`/profile/${user.id}`}>
                                <Avatar className="h-10 w-10 border-2 border-white dark:border-zinc-800 ring-2 ring-emerald-500/30">
                                    <AvatarImage src={user.avatar || "/avatars/default.png"} />
                                    <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-0.5 h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full"></div>
                            </Link>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
