"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Minus, Maximize2, Send, Paperclip, Smile, Mic,
    MoreVertical, Phone, Video, ChevronDown, Image as ImageIcon
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useFloatingChat, ChatWindow } from "./FloatingChatProvider";
import { getMessages, sendMessage } from "@/lib/services/messaging.service";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/lib/pusher";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Minimized bubble component
function MinimizedBubble({ chat, onClick }: { chat: ChatWindow; onClick: () => void }) {
    const { closeChat } = useFloatingChat();

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="relative group"
        >
            <button
                onClick={onClick}
                className="relative block"
            >
                <Avatar className="h-14 w-14 ring-4 ring-white dark:ring-zinc-900 shadow-lg hover:scale-105 transition-transform cursor-pointer">
                    <AvatarImage src={chat.user.avatar || "/avatars/default.svg"} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-pink-500 text-white font-bold text-lg">
                        {chat.user.name?.[0]}
                    </AvatarFallback>
                </Avatar>

                {/* Online indicator */}
                {chat.user.isOnline && (
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-zinc-900" />
                )}

                {/* Unread badge */}
                {chat.hasUnread && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-900 animate-pulse">
                        !
                    </span>
                )}
            </button>

            {/* Close button on hover */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    closeChat(chat.id);
                }}
                className="absolute -top-1 -left-1 w-5 h-5 bg-zinc-800 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
            >
                <X size={12} />
            </button>

            {/* Name tooltip */}
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-zinc-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {chat.user.name}
            </div>
        </motion.div>
    );
}

// Expanded chat window component
function ExpandedChatWindow({ chat }: { chat: ChatWindow }) {
    const { data: session } = useSession();
    const { minimizeChat, closeChat, markAsRead } = useFloatingChat();
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch messages
    useEffect(() => {
        const fetchMessages = async () => {
            setIsLoading(true);
            const res = await getMessages(chat.id);
            if (res.success && res.data) {
                setMessages(res.data);
            }
            setIsLoading(false);
            markAsRead(chat.id);
        };
        fetchMessages();
    }, [chat.id, markAsRead]);

    // Subscribe to new messages in this conversation
    useEffect(() => {
        const channel = pusherClient.subscribe(`conversation-${chat.id}`);

        channel.bind("new-message", (data: any) => {
            setMessages(prev => [...prev, data]);
            markAsRead(chat.id);
        });

        return () => {
            pusherClient.unsubscribe(`conversation-${chat.id}`);
        };
    }, [chat.id, markAsRead]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !session?.user?.id) return;

        const content = input.trim();
        setInput("");
        setIsSending(true);

        // Optimistic update
        const optimisticMessage = {
            id: `temp-${Date.now()}`,
            content,
            senderId: session.user.id,
            senderName: session.user.name,
            createdAt: new Date().toISOString(),
            isOptimistic: true
        };
        setMessages(prev => [...prev, optimisticMessage]);

        try {
            await sendMessage(chat.id, session.user.id, content, "TEXT");
        } catch (error) {
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
        } finally {
            setIsSending(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-80 bg-white dark:bg-zinc-900 rounded-t-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col"
            style={{ height: "420px" }}
        >
            {/* Header */}
            <div className="flex items-center gap-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                <div className="relative">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={chat.user.avatar || "/avatars/default.svg"} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-400 to-pink-500 text-white font-bold text-sm">
                            {chat.user.name?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    {chat.user.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-zinc-800" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-zinc-900 dark:text-white truncate">
                        {chat.user.name}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                        {chat.user.isOnline ? "En ligne" : "Hors ligne"}
                    </p>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                        onClick={() => minimizeChat(chat.id)}
                    >
                        <Minus size={16} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full text-zinc-500 hover:text-red-500"
                        onClick={() => closeChat(chat.id)}
                    >
                        <X size={16} />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea ref={scrollRef} className="flex-1 p-3">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <Avatar className="h-16 w-16 mb-3">
                            <AvatarImage src={chat.user.avatar || "/avatars/default.svg"} />
                            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-pink-500 text-white font-bold text-2xl">
                                {chat.user.name?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <p className="font-semibold text-zinc-900 dark:text-white">{chat.user.name}</p>
                        <p className="text-xs text-zinc-500 mt-1">Commencez une conversation</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {messages.map((msg, i) => {
                            const isMe = msg.senderId === session?.user?.id;
                            const showDate = i === 0 ||
                                new Date(messages[i - 1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

                            return (
                                <div key={msg.id}>
                                    {showDate && (
                                        <div className="text-center my-3">
                                            <span className="text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                                                {format(new Date(msg.createdAt), "dd MMM yyyy")}
                                            </span>
                                        </div>
                                    )}
                                    <div className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                                        <div className={cn(
                                            "max-w-[85%] px-3 py-2 rounded-2xl text-sm",
                                            isMe
                                                ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-tr-none"
                                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-tl-none",
                                            msg.isOptimistic && "opacity-70"
                                        )}>
                                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                            <span className={cn(
                                                "text-[9px] mt-1 block text-right",
                                                isMe ? "text-white/60" : "text-zinc-400"
                                            )}>
                                                {format(new Date(msg.createdAt), "HH:mm")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </ScrollArea>

            {/* Input */}
            <div className="p-2 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-zinc-400 hover:text-orange-500 flex-shrink-0"
                    >
                        <Paperclip size={18} />
                    </Button>

                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                        placeholder="Écrivez un message..."
                        className="h-9 text-sm bg-zinc-100 dark:bg-zinc-800 border-0 rounded-full focus-visible:ring-1 focus-visible:ring-orange-500"
                    />

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-zinc-400 hover:text-orange-500 flex-shrink-0"
                    >
                        <Smile size={18} />
                    </Button>

                    {input.trim() ? (
                        <Button
                            size="icon"
                            className="h-8 w-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex-shrink-0"
                            onClick={handleSend}
                            disabled={isSending}
                        >
                            <Send size={16} />
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-zinc-400 hover:text-orange-500 flex-shrink-0"
                        >
                            <Mic size={18} />
                        </Button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// Main floating chat container
export function FloatingChatContainer() {
    const { openChats, maximizeChat, isEnabled } = useFloatingChat();
    const pathname = usePathname();

    if (!isEnabled) return null;
    if (pathname?.startsWith("/messages")) return null;

    // Separate minimized and expanded chats
    const minimizedChats = openChats.filter(c => c.isMinimized);
    const expandedChats = openChats.filter(c => !c.isMinimized);

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-end gap-3">
            {/* Expanded chat windows */}
            <AnimatePresence mode="popLayout">
                {expandedChats.map(chat => (
                    <ExpandedChatWindow key={chat.id} chat={chat} />
                ))}
            </AnimatePresence>

            {/* Minimized bubbles */}
            <div className="flex flex-col-reverse gap-2">
                <AnimatePresence mode="popLayout">
                    {minimizedChats.map(chat => (
                        <MinimizedBubble
                            key={chat.id}
                            chat={chat}
                            onClick={() => maximizeChat(chat.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

