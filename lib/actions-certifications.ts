"use server";

import { prisma as db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";

export async function getUserCertifications(userId: string) {
    try {
        const certifications = await db.userCertification.findMany({
            where: { userId },
            orderBy: { issueDate: "desc" }
        });
        return certifications;
    } catch (error) {
        console.error("Error fetching certifications:", error);
        return [];
    }
}

export async function upsertCertification(data: {
    id?: string;
    name: string;
    issuer: string;
    issueDate: Date;
    expiryDate?: Date | null;
    credentialId?: string;
    credentialUrl?: string;
}) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    try {
        if (data.id) {
            // Update
            const existing = await db.userCertification.findUnique({
                where: { id: data.id }
            });

            if (!existing || existing.userId !== user.id) {
                throw new Error("Unauthorized or not found");
            }

            await db.userCertification.update({
                where: { id: data.id },
                data: {
                    name: data.name,
                    issuer: data.issuer,
                    issueDate: data.issueDate,
                    expiryDate: data.expiryDate,
                    credentialId: data.credentialId,
                    credentialUrl: data.credentialUrl
                }
            });
        } else {
            // Create
            await db.userCertification.create({
                data: {
                    userId: user.id,
                    name: data.name,
                    issuer: data.issuer,
                    issueDate: data.issueDate,
                    expiryDate: data.expiryDate,
                    credentialId: data.credentialId,
                    credentialUrl: data.credentialUrl
                }
            });
        }

        revalidatePath(`/profile/${user.id}`);
        return { success: true };
    } catch (error) {
        console.error("Error saving certification:", error);
        return { success: false, error: "Failed to save certification" };
    }
}

export async function deleteCertification(id: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    try {
        const existing = await db.userCertification.findUnique({
            where: { id }
        });

        if (!existing || existing.userId !== user.id) {
            throw new Error("Unauthorized");
        }

        await db.userCertification.delete({
            where: { id }
        });

        revalidatePath(`/profile/${user.id}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting certification:", error);
        return { success: false, error: "Failed to delete certification" };
    }
}
