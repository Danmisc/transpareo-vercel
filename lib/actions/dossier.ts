"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

// --- GETTERS ---

export async function getUserDossier(userId: string) {
    try {
        const dossier = await prisma.tenantDossier.findUnique({
            where: { userId },
            include: {
                documents: true,
                profile: true, // NEW: Include CV Profile
                guarantors: true,
                group: {
                    include: { members: { include: { user: true } } }
                },
                rentPayments: { orderBy: { month: 'desc' } },
                recommendations: { orderBy: { createdAt: 'desc' } }
            }
        });
        return { success: true, data: dossier };
    } catch (error) {
        console.error("Failed to fetch dossier:", error);
        return { success: false, error: "Failed to fetch dossier" };
    }
}

export async function getDossierByToken(token: string) {
    try {
        const access = await prisma.dossierAccess.findUnique({
            where: { token },
            include: {
                dossier: {
                    include: {
                        user: { select: { name: true, image: true, email: true } },
                        documents: {
                            where: { status: "VALID" } // Only show valid docs? Or all? Maybe all for now.
                        }
                    }
                }
            }
        });

        if (!access) return { success: false, error: "Invalid link" };
        if (access.expiresAt && access.expiresAt < new Date()) {
            return { success: false, error: "Link expired" };
        }

        // Log the access (Fire and forget, don't await strictly if performance matters, but await is safer here)
        await prisma.dossierAccessLog.create({
            data: {
                accessId: access.id,
                ipAddress: "127.0.0.1", // Simulated, would need headers()
                userAgent: "Browser/Simulated"
            }
        });

        return { success: true, data: access.dossier };
    } catch (error) {
        return { success: false, error: "Failed to access dossier" };
    }
}

// --- ACTIONS ---

export async function createOrUpdateDossier(userId: string, data: { description?: string }) {
    try {
        const dossier = await prisma.tenantDossier.upsert({
            where: { userId },
            create: {
                userId,
                description: data.description
            },
            update: {
                description: data.description
            }
        });
        revalidatePath("/dossier");
        return { success: true, data: dossier };
    } catch (error) {
        return { success: false, error: "Failed to update dossier" };
    }
}

export async function addDocument(
    userId: string,
    fileData: { url: string, name: string, size: number, mimeType: string },
    type: string
) {
    try {
        // 1. Ensure Dossier Exists
        let dossier = await prisma.tenantDossier.findUnique({ where: { userId } });
        if (!dossier) {
            dossier = await prisma.tenantDossier.create({ data: { userId } });
        }

        // 2. Add Document
        const doc = await prisma.dossierDocument.create({
            data: {
                dossierId: dossier.id,
                type,
                url: fileData.url,
                name: fileData.name,
                size: fileData.size,
                mimeType: fileData.mimeType,
                status: "PENDING"
                // watermarkedUrl would be generated here by an image processor in a real app
            }
        });

        // 3. Update Status (Simple logic: if ID + Payslip exist -> Complete?)
        // For now just revalidate
        revalidatePath("/dossier");
        return { success: true, data: doc };
    } catch (error) {
        console.error("Add doc error:", error);
        return { success: false, error: "Failed to add document" };
    }
}

export async function deleteDocument(documentId: string, userId: string) {
    try {
        const doc = await prisma.dossierDocument.findUnique({
            where: { id: documentId },
            include: { dossier: true }
        });

        if (!doc || doc.dossier.userId !== userId) {
            return { success: false, error: "Unauthorized" };
        }

        await prisma.dossierDocument.delete({ where: { id: documentId } });
        revalidatePath("/dossier");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete" };
    }
}

// --- LOGGING ---

export async function getDossierAccessLogs(userId: string) {
    try {
        const dossier = await prisma.tenantDossier.findUnique({
            where: { userId },
            select: { id: true }
        });

        if (!dossier) return { success: false, error: "No dossier" };

        const logs = await prisma.dossierAccessLog.findMany({
            where: {
                access: {
                    dossierId: dossier.id
                }
            },
            include: {
                access: {
                    select: { recipientEmail: true, token: true }
                }
            },
            orderBy: { viewedAt: 'desc' },
            take: 20
        });

        return { success: true, data: logs };
    } catch (error) {
        return { success: false, error: "Failed to fetch logs" };
    }
}

export async function revokeAllLinks(userId: string) {
    try {
        const dossier = await prisma.tenantDossier.findUnique({ where: { userId } });
        if (!dossier) return { success: false, error: "No dossier" };

        await prisma.dossierAccess.deleteMany({
            where: { dossierId: dossier.id }
        });

        revalidatePath("/dossier");
        return { success: true };
    } catch (e) {
        return { success: false, error: "Failed to revoke" };
    }
}

// --- SHARING ---

