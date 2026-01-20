"use server";

import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

// --- CONVERSATIONS ---

export async function createConversation(userIds: string[], isGroup: boolean = false, name?: string) {
    try {
        // For 1:1, check if exists
        if (!isGroup && userIds.length === 2) {
            const existing = await prisma.conversation.findFirst({
                where: {
                    isGroup: false,
                    AND: [
                        { participants: { some: { userId: userIds[0] } } },
                        { participants: { some: { userId: userIds[1] } } }
                    ]
                },
                include: { participants: true }
            });

            // Strict check to ensure only these 2 are in it (though isGroup=false usually implies it)
            if (existing) {
                return { success: true, data: existing };
            }
        }

        const conversation = await prisma.conversation.create({
            data: {
                isGroup,
                name,
                participants: {
                    create: userIds.map(id => ({ userId: id }))
                }
            },
            include: { participants: true }
        });

        return { success: true, data: conversation };
    } catch (error) {
        console.error("Create conversation error:", error);
        return { success: false, error: "Failed to create conversation" };
    }
}

export async function createChannel(ownerId: string, name: string, description: string, isPublic: boolean) {
    try {
        // Generate Slug
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 7);

        const conversation = await prisma.conversation.create({
            data: {
                name,
                description,
                type: isPublic ? "CHANNEL_PUBLIC" : "CHANNEL_PRIVATE",
                isGroup: true, // Channels are technically groups
                ownerId,
                slug,
                participants: {
                    create: {
                        userId: ownerId,
                        role: "ADMIN"
                    }
                }
            }
        });

        return { success: true, data: conversation };
    } catch (error) {
        console.error("Create channel error:", error);
        return { success: false, error: "Failed to create channel" };
    }
}

export async function getConversations(userId: string) {
    try {
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: { some: { userId } }
            },
            orderBy: { lastMessageAt: 'desc' },
            include: {
                participants: {
                    include: { user: { select: { id: true, name: true, avatar: true, image: true } } }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        // Format for UI with unread counts
        const formatted = await Promise.all(conversations.map(async c => {
            const myPart = c.participants.find(p => p.userId === userId);
            // Default to joinedAt or epoch if null. Logic: if new member, maybe 0 unread unless history shared.
            // Assuming history shared or standard logic:
            const lastRead = myPart?.lastReadAt || myPart?.joinedAt || new Date(0);

            const unreadCount = await prisma.message.count({
                where: {
                    conversationId: c.id,
                    createdAt: { gt: lastRead },
                    senderId: { not: userId }
                }
            });

            const otherParticipants = c.participants.filter(p => p.userId !== userId);
            const lastMsg = c.messages[0];

            let name = c.name;
            let avatar = c.image;

            if (!c.isGroup) {
                name = otherParticipants[0]?.user.name || "Utilisateur supprimé";
                avatar = otherParticipants[0]?.user.avatar || otherParticipants[0]?.user.image || "/avatars/default.svg";
            }

            return {
                id: c.id,
                name,
                avatar,
                type: c.type,
                isGroup: c.isGroup,
                lastMessage: lastMsg?.content || (lastMsg?.image ? "📷 Image" : "Aucun message"),
                lastMessageAt: c.lastMessageAt,
                unreadCount,
                unread: unreadCount > 0, // Computed boolean for UI
                participants: c.participants
            };
        }));

        return { success: true, data: formatted };
    } catch (error) {
        console.error("Get conversations error:", error);
        return { success: false, error: "Failed to fetch conversations" };
    }
}

export async function getConversationById(conversationId: string, userId: string) {
    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                participants: {
                    include: { user: { select: { id: true, name: true, avatar: true, image: true, lastActive: true } } }
                }
            }
        });

        if (!conversation) return { success: false, error: "Not found" };

        // Verify membership
        const isMember = conversation.participants.some(p => p.userId === userId);
        if (!isMember) return { success: false, error: "Unauthorized" };

        return { success: true, data: conversation };
    } catch (error) {
        return { success: false, error: "Error fetching conversation" };
    }
}

// --- MESSAGES ---

