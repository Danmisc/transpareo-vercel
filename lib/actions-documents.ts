"use client";

// Mock database for documents
// In a real app, this would be a database call + S3 storage with server-side encryption
export interface Document {
    id: string;
    name: string;
    type: 'CONTRACT' | 'INVOICE' | 'TAX' | 'INSURANCE' | 'OTHER';
    size: string;
    date: Date;
    property: string;
    isEncrypted: boolean; // Trust signal
    tags: string[];
    amount?: number; // Extracted by AI
}

const MOCK_DOCS: Document[] = [
    {
        id: "1",
        name: "Bail - Alice M. (2023).pdf",
        type: "CONTRACT",
        size: "2.4 MB",
        date: new Date("2023-09-01"),
        property: "Appartement Haussmannien",
        isEncrypted: true,
        tags: ["Locataire", "Signé", "Conforme"]
    },
    {
        id: "2",
        name: "Diagnostic DPE.pdf",
        type: "DIAGNOSTIC", // Helper type mapped to OTHER in interface but we can expand
        size: "1.2 MB",
        date: new Date("2023-06-12"),
        property: "Appartement Haussmannien",
        isEncrypted: true,
        tags: ["Performance C", "Valide 2033"]
    } as any, // Cast for loose typing in mock
    {
        id: "3",
        name: "Facture Peinture.pdf",
        type: "INVOICE",
        size: "0.8 MB",
        date: new Date("2023-08-15"),
        property: "Studio Lyon",
        isEncrypted: true,
        amount: 1250.00,
        tags: ["Travaux", "Déductible"]
    },
    {
        id: "4",
        name: "Taxe Foncière 2023.pdf",
        type: "TAX",
        size: "1.5 MB",
        date: new Date("2023-10-10"),
        property: "Global",
        isEncrypted: true,
        amount: 2430.00,
        tags: ["Fiscalité", "Payé"]
    },
];

export async function getDocuments(): Promise<Document[]> {
    // Simulate network delay and encryption check
    await new Promise(resolve => setTimeout(resolve, 800));
    return MOCK_DOCS;
}

export async function uploadDocumentAES(formData: FormData): Promise<Document> {
    // Simulate AES-256 Encryption & AI Analysis
    await new Promise(resolve => setTimeout(resolve, 2500)); // Longer delay for "AI Processing"

    const file = formData.get("file") as File;
    const name = file.name;

    // AI Mock Logic: Guess type from name
    let type: Document['type'] = 'OTHER';
    let tags = ["Analysé par IA"];
    let property = "Non assigné";
    let amount = undefined;

    if (name.toLowerCase().includes("facture")) {
        type = 'INVOICE';
        tags.push("Déductible");
        amount = Math.floor(Math.random() * 1000) + 100;
        property = "Studio Lyon"; // Mock AI guessing property
    } else if (name.toLowerCase().includes("bail") || name.toLowerCase().includes("contrat")) {
        type = 'CONTRACT';
        tags.push("Juridique");
        property = "Appartement Haussmannien";
    }

    const newDoc: Document = {
        id: Math.random().toString(36).substr(2, 9),
        name: name,
        type,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        date: new Date(),
        property,
        isEncrypted: true,
        tags,
        amount
    };

    // Return the "decrypted" view for the frontend
    return newDoc;
}

export async function generateSecureShareLink(docId: string): Promise<string> {
    // Simulate generating a signed, time-limited URL
    await new Promise(resolve => setTimeout(resolve, 500));
    return `https://secure.transpareo.com/shared/${docId}?token=${Math.random().toString(36).substr(2)}`;
}

export async function deleteDocumentSecure(docId: string): Promise<boolean> {
    // Simulate secure wipe
    await new Promise(resolve => setTimeout(resolve, 600));
    return true;
}
