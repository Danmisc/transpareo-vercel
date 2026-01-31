"use client";

import React, { useState } from "react";
import { Pin, Megaphone, ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PinnedPost {
    id: string;
    title: string;
    content: string;
    author: {
        name: string;
        avatar?: string;
        role: "ADMIN" | "MODERATOR";
    };
    date: string;
}

interface CommunityPinnedSectionProps {
    pinnedPosts: PinnedPost[];
    className?: string;
}

export function CommunityPinnedSection({ pinnedPosts, className }: CommunityPinnedSectionProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible || pinnedPosts.length === 0) return null;

    return (
        <div className={cn(
            "rounded-2xl border border-amber-200/50 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10 backdrop-blur-sm overflow-hidden transition-all duration-300",
            className
        )}>
            {/* Header / Banner */}
            <div className="flex items-center justify-between px-4 py-3 bg-amber-100/50 dark:bg-amber-900/20">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                    <Pin className="w-4 h-4 fill-amber-500 text-amber-600" />
                    <span className="text-xs font-bold uppercase tracking-wider">Épaulé par les admins</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-amber-700/70 hover:text-amber-900 hover:bg-amber-200/50 dark:text-amber-400 dark:hover:bg-amber-800/50 rounded-full"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-amber-700/70 hover:text-amber-900 hover:bg-amber-200/50 dark:text-amber-400 dark:hover:bg-amber-800/50 rounded-full"
                        onClick={() => setIsVisible(false)}
                    >
                        <X size={14} />
                    </Button>
                </div>
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="p-4 space-y-4">
                    {pinnedPosts.map((post) => (
                        <div key={post.id} className="flex gap-4 group">
                            <div className="shrink-0 pt-1">
                                <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-amber-900/50">
                                    <AvatarImage src={post.author.avatar} />
                                    <AvatarFallback className="bg-amber-200 text-amber-800 text-xs">AD</AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{post.title}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-200/50 text-amber-800 font-medium">Annonce</span>
                                </div>
                                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                                    {post.content}
                                </p>
                                <div className="flex items-center gap-3 pt-1 text-xs text-zinc-400">
                                    <span>Par {post.author.name}</span>
                                    <span>•</span>
                                    <span>{post.date}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
