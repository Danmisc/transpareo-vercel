// Document configuration constants (can be imported by both server actions and client components)

export type DocumentType = "FISCAL" | "LEGAL" | "KYC" | "CONTRACT" | "STATEMENT" | "OTHER";
export type DocumentStatus = "PENDING" | "VERIFIED" | "SIGNED" | "AVAILABLE" | "EXPIRED";

export interface UserDocument {
    id: string;
    name: string;
    type: DocumentType;
    status: DocumentStatus;
    createdAt: Date;
    size?: number;
    url?: string;
    expiresAt?: Date | null;
}

// Document type labels for display
export const DOC_TYPE_LABELS: Record<DocumentType, { label: string; color: string }> = {
    FISCAL: { label: "Fiscalité", color: "orange" },
    LEGAL: { label: "Légal", color: "blue" },
    KYC: { label: "Identité", color: "emerald" },
    CONTRACT: { label: "Contrat", color: "indigo" },
    STATEMENT: { label: "Relevé", color: "zinc" },
    OTHER: { label: "Autre", color: "zinc" }
};

export const DOC_STATUS_LABELS: Record<DocumentStatus, { label: string; color: string }> = {
    PENDING: { label: "En attente", color: "yellow" },
    VERIFIED: { label: "Vérifié", color: "emerald" },
    SIGNED: { label: "Signé", color: "blue" },
    AVAILABLE: { label: "Disponible", color: "green" },
    EXPIRED: { label: "Expiré", color: "red" }
};
