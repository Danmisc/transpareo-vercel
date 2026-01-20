"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface QuotedPostEmbedProps {
    post: {
        id: string;
        content: string;
        author: {
            name: string;
            avatar?: string;
            role?: string;
        };
        createdAt: Date | string;
        image?: string;
        type?: string;
    };
    className?: string;
}

export function QuotedPostEmbed({ post, className }: QuotedPostEmbedProps) {
    const publishedDate = new Date(post.createdAt);
    const timeAgo = formatDistanceToNow(publishedDate, { addSuffix: true, locale: fr });

    // Truncate content if too long
    const maxLength = 280;
    const truncatedContent = post.content.length > maxLength
        ? post.content.substring(0, maxLength) + "..."
        : post.content;

    return (
        <Link href={`/post/${post.id}`} className="block">
            <Card className={cn(
                "p-3 mt-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50",
                "hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer",
                "rounded-xl overflow-hidden",
                className
            )}>
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={post.author.avatar || "/avatars/default.svg"} />
                        <AvatarFallback className="text-xs">{post.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-1.5 text-sm">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {post.author.name}
                        </span>
                        {post.author.role && (
                            <span className="text-zinc-500 text-xs">• {post.author.role}</span>
                        )}
                        <span className="text-zinc-400 text-xs">• {timeAgo}</span>
                    </div>
                </div>

                {/* Content */}
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {truncatedContent}
                </p>

                {/* Optional Image Preview */}
                {post.image && (
                    <div className="mt-2 rounded-lg overflow-hidden max-h-32">
                        <img
                            src={post.image}
                            alt="Post image"
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
            </Card>
        </Link>
    );
}

