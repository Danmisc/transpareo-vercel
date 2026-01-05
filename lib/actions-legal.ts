"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { LEGAL_PERSONA_PROMPT } from "./legal-persona";

// --- SIMULATED KNOWLEDGE BASE (Fallback) ---
const LEGAL_KNOWLEDGE = [
    {
        keywords: ["dépôt de garantie", "caution", "meublé"],
        response: "**Pour un meublé**, le dépôt de garantie est plafonné à **2 mois** de loyer hors charges.\n\n*Article 22 de la loi du 6 juillet 1989.*"
    },
    {
        keywords: ["dépôt de garantie", "caution", "nu", "vide"],
        response: "**Pour un logement vide**, le dépôt de garantie est limité à **1 mois** de loyer hors charges.\n\nIl ne peut pas être révisé en cours de bail."
    },
    {
        keywords: ["préavis", "départ", "congé", "locataire"],
        response: "Le préavis est de :\n- **1 mois** pour un meublé.\n- **3 mois** pour un vide (réduit à 1 mois en zone tendue).\n\n*Attention : Le courrier doit être envoyé par LRAR.*"
    },
    {
        keywords: ["bouillir", "cuisiner", "chat", "chien", "animal"],
        response: "La détention d'un animal familier est un **droit** (Loi du 9 juillet 1970). Vous ne pouvez pas l'interdire, sauf s'il s'agit d'un chien d'attaque (Catégorie 1)."
    },
    {
        keywords: ["bonjour", "salut", "hello", "coucou", "aide"],
        response: "Bonjour ! Je suis **Maître IA**, votre assistant juridique virtuel.\n\nJe peux répondre à vos questions sur :\n- Les **baux** et contrats.\n- Les **impayés** et procédures.\n- La **conformité** (DPE, assurances).\n\nEn cas de surcharge de mon cerveau connecté, je bascule sur mes connaissances de base. Posez votre question !"
    }
];

// --- HELPER: GET USER CONTEXT ---
async function getCurrentUserId() {
    const session = await auth();
    if (session?.user?.id) return session.user.id;

    // DEV FALLBACK: If no session, try to find the 'me' user from seed
    const devUser = await prisma.user.findUnique({ where: { email: 'me@example.com' } });
    if (devUser) return devUser.id;

    throw new Error("Unauthorized: No user session found.");
}

// --- HELPER: CLEANUP ---
async function cleanupOldConversations(userId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
        await prisma.legalConversation.deleteMany({
            where: {
                userId,
                updatedAt: {
                    lt: thirtyDaysAgo
                }
            }
        });
    } catch (e) {
        console.error("Cleanup failed", e);
    }
}

// --- SERVER ACTIONS FOR HISTORY ---

export async function updateConversationTitle(conversationId: string, newTitle: string) {
    try {
        const userId = await getCurrentUserId();
        await prisma.legalConversation.update({
            where: { id: conversationId },
            data: { title: newTitle }
        });
        return { success: true };
    } catch (e) {
        console.error("Failed to update title", e);
        return { success: false };
    }
}

export async function createNewConversation() {
    const userId = await getCurrentUserId();

    return await prisma.legalConversation.create({
        data: {
            userId,
            title: "Nouvelle Conversation"
        }
    });
}

export async function getRecentConversations() {
    try {
        const userId = await getCurrentUserId();
        // Lazy cleanup
        await cleanupOldConversations(userId);

        return await prisma.legalConversation.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            take: 5
        });
    } catch (e) {
        console.warn("Could not fetch conversations (Auth?)", e);
        return [];
    }
}

export async function getAllConversations() {
    try {
        const userId = await getCurrentUserId();
        // Lazy cleanup
        await cleanupOldConversations(userId);

        return await prisma.legalConversation.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' }
        });
    } catch (e) {
        console.warn("Could not fetch all conversations", e);
        return [];
    }
}

export async function getConversationMessages(conversationId: string) {
    if (!conversationId) return [];

    // Ideally check if conversation belongs to user, but skipping for MVP
    return await prisma.legalMessage.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' }
    });
}

