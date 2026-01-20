"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { pusherClient } from "@/lib/pusher";
import { toast } from "sonner";

// Types
export interface ChatUser {
    id: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
}

export interface ChatWindow {
    id: string; // conversationId
    user: ChatUser;
    isMinimized: boolean;
    hasUnread: boolean;
    lastMessage?: string;
}

interface FloatingChatContextType {
    openChats: ChatWindow[];
    openChat: (conversationId: string, user: ChatUser) => void;
    closeChat: (conversationId: string) => void;
    minimizeChat: (conversationId: string) => void;
    maximizeChat: (conversationId: string) => void;
    markAsRead: (conversationId: string) => void;
    isEnabled: boolean;
}

const FloatingChatContext = createContext<FloatingChatContextType | null>(null);

export function useFloatingChat() {
    const context = useContext(FloatingChatContext);
    if (!context) {
        throw new Error("useFloatingChat must be used within FloatingChatProvider");
    }
    return context;
}

interface FloatingChatProviderProps {
    children: ReactNode;
    userId?: string;
    enabled?: boolean;
}

export function FloatingChatProvider({ children, userId, enabled = true }: FloatingChatProviderProps) {
    const [openChats, setOpenChats] = useState<ChatWindow[]>([]);
    const MAX_OPEN_CHATS = 3;

    // Subscribe to new messages via Pusher
    useEffect(() => {
        if (!userId || !enabled) return;

        const channel = pusherClient.subscribe(`user-${userId}`);

        channel.bind("new-message", (data: any) => {
            const { conversationId, sender, content, senderName, senderAvatar } = data;

            // Check if this conversation is already open
            setOpenChats(prev => {
                const existingIndex = prev.findIndex(c => c.id === conversationId);

                if (existingIndex >= 0) {
                    // Update existing chat
                    const updated = [...prev];
                    updated[existingIndex] = {
                        ...updated[existingIndex],
                        hasUnread: updated[existingIndex].isMinimized,
                        lastMessage: content
                    };
                    return updated;
                } else {
                    // Auto-open new chat bubble (minimized) if from someone else
                    if (sender !== userId && prev.length < MAX_OPEN_CHATS) {
                        toast.info(`Nouveau message de ${senderName}`, {
                            description: content?.slice(0, 50) + (content?.length > 50 ? "..." : ""),
                            action: {
                                label: "Voir",
                                onClick: () => {
                                    setOpenChats(current =>
                                        current.map(c =>
                                            c.id === conversationId
                                                ? { ...c, isMinimized: false, hasUnread: false }
                                                : c
                                        )
                                    );
                                }
                            }
                        });

                        return [...prev, {
                            id: conversationId,
                            user: {
                                id: sender,
                                name: senderName || "Utilisateur",
                                avatar: senderAvatar
                            },
                            isMinimized: true,
                            hasUnread: true,
                            lastMessage: content
                        }];
                    }
                    return prev;
                }
            });
        });

        return () => {
            pusherClient.unsubscribe(`user-${userId}`);
        };
    }, [userId, enabled]);

    const openChat = useCallback((conversationId: string, user: ChatUser) => {
        setOpenChats(prev => {
            // Already open?
            const existingIndex = prev.findIndex(c => c.id === conversationId);
            if (existingIndex >= 0) {
                // Just maximize it
                const updated = [...prev];
                updated[existingIndex] = { ...updated[existingIndex], isMinimized: false, hasUnread: false };
                return updated;
            }

            // Max chats reached? Remove oldest minimized one
            if (prev.length >= MAX_OPEN_CHATS) {
                const minimizedIndex = prev.findIndex(c => c.isMinimized);
                if (minimizedIndex >= 0) {
                    prev = prev.filter((_, i) => i !== minimizedIndex);
                } else {
                    // Remove oldest
                    prev = prev.slice(1);
                }
            }

            return [...prev, {
                id: conversationId,
                user,
                isMinimized: false,
                hasUnread: false
            }];
        });
    }, []);

    const closeChat = useCallback((conversationId: string) => {
        setOpenChats(prev => prev.filter(c => c.id !== conversationId));
    }, []);

    const minimizeChat = useCallback((conversationId: string) => {
        setOpenChats(prev =>
            prev.map(c => c.id === conversationId ? { ...c, isMinimized: true } : c)
        );
    }, []);

    const maximizeChat = useCallback((conversationId: string) => {
        setOpenChats(prev =>
            prev.map(c => c.id === conversationId ? { ...c, isMinimized: false, hasUnread: false } : c)
        );
    }, []);

    const markAsRead = useCallback((conversationId: string) => {
        setOpenChats(prev =>
            prev.map(c => c.id === conversationId ? { ...c, hasUnread: false } : c)
        );
    }, []);

    return (
        <FloatingChatContext.Provider value={{
            openChats,
            openChat,
            closeChat,
            minimizeChat,
            maximizeChat,
            markAsRead,
            isEnabled: enabled
        }}>
            {children}
        </FloatingChatContext.Provider>
    );
}

