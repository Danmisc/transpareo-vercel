"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Heart, MessageCircle, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { addComment, getComments, toggleReaction } from "@/lib/actions";

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
        likes: number;
        replies: number;
    };
    replies?: Comment[];
    userHasLiked?: boolean;
}

interface CommentsSectionProps {
    postId: string;
    postAuthorId: string;
    commentCount: number;
}

export function CommentsSection({ postId, postAuthorId, commentCount }: CommentsSectionProps) {
    const { data: session } = useSession();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

    // Fetch comments
    useEffect(() => {
        setLoading(true);
        getComments(postId).then(res => {
            if (res.success && res.data) {
                const mapped = res.data.map((c: any) => ({
                    ...c,
                    _count: {
                        likes: c._count.interactions || 0,
                        replies: c._count.children || 0
                    },
                    replies: c.replies?.map((r: any) => ({
                        ...r,
                        _count: { likes: 0, replies: 0 }
                    }))
                }));
                // @ts-ignore - loose typing for now to match interface
                setComments(mapped);
            }
            setLoading(false);
        });
    }, [postId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !session?.user) return;

        setIsSubmitting(true);
        try {
            const res = await addComment(
                postId,
                session.user.id as string,
                newComment,
                replyingTo ? replyingTo.id : undefined
            );

            if (res.success && res.data) {
                // Optimistic add
                const added: any = {
                    ...res.data,
                    user: {
                        id: session.user.id,
                        name: session.user.name || "User",
                        avatar: session.user.image || "/avatars/default.svg"
                    },
                    _count: { likes: 0, replies: 0 }
                };

                if (replyingTo) {
                    setComments(prev => prev.map(c => {
                        if (c.id === replyingTo.id) {
                            return {
                                ...c,
                                replies: [...(c.replies || []), added],
                                _count: { ...c._count, replies: c._count.replies + 1 }
                            };
                        }
                        return c;
                    }));
                } else {
                    setComments(prev => [added, ...prev]);
                }
                setNewComment("");
                setReplyingTo(null);
            }
        } catch (error) {
            console.error("Comment failed", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {loading ? (
                    <div className="flex justify-center p-4">
                        <div className="animate-spin h-6 w-6 border-2 border-white/20 border-t-white rounded-full" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-zinc-500 text-sm gap-3">
                        <div className="bg-white/5 p-4 rounded-full">
                            <MessageCircle className="w-8 h-8 opacity-40" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="font-medium text-white/80">Aucun commentaire</p>
                            <p className="text-xs max-w-[200px]">Soyez le premier à partager votre avis sur cette vidéo !</p>
                        </div>
                    </div>
                ) : (
                    comments.map(comment => (
                        <CommentItem key={comment.id} comment={comment} onReply={() => setReplyingTo(comment)} />
                    ))
                )}
            </div>

            {/* Input - floating at bottom */}
            <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md pb-8 md:pb-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20">
                {replyingTo && (
                    <div className="flex justify-between items-center bg-zinc-800/50 p-2 text-xs text-zinc-400 mb-2 rounded">
                        <span>Réponse à @{replyingTo.user.name}</span>
                        <button onClick={() => setReplyingTo(null)}><X size={12} /></button>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="flex gap-3 items-center">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={session?.user?.image || ""} />
                        <AvatarFallback>Me</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 relative">
                        <Input
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            placeholder="Ajouter un commentaire..."
                            className="bg-zinc-800 border-none rounded-full pr-10 text-white placeholder:text-zinc-500"
                        />
                    </div>
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!newComment.trim() || isSubmitting}
                        className={cn("rounded-full w-10 h-10 shrink-0", newComment.trim() ? "bg-primary hover:bg-primary/90" : "bg-zinc-800 text-zinc-500")}
                    >
                        <Send size={18} className={newComment.trim() ? "ml-0.5" : ""} />
                    </Button>
                </form>
            </div>
        </div>
    );
}

function CommentItem({ comment, onReply }: { comment: Comment, onReply: () => void }) {
    const { data: session } = useSession();
    const [liked, setLiked] = useState(comment.userHasLiked);
    const [likes, setLikes] = useState(comment._count.likes);

    const handleLike = async () => {
        if (!session?.user?.id) return;
        const newVal = !liked;
        setLiked(newVal);
        setLikes(prev => newVal ? prev + 1 : prev - 1);
        await toggleReaction(comment.id, session.user.id, "COMMENT", "REACTION", "LIKE");
    };

    return (
        <div className="flex gap-3 group relative transition-colors duration-200">
            <Avatar className="h-9 w-9 border border-white/10 shrink-0 ring-2 ring-transparent group-hover:ring-white/10 transition-all">
                <AvatarImage src={comment.user.avatar} />
                <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1.5">
                <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-xs text-zinc-200">{comment.user.name}</span>
                    <span className="text-[10px] text-zinc-500 font-medium">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: fr })}</span>
                </div>
                <p className="text-sm text-white/90 leading-tight font-light tracking-wide">{comment.content}</p>

                <div className="flex items-center gap-4 mt-2">
                    <button onClick={onReply} className="text-[11px] font-semibold text-zinc-500 hover:text-white transition-colors">Répondre</button>
                    {comment._count.replies > 0 && (
                        <div className="flex items-center gap-1 cursor-pointer group/replies">
                            <div className="w-4 h-px bg-zinc-700 group-hover/replies:bg-zinc-500" />
                            <button className="text-[11px] font-medium text-zinc-500 hover:text-zinc-300">
                                Voir {comment._count.replies} réponse(s)
                            </button>
                        </div>
                    )}
                </div>

                {/* Render Replies (Nested) */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 pl-3 border-l-2 border-white/10 space-y-4">
                        {comment.replies.map((reply) => (
                            <CommentItem key={reply.id} comment={reply} onReply={() => { }} />
                        ))}
                    </div>
                )}
            </div>
            <div className="flex flex-col items-center gap-1 pt-1 opacity-70 group-hover:opacity-100 transition-opacity">
                <button onClick={handleLike} className={cn("transition p-1 hover:bg-white/10 rounded-full", liked ? "text-red-500" : "text-zinc-600")}>
                    <Heart size={14} className={liked ? "fill-current" : ""} />
                </button>
                <span className="text-[10px] text-zinc-500 font-medium">{likes > 0 ? likes : ""}</span>
            </div>
        </div>
    );
}
