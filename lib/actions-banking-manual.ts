"use server";

import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addManualBank() {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // Cycle through some mock providers to simulate variety
    const providers = [
        { name: "Chase", mask: "4455", color: "blue" },
        { name: "Revolut", mask: "9988", color: "black" },
        { name: "BNP Paribas", mask: "1122", color: "green" },
        { name: "BoursoBank", mask: "7766", color: "pink" }
    ];

    const randomProvider = providers[Math.floor(Math.random() * providers.length)];

    await prisma.linkedAccount.create({
        data: {
            userId: user.id,
            providerId: "manual_" + Date.now(),
            providerName: randomProvider.name,
            accountName: "Checking Account",
            mask: randomProvider.mask,
            balance: Math.floor(Math.random() * 5000) + 500, // Random balance 500-5500
            status: "ACTIVE",
            accessToken: "manual_token_simulated"
        }
    });

    revalidatePath("/p2p/gains");
    return { success: true };
}
