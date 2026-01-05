"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Alias for generic "get all" or could have different logic
export async function getAllReviews() {
    return getPropertyReviews();
}

export async function getPropertyReviews(address?: string) {
    try {
        const where = address ? { address } : {};
        const reviews = await prisma.propertyReview.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return { success: true, data: reviews };
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return { success: false, error: "Failed to fetch reviews" };
    }
}

export async function createPropertyReview(data: any, userId: string) {
    try {
        const review = await prisma.propertyReview.create({
            data: {
                address: data.address,
                latitude: data.latitude,
                longitude: data.longitude,
                rating: parseInt(data.rating),
                comment: data.comment,
                pros: data.pros,
                cons: data.cons,

                // Detailed Scores
                thermalScore: data.thermalScore ? parseInt(data.thermalScore) : null,
                acousticScore: data.acousticScore ? parseInt(data.acousticScore) : null,
                luminosityScore: data.luminosityScore ? parseInt(data.luminosityScore) : null,
                humidityScore: data.humidityScore ? parseInt(data.humidityScore) : null,

                commonAreasScore: data.commonAreasScore ? parseInt(data.commonAreasScore) : null,
                safetyScore: data.safetyScore ? parseInt(data.safetyScore) : null,
                transportScore: data.transportScore ? parseInt(data.transportScore) : null,

                responsivenessScore: data.responsivenessScore ? parseInt(data.responsivenessScore) : null,
                depositReturnScore: data.depositReturnScore ? parseInt(data.depositReturnScore) : null,
                networkScore: data.networkScore ? parseInt(data.networkScore) : null,

                // Rent Tracker
                rentPaid: data.rentPaid ? parseInt(data.rentPaid) : null,
                rentYear: data.rentYear ? parseInt(data.rentYear) : new Date().getFullYear(),
                surface: data.surface ? parseFloat(data.surface) : null,
                isFurnished: data.isFurnished === true || data.isFurnished === "true",

                isVerifiedTenant: data.isVerifiedTenant === "true" || data.isVerifiedTenant === true,
                userId: userId
            }
        });
        revalidatePath("/marketplace");
        return { success: true, data: review };
    } catch (error) {
        // Type casting error to any to access message safely
        const errorMessage = (error as any)?.message || String(error);
        return { success: false, error: "Failed: " + errorMessage };
    }
}
