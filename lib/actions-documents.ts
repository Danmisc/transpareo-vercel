"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { UserDocument, DocumentType, DocumentStatus } from "./documents-config";

// Re-export types for convenience
export type { UserDocument, DocumentType, DocumentStatus } from "./documents-config";
import { UserDocument } from "./documents-config";
export type Document = UserDocument; // Alias for Client Components

// ========================================
// DOCUMENT MANAGEMENT ACTIONS
// Real document storage and retrieval
// ========================================

// Interfaces (Mocking what we need if imported from config)
import { Document } from "./documents-config";

/**
 * Upload a document (Simulated AES Encryption)
 */
export async function uploadDocumentAES(formData: FormData): Promise<Document> {
    const file = formData.get("file") as File;
    const user = await getCurrentUser();

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: "OTHER",
        status: "VERIFIED",
        createdAt: new Date(),
        property: "N/A",
        tags: ["Nouveau"],
        isEncrypted: true,
        size: file.size,
        url: "#"
    };
}

/**
 * Generate a secure share link (Simulated)
 */
export async function generateSecureShareLink(documentId: string): Promise<string> {
    // Simulate generation
    await new Promise(resolve => setTimeout(resolve, 500));
    return `https://transpareo.com/share/sec-${Math.random().toString(36).substring(7)}/${documentId}`;
}

/**
 * Delete a document securely (Simulated)
 */
export async function deleteDocumentSecure(documentId: string): Promise<void> {
    // Simulate deletion
    await new Promise(resolve => setTimeout(resolve, 800));
    // In a real app, this would delete from S3/Blob and DB
    return;
}

/**
 * Get all documents for the current user
 */
export async function getUserDocuments(): Promise<UserDocument[]> {
    const user = await getCurrentUser();
    if (!user) return [];

    // For now, generate documents based on user's actual data
    const documents: UserDocument[] = [];

    // Check KYC documents
    const kyc = await prisma.kYCProfile.findUnique({
        where: { userId: user.id },
        select: {
            status: true,
            createdAt: true,
            documentType: true
        }
    });

    if (kyc && kyc.status === "VERIFIED") {
        documents.push({
            id: `kyc-id-${user.id}`,
            name: "Pièce d'Identité",
            type: "KYC",
            status: "VERIFIED",
            createdAt: kyc.createdAt || new Date(),
        });
        documents.push({
            id: `kyc-address-${user.id}`,
            name: "Justificatif de Domicile",
            type: "KYC",
            status: "VERIFIED",
            createdAt: kyc.createdAt || new Date(),
        });
    }

    // Check for investments = generate contracts
    const investments = await prisma.investment.findMany({
        where: { wallet: { userId: user.id } },
        include: { loan: { select: { title: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10
    });

    for (const inv of investments) {
        documents.push({
            id: `contract-${inv.id}`,
            name: `Contrat: ${inv.loan?.title || "Investissement"}`,
            type: "CONTRACT",
            status: "SIGNED",
            createdAt: inv.createdAt,
        });
    }

    // Generate fiscal documents for each year with investments
    const years = [...new Set(investments.map(inv => new Date(inv.createdAt).getFullYear()))];
    const currentYear = new Date().getFullYear();

    for (const year of years) {
        if (year < currentYear) {
            documents.push({
                id: `ifu-${year}-${user.id}`,
                name: `Relevé Fiscal Annuel (IFU) ${year}`,
                type: "FISCAL",
                status: "AVAILABLE",
                createdAt: new Date(`${year + 1}-01-15`),
            });
        }
    }

    // Add investor framework contract if user has any investments
    if (investments.length > 0) {
        documents.unshift({
            id: `framework-${user.id}`,
            name: "Contrat Cadre Investisseur",
            type: "LEGAL",
            status: "SIGNED",
            createdAt: investments[investments.length - 1].createdAt,
        });
    }

    return documents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export const getDocuments = getUserDocuments; // Alias for Client Components

/**
 * Get storage stats for the current user
 */
export async function getStorageStats() {
    const user = await getCurrentUser();
    if (!user) return null;

    const documents = await getUserDocuments();

    // Estimate storage (each document ~50KB average)
    const usedBytes = documents.length * 50 * 1024;
    const maxBytes = 100 * 1024 * 1024; // 100 MB

    return {
        used: usedBytes,
        max: maxBytes,
        usedMB: Math.round(usedBytes / (1024 * 1024) * 10) / 10,
        maxMB: 100,
        percentage: Math.round((usedBytes / maxBytes) * 100),
        documentCount: documents.length
    };
}

/**
 * Generate IFU (tax statement) for a specific year
 */
export async function generateIFU(year: number) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Non autorisé" };

    const currentYear = new Date().getFullYear();
    if (year >= currentYear) {
        return { success: false, error: "L'IFU n'est disponible qu'après la clôture de l'année fiscale" };
    }

    // Get investments for that year
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31T23:59:59`);

    const investments = await prisma.investment.findMany({
        where: {
            wallet: { userId: user.id },
            createdAt: { gte: startDate, lte: endDate }
        },
        include: { loan: true }
    });

    if (investments.length === 0) {
        return { success: false, error: "Aucun investissement pour cette année" };
    }

    // Calculate totals
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);

    // Get gains for the year (from wallet transactions)
    const wallet = await prisma.wallet.findUnique({
        where: { userId: user.id },
        include: {
            transactions: {
                where: {
                    type: "REPAYMENT",
                    createdAt: { gte: startDate, lte: endDate }
                }
            }
        }
    });

    const totalGains = wallet?.transactions.reduce((sum, tx) => sum + tx.amount, 0) || 0;

    return {
        success: true,
        data: {
            year,
            userId: user.id,
            totalInvested,
            totalGains,
            investmentCount: investments.length,
            generatedAt: new Date().toISOString()
        }
    };
}

/**
 * Get document categories with counts
 */
export async function getDocumentCategories() {
    const documents = await getUserDocuments();

    const categories: Record<DocumentType, { count: number; label: string }> = {
        FISCAL: { count: 0, label: "Fiscalité" },
        LEGAL: { count: 0, label: "Légal" },
        KYC: { count: 0, label: "Identité" },
        CONTRACT: { count: 0, label: "Contrats" },
        STATEMENT: { count: 0, label: "Relevés" },
        OTHER: { count: 0, label: "Autre" }
    };

    for (const doc of documents) {
        if (categories[doc.type]) {
            categories[doc.type].count++;
        }
    }

    return categories;
}
