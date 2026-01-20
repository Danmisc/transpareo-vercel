"use server";

import { prisma as db } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { logSecurityEvent } from "@/lib/security";
import crypto from "crypto";

// ========================================
// RATE LIMITING - Production Security
// ========================================

const socialRateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const limit = socialRateLimits.get(key);

    if (limit) {
        if (now < limit.resetAt) {
            if (limit.count >= maxRequests) return false;
            limit.count++;
        } else {
            socialRateLimits.set(key, { count: 1, resetAt: now + windowMs });
        }
    } else {
        socialRateLimits.set(key, { count: 1, resetAt: now + windowMs });
    }
    return true;
}

// --- PROJECT UPDATES ---

export async function postProjectUpdate(data: {
    loanId: string;
    title: string;
    content: string;
    imageUrl?: string;
}) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // Rate limit: 5 updates per day
    if (!checkRateLimit(`update:${user.id}`, 5, 86400000)) {
        throw new Error("Trop de mises à jour. Réessayez demain.");
    }

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

    await logSecurityEvent(user.id, "PROJECT_UPDATE_POSTED", "SUCCESS", { loanId: data.loanId });
    revalidatePath(`/p2p/market/${data.loanId}`);
    return { success: true };
}

// --- SOCIAL VOUCHING ---

export async function vouchForUser(targetUserId: string, relationship: "FRIEND" | "FAMILY" | "COLLEAGUE") {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    if (user.id === targetUserId) throw new Error("Cannot vouch for yourself.");

    // Rate limit: 5 vouches per day
    if (!checkRateLimit(`vouch:${user.id}`, 5, 86400000)) {
        await logSecurityEvent(user.id, "VOUCH_RATE_LIMITED", "FAILURE", { targetUserId });
        throw new Error("Limite atteinte: 5 recommandations par jour maximum.");
    }

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

    await logSecurityEvent(user.id, "VOUCH_CREATED", "SUCCESS", { targetUserId, relationship });
    revalidatePath(`/p2p/profile/${targetUserId}`);
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

    // Generate cryptographically secure code: 8 alphanumeric characters
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars: I, O, 0, 1
    let code = '';
    const randomBytes = crypto.randomBytes(8);
    for (let i = 0; i < 8; i++) {
        code += chars[randomBytes[i] % chars.length];
    }

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
