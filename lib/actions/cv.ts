"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTenantProfile(userId: string) {
    try {
        const dossier = await prisma.tenantDossier.findUnique({
            where: { userId },
            include: { profile: true }
        });

        if (!dossier) return { success: false, error: "Dossier introuvable" };

        // If profile doesn't exist, return null (frontend handle creation state) or empty object?
        // Let's return the profile or null.
        return { success: true, data: dossier.profile };
    } catch (error) {
        console.error("Error fetching profile:", error);
        return { success: false, error: "Erreur lors du chargement du CV" };
    }
}

export async function updateTenantProfile(userId: string, data: any) {
    try {
        const dossier = await prisma.tenantDossier.findUnique({ where: { userId } });
        if (!dossier) return { success: false, error: "Dossier introuvable" };

        // Check if profile exists
        const existingProfile = await prisma.tenantProfile.findUnique({
            where: { dossierId: dossier.id }
        });

        console.log("Saving CV Profile for user:", userId);

        // Whitelist and type cast fields
        const safeData = {
            status: data.status,
            employer: data.employer,
            jobTitle: data.jobTitle,
            contractType: data.contractType,

            // Numbers - ensure they are integers or undefined
            netIncome: data.netIncome ? parseInt(String(data.netIncome)) : undefined,
            variableIncome: data.variableIncome ? parseInt(String(data.variableIncome)) : undefined,
            taxReference: data.taxReference ? parseInt(String(data.taxReference)) : undefined,
            childrenCount: data.childrenCount ? parseInt(String(data.childrenCount)) : 0,
            currentRent: data.currentRent ? parseInt(String(data.currentRent)) : undefined,

            linkedinUrl: data.linkedinUrl,
            workMode: data.workMode,
            bio: data.bio,
            phone: data.phone,
            nationality: data.nationality,
            familyStatus: data.familyStatus,
            pets: data.pets,
            smoker: Boolean(data.smoker),
            transport: data.transport,
            durationIntent: data.durationIntent,
            searchArea: data.searchArea,
            currentStatus: data.currentStatus,
            currentAddress: data.currentAddress,
            reasonForMove: data.reasonForMove,

            // Handle Dates safely (check if string or date object)
            birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            moveInDate: data.moveInDate ? new Date(data.moveInDate) : undefined,
        };

        // Remove NaN or undefined keys explicitly
        Object.keys(safeData).forEach(key => {
            const val = (safeData as any)[key];
            if (val === undefined || val === null || (typeof val === 'number' && isNaN(val))) {
                delete (safeData as any)[key];
            }
        });

        console.log("Cleaned Data payload:", JSON.stringify(safeData, null, 2));

        const profile = await prisma.tenantProfile.upsert({
            where: { dossierId: dossier.id },
            update: safeData,
            create: {
                dossierId: dossier.id,
                ...safeData
            }
        });

        console.log("Profile saved successfully:", profile.id);

        revalidatePath("/dossier");
        return { success: true, data: profile };
    } catch (error: any) {
        console.error("Error updating profile DETAIL:", error);
        // Return explicit error message if possible
        return { success: false, error: error.message || "Erreur technique lors de la sauvegarde" };
    }
}
