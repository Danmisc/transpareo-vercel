"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck, Music2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CommentsSection } from "./CommentsSection";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ReelDesktopSidePanelProps {
    post: any;
}

export function ReelDesktopSidePanel({ post }: ReelDesktopSidePanelProps) {
    const [isFollowed, setIsFollowed] = useState(false); // Should come from prop

    return (
        <div className="w-[450px] bg-black border-l border-white/10 flex flex-col h-full hidden lg:flex">
            {/* Header: Author & Description (Scrollable if needed, but sticky is better) */}
            <div className="p-5 border-b border-white/10 space-y-4 bg-zinc-950/50">
                {/* Author */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={`/profile/${post.author.id}`}>
                            <Avatar className="h-10 w-10 border border-white/20">
                                <AvatarImage src={post.author.avatar} />
                                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                            </Avatar>
                        </Link>
                        <div>
                            <Link href={`/profile/${post.author.id}`} className="font-bold text-sm hover:underline flex items-center gap-1 text-white">
                                {post.author.name}
                                <BadgeCheck className="w-4 h-4 text-blue-400 fill-blue-400/10" />
                            </Link>
                            <p className="text-xs text-zinc-400">Agent Immobilier</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn("h-8 px-4 text-xs ml-2 rounded-full transition-colors", isFollowed ? "bg-zinc-800 text-white border-zinc-700" : "bg-white text-black hover:bg-zinc-200 border-none")}
                        onClick={() => setIsFollowed(!isFollowed)}
                    >
                        {isFollowed ? "Suivi" : "Suivre"}
                    </Button>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <p className="text-sm text-zinc-200 leading-relaxed">
                        {post.content} <span className="text-blue-400">#immo #lyon #luxe</span>
                    </p>

                    {/* Music */}
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <Music2 size={12} />
                        <span>Son original - {post.author.name}</span>
                    </div>
                </div>
            </div>

            {/* Engagement Stats (Optional, could be in overlay or here) */}
            <div className="flex justify-around py-3 border-b border-white/10 bg-zinc-950/30 text-xs font-medium text-zinc-400">
                <span>{post._count?.interactions || 0} J'aime</span>
                <span>{post._count?.comments || 0} Com.</span>
                <span>{post._count?.shares || 0} Partages</span>
            </div>

            {/* Comments Section (Fills remaining height) */}
            <div className="flex-1 overflow-hidden relative">
                <CommentsSection
                    postId={post.id}
                    postAuthorId={post.author.id}
                    commentCount={post._count?.comments || 0}
                />
            </div>
        </div>
    );
}
