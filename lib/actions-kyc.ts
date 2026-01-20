"use server";

import { getCurrentUser } from "@/lib/session";
import { createSumsubAccessToken, getSumsubApplicantStatus } from "@/lib/sumsub";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { screenUser } from "@/lib/compliance/sanctions";

export async function getSumsubToken() {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // Ensure KYC Profile exists
    let profile = await prisma.kYCProfile.findUnique({ where: { userId: user.id } });
    if (!profile) {
        profile = await prisma.kYCProfile.create({ data: { userId: user.id } });
    }

    // Generate Token
    try {
        const token = await createSumsubAccessToken(user.id);
        return { token, email: user.email };
    } catch (e: any) {
        return { error: e.message || "Impossible de générer le token KYC" };
    }
}

/**
 * Sync KYC status from Sumsub and run AML screening
 * This is the critical compliance checkpoint
 */
export async function syncSumsubStatus() {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // Fetch real status from Sumsub
    const applicantData = await getSumsubApplicantStatus(user.id);

    if (!applicantData) return { success: false, error: "Impossible de récupérer le statut Sumsub." };

    console.log("Sumsub Applicant Data:", JSON.stringify(applicantData?.review?.reviewStatus, null, 2));

    const reviewStatus = applicantData?.review?.reviewStatus;
    const reviewResult = applicantData?.review?.reviewResult?.reviewAnswer;

    // Map Sumsub status to our KYCStatus
    let ourStatus = "SUBMITTED";
    let tier = 0;

    if (reviewStatus === 'completed' && reviewResult === 'GREEN') {
        // KYC passed - now run AML screening
        const userName = user.name || user.email || 'Unknown';

        console.log("[AML] Running sanctions screening for:", userName);
        const amlResult = await screenUser(userName);

        if (!amlResult.passed) {
            // AML hit - flag for review
            ourStatus = "AML_REVIEW";
            tier = 0;

            // Create compliance alert
            await prisma.complianceAlert.create({
                data: {
                    userId: user.id,
                    type: amlResult.riskLevel === 'CRITICAL' ? 'SANCTIONS_MATCH' : 'PEP_MATCH',
                    severity: amlResult.riskLevel,
                    status: 'PENDING',
                    title: 'Correspondance AML/PEP détectée',
                    description: `Screening a trouvé ${amlResult.matches.length} correspondance(s). ${amlResult.matches.map(m => m.listName).join(', ')}`
                }
            });

            console.log("[AML] User flagged for review:", amlResult.matches);
        } else {
            // All clear
            ourStatus = "VERIFIED";
            tier = 2; // Standard Tier
            console.log("[AML] User cleared:", amlResult.riskLevel);
        }
    } else if (reviewStatus === 'completed' && reviewResult === 'RED') {
        ourStatus = "REJECTED";
    } else if (reviewStatus === 'pending' || reviewStatus === 'queued') {
        ourStatus = "REVIEW";
    }

    // Update DB
    await prisma.kYCProfile.update({
        where: { userId: user.id },
        data: {
            status: ourStatus,
            tier: tier,
            lastCheckAt: new Date(),
            verifiedAt: tier > 0 ? new Date() : undefined
        }
    });

    // Log security event
    await prisma.securityLog.create({
        data: {
            userId: user.id,
            action: "KYC_STATUS_SYNC",
            status: ourStatus === "VERIFIED" ? "SUCCESS" : "PENDING",
            metadata: JSON.stringify({ reviewStatus, reviewResult, tier }),
            ipAddress: "server",
            userAgent: "server"
        }
    });

    revalidatePath("/p2p/settings/kyc");
    revalidatePath("/p2p/dashboard");
    return { success: true, status: ourStatus };
}

/**
 * Get full KYC and AML status for user
 */
export async function getComplianceStatus() {
    const user = await getCurrentUser();
    if (!user) return null;

    const [profile, alerts] = await Promise.all([
        prisma.kYCProfile.findUnique({ where: { userId: user.id } }),
        prisma.complianceAlert.findMany({
            where: { userId: user.id, status: { in: ['PENDING', 'REVIEWING'] } },
            orderBy: { createdAt: 'desc' },
            take: 5
        })
    ]);

    return {
        kyc: profile,
        alerts,
        isBlocked: alerts.some(a => a.severity === 'CRITICAL'),
        requiresReview: alerts.length > 0
    };
}