export async function createShareLink(userId: string, recipientEmail?: string) {
    try {
        const dossier = await prisma.tenantDossier.findUnique({ where: { userId } });
        if (!dossier) return { success: false, error: "No dossier found" };

        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days validity

        const access = await prisma.dossierAccess.create({
            data: {
                dossierId: dossier.id,
                token,
                recipientEmail,
                expiresAt
            }
        });

        revalidatePath("/dossier");
        return { success: true, token: access.token };
    } catch (error) {
        return { success: false, error: "Failed to create link" };
    }
}

// --- GUARANTORS ---

export async function inviteGuarantor(dossierId: string, data: { firstName: string, lastName: string, email: string, relation: string }) {
    try {
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

        const guarantor = await prisma.dossierGuarantor.create({
            data: {
                dossierId,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                relation: data.relation,
                token,
                status: "PENDING"
            }
        });

        // In a real app: Send Email via Resend/SendGrid with link: process.env.NEXT_PUBLIC_APP_URL + "/guarantor-invite/" + token
        console.log(`[MOCK EMAIL] To: ${data.email} | Subject: Invitation Guarantor | Link: /upload-guarantor/${token}`);

        revalidatePath("/dossier");
        return { success: true, data: guarantor };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Failed to invite" };
    }
}

export async function deleteGuarantor(id: string) {
    try {
        await prisma.dossierGuarantor.delete({ where: { id } });
        revalidatePath("/dossier");
        return { success: true };
    } catch (e) {
        return { success: false, error: "Failed to delete" };
    }
}

export async function addGuarantor(dossierId: string, data: { name: string, email: string, relation: string, monthlyIncome: number }) {
    try {
        // Splitting name for legacy schema if needed, or assuming schema handles generic name
        const [firstName, ...lastNameParts] = data.name.split(" ");
        const lastName = lastNameParts.join(" ") || "Unknown";

        const guarantor = await prisma.dossierGuarantor.create({
            data: {
                dossierId,
                firstName,
                lastName,
                email: data.email,
                relation: data.relation,
                monthlyIncome: data.monthlyIncome,
                status: "VERIFIED" // Auto verify for manual add demo
            }
        });

        revalidatePath("/dossier");
        return { success: true, data: guarantor };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Failed to add" };
    }
}

// --- APPLICATIONS CRM ---