export async function getMessages(conversationId: string, limit: number = 50) {
    try {
        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            take: limit,
            include: {
                sender: { select: { id: true, name: true, avatar: true, image: true } },
                replyTo: {
                    select: {
                        id: true,
                        content: true,
                        image: true,
                        sender: { select: { name: true } }
                    }
                },
                replies: {
                    select: {
                        id: true,
                        content: true,
                        senderId: true,
                        createdAt: true,
                        sender: { select: { name: true, avatar: true } }
                    },
                    orderBy: { createdAt: 'asc' },
                    take: 10
                },
                readStatuses: {
                    select: {
                        userId: true,
                        readAt: true,
                        user: { select: { id: true, name: true, avatar: true } }
                    }
                },
                reactions: {
                    include: {
                        user: { select: { id: true, name: true, avatar: true } }
                    }
                },
                attachments: true
            }

        });

        return { success: true, data: messages.map(msg => ({ ...msg, isPinned: msg.isPinned || false })) };
    } catch (error) {
        return { success: false, error: "Failed to fetch messages" };
    }
}

export async function getPinnedMessages(conversationId: string) {
    try {
        const messages = await prisma.message.findMany({
            where: { conversationId, isPinned: true, isDeleted: false },
            include: { sender: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: messages };
    } catch (error) {
        return { success: false, error: "Failed to fetch pinned messages" };
    }
}

import { SendMessageSchema, EditMessageSchema } from "@/lib/validations/messaging";
import { ratelimit } from "@/lib/redis";

import { fetchMetadata } from "@/lib/metadata";
import { canSendMessage, recordMessageSent } from "@/lib/subscription/feature-gates";

// ... existing imports ...

export async function sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: string = "TEXT",
    fileUrl?: string,
    replyToId?: string,
    attachments?: { url: string; type: string; name?: string; size?: number; mimeType?: string }[],
    metadata?: any
) {
    try {
        // 0. Check subscription message limit
        const messageCheck = await canSendMessage(senderId);
        if (!messageCheck.allowed) {
            return {
                success: false,
                error: messageCheck.message || "Limite de messages quotidiens atteinte",
                code: "MESSAGE_LIMIT_REACHED",
                requiredPlan: messageCheck.requiredPlan
            };
        }

        // 1. Validation (Zod)
        const validation = SendMessageSchema.safeParse({
            conversationId,
            content,
            type,
            fileUrl,
            replyToId,
            attachments
        });

        if (!validation.success) {
            return { success: false, error: "Validation failed", details: validation.error.flatten() };
        }

        // 2. Fetch Metadata if content has link and type is TEXT using a simplified check
        let finalMetadata = metadata || null;
        if (!finalMetadata && type === "TEXT" && content) {
            const urlMatch = content.match(/(https?:\/\/[^\s]+)/);
            if (urlMatch) {
                finalMetadata = await fetchMetadata(urlMatch[0]);
            }
        }

        // 3. Rate Limiting (Redis)
        const { success: allowed } = await ratelimit.limit(`send_message:${senderId}`);
        if (!allowed) {
            return { success: false, error: "Rate limit exceeded. Please wait." };
        }

        const message = await prisma.message.create({
            data: {
                conversationId,
                senderId,
                content: validation.data.content,
                type: validation.data.type,
                image: validation.data.type === "IMAGE" ? fileUrl : undefined,
                file: validation.data.type === "FILE" ? fileUrl : undefined,
                replyToId: validation.data.replyToId,
                metadata: finalMetadata ? JSON.stringify(finalMetadata) : undefined, // Store as JSON string or object if Prisma supports Json
                attachments: validation.data.attachments ? {
                    create: validation.data.attachments.map(a => ({
                        url: a.url,
                        type: a.type,
                        name: a.name,
                        size: a.size,
                        mimeType: a.mimeType
                    }))
                } : undefined
            },
            include: {
                sender: { select: { id: true, name: true, avatar: true, image: true } },
                replyTo: {
                    select: {
                        id: true,
                        content: true,
                        image: true,
                        sender: { select: { name: true } }
                    }
                },
                attachments: true
            }
        });

        // Update conversation lastMessageAt
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() }
        });

        // Trigger Pusher Event
        await pusherServer.trigger(`private-conversation-${conversationId}`, "message:new", message);

        // Track message usage for subscription limits
        await recordMessageSent(senderId);

        return { success: true, data: message };
    } catch (error) {
        console.error("Send message error:", error);
        return { success: false, error: "Failed to send message" };
    }
}

// --- MESSAGE ACTIONS ---

