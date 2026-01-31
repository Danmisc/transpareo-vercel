"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useCall } from "@/components/calls/CallProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Video, Info, Image as ImageIcon, Mic, Send, Smile, Paperclip, ArrowLeft, Users, Hash, Lock, X, Pin, Reply, Trash2, Edit2, MoreHorizontal, MoreVertical, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getMessages, sendMessage, getConversationById, markMessagesAsRead, updateGroupInfo, updateParticipantRole, removeParticipant, getPinnedMessages, pinMessage, unpinMessage, searchMessages, fetchMessageContext } from "@/lib/services/messaging.service";
import { uploadFiles } from "@/lib/upload";
import imageCompression from "browser-image-compression";
import { pusherClient } from "@/lib/pusher";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GroupSettings } from "./GroupSettings";
import { usePresence } from "@/components/providers/PresenceProvider";
import { MessageItem } from "@/components/messages/MessageItem";
import { AdvancedChatSearch } from "./AdvancedChatSearch";
import { SearchResultsSidebar } from "./SearchResultsSidebar";
import { ChatInput } from "@/components/messages/ChatInput";
import { SharedMediaSheet } from "../conversation/SharedMediaSheet";
import { ThreadView } from "./ThreadView";
import { TypingBubble } from "./TypingBubble";


