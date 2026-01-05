import { prisma } from "@/lib/prisma";
import { differenceInMonths, isBefore } from "date-fns";

export type EligibilityStatus =
    | "ELIGIBLE"
    | "NOT_ELIGIBLE_ACCOUNT_AGE"
    | "NOT_ELIGIBLE_NO_PROOF"
    | "NOT_ELIGIBLE_RESIDENCY_TOO_SHORT"
    | "NOT_ELIGIBLE_CURRENT_TENANT"
    | "NOT_ELIGIBLE_ALREADY_REVIEWED";

export async function checkReviewEligibility(userId: string, address: string): Promise<{ status: EligibilityStatus, message?: string }> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            reviewEligibilities: true,
            propertyReviews: {
                where: { address: address } // Check if already reviewed this exact address
            }
        }
    });

    if (!user) return { status: "NOT_ELIGIBLE_ACCOUNT_AGE", message: "User not found" };

    // 1. Account Age Check (30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (!user.createdAt || user.createdAt > thirtyDaysAgo) {
        return { status: "NOT_ELIGIBLE_ACCOUNT_AGE", message: "Votre compte doit avoir au moins 30 jours." };
    }

    // 2. Already Reviewed Check
    if (user.propertyReviews.length > 0) {
        return { status: "NOT_ELIGIBLE_ALREADY_REVIEWED", message: "Vous avez déjà noté ce logement." };
    }

    // 3. Proof Check (ReviewEligibility)
    // Find an APPROVED eligibility record for this address
    // Note: In a real app, address matching is complex (canonicalization). 
    // Here we assume exact match or we check mostly if *any* approved proof exists for now for simplicty, 
    // or we'd need to filter reviewEligibilities by address string match.
    const eligibilityProof = user.reviewEligibilities.find(
        (e) => e.status === "APPROVED" && e.address === address
    );

    if (!eligibilityProof) {
        // Check if there is a PENDING one
        const pending = user.reviewEligibilities.find(e => e.status === "PENDING" && e.address === address);
        if (pending) return { status: "NOT_ELIGIBLE_NO_PROOF", message: "Validation de preuve en cours..." };

        return { status: "NOT_ELIGIBLE_NO_PROOF", message: "Aucune preuve de bail validée pour cette adresse." };
    }

    // 4. Residency Duration Check (6 months)
    if (eligibilityProof.moveInDate && eligibilityProof.moveOutDate) {
        const months = differenceInMonths(new Date(eligibilityProof.moveOutDate), new Date(eligibilityProof.moveInDate));
        if (months < 6) {
            return { status: "NOT_ELIGIBLE_RESIDENCY_TOO_SHORT", message: "Durée de location inférieure à 6 mois." };
        }
    }

    // 5. Current Tenant Check (Must have moved out)
    if (eligibilityProof.moveOutDate && !isBefore(new Date(eligibilityProof.moveOutDate), new Date())) {
        return { status: "NOT_ELIGIBLE_CURRENT_TENANT", message: "Vous devez avoir quitté le logement pour noter." };
    }

    return { status: "ELIGIBLE" };
}

export async function submitEligibilityProof(userId: string, data: { address: string, moveInDate: Date, moveOutDate: Date, documentUrl: string }) {
    return prisma.reviewEligibility.create({
        data: {
            userId,
            address: data.address,
            moveInDate: data.moveInDate,
            moveOutDate: data.moveOutDate,
            proofDocumentUrl: data.documentUrl,
            status: "PENDING" // Auto-approve could happen here if we had OCR
        }
    });
}
