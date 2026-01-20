"use client";

import { useState, useRef, useEffect } from "react";
import { useCall } from "@/components/calls/CallProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Video, Info, Image as ImageIcon, Mic, Send, Smile, Paperclip, ArrowLeft, Users, Hash, Lock, X, Pin, Reply } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { getMessages, sendMessage, getConversationById, markMessagesAsRead, updateGroupInfo, updateParticipantRole, removeParticipant, getPinnedMessages, pinMessage, unpinMessage } from "@/lib/services/messaging.service";
import { uploadFiles } from "@/lib/upload";
import imageCompression from "browser-image-compression";
import { pusherClient } from "@/lib/pusher";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GroupSettings } from "./GroupSettings";
import { usePresence } from "@/components/providers/PresenceProvider";
import { MessageItem } from "@/components/messages/MessageItem";
import { ChatInput } from "@/components/messages/ChatInput";
import { SharedMediaSheet } from "../conversation/SharedMediaSheet";
import { ThreadView } from "./ThreadView";

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
    const [pinnedMessages, setPinnedMessages] = useState<any[]>([]);
    const [showMediaSheet, setShowMediaSheet] = useState(false);
    const [threadMessage, setThreadMessage] = useState<any>(null);

    // Initial Load
    useEffect(() => {
        async function load() {
            if (!session?.user?.id) return;

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
                // Mark as read immediately
                markMessagesAsRead(conversationId, session.user.id);
            }

            if (convRes.success && convRes.data) {
                setConversation(convRes.data);
            }

            if (pinnedRes.success && pinnedRes.data) {
                setPinnedMessages(pinnedRes.data);
            }

            setLoading(false);
        }
        load();
    }, [conversationId, session?.user?.id]);

    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const processingTyping = useRef(false);

    // Real-time Subscription (Pusher)
    useEffect(() => {
        const channelName = `private-conversation-${conversationId}`;
        const channel = pusherClient.subscribe(channelName);

        channel.bind("message:new", (data: any) => {
            setMessages((prev) => {
                if (prev.find(m => m.id === data.id)) return prev;
                // Remove sender from typing users if message received
                if (data.senderName) {
                    setTypingUsers(prev => prev.filter(u => u !== data.senderName));
                }

                const isMe = data.senderId === session?.user?.id;

                // If I received a message, mark as read
                if (!isMe && session?.user?.id) {
                    markMessagesAsRead(conversationId, session.user.id);
                }

                const newMessage = {
                    id: data.id,
                    sender: isMe ? "me" : "other",
                    senderName: data.sender?.name,
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

        channel.bind("client-typing", (data: { user: string }) => {
            if (!data.user) return;
            setTypingUsers(prev => {
                if (!prev.includes(data.user)) return [...prev, data.user];
                return prev;
            });

            // Clear after 3 seconds
            setTimeout(() => {
                setTypingUsers(prev => prev.filter(u => u !== data.user));
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
        };
    }, [conversationId, session?.user?.id]);

    const triggerTyping = () => {
        if (processingTyping.current) return;
        processingTyping.current = true;

        const channel = pusherClient.subscribe(`private-conversation-${conversationId}`);
        if (session?.user?.name) {
            channel.trigger("client-typing", { user: session.user.name });
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

    return (
        <div className="flex flex-col h-full w-full relative bg-white">
            {/* Header */}
            <div className="h-16 px-4 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-zinc-100 sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-3">
                    <Link href="/messages" className="md:hidden p-2 -ml-2 mr-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <Avatar className="h-10 w-10 border border-zinc-200 ring-2 ring-transparent hover:ring-orange-100 transition-all cursor-pointer">
                        <AvatarImage src={display.avatar} />
                        <AvatarFallback className={cn("text-orange-600", (display.isGroup || isChannel) ? "bg-blue-50 text-blue-600" : "bg-orange-50")}>
                            {isChannel ? (display.type === "CHANNEL_PRIVATE" ? <Lock size={18} /> : <Hash size={18} />) :
                                display.isGroup ? <Users size={18} /> :
                                    display.name?.[0]?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col cursor-pointer">
                        <span className="text-sm font-bold text-zinc-900 leading-none hover:underline">{display.name}</span>
                        <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1 line-clamp-1 max-w-[200px]">
                            {display.isOnline && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />}
                            <span className={display.isOnline ? "text-green-600 font-semibold" : ""}>{display.status}</span>
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

                    <Button variant="ghost" size="icon" className="hover:text-orange-600 hover:bg-orange-50 rounded-full" onClick={() => display.id && callUser({ id: display.id, name: display.name, avatar: display.avatar }, false)}><Phone size={20} /></Button>
                    <Button variant="ghost" size="icon" className="hover:text-orange-600 hover:bg-orange-50 rounded-full" onClick={() => display.id && callUser({ id: display.id, name: display.name, avatar: display.avatar }, true)}><Video size={20} /></Button>
                    <Button variant="ghost" size="icon" className="hover:text-orange-600 hover:bg-orange-50 rounded-full" onClick={() => setShowMediaSheet(true)}><Info size={20} /></Button>
                </div>
            </div>

            {/* Pinned Messages Banner */}
            {
                pinnedMessages.length > 0 && (
                    <div className="bg-orange-50/90 backdrop-blur-sm px-4 py-2 text-xs flex items-center justify-between border-b border-orange-100 sticky top-[64px] z-20">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
                            // Optionally scroll to message
                            document.getElementById(`message - ${pinnedMessages[0].id} `)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}>
                            <Pin size={12} className="text-orange-500 fill-orange-500" />
                            <span className="font-semibold text-orange-900">Épinglé:</span>
                            <span className="text-orange-700 truncate max-w-[200px] md:max-w-[400px]">{pinnedMessages[0].content}</span>
                        </div>
                        {/* Only Admin/Mod can unpin, but simplistic UI for now */}
                    </div>
                )
            }

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 relative bg-white" ref={scrollRef}>
                {!loading && messages.length === 0 && (
                    <div className="flex h-full items-center justify-center text-zinc-400 text-sm">
                        Dites bonjour ! 👋
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {messages.map((msg, index) => {
                        const isMe = msg.sender === "me";
                        const isSequence = index > 0 && messages[index - 1].sender === msg.sender;

                        return (
                            <motion.div
                                key={msg.id}
                                id={`message-${msg.id}`}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                className="transition-colors duration-500 rounded-xl"
                            >
                                <MessageItem
                                    message={msg}
                                    isMe={isMe}
                                    isSequence={isSequence}
                                    onReply={(msg: any) => setReplyingTo(msg)}
                                    onQuoteClick={(id: string) => {
                                        const el = document.getElementById(`message-${id}`);
                                        if (el) {
                                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            // Highlight effect
                                            el.classList.add('bg-orange-50/50');
                                            setTimeout(() => el.classList.remove('bg-orange-50/50'), 1000);
                                        } else {
                                            // TODO: Fetch older message if not loaded?
                                            // For now just ignore or show toast
                                        }
                                    }}
                                    onPin={async (msg: any) => {
                                        if (!session?.user?.id) return;
                                        if (msg.isPinned) {
                                            await unpinMessage(msg.id, session.user.id);
                                        } else {
                                            await pinMessage(msg.id, session.user.id);
                                        }
                                    }}
                                    onThread={(msg: any) => {
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
                                    }}
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="relative z-40">
                {typingUsers.length > 0 && (
                    <div className="absolute -top-6 left-4 text-xs text-orange-500 font-medium flex items-center gap-1 h-4 animate-pulse">
                        <span className="w-1 h-1 bg-orange-500 rounded-full" />
                        {typingUsers.join(", ")} {typingUsers.length > 1 ? "écrivent..." : "écrit..."}
                    </div>
                )}

                {replyingTo && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md border-t border-zinc-100 border-l-4 border-l-orange-500 shadow-sm relative z-50 mx-4 mb-2 rounded-r-lg"
                    >
                        <div className="flex flex-col overflow-hidden mr-4">
                            <span className="text-orange-600 font-bold text-xs flex items-center gap-1">
                                <Reply size={12} />
                                Répondre à {replyingTo.senderName}
                            </span>
                            <span className="text-zinc-600 text-sm line-clamp-1 truncate mt-0.5">{replyingTo.content || (replyingTo.attachments?.length ? "📎 Pièce jointe" : "Message")}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0 hover:bg-zinc-100 rounded-full text-zinc-400" onClick={() => setReplyingTo(null)}>
                            <X size={14} />
                        </Button>
                    </motion.div>
                )}

                <ChatInput
                    onSendMessage={handleSendMessage}
                    triggerTyping={triggerTyping}
                    replyingTo={replyingTo}
                    setReplyingTo={setReplyingTo}
                />
            </div>
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