export default function ChatWindow({ conversationId }: { conversationId: string }) {
    const { data: session } = useSession();
    const { onlineUsers } = usePresence();
    const router = useRouter();
    const { callUser } = useCall(); // Moved here
    const [messages, setMessages] = useState<any[]>([]);
    const [conversation, setConversation] = useState<any>(null);
    const [replyingTo, setReplyingTo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [pinnedMessages, setPinnedMessages] = useState<any[]>([]);

    // In-Chat Search
    // In-Chat Search
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [isContextView, setIsContextView] = useState(false);

    const [showMediaSheet, setShowMediaSheet] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 300; // Show if >300px from bottom
        setShowScrollButton(!isNearBottom);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    const [threadMessage, setThreadMessage] = useState<any>(null);
    const typingTimeoutsRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

    // Initial Load
    useEffect(() => {
        async function load() {
            if (!session?.user?.id) return;

            setLoading(true);
            try {
                // Parallel fetch
                const [msgsRes, convRes, pinnedRes] = await Promise.all([
                    getMessages(conversationId),
                    getConversationById(conversationId, session.user.id),
                    getPinnedMessages(conversationId)
                ]);

                if (msgsRes.success && msgsRes.data) {
                    const mapMessage = (m: any) => ({
                        id: m.id,
                        sender: m.senderId === session?.user?.id ? "me" : "other",
                        senderId: m.senderId,
                        senderName: m.sender.name,
                        senderAvatar: m.sender.avatar || m.sender.image,
                        content: m.content,
                        time: new Date(m.createdAt),
                        type: m.type === "IMAGE" ? "image" : "text",
                        image: m.image,
                        isDeleted: m.isDeleted,
                        isEdited: m.isEdited,
                        isRead: m.readStatuses?.some((r: any) => r.userId !== session?.user?.id) || false,
                        readStatuses: m.readStatuses || [],
                        reactions: m.reactions || [],
                        attachments: m.attachments || [],
                        replyTo: m.replyTo,
                        replyToId: m.replyToId,
                        isPinned: m.isPinned,
                        replies: m.replies || [],
                        conversationId: conversationId
                    });
                    const mapped = msgsRes.data.map(mapMessage);
                    setMessages(mapped);
                    markMessagesAsRead(conversationId, session.user.id);
                }

                if (convRes.success && convRes.data) {
                    setConversation(convRes.data);
                    const pinned = convRes.data.messages?.filter((m: any) => m.isPinned) || [];
                    setPinnedMessages(pinned);
                }

                if (pinnedRes.success && pinnedRes.data) {
                    setPinnedMessages(pinnedRes.data);
                }
            } catch (error) {
                console.error("Failed to load conversation", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [conversationId, session?.user?.id]);

    // Force scroll to bottom on load
    useEffect(() => {
        if (!loading) {
            messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        }
    }, [loading, conversationId]);

    // Scroll to bottom when I send a message
    useEffect(() => {
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.senderId === session?.user?.id) {
                scrollToBottom();
            }
        }
    }, [messages.length, session?.user?.id]);

    const [typingUsers, setTypingUsers] = useState<{ id: string, name: string, avatar?: string }[]>([]);
    const processingTyping = useRef(false);

    // Real-time Subscription (Pusher)
    useEffect(() => {
        const channelName = `private-conversation-${conversationId}`;
        const channel = pusherClient.subscribe(channelName);

        channel.bind("message:new", (data: any) => {
            const isMe = data.senderId === session?.user?.id;

            // Skip if this is my own message - it's already handled via optimistic UI
            // Skip if this is my own message - it's already handled via optimistic UI
            if (isMe) return;

            // Remove sender from typing users IMMEDIATELY upon receiving message
            if (data.senderId) {
                setTypingUsers(prev => prev.filter(u => u.id !== data.senderId));
            }

            // Play Receive Sound
            import("@/components/ui/sound-effects").then(({ soundEffects }) => {
                soundEffects.playReceive();
            });

            // Mark as read since we received it
            if (session?.user?.id) {
                markMessagesAsRead(conversationId, session.user.id);
            }

            setMessages((prev) => {
                if (prev.find(m => m.id === data.id)) return prev;

                // Mark as read since we received it


                const newMessage = {
                    id: data.id,
                    sender: "other",
                    senderId: data.senderId,
                    senderName: data.sender?.name,
                    senderAvatar: data.sender?.avatar || data.sender?.image,
                    content: data.content,
                    time: new Date(data.createdAt),
                    type: data.type === "IMAGE" ? "image" : "text",
                    image: data.image,
                    isDeleted: data.isDeleted,
                    isEdited: data.isEdited,
                    isRead: false,
                    reactions: [],
                    attachments: data.attachments || [],
                    replyTo: data.replyTo,
                    isPinned: data.isPinned
                };

                return [...prev, newMessage];
            });
        });

        channel.bind("message:update", (data: any) => {
            // ... existing code ...
            setMessages((prev) => prev.map(m => {
                if (m.id === data.id) {
                    return {
                        ...m,
                        content: data.content,
                        isDeleted: data.isDeleted,
                        isEdited: data.isEdited,
                        time: new Date(data.createdAt),
                        isPinned: data.isPinned !== undefined ? data.isPinned : m.isPinned, // Update isPinned if present
                        reactions: data.reactions !== undefined ? data.reactions : m.reactions,
                        attachments: data.attachments !== undefined ? data.attachments : m.attachments
                    };
                }
                return m;
            }));

            // Handle pinned messages list update
            if (data.isPinned !== undefined) {
                setPinnedMessages(prev => {
                    if (data.isPinned) {
                        // Add to pinned if not already there, ensure it's the latest
                        const existing = prev.find(m => m.id === data.id);
                        if (!existing) {
                            return [{ ...data, senderName: data.sender?.name }, ...prev];
                        }
                        return prev; // Already pinned
                    } else {
                        // Remove from pinned
                        return prev.filter(m => m.id !== data.id);
                    }
                });
            }
        });

        channel.bind("client-typing", (data: { user: string, avatar?: string, id: string }) => {
            if (!data.user) return;
            if (data.id === session?.user?.id) return; // Ignore my own typing

            // Clear existing timeout to prevent premature removal
            if (typingTimeoutsRef.current[data.id]) {
                clearTimeout(typingTimeoutsRef.current[data.id]);
            }

            setTypingUsers(prev => {
                if (!prev.find(u => u.name === data.user)) {
                    return [...prev, { name: data.user, avatar: data.avatar, id: data.id }];
                }
                return prev;
            });

            // Set new timeout (debounce)
            typingTimeoutsRef.current[data.id] = setTimeout(() => {
                setTypingUsers(prev => prev.filter(u => u.name !== data.user));
                delete typingTimeoutsRef.current[data.id];
            }, 3000);
        });

        channel.bind("conversation:read", (data: { userId: string, readAt: string }) => {
            if (data.userId === session?.user?.id) return;

            setMessages(prev => prev.map(m => {
                // Mark all my sent messages as read if they are older than readAt
                if (m.sender === "me" && !m.isRead && new Date(m.time) <= new Date(data.readAt)) {
                    return { ...m, isRead: true };
                }
                return m;
            }));
        });

        return () => {
            pusherClient.unsubscribe(channelName);
            // Clear all timeouts on unmount
            Object.values(typingTimeoutsRef.current).forEach(clearTimeout);
        };
    }, [conversationId, session?.user?.id]);

    const triggerTyping = () => {
        if (processingTyping.current) return;
        processingTyping.current = true;

        if (session?.user?.name) {
            fetch("/api/pusher/trigger", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    channel: `private-conversation-${conversationId}`,
                    event: "client-typing",
                    data: {
                        user: session.user.name,
                        avatar: session.user.image,
                        id: session.user.id
                    }
                })
            }).catch(e => console.error("Failed to trigger typing", e));
        }

        setTimeout(() => {
            processingTyping.current = false;
        }, 2000);
    };

    // Scroll to bottom effect
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (content: string, type: string, files?: File[], metadata?: any) => {
        if (!session?.user?.id) return;

        const optimisticId = Date.now().toString();
        let attachments: any[] = [];
        let filesToUpload: File[] = [];

        // 1. Prepare Optimistic Attachments
        if (files && files.length > 0) {
            filesToUpload = files;
            attachments = files.map(f => ({
                id: `temp-${Math.random()}`,
                url: URL.createObjectURL(f), // Blob URL for instant preview
                type: f.type.startsWith("image/") ? "IMAGE" : f.type.startsWith("video/") ? "VIDEO" : f.type.startsWith("audio/") ? "AUDIO" : "FILE",
                name: f.name,
                size: f.size,
                mimeType: f.type,
                isOptimistic: true // Flag for UI
            }));
        }

        // 2. Add Optimistic Message
        const optimisticMsg = {
            id: optimisticId,
            sender: "me",
            senderId: session.user.id,
            senderName: session.user.name,
            content: content,
            time: new Date(),
            type: attachments.length > 0
                ? (attachments.every(a => a.type === "IMAGE") ? "image" : "text") // Using "text" type for mixed content logic fallback, or mapped logic
                : "text",
            isDeleted: false,
            isEdited: false,
            isRead: false,
            reactions: [],
            attachments: attachments,
            replyTo: replyingTo ? { sender: { name: replyingTo.senderName }, content: replyingTo.content } : undefined,
            isPinned: false,
            metadata: metadata // Optimistic metadata
        };
        setMessages(prev => [...prev, optimisticMsg]);

        const replyId = replyingTo?.id;
        setReplyingTo(null);

        // 3. Upload Background
        let uploadedAttachments: any[] = [];
        if (filesToUpload.length > 0) {

            // Compress if Image
            const compressedFiles = await Promise.all(filesToUpload.map(async (f) => {
                if (f.type.startsWith("image/")) {
                    try {
                        return await imageCompression(f, {
                            maxSizeMB: 1,
                            maxWidthOrHeight: 1920,
                            useWebWorker: true
                        });
                    } catch (e) {
                        return f;
                    }
                }
                return f;
            }));

            const formData = new FormData();
            compressedFiles.forEach(f => formData.append("files", f));
            try {
                const uploadRes = await uploadFiles(formData);
                if (uploadRes.success && uploadRes.attachments) {
                    uploadedAttachments = uploadRes.attachments;
                } else {
                    console.error("Upload failed");
                    // Show error state on message?
                }
            } catch (err) {
                console.error("Upload error", err);
            }
        }

        // 4. Send Server Action
        // Determine final type based on UPLOADED files (same logic as before)
        const finalType = uploadedAttachments.length > 0
            ? (uploadedAttachments.every(a => a.type === "IMAGE") ? "IMAGE" : "FILE")
            : (attachments.length > 0 ? "FILE" : "TEXT"); // Check original attachments if upload failed? No, if upload failed we can't send.

        // If upload failed but we had files, we should probably abort or send text only?
        // For now, assume success or attempt text only.

        const res = await sendMessage(conversationId, session.user.id, content, finalType, undefined, replyId, uploadedAttachments, metadata);

        if (res.success && res.data) {
            // 5. Swap Optimistic with Real
            setMessages(prev => {
                // Remove optimistic
                const filtered = prev.filter(m => m.id !== optimisticId);
                // Deduplicate real message
                if (filtered.some(m => m.id === res.data.id)) return filtered;

                const mapped: any = {
                    id: res.data.id,
                    sender: "me",
                    senderId: res.data.senderId || session.user.id,
                    senderName: res.data.sender?.name || session?.user?.name || "Me",
                    content: res.data.content,
                    time: new Date(res.data.createdAt),
                    type: res.data.type === "IMAGE" ? "image" : "text",
                    image: res.data.image,
                    isDeleted: res.data.isDeleted,
                    isEdited: res.data.isEdited,
                    isRead: false,
                    readStatuses: [],
                    reactions: [],
                    metadata: res.data.metadata,
                    attachments: res.data.attachments || [],
                    replyTo: res.data.replyTo,
                    isPinned: res.data.isPinned
                };
                return [...filtered, mapped];
            });
        } else {
            console.error("Failed to send message", res.error);
            // Mark as error in UI (TODO)
            setMessages(prev => prev.filter(m => m.id !== optimisticId)); // Remove for now
        }
    };

    // Helper to get display info
    const getDisplayInfo = () => {
        if (!conversation || !session?.user) return { name: "Chargement...", avatar: null, isGroup: false, status: "", isOnline: false };

        if (conversation.isGroup) {
            const isChannel = conversation.type?.startsWith("CHANNEL");
            return {
                id: conversation.id,
                name: conversation.name || "Groupe sans nom",
                avatar: conversation.image,
                isGroup: true,
                type: conversation.type,
                status: isChannel ? (conversation.description || "Pas de description") : `${conversation.participants.length} membres`,
                isOnline: false
            };
        }

        const other = conversation.participants.find((p: any) => p.user.id !== session?.user?.id)?.user;
        const isOnline = other ? onlineUsers.has(other.id) : false;

        let statusText = "";
        if (isOnline) statusText = "En ligne";
        else if (other?.lastActive) {
            statusText = `Vu à ${format(new Date(other.lastActive), "HH:mm")} `;
        } else {
            statusText = "Hors ligne";
        }

        return {
            id: other?.id,
            name: other?.name || "Utilisateur",
            avatar: other?.avatar,
            isGroup: false,
            type: "DM",
            status: statusText,
            isOnline
        };
    };

    const display = getDisplayInfo();
    const isChannel = display.type?.startsWith("CHANNEL");

    // Aliases and Helpers for Render Compatibility
    const isLoading = loading;
    const conversationName = display.name;
    const conversationType = display.type;
    const currentUserId = session?.user?.id;
    const otherParticipant = conversation?.participants?.find((p: any) => p.userId !== session?.user?.id)?.user;

    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearchLoading(true);
        const res = await searchMessages(conversationId, query);
        if (res.success && res.data) {
            setSearchResults(res.data);
        }
        setIsSearchLoading(false);
    }, [conversationId]);

    const handleJumpToMessage = async (msg: any) => {
        const highlightMessage = (id: string) => {
            const element = document.getElementById(`message-${id}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.remove('flash-message');
                void element.offsetWidth; // Force reflow
                element.classList.add('flash-message');
                setTimeout(() => {
                    element.classList.remove('flash-message');
                }, 3000);
            }
        };

        const element = document.getElementById(`message-${msg.id}`);
        if (element) {
            highlightMessage(msg.id);
            return;
        }

        setIsSearchLoading(true);
        const res = await fetchMessageContext(conversationId, msg.id);
        setIsSearchLoading(false);

        if (res.success && res.data) {
            setMessages(res.data);
            setIsContextView(true);
            setTimeout(() => {
                highlightMessage(msg.id);
            }, 300);
        }
    };

    const exitContextView = async () => {
        setLoading(true);
        setIsContextView(false);
        const res = await getMessages(conversationId);
        if (res.success) setMessages(res.data);
        setLoading(false);
        setTimeout(() => messagesEndRef.current?.scrollIntoView(), 100);
    };

    const scrollToMessage = (id: string) => {
        document.getElementById(`message-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const handlePinMessage = async (msg: any) => {
        if (!session?.user?.id) return;
        if (msg.isPinned) {
            await unpinMessage(msg.id, session.user.id);
            setPinnedMessages(prev => prev.filter(p => p.id !== msg.id));
        } else {
            await pinMessage(msg.id, session.user.id);
            setPinnedMessages(prev => [{ ...msg }, ...prev]);
        }
    };

    const handleThreadOpen = (msg: any) => {
        setThreadMessage({
            id: msg.id,
            content: msg.content,
            senderId: msg.senderId,
            senderName: msg.senderName,
            senderAvatar: msg.senderAvatar,
            createdAt: msg.time,
            conversationId: conversationId,
            repliesCount: msg.replies?.length || 0
        });
    };

    const formatDateSeparator = (date: Date | string) => {
        return format(new Date(date), "d MMMM yyyy", { locale: fr });
    };

    const groupMessages = (msgs: any[]) => {
        const groups: { date: Date, messages: any[] }[] = [];
        if (!msgs) return [];
        msgs.forEach((msg) => {
            const dateVal = msg.time || msg.createdAt;
            if (!dateVal) return;

            const date = new Date(dateVal);
            if (isNaN(date.getTime())) return;

            date.setHours(0, 0, 0, 0);

            let group = groups.find(g => {
                const gDate = new Date(g.date);
                gDate.setHours(0, 0, 0, 0);
                return gDate.getTime() === date.getTime();
            });

            if (!group) {
                group = { date: date, messages: [] };
                groups.push(group);
            }
            group.messages.push(msg);
        });
        return groups;
    };

    return (
        <div className="flex h-full w-full overflow-hidden bg-white dark:bg-zinc-900">
            <div className="flex flex-col flex-1 h-full w-full relative min-w-0">
                <AdvancedChatSearch
                    isOpen={isSearching}
                    onClose={() => {
                        setIsSearching(false);
                        setSearchResults([]);
                    }}
                    onSearch={handleSearch}
                    initialQuery={searchQuery}
                />
                {/* Header */}
                <div className="h-16 px-4 flex items-center justify-between bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800/50 sticky top-0 z-30 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Link href="/messages" className="md:hidden p-2 -ml-2 mr-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <Avatar className="h-10 w-10 border border-zinc-200 dark:border-zinc-700 ring-2 ring-transparent hover:ring-orange-100 dark:hover:ring-orange-900/20 transition-all cursor-pointer">
                            <AvatarImage src={display.avatar} />
                            <AvatarFallback className={cn("text-orange-600 dark:text-orange-400", (display.isGroup || isChannel) ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "bg-orange-50 dark:bg-orange-900/20")}>
                                {isChannel ? (display.type === "CHANNEL_PRIVATE" ? <Lock size={18} /> : <Hash size={18} />) :
                                    display.isGroup ? <Users size={18} /> :
                                        display.name?.[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col cursor-pointer">
                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-none hover:underline">{display.name}</span>
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1 line-clamp-1 max-w-[200px]">
                                {display.isOnline && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />}
                                <span className={display.isOnline ? "text-green-600 dark:text-green-400 font-semibold" : ""}>{display.status}</span>
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 text-zinc-400">
                        {(display.isGroup || isChannel) && (
                            <GroupSettings
                                conversation={conversation}
                                currentUserId={session?.user?.id || ""}
                                currentUserRole={conversation.participants.find((p: any) => p.userId === session?.user?.id)?.role || "MEMBER"}
                                onUpdate={async (data) => {
                                    await updateGroupInfo(conversationId, data);
                                    setConversation((prev: any) => ({ ...prev, ...data }));
                                }}
                                onLeave={async () => {
                                    if (!session?.user?.id) return;
                                    await removeParticipant(conversationId, session.user.id);
                                    router.push('/messages');
                                }}
                                onPromote={async (userId) => {
                                    if (!session?.user?.id) return;
                                    await updateParticipantRole(conversationId, userId, "ADMIN");
                                    // Refresh
                                    const res = await getConversationById(conversationId, session.user.id);
                                    if (res.success) setConversation(res.data);
                                }}
                                onKick={async (userId) => {
                                    if (!session?.user?.id) return;
                                    await removeParticipant(conversationId, userId);
                                    // Refresh
                                    const res = await getConversationById(conversationId, session.user.id);
                                    if (res.success) setConversation(res.data);
                                }}
                            />
                        )}

                        <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors" onClick={() => {
                            if (display.isGroup) {
                                callUser({ id: conversationId, name: display.name, avatar: display.avatar, isGroup: true, participants: conversation.participants }, false);
                            } else if (display.id) {
                                callUser({ id: display.id, name: display.name, avatar: display.avatar }, false);
                            }
                        }}><Phone size={18} /></Button>

                        <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors" onClick={() => {
                            if (display.isGroup) {
                                callUser({ id: conversationId, name: display.name, avatar: display.avatar, isGroup: true, participants: conversation.participants }, true);
                            } else if (display.id) {
                                callUser({ id: display.id, name: display.name, avatar: display.avatar }, true);
                            }
                        }}><Video size={18} /></Button>

                        <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors" onClick={() => setIsSearching(true)}>
                            <Search size={18} />
                        </Button>

                        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1" />

                        <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors" onClick={() => setShowMediaSheet(true)}>
                            <MoreVertical size={18} />
                        </Button>
                    </div>
                </div>

                {/* Pinned Messages Banner */}
                {
                    pinnedMessages.length > 0 && !isContextView && (
                        <div className="bg-orange-50/90 dark:bg-zinc-900/90 backdrop-blur-sm px-4 py-2 text-xs flex items-center justify-between border-b border-orange-100 dark:border-zinc-800 sticky top-[64px] md:top-0 z-20">
                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
                                document.getElementById(`message-${pinnedMessages[0].id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}>
                                <Pin size={12} className="text-orange-500 fill-orange-500" />
                                <span className="font-medium text-zinc-900 dark:text-zinc-200">Message épinglé:</span>
                                <span className="text-zinc-600 dark:text-zinc-400 truncate max-w-[200px]">{pinnedMessages[0].content}</span>
                            </div>
                        </div>
                    )
                }


                {/* Messages Area - SCROLLABLE */}
                {/* Added pb-24 to create space for the absolute input at bottom */}
                <div
                    className="flex-1 overflow-y-auto p-4 pb-32 space-y-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 scrollbar-track-transparent custom-scrollbar"
                    onScroll={handleScroll}
                >
                    {isLoading ? (
                        <div className="flex flex-col space-y-4 pt-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className={cn("flex w-full gap-3", i % 2 === 0 ? "justify-end" : "justify-start")}>
                                    {i % 2 !== 0 && <Skeleton className="w-8 h-8 rounded-full flex-shrink-0 bg-zinc-200 dark:bg-zinc-800" />}
                                    <div className={cn("flex flex-col gap-1 max-w-[65%]", i % 2 === 0 ? "items-end" : "items-start")}>
                                        <Skeleton className={cn("h-10 rounded-2xl w-full", i % 2 === 0 ? "rounded-tr-none bg-orange-100/50 dark:bg-orange-500/10" : "rounded-tl-none bg-zinc-100 dark:bg-zinc-800")} style={{ width: [180, 240, 160, 220, 200][i % 5] }} />
                                        <Skeleton className="h-3 w-12 bg-zinc-100 dark:bg-zinc-800/50" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {/* Conversation Start Banner */}
                            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 opacity-50 select-none">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-50 to-pink-50 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center">
                                    <Avatar className="w-20 h-20 shadow-none">
                                        <AvatarImage src={otherParticipant?.avatar} />
                                        <AvatarFallback className="bg-transparent text-4xl">
                                            {conversationName?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div>
                                    <h3 className="text-zinc-900 dark:text-white font-bold text-lg">
                                        {conversationName}
                                    </h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                                        C'est le début de votre conversation. Soyez sympa et respectueux !
                                    </p>
                                </div>
                                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                    {format(new Date(conversation.createdAt || new Date()), "d MMMM yyyy", { locale: fr })}
                                </span>
                            </div>

                            {/* Messages List */}
                            {groupMessages(messages).map((group, groupIndex) => (
                                <div key={groupIndex} className="space-y-1">
                                    {/* Date Separator */}
                                    <div className="sticky top-2 z-10 flex justify-center my-4 pointer-events-none">
                                        <span className="bg-zinc-100/80 dark:bg-zinc-800/80 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-bold text-zinc-500 dark:text-zinc-400 shadow-sm border border-white/20 dark:border-zinc-700/50">
                                            {formatDateSeparator(group.date)}
                                        </span>
                                    </div>

                                    {group.messages.map((msg: any, i: number) => {
                                        const isMe = msg.senderId === currentUserId;
                                        // Check if next message is same sender (for sequence grouping styling)
                                        const isSequence = i < group.messages.length - 1 && group.messages[i + 1].senderId === msg.senderId;

                                        return (
                                            <div key={msg.id} id={`message-${msg.id}`} className="scroll-mt-32 rounded-lg transition-all duration-300">
                                                <MessageItem
                                                    message={msg}
                                                    isMe={isMe}
                                                    isSequence={isSequence}
                                                    onReply={setReplyingTo}
                                                    onPin={handlePinMessage}
                                                    onQuoteClick={scrollToMessage}
                                                    onThread={handleThreadOpen}
                                                    searchQuery={searchQuery}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}




                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input Area - FLOAT ABSOLUTELY */}
                <div className="absolute bottom-0 left-0 right-0 z-50 pt-2 px-4 pb-4 pointer-events-none">
                    {/* Re-enable pointer events for interactive children */}
                    <div className="pointer-events-auto relative">
                        {/* Scroll / Context Button */}
                        <AnimatePresence>
                            {(showScrollButton || isContextView) && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                    onClick={isContextView ? exitContextView : scrollToBottom}
                                    className="absolute bottom-full right-0 mb-4 bg-zinc-900/90 dark:bg-zinc-800/90 text-white backdrop-blur-md p-1.5 pr-3 pl-2 rounded-full shadow-lg border border-zinc-700/50 hover:bg-zinc-800 transition-colors z-50 flex items-center gap-2 group cursor-pointer"
                                >
                                    <div className="bg-zinc-800 dark:bg-zinc-700 rounded-full p-1 group-hover:bg-zinc-700 transition-colors">
                                        <ArrowLeft size={12} className="-rotate-90 text-zinc-200" />
                                    </div>
                                    <span className="text-[11px] font-semibold">
                                        {isContextView ? "Retour au présent" : "Récent"}
                                    </span>
                                </motion.button>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {replyingTo && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-t border-zinc-100 dark:border-zinc-800 border-l-4 border-l-orange-500 shadow-sm relative z-50 mx-4 mb-2 rounded-r-lg"
                                >
                                    <div className="flex flex-col overflow-hidden mr-4">
                                        <span className="text-orange-600 font-bold text-xs flex items-center gap-1">
                                            <Reply size={12} />
                                            Répondre à {replyingTo.senderName}
                                        </span>
                                        <span className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-1 truncate mt-0.5">{replyingTo.content || (replyingTo.attachments?.length ? "📎 Pièce jointe" : "Message")}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400" onClick={() => setReplyingTo(null)}>
                                        <X size={14} />
                                    </Button>
                                </motion.div>
                            )}



                            {/* Restored closing tag */}
                        </AnimatePresence>

                        <ChatInput
                            key={conversationId}
                            conversationId={conversationId}
                            onSendMessage={handleSendMessage}
                            triggerTyping={triggerTyping}
                            replyingTo={replyingTo}
                            setReplyingTo={setReplyingTo}
                            typingUsers={typingUsers}
                        />
                    </div>
                </div>
                {/* Close Wrapper */}
            </div>

            <SearchResultsSidebar
                isOpen={isSearching}
                onClose={() => setIsSearching(false)}
                results={searchResults}
                onJumpTo={handleJumpToMessage}
                isLoading={isSearchLoading}
            />

            {/* Shared Media Sheet */}
            <SharedMediaSheet
                open={showMediaSheet}
                onOpenChange={setShowMediaSheet}
                conversationId={conversationId}
            />

            {/* Thread View Panel */}
            <ThreadView
                isOpen={!!threadMessage}
                onClose={() => setThreadMessage(null)}
                parentMessage={threadMessage || { id: "", content: "", senderId: "", createdAt: "", conversationId: "" }}
                conversationId={conversationId}
            />
        </div >
    );
}

