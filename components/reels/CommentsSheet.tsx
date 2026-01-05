"use client";

import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CommentsSection } from "./CommentsSection";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useMediaQuery } from "@/hooks/use-media-query";

interface Comment {
    id: string;
    content: string;
    createdAt: Date;
    user: {
        id: string;
        name: string;
        avatar: string;
    };
    _count: {
        likes: number; // mapped from reactions
        replies: number;
    };
    replies?: Comment[];
    userHasLiked?: boolean;
}

interface CommentsSheetProps {
    postId: string;
    postAuthorId: string;
    isOpen: boolean;
    onClose: () => void;
    commentCount: number;
}

// Mock data to start if generic fetch not ready in props, but ideally we fetch.
// For MVP we will trust generic fetch or implement a fetch here.

export function CommentsSheet({ postId, postAuthorId, isOpen, onClose, commentCount }: CommentsSheetProps) {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent
                side={isDesktop ? "right" : "bottom"}
                className={cn(
                    "flex flex-col border-white/10 shadow-2xl transition-all duration-300",
                    isDesktop
                        ? "h-full w-[450px] border-l backdrop-blur-xl bg-zinc-950/90"
                        : "h-[75vh] rounded-t-3xl border-t backdrop-blur-xl bg-zinc-900/95"
                )}
            >
                <SheetHeader className={cn(
                    "p-4 border-b border-white/10 flex flex-row items-center justify-between sticky top-0 bg-zinc-900 z-10",
                    !isDesktop && "rounded-t-3xl"
                )}>
                    <SheetTitle className="text-white text-center w-full text-sm font-bold">
                        {commentCount} commentaires
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-hidden">
                    <CommentsSection
                        postId={postId}
                        postAuthorId={postAuthorId}
                        commentCount={commentCount}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}

function CommentItem({ comment, onReply }: { comment: Comment, onReply: () => void }) {
    const [liked, setLiked] = useState(comment.userHasLiked);
    const [likes, setLikes] = useState(comment._count.likes);

    const handleLike = () => {
        setLiked(!liked);
        setLikes(prev => liked ? prev - 1 : prev + 1);
        // Call backend API
    };

    return (
        <div className="flex gap-3">
            <Avatar className="h-8 w-8 border border-white/10">
                <AvatarImage src={comment.user.avatar} />
                <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
                <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-xs text-zinc-300">{comment.user.name}</span>
                    <span className="text-[10px] text-zinc-500">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: fr })}</span>
                </div>
                <p className="text-sm text-white/90 leading-tight">{comment.content}</p>

                <div className="flex items-center gap-4 mt-1">
                    <button onClick={onReply} className="text-[10px] font-medium text-zinc-500 hover:text-zinc-300">Répondre</button>
                    {comment._count.replies > 0 && (
                        <button className="text-[10px] font-medium text-zinc-500 hover:text-zinc-300">
                            {/* Simplification: Just showing count, expanding could require more state */}
                            Voir {comment._count.replies} réponse(s)
                        </button>
                    )}
                </div>

                {/* Render Replies (Nested) */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 pl-2 border-l border-white/10 space-y-4">
                        {comment.replies.map((reply) => (
                            <CommentItem key={reply.id} comment={reply} onReply={() => { }} />
                            // Disable deep nesting reply button for MVP
                        ))}
                    </div>
                )}
            </div>
            <div className="flex flex-col items-center gap-0.5 pt-1">
                <button onClick={handleLike} className={cn("transition", liked ? "text-red-500" : "text-zinc-600")}>
                    <Heart size={14} className={liked ? "fill-current" : ""} />
                </button>
                <span className="text-[10px] text-zinc-500">{likes > 0 ? likes : ""}</span>
            </div>
        </div>
    );
}
