"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Send, ArrowLeft, MessageSquare, Clock, MoreVertical,
    Smile, Paperclip, Image as ImageIcon
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { getMessages, sendMessage } from "@/lib/services/messaging.service";
import { pusherClient } from "@/lib/pusher";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ThreadMessage {
    id: string;
    content: string | null;
    senderId: string;
    senderName?: string;
    senderAvatar?: string;
    createdAt: string | Date;
    type?: string;
    attachments?: any[];
}

interface ThreadViewProps {
    isOpen: boolean;
    onClose: () => void;
    parentMessage: {
        id: string;
        content: string;
        senderId: string;
        senderName?: string;
        senderAvatar?: string;
        createdAt: string;
        conversationId: string;
        repliesCount?: number;
    };
    conversationId: string;
}

export function ThreadView({ isOpen, onClose, parentMessage, conversationId }: ThreadViewProps) {
    const { data: session } = useSession();
    const [replies, setReplies] = useState<ThreadMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch thread replies
    useEffect(() => {
        const fetchReplies = async () => {
            if (!parentMessage.id) return;
            setIsLoading(true);

            try {
                // Fetch messages that are replies to this parent
                const res = await getMessages(conversationId, 100);
                if (res.success && res.data) {
                    // Filter for replies to this message
                    const threadReplies = res.data.filter(
                        (msg: any) => msg.replyToId === parentMessage.id
                    );
                    setReplies(threadReplies);
                }
            } catch (error) {
                console.error("Error fetching thread replies:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen) {
            fetchReplies();
        }
    }, [isOpen, parentMessage.id, conversationId]);

    // Subscribe to new messages in this thread
    useEffect(() => {
        if (!isOpen || !conversationId) return;

        const channel = pusherClient.subscribe(`conversation-${conversationId}`);

        channel.bind("message:new", (data: any) => {
            // Only add if it's a reply to our parent message
            if (data.replyToId === parentMessage.id) {
                setReplies(prev => [...prev, data]);
            }
        });

        return () => {
            pusherClient.unsubscribe(`conversation-${conversationId}`);
        };
    }, [isOpen, conversationId, parentMessage.id]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [replies]);

    const handleSend = async () => {
        if (!input.trim() || !session?.user?.id) return;

        const content = input.trim();
        setInput("");
        setIsSending(true);

        // Optimistic update
        const optimisticReply: ThreadMessage = {
            id: `temp-${Date.now()}`,
            content,
            senderId: session.user.id,
            senderName: session.user.name || "Moi",
            senderAvatar: session.user.image || undefined,
            createdAt: new Date().toISOString(),
        };
        setReplies(prev => [...prev, optimisticReply]);

        try {
            await sendMessage(
                conversationId,
                session.user.id,
                content,
                "TEXT",
                undefined, // fileUrl
                parentMessage.id // replyToId - this makes it a thread reply!
            );
        } catch (error) {
            // Remove optimistic message on error
            setReplies(prev => prev.filter(r => r.id !== optimisticReply.id));
            console.error("Error sending thread reply:", error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white dark:bg-zinc-900 shadow-2xl z-50 flex flex-col border-l border-zinc-200 dark:border-zinc-800"
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={onClose}
                        >
                            <ArrowLeft size={18} />
                        </Button>
                        <div className="flex-1">
                            <h2 className="font-semibold text-sm text-zinc-900 dark:text-white">
                                Fil de discussion
                            </h2>
                            <p className="text-xs text-zinc-500">
                                {replies.length} réponse{replies.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={onClose}
                        >
                            <X size={18} />
                        </Button>
                    </div>

                    {/* Parent Message */}
                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-orange-50/50 dark:bg-orange-900/10">
                        <div className="flex gap-3">
                            <Avatar className="h-10 w-10 flex-shrink-0">
                                <AvatarImage src={parentMessage.senderAvatar || "/avatars/default.svg"} />
                                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-pink-500 text-white font-bold text-sm">
                                    {parentMessage.senderName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm text-zinc-900 dark:text-white">
                                        {parentMessage.senderName}
                                    </span>
                                    <span className="text-xs text-zinc-400">
                                        {formatDistanceToNow(new Date(parentMessage.createdAt), { addSuffix: true, locale: fr })}
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                                    {parentMessage.content}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Thread divider */}
                    <div className="flex items-center gap-3 px-4 py-2 bg-zinc-50 dark:bg-zinc-800/30">
                        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
                        <span className="text-xs text-zinc-400 flex items-center gap-1">
                            <MessageSquare size={12} />
                            {replies.length} réponse{replies.length !== 1 ? "s" : ""}
                        </span>
                        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
                    </div>

                    {/* Replies */}
                    <ScrollArea ref={scrollRef} className="flex-1 p-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : replies.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 text-zinc-400 text-sm">
                                <MessageSquare size={32} className="opacity-30 mb-2" />
                                <p>Aucune réponse pour l'instant</p>
                                <p className="text-xs mt-1">Soyez le premier à répondre !</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {replies.map((reply) => {
                                    const isMe = reply.senderId === session?.user?.id;
                                    return (
                                        <div key={reply.id} className="flex gap-3">
                                            <Avatar className="h-8 w-8 flex-shrink-0">
                                                <AvatarImage src={reply.senderAvatar || "/avatars/default.svg"} />
                                                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-bold text-xs">
                                                    {reply.senderName?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="font-semibold text-xs text-zinc-900 dark:text-white">
                                                        {isMe ? "Vous" : reply.senderName}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-400">
                                                        {format(new Date(reply.createdAt), "HH:mm")}
                                                    </span>
                                                </div>
                                                <div className={cn(
                                                    "inline-block px-3 py-2 rounded-2xl text-sm max-w-full",
                                                    isMe
                                                        ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-tl-none"
                                                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-tl-none"
                                                )}>
                                                    <p className="whitespace-pre-wrap break-words">{reply.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </ScrollArea>

                    {/* Input */}
                    <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={session?.user?.image || "/avatars/default.svg"} />
                                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-pink-500 text-white font-bold text-xs">
                                    {session?.user?.name?.[0]}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-full px-3 py-1">
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                                    placeholder="Répondre dans le fil..."
                                    className="h-8 bg-transparent border-0 focus-visible:ring-0 text-sm"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-full text-zinc-400 hover:text-orange-500"
                                >
                                    <Smile size={16} />
                                </Button>
                            </div>

                            {input.trim() && (
                                <Button
                                    size="icon"
                                    className="h-9 w-9 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex-shrink-0"
                                    onClick={handleSend}
                                    disabled={isSending}
                                >
                                    <Send size={16} />
                                </Button>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Thread indicator badge for messages
export function ThreadBadge({
    count,
    onClick
}: {
    count: number;
    onClick: () => void;
}) {
    if (count === 0) return null;

    return (
        <button
            onClick={onClick}
            className="flex items-center gap-1.5 mt-1 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
            <MessageSquare size={12} />
            <span>{count} réponse{count !== 1 ? "s" : ""}</span>
        </button>
    );
}

