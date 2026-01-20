import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canSendInMail } from "@/lib/subscription/feature-gates";
import { pusherServer } from "@/lib/pusher";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            );
        }

        const { recipientId, message } = await request.json();

        if (!recipientId || !message?.trim()) {
            return NextResponse.json(
                { error: "Destinataire et message requis" },
                { status: 400 }
            );
        }

        // Check if user can send InMail
        const inMailCheck = await canSendInMail(session.user.id);
        if (!inMailCheck.allowed) {
            return NextResponse.json(
                {
                    error: inMailCheck.message || "Limite d'InMails atteinte",
                    code: "INMAIL_LIMIT_REACHED",
                    limit: inMailCheck.limit,
                    used: inMailCheck.used
                },
                { status: 403 }
            );
        }

        // Check recipient exists
        const recipient = await prisma.user.findUnique({
            where: { id: recipientId },
            select: { id: true, name: true }
        });

        if (!recipient) {
            return NextResponse.json(
                { error: "Destinataire introuvable" },
                { status: 404 }
            );
        }

        // Check if not sending to self
        if (recipientId === session.user.id) {
            return NextResponse.json(
                { error: "Vous ne pouvez pas vous envoyer un InMail" },
                { status: 400 }
            );
        }

        // Create or find existing 1:1 conversation
        let conversation = await prisma.conversation.findFirst({
            where: {
                isGroup: false,
                AND: [
                    { participants: { some: { userId: session.user.id } } },
                    { participants: { some: { userId: recipientId } } }
                ]
            }
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    isGroup: false,
                    participants: {
                        create: [
                            { userId: session.user.id },
                            { userId: recipientId }
                        ]
                    }
                }
            });
        }

        // Create the InMail message with special type
        const inMailMessage = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderId: session.user.id,
                content: message.trim(),
                type: "INMAIL", // Special type for InMails
                metadata: JSON.stringify({
                    isInMail: true,
                    sentAt: new Date().toISOString()
                })
            },
            include: {
                sender: {
                    select: { id: true, name: true, avatar: true, image: true }
                }
            }
        });

        // Update conversation lastMessageAt
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: { lastMessageAt: new Date() }
        });

        // Record InMail usage (upsert to increment if exists)
        const now = new Date();
        const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        await prisma.featureUsage.upsert({
            where: {
                userId_feature_period: {
                    userId: session.user.id,
                    feature: "inmails_sent",
                    period: period
                }
            },
            update: {
                count: { increment: 1 }
            },
            create: {
                userId: session.user.id,
                feature: "inmails_sent",
                count: 1,
                period: period
            }
        });

        // Trigger Pusher notification
        await pusherServer.trigger(
            `private-conversation-${conversation.id}`,
            "message:new",
            inMailMessage
        );

        // Also notify recipient of new InMail
        await pusherServer.trigger(
            `private-user-${recipientId}`,
            "inmail:received",
            {
                from: session.user,
                conversationId: conversation.id,
                preview: message.trim().substring(0, 100)
            }
        );

        return NextResponse.json({
            success: true,
            conversationId: conversation.id,
            messageId: inMailMessage.id,
            remaining: inMailCheck.remaining !== undefined ? inMailCheck.remaining - 1 : undefined
        });

    } catch (error) {
        console.error("InMail send error:", error);
        return NextResponse.json(
            { error: "Erreur lors de l'envoi de l'InMail" },
            { status: 500 }
        );
    }
}
