"use server";

import { prisma as db } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

// --- PROJECT UPDATES ---

export async function postProjectUpdate(data: {
    loanId: string;
    title: string;
    content: string;
    imageUrl?: string;
}) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // Verify ownership
    const loan = await db.loanProject.findUnique({ where: { id: data.loanId } });
    if (!loan || loan.borrowerId !== user.id) {
        throw new Error("Only the borrower can post updates.");
    }

    await db.projectUpdate.create({
        data: {
            loanId: data.loanId,
            title: data.title,
            content: data.content,
            imageUrl: data.imageUrl
        }
    });

    revalidatePath(`/p2p/market/${data.loanId}`);
    return { success: true };
}

// --- SOCIAL VOUCHING ---

export async function vouchForUser(targetUserId: string, relationship: "FRIEND" | "FAMILY" | "COLLEAGUE") {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    if (user.id === targetUserId) throw new Error("Cannot vouch for yourself.");

    // Check existing vouch
    const existing = await db.socialVouch.findUnique({
        where: {
            voucherId_targetId: {
                voucherId: user.id,
                targetId: targetUserId
            }
        }
    });

    if (existing) throw new Error("You already vouched for this person.");

    await db.socialVouch.create({
        data: {
            voucherId: user.id,
            targetId: targetUserId,
            relationship
        }
    });

    revalidatePath(`/p2p/profile/${targetUserId}`); // Assuming future profile page
    return { success: true };
}

export async function getSocialTrust(userId: string) {
    const vouches = await db.socialVouch.findMany({
        where: { targetId: userId },
        include: { voucher: { select: { name: true, image: true, reputation: true } } }
    });

    // Simple Algorithm: 1 Vouch = 10 Points. High Rep Voucher = +5 Bonus.
    let trustScore = 0;
    vouches.forEach(v => {
        trustScore += 10;
        if (v.voucher.reputation > 500) trustScore += 5;
    });

    return {
        score: trustScore,
        count: vouches.length,
        vouchers: vouches.map(v => v.voucher)
    };
}

// --- REFERRAL SYSTEM & NETWORK ---

export async function generateReferralCode() {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // Check if exists
    const existing = await db.user.findUnique({
        where: { id: user.id },
        select: { referralCode: true }
    });

    if (existing?.referralCode) return { code: existing.referralCode };

    // Generate new code: Name + 4 random digits
    const code = (user.name?.slice(0, 4).toUpperCase() || "USER") + Math.floor(1000 + Math.random() * 9000);

    // Update user
    await db.user.update({
        where: { id: user.id },
        data: { referralCode: code }
    });

    return { code };
}

export async function getSocialDashboardData() {
    const user = await getCurrentUser();
    if (!user) return null;

    const [userData, vouchData, referrals, updates] = await Promise.all([
        db.user.findUnique({
            where: { id: user.id },
            select: { referralCode: true, reputation: true }
        }),
        getSocialTrust(user.id),
        db.user.findMany({
            where: { referredById: user.id },
            select: { id: true, name: true, image: true, createdAt: true }
        }),
        db.projectUpdate.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                loan: {
                    select: {
                        title: true,
                        borrower: { select: { name: true, image: true } }
                    }
                }
            }
        })
    ]);

    // Get people I vouched for
    const vouchedFor = await db.socialVouch.findMany({
        where: { voucherId: user.id },
        include: { target: { select: { id: true, name: true, image: true } } }
    });

    return {
        referralCode: userData?.referralCode,
        reputation: userData?.reputation,
        trustScore: vouchData.score,
        receivedVouches: vouchData.vouchers,
        sentVouches: vouchedFor.map(v => v.target),
        referrals,
        activities: updates
    };
}
