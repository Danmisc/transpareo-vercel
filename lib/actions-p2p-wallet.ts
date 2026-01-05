"use server";

import { prisma as db } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

// --- WALLET ACTIONS ---

export async function getMyWallet() {
    const user = await getCurrentUser();
    if (!user) return null;

    let wallet = await db.wallet.findUnique({
        where: { userId: user.id },
        include: {
            transactions: {
                orderBy: { createdAt: 'desc' },
                take: 5
            }
        }
    });

    if (!wallet) {
        // Auto-create wallet if not exists
        wallet = await db.wallet.create({
            data: {
                userId: user.id,
                balance: 0,
                currency: "EUR"
            },
            include: { transactions: true }
        });
    }

    return wallet;
}

export async function depositMockFunds(amount: number, code?: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // 2FA Verification
    if (code) {
        const { verifyTwoFactor } = await import("@/lib/safe-action");
        const isValid = await verifyTwoFactor(code);
        if (!isValid) return { success: false, error: "Code 2FA invalide" };
    } else {
        // Check if 2FA is required
        const dbUser = await db.user.findUnique({ where: { id: user.id }, select: { twoFactorEnabled: true } });
        if (dbUser?.twoFactorEnabled) {
            return { success: false, error: "Code 2FA requis", requires2FA: true };
        }
    }

    const wallet = await db.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet) throw new Error("No wallet found");

    // 1. Create Transaction
    await db.transaction.create({
        data: {
            walletId: wallet.id,
            amount: amount,
            type: "DEPOSIT",
            status: "COMPLETED",
            metadata: JSON.stringify({ method: "MOCK_BANK_TRANSFER" })
        }
    });

    // 2. Update Balance
    await db.wallet.update({
        where: { id: wallet.id },
        data: {
            balance: { increment: amount }
        }
    });

    const { logSecurityEvent } = await import("@/lib/security");
    await logSecurityEvent(user.id, "FUND_DEPOSIT", "SUCCESS", { amount });

    revalidatePath("/p2p/wallet");
    return { success: true };
}

// --- KYC ACTIONS ---

export async function getKYCStatus() {
    const user = await getCurrentUser();
    if (!user) return null;

    const kyc = await db.kYCProfile.findUnique({
        where: { userId: user.id }
    });

    return kyc;
}

export async function submitKYC(data: { documentType: string, documentUrl: string }) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // Mock verification for demo
    // In real world: Status = PENDING
    const status = "VERIFIED";

    const kyc = await db.kYCProfile.upsert({
        where: { userId: user.id },
        update: {
            status: status,
            documentType: data.documentType,
            documentUrl: data.documentUrl,
            verifiedAt: new Date()
        },
        create: {
            userId: user.id,
            status: status,
            documentType: data.documentType,
            documentUrl: data.documentUrl,
            riskLevel: "LOW",
            verifiedAt: new Date()
        }
    });



    revalidatePath("/p2p");
    return { success: true, status };
}

// --- PORTFOLIO & DASHBOARD ---

export async function getPortfolio() {
    const user = await getCurrentUser();
    if (!user) return [];

    return await db.investment.findMany({
        where: { wallet: { userId: user.id } },
        include: {
            loan: {
                select: {
                    id: true,
                    title: true,
                    riskGrade: true,
                    apr: true,
                    duration: true,
                    status: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
}

export async function getMyLoans() {
    const user = await getCurrentUser();
    if (!user) return [];

    return await db.loanProject.findMany({
        where: { borrowerId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            repayments: {
                where: { status: 'PENDING' },
                orderBy: { dueDate: 'asc' },
                take: 1
            }
        }
    });
}
