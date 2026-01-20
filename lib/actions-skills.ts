"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getUserSkills(userId: string) {
    try {
        const skills = await prisma.userSkill.findMany({
            where: { userId },
            orderBy: { endorsementsCount: 'desc' }
        });
        return { success: true, data: skills };
    } catch (error) {
        console.error("Error fetching skills:", error);
        return { success: false, error: "Impossible de récupérer les compétences" };
    }
}

export async function upsertSkill(data: { id?: string; name: string; category?: string }) {
    const session = await auth();
    console.log("UpsertSkill Auth Check:", session?.user?.id);
    if (!session?.user?.id) {
        console.error("UpsertSkill: No session user ID");
        return { success: false, error: "Non autorisé (Session invalide)" };
    }

    try {
        if (data.id) {
            // Update
            const existing = await prisma.userSkill.findUnique({ where: { id: data.id } });
            if (!existing || existing.userId !== session.user.id) {
                console.error("UpsertSkill: Ownership mismatch", existing?.userId, session.user.id);
                return { success: false, error: "Non autorisé (Propriété)" };
            }
            const updatedSkill = await prisma.userSkill.update({
                where: { id: data.id },
                data: { name: data.name, category: data.category || "PROFESSIONAL" }
            });
            revalidatePath("/");
            return { success: true, id: updatedSkill.id };
        } else {
            // Create or find existing based on unique constraint
            console.log("Upserting skill for user:", session.user.id, data);
            // Custom "Upsert" logic because Schema is missing unique constraint for [userId, name, category]
            const existingSkill = await prisma.userSkill.findFirst({
                where: {
                    userId: session.user.id,
                    name: data.name,
                    category: data.category || "PROFESSIONAL"
                }
            });

            if (existingSkill) {
                // Already exists, just return it
                return { success: true, id: existingSkill.id };
            }

            const skill = await prisma.userSkill.create({
                data: {
                    userId: session.user.id,
                    name: data.name,
                    category: data.category || "PROFESSIONAL",
                    endorsementsCount: 0
                }
            });

            console.log("Skill upserted:", skill.name);
            revalidatePath("/");

            return { success: true, id: skill.id };
        }
    } catch (error) {
        console.error("Error upserting skill:", error);
        return { success: false, error: "Erreur lors de l'ajout" };
    }
}

export async function deleteSkill(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Non autorisé" };

    try {
        const existing = await prisma.userSkill.findUnique({ where: { id } });
        if (!existing || existing.userId !== session.user.id) {
            return { success: false, error: "Non autorisé" };
        }

        await prisma.userSkill.delete({ where: { id } });
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error deleting skill:", error);
        return { success: false, error: "Erreur lors de la suppression" };
    }
}

export async function endorseSkill(skillId: string) {
    const session = await auth();
    // Allow non-logged in users to potentially view but not endorse? Or just fail. 
    // Requirement is to be "complete", so endorsements usually require auth.
    if (!session?.user?.id) return { success: false, error: "Connectez-vous pour recommander" };

    try {
        const skill = await prisma.userSkill.findUnique({ where: { id: skillId } });
        if (!skill) return { success: false, error: "Compétence introuvable" };

        if (skill.userId === session.user.id) {
            return { success: false, error: "Vous ne pouvez pas recommander vos propres compétences" };
        }

        await prisma.userSkill.update({
            where: { id: skillId },
            data: { endorsementsCount: { increment: 1 } }
        });

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error endorsing skill:", error);
        return { success: false, error: "Erreur lors de la recommandation" };
    }
}