export async function askLegalAI(question: string, conversationId?: string) {
    const aiResponseContent = await generateAIResponse(question);

    // PERSISTENCE
    if (conversationId) {
        try {
            // 1. Save User Message
            await prisma.legalMessage.create({
                data: {
                    conversationId,
                    role: 'user',
                    content: question
                }
            });

            // 2. Save AI Response
            await prisma.legalMessage.create({
                data: {
                    conversationId,
                    role: 'assistant', // Stored as assistant in DB
                    content: aiResponseContent
                }
            });

            // 3. Update Conversation Timestamp & Title if needed
            const currentConv = await prisma.legalConversation.findUnique({
                where: { id: conversationId },
                select: { title: true }
            });

            const dataToUpdate: any = { updatedAt: new Date() };

            if (currentConv?.title === "Nouvelle Conversation") {
                // Simple auto-title based on first meaningful message
                dataToUpdate.title = question.length > 40 ? question.substring(0, 40) + "..." : question;
            }

            await prisma.legalConversation.update({
                where: { id: conversationId },
                data: dataToUpdate
            });

        } catch (error) {
            console.error("Failed to persist legal chat:", error);
        }
    }

    return {
        role: "system",
        content: aiResponseContent
    };
}

// --- MANAGEMENT ACTIONS ---

export async function deleteConversation(conversationId: string) {
    try {
        const userId = await getCurrentUserId();
        await prisma.legalConversation.delete({
            where: { id: conversationId } // In real prod, verify userId matches
        });
        return { success: true };
    } catch (e) {
        console.error("Failed to delete conversation", e);
        return { success: false };
    }
}

export async function restoreConversation(conversationId: string) {
    try {
        const userId = await getCurrentUserId();
        // restoring = updating date to now so it doesn't get cleaned up
        await prisma.legalConversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        });
        return { success: true };
    } catch (e) {
        console.error("Failed to restore conversation", e);
        return { success: false };
    }
}

// Internal function to separate generation logic
async function generateAIResponse(question: string): Promise<string> {
    // 1. DATABASE LOCALE Check
    const lowerQ = question.toLowerCase();
    const localMatch = LEGAL_KNOWLEDGE.find(item =>
        item.keywords.every(k => lowerQ.includes(k)) ||
        (item.keywords.some(k => lowerQ.includes(k)) && item.keywords.length < 3)
    );

    if (localMatch) {
        return localMatch.response;
    }

    // 2. INTELLIGENCE CONNECTÉE (Gemini / OpenAI)
    const geminiKey = process.env.GEMINI_API_KEY;
    const openAIKey = process.env.OPENAI_API_KEY;

    try {
        if (geminiKey) {
            // --- GOOGLE GEMINI STRATEGY (Model Ladder) ---
            const modelsToTry = [
                "gemini-1.5-flash",
                "gemini-flash-latest",
                "gemini-2.0-flash-lite-preview-02-05", // New Lite Model
                "gemini-pro"
            ];

            for (const model of modelsToTry) {
                try {
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
                    const response = await fetch(url, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: `${LEGAL_PERSONA_PROMPT}\n\nQuestion: "${question}"` }] }]
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (text) return text;
                    } else {
                        // console.warn(`Gemini Model ${model} failed:`, response.status);
                    }
                } catch (e) {
                    // console.warn(`Gemini Model ${model} error:`, e);
                }
            }
        }

        if (openAIKey) {
            // --- OPENAI (Fallback) ---
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${openAIKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: LEGAL_PERSONA_PROMPT },
                        { role: "user", content: question }
                    ],
                    temperature: 0.7,
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.choices?.[0]) {
                    return data.choices[0].message.content;
                }
            }
        }
    } catch (e) {
        console.error("AI Service Failed (Network/Quota):", e);
    }

    // 3. FALLBACK ULTIME
    return "Je n'ai pas trouvé de réponse précise dans ma base locale.\n\nMes circuits connectés (Gemini/OpenAI) semblent momentanément indisponibles. Essayez de reformuler avec des mots clés simples (ex: 'préavis', 'caution', 'travaux').";
}
