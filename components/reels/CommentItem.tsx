"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { toggleReaction, deleteComment } from "@/lib/actions";
import { useSession } from "next-auth/react";

interface CommentItemProps {
    comment: any;
    onReply: (comment: any) => void;
    onDeleteRaw: (id: string) => void;
}

export function CommentItem({ comment, onReply, onDeleteRaw }: CommentItemProps) {
    const { data: session } = useSession();
    const [liked, setLiked] = useState(comment.userHasLiked || false);
    const [likeCount, setLikeCount] = useState(comment._count?.interactions || 0);
    const [isDeleted, setIsDeleted] = useState(false);

    const isAuthor = session?.user?.id === comment.userId;

    const handleLike = async () => {
        if (!session) return;
        const newVal = !liked;
        setLiked(newVal);
        setLikeCount(prev => newVal ? prev + 1 : prev - 1);

        try {
            await toggleReaction(comment.id, session.user.id, "COMMENT", "REACTION", "LIKE");
        } catch (error) {
            setLiked(!newVal);
            setLikeCount(prev => !newVal ? prev + 1 : prev - 1);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Supprimer ce commentaire ?")) return;
        setIsDeleted(true);
        // Optimistic delete from UI
        onDeleteRaw(comment.id);

        if (session?.user?.id) {
            await deleteComment(comment.id, session.user.id);
        }
    };

    if (isDeleted) return null;

    return (
        <div className="flex gap-3 w-full group">
            <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={comment.user?.avatar || ""} />
                <AvatarFallback>{comment.user?.name?.[0] || "?"}</AvatarFallback>
            </Avatar>

            <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white/90">
                        {comment.user?.name || "Utilisateur"}
                    </span>
                    <span className="text-xs text-white/40">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: fr })}
                    </span>
                </div>

                <p className="text-sm text-white/80 leading-snug whitespace-pre-wrap">
                    {comment.content}
                </p>

                <div className="flex items-center gap-4 mt-1">
                    <button
                        onClick={() => onReply(comment)}
                        className="text-xs font-medium text-white/40 hover:text-white transition-colors"
                    >
                        Répondre
                    </button>
                    {isAuthor && (
                        <button
                            onClick={handleDelete}
                            className="text-xs font-medium text-red-500/0 group-hover:text-red-500/80 transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={12} />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-center gap-1 pt-1">
                <button
                    onClick={handleLike}
                    className="flex flex-col items-center justify-center"
                >
                    <Heart
                        size={14}
                        className={cn("transition-colors", liked ? "fill-red-500 text-red-500" : "text-zinc-500")}
                    />
                </button>
                {likeCount > 0 && (
                    <span className="text-[10px] text-zinc-500">{likeCount}</span>
                )}
            </div>
        </div>
    );
}

