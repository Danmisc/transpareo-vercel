"use server";

import { prisma as db } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function createLoanApplication(data: any) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // Simplified Risk Engine Mock
    // In reality, this would analyze banking data
    const riskGrade = data.amount > 50000 ? "B" : "A";
    const apr = riskGrade === "A" ? 4.5 : 6.2;

    const project = await db.loanProject.create({
        data: {
            borrowerId: user.id,
            title: data.title,
            description: data.description,
            amount: parseFloat(data.amount),
            duration: parseInt(data.duration),
            projectType: data.category,
            status: "REVIEW", // Pending Admin Approval
            riskGrade: riskGrade,
            apr: apr,
            location: data.location || "France"
        }
    });

    return { success: true, id: project.id };
}

export async function getAvailableLoans() {
    // In prod, only return "FUNDING" status
    // For demo, we return everything so the user sees their own creation
    return await db.loanProject.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            borrower: {
                select: { id: true, name: true, avatar: true }
            }
        }
    });
}

export async function getLoanDetails(id: string) {
    return await db.loanProject.findUnique({
        where: { id },
        include: {
            borrower: true,
            investments: true,
            updates: { orderBy: { createdAt: 'desc' } }
        }
    });
}

export async function investInLoan(loanId: string, amount: number) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // 1. Check Wallet
    const wallet = await db.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance < amount) {
        throw new Error("Insufficient funds");
    }

    // 2. Transaction: Withdraw from Wallet (Invest)
    await db.transaction.create({
        data: {
            walletId: wallet.id,
            amount: -amount,
            type: "INVESTMENT",
            reference: loanId,
            status: "COMPLETED"
        }
    });

    // 3. Create Investment Record
    await db.investment.create({
        data: {
            walletId: wallet.id,
            loanId: loanId,
            amount: amount,
            status: "ACTIVE"
        }
    });

    // 4. Update Wallet Balance
    await db.wallet.update({
        where: { id: wallet.id },
        data: {
            balance: { decrement: amount },
            invested: { increment: amount }
        }
    });

    // 5. Update Loan Funded Amount
    await db.loanProject.update({
        where: { id: loanId },
        data: {
            funded: { increment: amount }
        }
    });

    revalidatePath(`/p2p/market/${loanId}`);
    revalidatePath('/p2p/dashboard');
    return { success: true };
}
