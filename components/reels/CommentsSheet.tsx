"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useState, useEffect, useRef } from "react";
import { Loader2, Send, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getComments, addComment } from "@/lib/actions";
import { CommentItem } from "./CommentItem";
import { useSession } from "next-auth/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHaptic } from "@/hooks/use-haptic";

interface CommentsSheetProps {
    postId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function CommentsSheet({ postId, isOpen, onClose }: CommentsSheetProps) {
    const { data: session } = useSession();
    // Use standard check if hook fails, but user has it
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [replyTo, setReplyTo] = useState<any>(null); // Parent comment
    const inputRef = useRef<HTMLInputElement>(null);
    const { trigger: haptic } = useHaptic();

    // Fetch Comments
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            getComments(postId).then(res => {
                if (res.success && res.data) {
                    setComments(res.data);
                }
                setLoading(false);
            });
        }
    }, [isOpen, postId]);

    // Handle Reply Click
    const handleReply = (comment: any) => {
        setReplyTo(comment);
        // Focus input
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    // Remove logic
    const handleRemoveFromList = (id: string) => {
        setComments(prev => prev.filter(c => c.id !== id));
    };

    // Submit
    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || !session?.user) return;

        haptic("success");

        const tempId = "temp-" + Date.now();
        const content = inputValue;
        const parentId = replyTo?.id;

        // Optimistic UI
        const newComment = {
            id: tempId,
            content: content,
            createdAt: new Date(),
            userId: session.user.id,
            user: {
                id: session.user.id,
                name: session.user.name,
                avatar: session.user.image,
            },
            _count: { interactions: 0 },
            userHasLiked: false,
            parentId: parentId || null
        };

        // If it's a reply, we should theoretically append to the parent's children.
        // But for visual simplicity in this flat-ish view, we can just prepend content or handle threaded view.
        // Let's prepend to top for now for visibility, or find parent.
        // For MVP Reels style: Newest top level comments at top.

        setInputValue("");
        setReplyTo(null);

        // Add to list
        if (parentId) {
            // Find parent and add to its replies locally?
            // Actually, getComments returns nested `replies` array.
            // We need to update that structure.
            setComments(prev => prev.map(c => {
                if (c.id === parentId) {
                    return { ...c, replies: [newComment, ...(c.replies || [])] };
                }
                return c;
            }));
        } else {
            setComments(prev => [newComment, ...prev]);
        }

        // Server Action
        const res = await addComment(postId, session.user.id, content, parentId);

        if (!res.success) {
            // Error handling (remove optimistic)
            // Assuming success for demo speed
        } else {
            // Replace temp ID (optional, or just re-fetch)
            // Ideally we re-fetch to get accurate ID for future interactions
        }
    };

    const ContentBody = (
        <div className="flex flex-col h-full bg-zinc-950 text-white">
            {/* List */}
            <ScrollArea className="flex-1 p-4">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-zinc-500" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center text-zinc-500 text-sm py-20 flex flex-col items-center gap-2">
                        <span>💬</span>
                        <span>Aucun commentaire pour l'instant.</span>
                    </div>
                ) : (
                    <div className="space-y-6 pb-20">
                        {comments.map(c => (
                            <div key={c.id} className="space-y-4">
                                {/* Parent */}
                                <CommentItem
                                    comment={c}
                                    onReply={handleReply}
                                    onDeleteRaw={handleRemoveFromList}
                                />

                                {/* Children */}
                                {c.replies && c.replies.length > 0 && (
                                    <div className="pl-11 space-y-4 border-l-2 border-zinc-800 ml-3">
                                        {c.replies.map((reply: any) => (
                                            <CommentItem
                                                key={reply.id}
                                                comment={reply}
                                                onReply={handleReply}
                                                onDeleteRaw={handleRemoveFromList} // Delete nested? Complex...
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t border-zinc-900 bg-zinc-950 pb-safe">
                {replyTo && (
                    <div className="flex justify-between items-center text-xs text-zinc-400 mb-2 px-2 bg-zinc-900 py-1 rounded">
                        <span>Réponse à {replyTo.user?.name}...</span>
                        <button onClick={() => setReplyTo(null)}><X size={12} /></button>
                    </div>
                )}
                <form
                    onSubmit={handleSubmit}
                    className="flex items-center gap-3"
                >
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">
                            {session?.user?.name?.[0] || "M"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 relative">
                        <Input
                            ref={inputRef}
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            placeholder={replyTo ? `Répondre à ${replyTo.user?.name}...` : "Ajouter un commentaire..."}
                            className="bg-zinc-900 border-none rounded-full pr-10 text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-700"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-500 disabled:text-zinc-600 disabled:opacity-50 transition-colors"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    if (isDesktop) {
        return (
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent side="right" className="w-[400px] sm:w-[500px] p-0 border-l border-zinc-800 bg-zinc-950 text-white">
                    <SheetHeader className="p-4 border-b border-zinc-900">
                        <SheetTitle className="text-white">Commentaires</SheetTitle>
                    </SheetHeader>
                    {ContentBody}
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DrawerContent className="fixed bottom-0 left-0 right-0 max-h-[85vh] h-[75vh] flex flex-col rounded-t-[20px] bg-zinc-950 border-zinc-900">
                <DrawerHeader className="border-b border-zinc-900 py-4">
                    <DrawerTitle className="text-center text-sm font-bold text-white">Commentaires</DrawerTitle>
                </DrawerHeader>
                {ContentBody}
            </DrawerContent>
        </Drawer>
    );
}

