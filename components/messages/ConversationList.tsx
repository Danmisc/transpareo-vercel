"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, PenSquare, CheckCheck, Users, Plus, Hash, Lock, MessageCircle, Home, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getConversations } from "@/lib/services/messaging.service";
import { pusherClient } from "@/lib/pusher";
import { useSession } from "next-auth/react";
import { usePresence } from "@/components/providers/PresenceProvider";
import { CreateGroupDialog } from "./CreateGroupDialog";
import { CreateChannelDialog } from "./CreateChannelDialog";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function ConversationList() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { onlineUsers } = usePresence();

    const [conversations, setConversations] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    const activeTab = searchParams.get("tab") === "channels" ? "channels" : "chat";

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({}); // convId -> userNames[]
    const subscribedIds = useRef(new Set<string>());

    const handleTabChange = (tab: "chat" | "channels") => {
        // preserve other params? No, just switch tab
        router.push(`${pathname}?tab=${tab}`);
    };

    useEffect(() => {
        async function load() {
            if (!session?.user?.id) return;
            const res = await getConversations(session.user.id);
            if (res.success && res.data) {
                setConversations(res.data);
            }
        }
        load();
    }, [session?.user?.id]);

    useEffect(() => {
        if (!session?.user?.id) return;

        // Listen for NEW conversations (Realtime Sidebar Update)
        const userChannel = pusherClient.subscribe(`private-user-${session.user.id}`);
        userChannel.bind("conversation:new", (data: any) => {
            setConversations(prev => {
                if (prev.find(c => c.id === data.id)) return prev;

                // Format new conversation for list
                const other = data.participants?.find((p: any) => p.userId !== session.user.id)?.user;
                let name = data.name;
                let avatar = data.image;

                if (!data.isGroup && other) {
                    name = other.name || "Utilisateur";
                    avatar = other.avatar || other.image || "/avatars/default.svg";
                }

                const newConv = {
                    ...data,
                    name,
                    avatar,
                    unreadCount: 0,
                    unread: false,
                    lastMessage: data.isGroup ? "Groupe créé" : "Nouvelle discussion",
                    lastMessageAt: data.createdAt
                };
                return [newConv, ...prev];
            });
        });

        conversations.forEach(c => {
            if (subscribedIds.current.has(c.id)) return;
            subscribedIds.current.add(c.id);
            const channel = pusherClient.subscribe(`private-conversation-${c.id}`);

            channel.bind("message:new", (data: any) => {
                setConversations(prev => {
                    const idx = prev.findIndex(item => item.id === c.id);
                    if (idx === -1) return prev;

                    const updated = { ...prev[idx] };
                    updated.lastMessage = data.content || (data.image ? "📷 Image" : "Message");
                    updated.lastMessageAt = data.createdAt;

                    if (session?.user?.id && data.senderId !== session.user.id) {
                        updated.unreadCount = (updated.unreadCount || 0) + 1;
                        updated.unread = true;
                    }

                    const newList = [...prev];
                    newList.splice(idx, 1);
                    return [updated, ...newList];
                });
            });

            channel.bind("conversation:read", (data: { userId: string }) => {
                if (session?.user?.id && data.userId === session.user.id) {
                    setConversations(prev => prev.map(item => {
                        if (item.id === c.id) {
                            return { ...item, unreadCount: 0, unread: false };
                        }
                        return item;
                    }));
                }
            });

            // Typing Indicators
            channel.bind("client-typing", (data: { user: string }) => {
                if (!data.user || (session?.user?.name && data.user === session.user.name)) return;

                setTypingUsers(prev => ({
                    ...prev,
                    [c.id]: [...(prev[c.id] || []), data.user]
                }));

                // Clear after 3s
                setTimeout(() => {
                    setTypingUsers(prev => ({
                        ...prev,
                        [c.id]: (prev[c.id] || []).filter(u => u !== data.user)
                    }));
                }, 3000);
            });
        });

        // Cleanup on unmount only
        return () => {
            // Optional: Unsubscribe all?
        };
    }, [conversations, session?.user?.id]);

    const filtered = conversations.filter(c => {
        const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase());
        const isChannel = c.type === "CHANNEL_PUBLIC" || c.type === "CHANNEL_PRIVATE";

        if (activeTab === "chat") {
            return matchesSearch && !isChannel;
        } else {
            return matchesSearch && isChannel;
        }
    });

    return (
        <div className="flex flex-col h-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl relative">
            {/* Header */}
            <div className="p-4 flex flex-col gap-4 sticky top-0 z-10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="hidden md:flex rounded-full -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                                title="Retour à l'accueil"
                            >
                                <ArrowLeft size={20} />
                            </Button>
                        </Link>
                        <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
                            {activeTab === "chat" ? "Messages" : "Salons"}
                        </h1>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                        onClick={() => setIsCreateOpen(true)}
                    >
                        <Plus size={18} />
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl relative">
                    <button
                        onClick={() => handleTabChange("chat")}
                        className={cn("flex-1 text-sm font-medium py-1.5 rounded-lg transition-all flex items-center justify-center gap-2", activeTab === "chat" ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300")}
                    >
                        <MessageCircle size={14} /> Chats
                    </button>
                    <button
                        onClick={() => handleTabChange("channels")}
                        className={cn("flex-1 text-sm font-medium py-1.5 rounded-lg transition-all flex items-center justify-center gap-2", activeTab === "channels" ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300")}
                    >
                        <Hash size={14} /> Salons
                    </button>
                </div>
            </div>

            {/* Dialogs */}
            <CreateGroupDialog
                open={isCreateOpen && activeTab === "chat"}
                onOpenChange={(v) => !v && setIsCreateOpen(false)}
                onSuccess={(newConv) => {
                    setConversations(prev => [newConv, ...prev]);
                    setIsCreateOpen(false);
                }}
            />

            <CreateChannelDialog
                open={isCreateOpen && activeTab === "channels"}
                onOpenChange={(v) => !v && setIsCreateOpen(false)}
                onSuccess={(newConv) => {
                    setConversations(prev => [newConv, ...prev]);
                    setIsCreateOpen(false);
                }}
            />

            {/* Search */}
            <div className="px-4 pb-2 pt-2">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4 group-focus-within:text-orange-500 transition-colors" />
                    <Input
                        placeholder={activeTab === "chat" ? "Rechercher une discussion..." : "Rechercher un salon..."}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-zinc-100 dark:bg-zinc-800 border-none pl-9 h-10 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-orange-500/20 transition-all font-medium"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent space-y-1 p-2">
                {filtered.map((conv) => {
                    // Logic for online status
                    let isOnline = false;
                    if (!conv.isGroup && session?.user?.id) {
                        const other = conv.participants.find((p: any) => p.userId !== session.user?.id);
                        if (other && onlineUsers.has(other.userId)) {
                            isOnline = true;
                        }
                    }

                    return (
                        <ConversationItem
                            key={conv.id}
                            data={conv}
                            isActive={false} // Logic for active state needs URL check, simplified
                            isOnline={isOnline}
                            typingUsers={typingUsers[conv.id] || []}
                            onClick={() => { }}
                        />
                    );
                })}

                {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-8 text-zinc-400 text-sm gap-2">
                        {activeTab === "chat" ? (
                            <>
                                <Users size={32} className="opacity-20" />
                                <p>Aucune discussion</p>
                            </>
                        ) : (
                            <>
                                <Hash size={32} className="opacity-20" />
                                <p>Aucun salon rejoint</p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function ConversationItem({ data, isActive, isOnline, typingUsers, onClick }: { data: any, isActive: boolean, isOnline?: boolean, typingUsers?: string[], onClick: () => void }) {
    const isChannel = data.type?.startsWith("CHANNEL");

    return (
        <Link
            href={`/messages/${data.id}`}
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 group relative overflow-hidden",
                isActive ? "bg-orange-50 dark:bg-orange-500/10 border border-orange-100/50 dark:border-orange-500/20 shadow-sm" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border border-transparent"
            )}
        >
            {/* Active Indicator Glow */}
            {isActive && <div className="absolute inset-0 bg-orange-500/5 dark:bg-orange-500/10 blur-xl rounded-2xl -z-10" />}

            <div className="relative flex-shrink-0">
                <Avatar className="w-12 h-12 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                    <AvatarImage src={data.avatar} />
                    <AvatarFallback className={cn("text-xs font-bold", (data.isGroup || isChannel) ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400")}>
                        {isChannel ? (data.type === "CHANNEL_PRIVATE" ? <Lock size={16} /> : <Hash size={16} />) :
                            data.isGroup ? <Users size={16} /> :
                                data.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                {/* Online Indicator */}
                {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full transition-all animate-bounce-in" />
                )}
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <div className="flex justify-between items-baseline">
                    <span className={cn("text-sm font-semibold truncate transition-colors", isActive ? "text-zinc-900 dark:text-white" : "text-zinc-700 dark:text-zinc-200")}>
                        {data.name}
                    </span>
                    {data.lastMessageAt && (
                        <span className={cn("text-[10px] font-medium shrink-0", data.unread > 0 ? "text-orange-500" : "text-zinc-400 dark:text-zinc-500")}>
                            {formatDistanceToNow(new Date(data.lastMessageAt), { addSuffix: false, locale: fr })}
                        </span>
                    )}
                </div>

                <div className="flex justify-between items-center">
                    <p className={cn(
                        "text-xs truncate max-w-[80%]",
                        (data.unread > 0 || (typingUsers && typingUsers.length > 0)) ? "text-zinc-900 dark:text-white font-bold" : "text-zinc-500 dark:text-zinc-400 font-normal",
                        (typingUsers && typingUsers.length > 0) && "text-orange-500"
                    )}>
                        {typingUsers && typingUsers.length > 0
                            ? `${typingUsers.join(", ")} écrit...`
                            : data.lastMessage}
                    </p>

                    {data.unreadCount > 0 ? (
                        <div className="flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-orange-500 rounded-full text-[10px] font-bold text-white shadow-lg shadow-orange-500/20">
                            {data.unreadCount}
                        </div>
                    ) : (
                        <CheckCheck size={14} className="text-orange-500/60" />
                    )}
                </div>
            </div>
        </Link>
    );
}

