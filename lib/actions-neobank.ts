"use server";

import { prisma as db } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

// --- CARD MANAGEMENT ---

export async function toggleCardFreeze(cardId: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const card = await db.bankCard.findUnique({
        where: { id: cardId },
        include: { wallet: true }
    });

    if (!card || card.wallet.userId !== user.id) {
        throw new Error("Card not found");
    }

    const newStatus = card.status === "ACTIVE" ? "FROZEN" : "ACTIVE";

    await db.bankCard.update({
        where: { id: cardId },
        data: { status: newStatus }
    });

    revalidatePath("/p2p/gains");
    return { success: true, status: newStatus };
}

export async function updateCardSettings(cardId: string, settings: { contactless?: boolean, online?: boolean, atm?: boolean }) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // Verify ownership
    const card = await db.bankCard.findFirst({
        where: { id: cardId, wallet: { userId: user.id } }
    });
    if (!card) throw new Error("Access denied");

    await db.bankCard.update({
        where: { id: cardId },
        data: {
            contactless: settings.contactless,
            onlinePayments: settings.online,
            atmWithdrawals: settings.atm
        }
    });

    revalidatePath("/p2p/gains");
    return { success: true };
}

export async function updateCardLimits(cardId: string, monthlyLimit: number) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const card = await db.bankCard.findFirst({
        where: { id: cardId, wallet: { userId: user.id } }
    });
    if (!card) throw new Error("Access denied");

    if (monthlyLimit < 0) throw new Error("Invalid limit");

    await db.bankCard.update({
        where: { id: cardId },
        data: { monthlyLimit }
    });

    revalidatePath("/p2p/gains");
    return { success: true };
}

export async function revealCardDetails(cardId: string, _secret: string) {
    // In a real app, verify the 2FA secret/PIN here
    // For now, we simulate success
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const card = await db.bankCard.findFirst({
        where: { id: cardId, wallet: { userId: user.id } }
    });
    if (!card) throw new Error("Access denied");

    // Decrypt details (mock)
    return {
        pan: `4242 4242 4242 ${card.panLast4}`,
        cvv: card.cvv || "123",
        expiry: card.expiry
    };
}

// --- POCKETS & VAULTS ---

export async function createPocket(name: string, goal: number, emoji: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const wallet = await db.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet) throw new Error("No wallet");

    await db.pocket.create({
        data: {
            walletId: wallet.id,
            name,
            goalAmount: goal,
            emoji
        }
    });

    revalidatePath("/p2p/gains");
    return { success: true };
}

export async function transferToPocket(pocketId: string, amount: number) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const wallet = await db.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet) throw new Error("No wallet");
    if (wallet.balance < amount) throw new Error("Insufficient funds");

    // Atomic Transaction
    await db.$transaction([
        // 1. Debit Main Wallet
        db.wallet.update({
            where: { id: wallet.id },
            data: { balance: { decrement: amount } }
        }),
        // 2. Credit Pocket
        db.pocket.update({
            where: { id: pocketId },
            data: { balance: { increment: amount } }
        }),
        // 3. Log Transaction
        db.transaction.create({
            data: {
                walletId: wallet.id,
                amount: -amount,
                type: "POCKET_TRANSFER",
                status: "COMPLETED",
                pocketId: pocketId,
                description: "Transfer to Pocket"
            }
        })
    ]);

    revalidatePath("/p2p/gains");
    return { success: true };
}

export async function withdrawFromPocket(pocketId: string, amount: number) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const wallet = await db.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet) return { error: "No wallet" };

    const pocket = await db.pocket.findUnique({ where: { id: pocketId } });
    if (!pocket || pocket.balance < amount) throw new Error("Insufficient pocket funds");

    await db.$transaction([
        db.pocket.update({
            where: { id: pocketId },
            data: { balance: { decrement: amount } }
        }),
        db.wallet.update({
            where: { id: wallet.id },
            data: { balance: { increment: amount } }
        }),
        db.transaction.create({
            data: {
                walletId: wallet.id,
                amount: amount,
                type: "POCKET_TRANSFER",
                status: "COMPLETED",
                pocketId: pocketId,
                description: `Withdraw from ${pocket.name}`
            }
        })
    ]);

    revalidatePath("/p2p/gains");
    return { success: true };
}

// --- AUTO-INVEST ---

export async function toggleAutoInvest(isEnabled: boolean) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    await db.user.update({
        where: { id: user.id },
        data: {
            autoInvestSettings: {
                upsert: {
                    create: { isEnabled, riskLevel: "BALANCED" },
                    update: { isEnabled }
                }
            }
        }
    });

    revalidatePath("/p2p/gains");
    return { success: true };
}