export async function getApplications(userId: string) {
    try {
        const dossier = await prisma.tenantDossier.findUnique({
            where: { userId },
            include: {
                applications: {
                    include: { listing: { select: { title: true, address: true, price: true } } },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        return { success: true, data: dossier?.applications || [] };
    } catch (e) {
        return { success: false, error: "Failed to fetch apps" };
    }
}

export async function createApplication(userId: string, data: { listingId?: string, externalLabel?: string, notes?: string }) {
    try {
        const dossier = await prisma.tenantDossier.findUnique({ where: { userId } });
        if (!dossier) return { success: false, error: "No dossier" };

        const app = await prisma.rentalApplication.create({
            data: {
                dossierId: dossier.id,
                listingId: data.listingId,
                externalLabel: data.externalLabel,
                notes: data.notes,
                status: "SENT"
            }
        });

        revalidatePath("/dossier");
        return { success: true, data: app };
    } catch (e) {
        return { success: false, error: "Failed to create application" };
    }
}

export async function updateApplicationStatus(appId: string, status: string) {
    try {
        await prisma.rentalApplication.update({
            where: { id: appId },
            data: { status }
        });
        revalidatePath("/dossier");
        return { success: true };
    } catch (e) {
        return { success: false, error: "Failed to update" };
    }
}

// --- AI COACH ---

export async function generateCoverLetter(dossierId: string) {
    // Mock for now, would use OpenAI API
    return { success: true, text: "Madame, Monsieur, ..." };
}

import { DossierGroup } from "@prisma/client";

// --- Phase 13: Group Dossier ---

export async function createGroup(userId: string, name: string, type: "COUPLE" | "ROOMMATES"): Promise<ActionResponse<DossierGroup>> {
    try {
        const dossier = await prisma.tenantDossier.findUnique({ where: { userId } });
        if (!dossier) return { success: false, error: "Dossier introuvable" };

        const group = await prisma.dossierGroup.create({
            data: {
                name,
                type,
                members: {
                    connect: { id: dossier.id }
                }
            }
        });

        revalidatePath("/dossier");
        return { success: true, data: group };
    } catch (error) {
        console.error("Error creating group:", error);
        return { success: false, error: "Erreur lors de la création du groupe" };
    }
}

export async function leaveGroup(userId: string): Promise<ActionResponse<void>> {
    try {
        const dossier = await prisma.tenantDossier.findUnique({ where: { userId } });
        if (!dossier || !dossier.groupId) return { success: false, error: "Aucun groupe actif" };

        // Disconnect
        await prisma.tenantDossier.update({
            where: { id: dossier.id },
            data: { groupId: null }
        });

        // Cleanup empty groups? (Optional)
        const groupMembers = await prisma.tenantDossier.count({ where: { groupId: dossier.groupId } });
        if (groupMembers === 0) {
            await prisma.dossierGroup.delete({ where: { id: dossier.groupId } });
        }

        revalidatePath("/dossier");
        return { success: true };
    } catch (error) {
        console.error("Error leaving group:", error);
        return { success: false, error: "Erreur lors de la sortie du groupe" };
    }
}

// Mock Invite for now (would typically generate a token link)
export async function inviteMemberToGroup(userId: string, email: string) {
    // In a real app, this sends an email with a join link.
    // For now, we'll just simulate success.
    return { success: true, data: `Invitation envoyée à ${email}` };
}

export async function joinGroup(userId: string, code: string) {
    try {
        const dossier = await prisma.tenantDossier.findUnique({ where: { userId } });
        if (!dossier) return { success: false, error: "Dossier introuvable" };

        const group = await prisma.dossierGroup.findUnique({ where: { id: code } }); // Assuming code IS the ID for now
        if (!group) return { success: false, error: "Code invalide" };

        await prisma.tenantDossier.update({
            where: { id: dossier.id },
            data: { groupId: group.id }
        });

        revalidatePath("/dossier");
        return { success: true, data: group };
    } catch (error) {
        return { success: false, error: "Erreur lors de l'adhésion" };
    }
}

// --- Phase 12C: Rent Resume ---
import { RentPayment } from "@prisma/client";

export async function getRentPayments(userId: string): Promise<ActionResponse<RentPayment[]>> {
    const dossier = await prisma.tenantDossier.findUnique({ where: { userId } });
    if (!dossier) return { success: false, error: "Dossier introuvable" };

    const payments = await prisma.rentPayment.findMany({
        where: { dossierId: dossier.id },
        orderBy: { month: 'desc' }
    });

    return { success: true, data: payments };
}

export async function addRentPayment(userId: string, data: { month: Date, amount: number, status: string, proofUrl?: string }): Promise<ActionResponse<RentPayment>> {
    try {
        const dossier = await prisma.tenantDossier.findUnique({ where: { userId } });
        if (!dossier) return { success: false, error: "Dossier introuvable" };

        const payment = await prisma.rentPayment.create({
            data: {
                dossierId: dossier.id,
                month: data.month,
                amount: data.amount,
                status: data.status,
                proofUrl: data.proofUrl
            }
        });

        revalidatePath("/dossier");
        return { success: true, data: payment };
    } catch (error) {
        console.error("Error adding rent payment:", error);
        return { success: false, error: "Erreur lors de l'ajout" };
    }
}

export async function deleteRentPayment(paymentId: string): Promise<ActionResponse<void>> {
    try {
        await prisma.rentPayment.delete({ where: { id: paymentId } });
        revalidatePath("/dossier");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erreur suppression" };
    }
}

export async function saveVideoPitch(userId: string, videoUrl: string): Promise<ActionResponse<void>> {
    try {
        await prisma.tenantDossier.update({
            where: { userId },
            data: { videoPitchUrl: videoUrl }
        });
        revalidatePath("/dossier");
        return { success: true };
    } catch (error) {
        console.error("Error saving video pitch:", error);
        return { success: false, error: "Erreur sauvegarde" };
    }
}

export async function connectOpenBanking(userId: string): Promise<ActionResponse<any>> {
    try {
        // Simulate API delay and analysis
        await new Promise(resolve => setTimeout(resolve, 2000));

        const mockIncome = 2850; // Mock analysed income
        const mockScore = 94; // Mock solvency score

        await prisma.tenantDossier.update({
            where: { userId },
            data: {
                openBankingStatus: "CONNECTED",
                verifiedIncome: mockIncome,
                solvencyScore: mockScore
            }
        });

        revalidatePath("/dossier");
        return { success: true, data: { income: mockIncome, score: mockScore } };
    } catch (error) {
        console.error("Error connecting banking:", error);
        return { success: false, error: "Erreur connexion" };
    }
}

export async function addRecommendation(userId: string, data: { name: string, email: string, role: string, rating: number, comment: string }): Promise<ActionResponse<void>> {
    try {
        const dossier = await prisma.tenantDossier.findUnique({ where: { userId } });
        if (!dossier) return { success: false, error: "Dossier introuvable" };

        await prisma.tenantRecommendation.create({
            data: {
                dossierId: dossier.id,
                authorName: data.name,
                authorEmail: data.email,
                authorRole: data.role,
                rating: data.rating,
                comment: data.comment,
                status: "VERIFIED"
            }
        });

        revalidatePath("/dossier");
        return { success: true };
    } catch (error) {
        console.error("Error adding recommendation:", error);
        return { success: false, error: "Erreur ajout recommandation" };
    }
}
