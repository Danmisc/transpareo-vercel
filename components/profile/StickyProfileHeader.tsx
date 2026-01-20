"use client";

import { useScroll, useMotionValueEvent, motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

import { followUser } from "@/lib/follow-actions";
import { useTransition } from "react";

interface StickyProfileHeaderProps {
    user: {
        id: string;
        name: string;
        avatar?: string;
        role: string;
        isFollowing?: boolean;
    };
    isCurrentUser?: boolean;
}

export function StickyProfileHeader({ user, isCurrentUser }: StickyProfileHeaderProps) {
    const { scrollY } = useScroll();
    const [visible, setVisible] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);

    const handleFollow = () => {
        startTransition(async () => {
            await followUser(user.id);
            setIsFollowing(true);
        });
    };

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 400) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    });

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-border/50 shadow-sm px-4 py-2"
                >
                    <div className="container max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 border border-zinc-200 dark:border-zinc-700">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-zinc-900 dark:text-white leading-none">
                                    {user.name}
                                </span>
                                <span className="text-xs text-zinc-500 mt-0.5 font-medium">
                                    {user.role === 'PRO' ? 'Professionnel' : 'Membre Transpareo'}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="hidden sm:flex" onClick={() => {/* Message */ }}>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Message
                            </Button>
                            <Button size="sm" className={cn("shadow-sm", isFollowing ? "bg-zinc-100 text-zinc-900 hover:bg-zinc-200" : "bg-blue-600 hover:bg-blue-700 text-white")} onClick={handleFollow} disabled={isPending || isFollowing || isCurrentUser}>
                                <UserPlus className="w-4 h-4 mr-2" />
                                {isFollowing ? "Suivi" : "Se connecter"}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
