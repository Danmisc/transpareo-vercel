"use server";

import { prisma as db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";

export async function getUserExperiences(userId: string) {
    try {
        const experiences = await db.userExperience.findMany({
            where: { userId },
            orderBy: { startDate: "desc" }
        });
        return experiences;
    } catch (error) {
        console.error("Error fetching experiences:", error);
        return [];
    }
}

export async function upsertExperience(data: {
    id?: string;
    title: string;
    company: string;
    location?: string;
    startDate: Date;
    endDate?: Date | null;
    description?: string;
    type?: string;
}) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    try {
        if (data.id) {
            // Update
            const existing = await db.userExperience.findUnique({
                where: { id: data.id }
            });

            if (!existing || existing.userId !== user.id) {
                throw new Error("Unauthorized or not found");
            }

            await db.userExperience.update({
                where: { id: data.id },
                data: {
                    title: data.title,
                    company: data.company,
                    location: data.location,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    description: data.description,
                    type: data.type || "REAL_ESTATE"
                }
            });
        } else {
            // Create
            await db.userExperience.create({
                data: {
                    userId: user.id,
                    title: data.title,
                    company: data.company,
                    location: data.location,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    description: data.description,
                    type: data.type || "REAL_ESTATE"
                }
            });
        }

        revalidatePath(`/profile/${user.id}`);
        return { success: true };
    } catch (error) {
        console.error("Error saving experience:", error);
        return { success: false, error: "Failed to save experience" };
    }
}

export async function deleteExperience(id: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    try {
        const existing = await db.userExperience.findUnique({
            where: { id }
        });

        if (!existing || existing.userId !== user.id) {
            throw new Error("Unauthorized");
        }

        await db.userExperience.delete({
            where: { id }
        });

        revalidatePath(`/profile/${user.id}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting experience:", error);
        return { success: false, error: "Failed to delete experience" };
    }
}