export async function editMessage(messageId: string, userId: string, newContent: string) {
    try {
        // 1. Validation
        const validation = EditMessageSchema.safeParse({ messageId, userId, content: newContent });
        if (!validation.success) return { success: false, error: "Validation failed" };

        const message = await prisma.message.findUnique({
            where: { id: messageId },
            include: { sender: true }
        });

        if (!message) return { success: false, error: "Message not found" };

        // 2. Ownership Check
        if (message.senderId !== userId) return { success: false, error: "Unauthorized" };

        // 3. Time Limit Check (15 minutes)
        const timeDiff = Date.now() - new Date(message.createdAt).getTime();
        if (timeDiff > 15 * 60 * 1000) {
            return { success: false, error: "Edit window expired (15 mins)" };
        }

        // 4. Update
        const updatedMessage = await prisma.message.update({
            where: { id: messageId },
            data: {
                content: newContent,
                isEdited: true,
                editedAt: new Date()
            },
            include: {
                sender: { select: { id: true, name: true, avatar: true, image: true } },
                attachments: true,
                reactions: { include: { user: { select: { id: true, name: true, avatar: true } } } }
            }
        });

        // 5. Trigger Pusher
        await pusherServer.trigger(`private-conversation-${message.conversationId}`, "message:update", updatedMessage);

        return { success: true, data: updatedMessage };
    } catch (error) {
        console.error("Edit message error:", error);
        return { success: false, error: "Failed to edit message" };
    }
}

export async function deleteMessage(messageId: string, userId: string) {
    try {
        const message = await prisma.message.findUnique({ where: { id: messageId } });
        if (!message) return { success: false, error: "Message not found" };

        if (message.senderId !== userId) return { success: false, error: "Unauthorized" };

        // Soft Delete: Wipe content, mark deleted
        const deletedMessage = await prisma.message.update({
            where: { id: messageId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                content: null,
                image: null,
                file: null,
                audio: null
            }
        });

        // Emit 'message:update' with isDeleted flag
        await pusherServer.trigger(`private-conversation-${message.conversationId}`, "message:update", deletedMessage);

        return { success: true, data: deletedMessage };
    } catch (error) {
        console.error("Delete message error:", error);
        return { success: false, error: "Failed to delete message" };
    }
}

// --- REACTIONS ---

export async function toggleReaction(messageId: string, userId: string, emoji: string) {
    try {
        const existing = await prisma.messageReaction.findUnique({
            where: {
                messageId_userId_emoji: { messageId, userId, emoji }
            }
        });

        if (existing) {
            await prisma.messageReaction.delete({ where: { id: existing.id } });
        } else {
            await prisma.messageReaction.create({
                data: { messageId, userId, emoji }
            });
        }

        // Fetch updated reactions to broadcast
        const message = await prisma.message.findUnique({
            where: { id: messageId },
            include: {
                reactions: {
                    include: { user: { select: { id: true, name: true, avatar: true } } }
                },
                attachments: true,
                sender: { select: { id: true, name: true, avatar: true, image: true } },
                replyTo: { select: { id: true, content: true, sender: { select: { name: true } } } }
            }
        });

        if (message) {
            await pusherServer.trigger(
                `private-conversation-${message.conversationId}`,
                "message:update",
                message
            );
        }

        return { success: true, data: message };
    } catch (error) {
        console.error("Toggle reaction error:", error);
        return { success: false, error: "Failed to toggle reaction" };
    }
}

// --- READ STATUS ---

export async function markMessagesAsRead(conversationId: string, userId: string) {
    try {
        // 1. Update Participant lastReadAt
        await prisma.conversationParticipant.update({
            where: {
                conversationId_userId: { conversationId, userId }
            },
            data: {
                lastReadAt: new Date()
            }
        });

        // Check Privacy Settings
        const userSettings = await prisma.notificationSettings.findUnique({
            where: { userId }
        });

        if (userSettings && userSettings.readReceiptsEnabled === false) {
            return { success: true, count: 0, privacyFiltered: true };
        }

        // 2. Find unread messages (where sender != userId, and no readStatus by userId)
        // Optimization: Just find IDs to create read statuses.
        const unreadMessages = await prisma.message.findMany({
            where: {
                conversationId,
                senderId: { not: userId },
                readStatuses: {
                    none: { userId }
                }
            },
            select: { id: true }
        });

        if (unreadMessages.length > 0) {
            // 3. Create Read Statuses
            // 3. Create Read Statuses (createMany fallback)
            await Promise.all(unreadMessages.map(m =>
                prisma.messageReadStatus.create({
                    data: {
                        messageId: m.id,
                        userId
                    }
                })
            ));

            // 4. Trigger Pusher Event
            // Notify others that THIS user has read up to now
            await pusherServer.trigger(
                `private-conversation-${conversationId}`,
                "conversation:read",
                {
                    conversationId,
                    userId,
                    readAt: new Date()
                }
            );
        }

        return { success: true };
    } catch (error) {
        console.error("Mark read error:", error);
        return { success: false, error: "Failed to mark as read" };
    }
}

