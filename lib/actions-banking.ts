"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { logSecurityEvent } from "@/lib/security";
import { verifyTwoFactor } from "@/lib/safe-action";

export async function addBeneficiary(data: { name: string, holder: string, iban: string, bic: string }, code?: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // Critical Action -> Require 2FA if enabled
    if (code) {
        const isValid = await verifyTwoFactor(code);
        if (!isValid) return { success: false, error: "Code 2FA incorrect" };
    } else {
        const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { twoFactorEnabled: true } });
        if (dbUser?.twoFactorEnabled) {
            return { success: false, error: "2FA requis", requires2FA: true };
        }
    }

    try {
        await prisma.beneficiary.create({
            data: {
                userId: user.id,
                name: data.name,
                holder: data.holder,
                iban: data.iban.toUpperCase().replace(/\s/g, ""),
                bic: data.bic.toUpperCase()
            }
        });

        await logSecurityEvent(user.id, "ADD_BENEFICIARY", "SUCCESS", { iban: data.iban });
        revalidatePath("/p2p/wallet/transfer");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Erreur lors de l'ajout" };
    }
}

export async function getBeneficiaries() {
    const user = await getCurrentUser();
    if (!user) return [];

    return await prisma.beneficiary.findMany({
        where: { userId: user.id, status: "ACTIVE" },
        orderBy: { createdAt: 'desc' }
    });
}

import { checkTransferLimits } from "@/lib/banking/limits";

export async function transferFunds(beneficiaryId: string, amount: number) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // 1. Security & Limits
    const limitCheck = await checkTransferLimits(user.id, amount);
    if (!limitCheck.allowed) {
        return { success: false, error: limitCheck.error };
    }

    const beneficiary = await prisma.beneficiary.findUnique({
        where: { id: beneficiaryId, userId: user.id }
    });
    if (!beneficiary) return { success: false, error: "Bénéficiaire introuvable" };

    try {
        // 2. Execute Transfer (Atomic)
        await prisma.$transaction(async (tx) => {
            // Debit Wallet
            const wallet = await tx.wallet.findUnique({ where: { userId: user.id } });
            if (!wallet) throw new Error("No wallet");

            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: amount } }
            });

            // Create Transaction Record
            await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    amount: amount,
                    type: "WITHDRAWAL", // Treating transfer as withdrawal from system
                    status: "COMPLETED",
                    metadata: JSON.stringify({
                        beneficiary: beneficiary.name,
                        iban: beneficiary.iban
                    })
                }
            });
        });

        // 3. Log & Notify
        await logSecurityEvent(user.id, "TRANSFER_OUT", "SUCCESS", { amount, beneficiary: beneficiary.name });
        revalidatePath("/p2p/wallet");
        return { success: true };

    } catch (error) {
        console.error(error);
        return { success: false, error: "Erreur technique lors du virement" };
    }
}
