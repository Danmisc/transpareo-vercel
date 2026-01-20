
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

export enum KYCTier {
    UNVERIFIED = 0,
    LIGHT = 1,      // Email + Phone
    STANDARD = 2,   // ID Doc
    ENHANCED = 3    // Address + Tax
}

export enum KYCStatus {
    IDLE = "IDLE",
    SUBMITTED = "SUBMITTED",
    REVIEW = "REVIEW",
    VERIFIED = "VERIFIED",
    REJECTED = "REJECTED",
    MORE_INFO = "MORE_INFO"
}

export async function getKYCState() {
    const user = await getCurrentUser();
    if (!user) return null;

    const profile = await prisma.kYCProfile.findUnique({
        where: { userId: user.id },
        include: { documents: true }
    });

    if (!profile) {
        // Auto-init profile if missing
        return await prisma.kYCProfile.create({
            data: { userId: user.id }
        });
    }

    return profile;
}

/**
 * Transitions the KYC state based on submitted documents and risk checks.
 */
export async function submitKYCDocument(type: string, url: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    let profile = await prisma.kYCProfile.findUnique({ where: { userId: user.id } });
    if (!profile) {
        profile = await prisma.kYCProfile.create({ data: { userId: user.id } });
    }

    // Create Document Logic
    await prisma.kYCDocument.create({
        data: {
            profileId: profile.id,
            type,
            url,
            status: "PENDING" // Starts pending
        }
    });

    // Update Profile Status -> SUBMITTED or REVIEW
    await prisma.kYCProfile.update({
        where: { id: profile.id },
        data: {
            status: KYCStatus.REVIEW,
            lastCheckAt: new Date()
        }
    });

    // TRIGGER ASYNC VERIFICATION HERE (Mocking the response for now)
    // In real system, this calls Stripe Identity / SumSub
    await mockVerificationProcess(profile.id);

    revalidatePath("/p2p/settings");
    return { success: true };
}

async function mockVerificationProcess(profileId: string) {
    // Simulate API delay
    // In a real implementation, this would be a separate worker or webhook handler

    // 1. Check logic
    const docs = await prisma.kYCDocument.findMany({ where: { profileId } });
    const hasID = docs.some(d => ["PASSPORT", "ID_CARD"].includes(d.type));

    if (hasID) {
        // Upgrade to Tier 2
        await prisma.kYCProfile.update({
            where: { id: profileId },
            data: {
                status: KYCStatus.VERIFIED,
                tier: KYCTier.STANDARD,
                riskScore: 10, // Low risk
                verifiedAt: new Date()
            }
        });

        // Mark docs as valid
        await prisma.kYCDocument.updateMany({
            where: { profileId },
            data: { status: "VALID" }
        });
    }
}