// --- GROUP MANAGEMENT ---

export async function updateGroupInfo(conversationId: string, name: string) {
    try {
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { name }
        });
        return { success: true };
    } catch (error) {
        console.error("Update group error:", error);
        return { success: false, error: "Failed to update group" };
    }
}

export async function updateParticipantRole(conversationId: string, targetUserId: string, role: "ADMIN" | "MEMBER") {
    try {
        await prisma.conversationParticipant.updateMany({
            where: { conversationId, userId: targetUserId },
            data: { role }
        });
        return { success: true };
    } catch (error) {
        console.error("Update role error:", error);
        return { success: false, error: "Failed to update role" };
    }
}

export async function removeParticipant(conversationId: string, targetUserId: string) {
    try {
        await prisma.conversationParticipant.deleteMany({
            where: { conversationId, userId: targetUserId }
        });
        return { success: true };
    } catch (error) {
        console.error("Remove participant error:", error);
        return { success: false, error: "Failed to remove participant" };
    }
}

export async function getConversationMedia(conversationId: string) {
    try {
        const messages = await prisma.message.findMany({
            where: {
                conversationId,
                isDeleted: false,
                OR: [
                    { type: { in: ["IMAGE", "VIDEO", "FILE", "AUDIO"] } },
                    { attachments: { some: {} } }
                ]
            },
            select: {
                id: true,
                type: true,
                content: true,
                image: true,
                file: true,
                createdAt: true,
                sender: { select: { name: true } },
                attachments: true,
                metadata: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: messages };
    } catch (error) {
        console.error("Get media error:", error);
        return { success: false, error: "Failed to fetch media" };
    }
}

// --- PINNING & PERMISSIONS ---

export async function pinMessage(messageId: string, userId: string) {
    try {
        const message = await prisma.message.findUnique({
            where: { id: messageId },
            include: { conversation: { include: { participants: true } } }
        });
        if (!message) return { success: false, error: "Message not found" };

        const participant = message.conversation.participants.find((p: any) => p.userId === userId);
        if (!participant || (participant.role !== "ADMIN" && participant.role !== "MODERATOR")) {
            return { success: false, error: "Unauthorized" };
        }

        const updated = await prisma.message.update({
            where: { id: messageId },
            data: { isPinned: true }
        });

        await pusherServer.trigger(`private-conversation-${message.conversationId}`, "message:update", updated);
        return { success: true, data: updated };
    } catch (error) {
        return { success: false, error: "Failed to pin message" };
    }
}

export async function unpinMessage(messageId: string, userId: string) {
    try {
        const message = await prisma.message.findUnique({
            where: { id: messageId },
            include: { conversation: { include: { participants: true } } }
        });
        if (!message) return { success: false, error: "Message not found" };

        const participant = message.conversation.participants.find((p: any) => p.userId === userId);
        // Allow unpinning? Usually same roles.
        if (!participant || (participant.role !== "ADMIN" && participant.role !== "MODERATOR")) {
            return { success: false, error: "Unauthorized" };
        }

        const updated = await prisma.message.update({
            where: { id: messageId },
            data: { isPinned: false }
        });

        await pusherServer.trigger(`private-conversation-${message.conversationId}`, "message:update", updated);
        return { success: true, data: updated };
    } catch (error) {
        return { success: false, error: "Failed to unpin message" };
    }
}

export async function updateGroupPermissions(conversationId: string, permissions: string) {
    try {
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { permissions }
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update permissions" };
    }
}

// --- USER & PRESENCE ---

export async function updatePresence(userId: string) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { lastActive: new Date() }
        });
    } catch (error) {
        // Ignore "Record to update not found" errors as they are non-critical for presence
        // and often occur with stale sessions or cached IDs.
        if ((error as any).code === "P2025") return;
        console.error("Failed to update presence:", error);
    }
}
// --- USERS ---

export async function searchUsers(query: string = "") {
    try {
        const users = await prisma.user.findMany({
            where: {
                name: {
                    contains: query
                }
            },
            take: 20,
            select: { id: true, name: true, image: true, avatar: true }
        });
        return { success: true, data: users };
    } catch (error) {
        console.error("Search users error:", error);
        return { success: false, error: "Failed to search users" };
    }
}
