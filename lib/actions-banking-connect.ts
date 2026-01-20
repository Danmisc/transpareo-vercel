"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function connectExternalBank(providerId: string, providerName: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // Simulate Token Generation & Encryption
    // const encryptedToken = encrypt("access_token_mock");

    // Generate random mock balance
    const mockBalance = Math.floor(Math.random() * 15000) + 500;
    const mockMask = "**** " + Math.floor(1000 + Math.random() * 9000).toString();

    try {
        await prisma.linkedAccount.create({
            data: {
                userId: user.id,
                providerId,
                providerName,
                accountName: "Compte Courant",
                mask: mockMask,
                balance: mockBalance,
                status: "ACTIVE",
                lastSync: new Date()
            }
        });

        revalidatePath("/p2p/gains");
        return { success: true };
    } catch (error) {
        console.error("Link Bank Error:", error);
        return { success: false, error: "Failed to link" };
    }
}

export async function getLinkedAccounts() {
    const user = await getCurrentUser();
    if (!user) return [];

    return await prisma.linkedAccount.findMany({
        where: { userId: user.id, status: "ACTIVE" },
        orderBy: { lastSync: 'desc' }
    });
}
