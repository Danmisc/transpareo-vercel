"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ChevronUp, ChevronDown, X, Plus, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useFloatingChat } from "./FloatingChatProvider";
import { getConversations } from "@/lib/services/messaging.service";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/lib/pusher";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

interface MessagesTrayProps {
    className?: string;
}

export function MessagesTray({ className }: MessagesTrayProps) {
    const { data: session } = useSession();
    const { openChat, isEnabled } = useFloatingChat();
    const [isExpanded, setIsExpanded] = useState(false);
    const [conversations, setConversations] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [totalUnread, setTotalUnread] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch conversations
    useEffect(() => {
        const fetchConversations = async () => {
            if (!session?.user?.id) return;
            setIsLoading(true);
            const res = await getConversations(session.user.id);
            if (res.success && res.data) {
                setConversations(res.data);
                const unread = res.data.reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0);
                setTotalUnread(unread);
            }
            setIsLoading(false);
        };
        fetchConversations();
    }, [session?.user?.id]);

    // Subscribe to new messages
    useEffect(() => {
        if (!session?.user?.id) return;

        const channel = pusherClient.subscribe(`user-${session.user.id}`);

        channel.bind("new-message", (data: any) => {
            // Update conversation list
            setConversations(prev => {
                const existing = prev.find(c => c.id === data.conversationId);
                if (existing) {
                    return prev.map(c =>
                        c.id === data.conversationId
                            ? {
                                ...c,
                                lastMessage: data.content || "Nouveau message",
                                lastMessageAt: new Date().toISOString(),
                                unreadCount: (c.unreadCount || 0) + 1
                            }
                            : c
                    ).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
                }
                return prev;
            });
            setTotalUnread(prev => prev + 1);
        });

        return () => {
            pusherClient.unsubscribe(`user-${session.user.id}`);
        };
    }, [session?.user?.id]);

    const filteredConversations = conversations.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) &&
        !c.type?.startsWith("CHANNEL")
    );

    const handleOpenChat = (conv: any) => {
        if (isEnabled) {
            // Get the other user for DM conversations
            const otherUser = conv.participants?.find((p: any) => p.userId !== session?.user?.id);
            openChat(conv.id, {
                id: otherUser?.userId || conv.id,
                name: conv.name,
                avatar: conv.avatar,
                isOnline: false
            });
        } else {
            window.location.href = `/messages/${conv.id}`;
        }
    };

    if (!session?.user?.id) return null;

    return (
        <div className={cn("fixed bottom-4 right-24 z-40", className)}>
            <motion.div
                layout
                className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
                style={{ width: isExpanded ? 320 : "auto" }}
            >
                {/* Header - Always visible */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-900 dark:bg-zinc-800 text-white hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
                >
                    <div className="relative">
                        <MessageCircle size={20} />
                        {totalUnread > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold">
                                {totalUnread > 9 ? "9+" : totalUnread}
                            </span>
                        )}
                    </div>
                    <span className="font-semibold text-sm flex-1 text-left">Messagerie</span>
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </button>

                {/* Expanded content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Search */}
                            <div className="p-2 border-b border-zinc-100 dark:border-zinc-800">
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <Input
                                        placeholder="Rechercher..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="h-8 pl-8 text-sm bg-zinc-100 dark:bg-zinc-800 border-0 rounded-lg"
                                    />
                                </div>
                            </div>

                            {/* Conversation list */}
                            <ScrollArea className="h-72">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : filteredConversations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-zinc-400 text-sm">
                                        <MessageCircle size={32} className="opacity-20 mb-2" />
                                        <p>Aucune conversation</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                        {filteredConversations.slice(0, 8).map((conv) => (
                                            <button
                                                key={conv.id}
                                                onClick={() => handleOpenChat(conv)}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left"
                                            >
                                                <div className="relative flex-shrink-0">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={conv.avatar || "/avatars/default.svg"} />
                                                        <AvatarFallback className="bg-gradient-to-br from-orange-400 to-pink-500 text-white font-bold text-sm">
                                                            {conv.name?.[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {/* Could add online indicator here */}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold text-sm text-zinc-900 dark:text-white truncate">
                                                            {conv.name}
                                                        </span>
                                                        {conv.lastMessageAt && (
                                                            <span className="text-[10px] text-zinc-400 flex-shrink-0">
                                                                {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false, locale: fr })}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className={cn(
                                                        "text-xs truncate",
                                                        conv.unreadCount > 0
                                                            ? "text-zinc-900 dark:text-white font-medium"
                                                            : "text-zinc-500"
                                                    )}>
                                                        {conv.lastMessage || "Démarrer la conversation"}
                                                    </p>
                                                </div>

                                                {conv.unreadCount > 0 && (
                                                    <span className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                                                        {conv.unreadCount}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>

                            {/* Footer */}
                            <div className="p-2 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-2">
                                <Link href="/messages">
                                    <Button variant="ghost" size="sm" className="w-full text-xs">
                                        Tout voir
                                    </Button>
                                </Link>
                                <Button variant="ghost" size="sm" className="w-full text-xs gap-1">
                                    <Plus size={14} />
                                    Nouveau
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

