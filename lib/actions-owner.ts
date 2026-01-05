"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// --- PROPERTIES ---

export async function getPropertyDetails(propertyId: string) {
    const session = await auth();
    if (!session?.user) return null;

    try {
        const property = await prisma.property.findUnique({
            where: {
                id: propertyId,
                ownerId: session.user.id
            },
            include: {
                leases: {
                    include: {
                        tenant: true,
                        payments: { orderBy: { date: 'desc' } }
                    },
                    orderBy: { startDate: 'desc' }
                },
                tickets: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        messages: { orderBy: { createdAt: 'asc' } },
                        timeline: { orderBy: { createdAt: 'desc' } },
                        attachments: true
                    }
                },
                documents: {
                    orderBy: { createdAt: 'desc' }
                },
                expenses: {
                    orderBy: { date: 'desc' }
                }
            }
        });

        if (!property) return null;

        // --- KPI CALCULATIONS (Simulated/Projected) ---

        // 1. Occupancy Status
        const activeLease = property.leases.find(l => l.status === 'ACTIVE');
        const isOccupied = !!activeLease;

        // 2. Financials
        // If we have an acquisition price, we can calculate yield. Default to random sane value if missing for demo.
        const price = property.acquisitionPrice || (property.surface * 10000); // Mock: 10k/m2
        const monthlyRent = activeLease ? activeLease.rentAmount : (property.rent || 0); // Use active rent or estimated
        const annualRent = monthlyRent * 12;

        // Gross Yield (Rentabilité Brute)
        const grossYield = price > 0 ? (annualRent / price) * 100 : 0;

        // Cashflow (Monthly)
        // Mock Assumption: Loan is 70% of rent, Charges are 15%
        const loanPayment = isOccupied ? monthlyRent * 0.70 : 0;
        const charges = activeLease ? activeLease.chargesAmount : 150;
        const cashflow = monthlyRent - loanPayment - charges;

        // Serialize Dates
        return {
            ...property,
            createdAt: property.createdAt.toISOString(),
            updatedAt: property.updatedAt.toISOString(),
            leases: property.leases.map(l => ({
                ...l,
                createdAt: l.createdAt.toISOString(),
                updatedAt: l.updatedAt.toISOString(),
                startDate: l.startDate.toISOString(),
                endDate: l.endDate?.toISOString() || null,
                payments: l.payments.map(p => ({ ...p, date: p.date.toISOString(), createdAt: p.createdAt.toISOString() }))
            })),
            tickets: property.tickets.map(t => ({
                ...t,
                createdAt: t.createdAt.toISOString(),
                updatedAt: t.updatedAt.toISOString(),
                messages: t.messages.map(m => ({ ...m, createdAt: m.createdAt.toISOString() })),
                timeline: t.timeline.map(e => ({ ...e, createdAt: e.createdAt.toISOString() })),
                attachments: t.attachments.map(a => ({ ...a, createdAt: a.createdAt.toISOString() }))
            })),
            documents: property.documents.map(d => ({
                ...d,
                createdAt: d.createdAt.toISOString()
            })),
            expenses: property.expenses.map(e => ({
                ...e,
                date: e.date.toISOString(),
                createdAt: e.createdAt.toISOString(),
                updatedAt: e.updatedAt.toISOString()
            })),
            // Metrics attached
            metrics: {
                isOccupied,
                grossYield: parseFloat(grossYield.toFixed(2)),
                cashflow: parseFloat(cashflow.toFixed(2)),
                monthlyRent,
                activeLeaseId: activeLease?.id
            }
        };

    } catch (error) {
        console.error("Error fetching property details:", error);
        return null;
    }
}

export async function getOwnerProperties() {
    const session = await auth();
    if (!session?.user) return [];

    try {
        const properties = await prisma.property.findMany({
            where: {
                ownerId: session.user.id
            },
            include: {
                leases: {
                    include: {
                        tenant: true,
                        payments: {
                            orderBy: { date: 'desc' },
                            take: 1 // Only need last payment for status
                        }
                    }
                },
                tickets: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Serialize and Calculate KPIs
        return properties.map(p => {
            // KPI Logic (Duplicated from details for list view - could be abstracted)
            const activeLease = p.leases.find(l => !l.endDate || new Date(l.endDate) > new Date());
            const monthlyRent = activeLease ? activeLease.rentAmount : 0;
            const price = p.acquisitionPrice || (p.surface * 5000); // Fallback estimate

            // Annual Rent
            const annualRent = monthlyRent * 12;

            // Yield
            const grossYield = price > 0 ? ((annualRent / price) * 100).toFixed(1) : "0.0";

            // Cashflow (Simple Estimate)
            // Loan ~70% of rent, Charges ~15%
            const isOccupied = !!activeLease;
            const loan = isOccupied ? monthlyRent * 0.7 : 0;
            const charges = activeLease ? activeLease.chargesAmount : 0;
            const cashflow = (monthlyRent - loan - charges).toFixed(0);

            return {
                ...p,
                createdAt: p.createdAt.toISOString(),
                updatedAt: p.updatedAt.toISOString(),
                // Add Metrics for List View
                metrics: {
                    grossYield,
                    cashflow,
                    status: isOccupied ? 'OCCUPIED' : 'VACANT',
                    monthlyRent
                },
                leases: p.leases.map(l => ({
                    ...l,
                    createdAt: l.createdAt.toISOString(),
                    updatedAt: l.updatedAt.toISOString(),
                    startDate: l.startDate.toISOString(),
                    endDate: l.endDate?.toISOString() || null
                })),
                tickets: p.tickets.map(t => ({
                    ...t,
                    createdAt: t.createdAt.toISOString(),
                    updatedAt: t.updatedAt.toISOString()
                }))
            };
        });

    } catch (error) {
        console.error("Error fetching properties:", error);
        return [];
    }
}

export async function createProperty(data: {
    title: string;
    address: string;
    type: string;
    surface: number;
    rent: number; // For initial lease projection or empty
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    try {
        const property = await prisma.property.create({
            data: {
                ownerId: session.user.id,
                title: data.title,
                address: data.address,
                type: data.type,
                surface: data.surface,
                imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80", // Placeholder
                // Create a mock lease if rent is provided?
                // For now just property
            }
        });
        revalidatePath("/owner");
        return { success: true, property };
    } catch (error) {
        console.error("Error creating property:", error);
        return { success: false, error: "Failed to create property" };
    }
}

export async function updateProperty(propertyId: string, data: {
    title?: string;
    description?: string;
    surface?: number;
    roomCount?: number;
    address?: string;
    city?: string;
    zipCode?: string;
    type?: string; // APARTMENT, HOUSE, etc.
    acquisitionPrice?: number;
    fiscalMode?: string;
}) {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    try {
        await prisma.property.update({
            where: { id: propertyId, ownerId: session.user.id },
            data: {
                ...data
            }
        });

        revalidatePath(`/owner/properties/${propertyId}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating property:", error);
        return { success: false, error: "Failed to update property" };
    }
}

export async function inviteTenant(data: {
    propertyId: string;
    firstName: string;
    lastName: string;
    email: string;
    rentAmount: number;
    startDate: Date;
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    try {
        // 1. Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        // 2. Create Lease
        const lease = await prisma.lease.create({
            data: {
                propertyId: data.propertyId,
                tenantName: `${data.firstName} ${data.lastName}`,
                tenantEmail: data.email,
                tenantId: existingUser?.id, // Link if exists
                startDate: data.startDate,
                rentAmount: data.rentAmount,
                chargesAmount: 0, // Default for now
                status: 'ACTIVE'
            }
        });

        revalidatePath("/owner");
        return { success: true, lease };
    } catch (error) {
        console.error("Error inviteTenant:", error);
        return { success: false, error: "Failed to invite tenant" };
    }
}

// --- TENANTS ---

export async function getOwnerTenants() {
    const session = await auth();
    if (!session?.user) return [];

    try {
        // Fetch tenants via Leases on properties owned by user
        const leases = await prisma.lease.findMany({
            where: {
                property: {
                    ownerId: session.user.id
                },
                status: 'ACTIVE'
            },
            include: {
                property: true,
                tenant: true
            }
        });
        return leases;
    } catch (error) {
        return [];
    }
}

// --- TICKETS ---

export async function createTicket(data: {
    propertyId: string;
    title: string;
    description: string;
    priority: string; // HIGH, MEDIUM, LOW
    category?: string;
}) {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    try {
        await prisma.maintenanceTicket.create({
            data: {
                propertyId: data.propertyId,
                title: data.title,
                description: data.description,
                priority: data.priority,
                category: data.category,
                status: "OPEN"
            }
        });

        revalidatePath(`/owner/properties/${data.propertyId}`);
        return { success: true };
    } catch (error) {
        console.error("Error creating ticket:", error);
        return { success: false, error: "Failed to create ticket" };
    }
}

export async function addTicketMessage(data: { ticketId: string; content: string }) {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    try {
        await prisma.ticketMessage.create({
            data: {
                ticketId: data.ticketId,
                content: data.content,
                senderName: session.user.name || "Moi",
                senderRole: "OWNER", // Assume owner for now
                isMe: true
            }
        });

        revalidatePath('/owner/properties');
        return { success: true };
    } catch (e) {
        return { success: false };
    }
}

export async function updateTicketStatus(ticketId: string, status: string) {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    try {
        await prisma.maintenanceTicket.update({
            where: { id: ticketId },
            data: { status }
        });

        await prisma.ticketEvent.create({
            data: {
                ticketId,
                type: "STATUS_CHANGE",
                title: `Statut modifié : ${status}`,
                description: `Le ticket est passé à ${status}`
            }
        });

        revalidatePath('/owner/properties');
        return { success: true };
    } catch (e) {
        return { success: false };
    }
}

export async function assignTicketProvider(data: { ticketId: string; providerName: string; providerContact: string }) {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    try {
        await prisma.maintenanceTicket.update({
            where: { id: data.ticketId },
            data: {
                provider: data.providerName,
                proContact: data.providerContact
            }
        });

        await prisma.ticketEvent.create({
            data: {
                ticketId: data.ticketId,
                type: "ALERT",
                title: "Prestataire assigné",
                description: `Assigné à : ${data.providerName}`
            }
        });

        revalidatePath('/owner/properties');
        return { success: true };
    } catch (e) {
        return { success: false };
    }
}

export async function uploadTicketAttachment(formData: FormData) {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const ticketId = formData.get("ticketId") as string;
    const file = formData.get("file") as File;

    if (!ticketId || !file) return { success: false, error: "Missing data" };

    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure directory exists
        const uploadDir = path.join(process.cwd(), "public/uploads");
        await mkdir(uploadDir, { recursive: true });

        // Unique filename
        const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
        const filepath = path.join(uploadDir, filename);

        await writeFile(filepath, buffer);
        const url = `/uploads/${filename}`;

        // DB Record
        await prisma.ticketAttachment.create({
            data: {
                ticketId,
                name: file.name,
                url: url,
                type: file.type.startsWith("image/") ? "IMAGE" : "DOCUMENT"
            }
        });

        // Event
        await prisma.ticketEvent.create({
            data: {
                ticketId,
                type: "ALERT",
                title: "Fichier ajouté",
                description: `Document : ${file.name}`
            }
        });

        revalidatePath('/owner/properties');
        return { success: true, url };
    } catch (e) {
        console.error("Upload error:", e);
        return { success: false, error: "Upload failed" };
    }
}

// --- DOCUMENTS ---

export async function uploadPropertyDocument(formData: FormData) {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const propertyId = formData.get("propertyId") as string;
    const file = formData.get("file") as File;
    const category = formData.get("category") as string || "OTHER";

    // Optional: get expiration date if provided
    const expirationDateStr = formData.get("expirationDate") as string;
    const expirationDate = expirationDateStr ? new Date(expirationDateStr) : null;

    if (!propertyId || !file) return { success: false, error: "Missing data" };

    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure directory exists
        const uploadDir = path.join(process.cwd(), "public/uploads");
        await mkdir(uploadDir, { recursive: true });

        // Unique filename
        const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
        const filepath = path.join(uploadDir, filename);

        await writeFile(filepath, buffer);
        const url = `/uploads/${filename}`;

        // DB Record
        await prisma.propertyDocument.create({
            data: {
                propertyId,
                name: file.name,
                url: url,
                type: file.type.startsWith("image/") ? "IMAGE" : "DOCUMENT",
                category,
                expirationDate,
                fileSize: file.size
            }
        });

        revalidatePath(`/owner/properties/${propertyId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Error creating property document:", error);
        return { success: false, error: error.message || "Failed to upload document" };
    }
}

export async function deletePropertyDocument(documentId: string) {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    try {
        // In a real app we would also delete the file from disk/blob storage
        // For MVP, we just remove the DB record
        const doc = await prisma.propertyDocument.delete({
            where: { id: documentId }
        });

        if (doc) {
            revalidatePath(`/owner/properties/${doc.propertyId}`);
        }

        return { success: true };
    } catch (error) {
        console.error("Error deleting document:", error);
        return { success: false, error: "Failed to delete document" };
    }
}

// --- PAYMENTS ---

export async function recordPayment(data: {
    leaseId: string;
    amount: number;
    type: string; // RENT, CHARGES
    date: Date;
    frequency?: string;
}) {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    try {
        await prisma.payment.create({
            data: {
                leaseId: data.leaseId,
                amount: data.amount,
                type: data.type,
                date: data.date,
                status: "PAID",
                frequency: data.frequency || "ONCE"
            }
        });

        revalidatePath('/owner/properties');
        return { success: true };
    } catch (error) {
        console.error("Error recording payment:", error);
        return { success: false, error: "Failed to record payment" };
    }
}

// --- EXPENSES ---

export async function addExpense(data: { propertyId: string; amount: number; date: Date; category: string; description?: string; isDeductible?: boolean; frequency?: string }) {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    try {
        await prisma.expense.create({
            data: {
                propertyId: data.propertyId,
                amount: data.amount,
                date: data.date,
                category: data.category,
                description: data.description,
                isDeductible: data.isDeductible ?? true,
                frequency: data.frequency || "ONCE"
            }
        });

        revalidatePath(`/owner/properties/${data.propertyId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Error creating expense:", error);
        return { success: false, error: error.message || "Failed to add expense" };
    }
}

export async function deleteExpense(expenseId: string) {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    try {
        await prisma.expense.delete({
            where: { id: expenseId }
        });
        revalidatePath('/owner/properties');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete expense" };
    }
}

export async function getFinancialStats(propertyId: string) {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    try {
        // Fetch all financial movements (Income & Expenses)
        // Group by month for chart
        const expenses = await prisma.expense.findMany({
            where: { propertyId: propertyId },
            orderBy: { date: 'asc' }
        });

        // Income comes from Lease Payments
        // We will fetch payments via leases
        const leases = await prisma.lease.findMany({
            where: { propertyId: propertyId },
            include: { payments: true }
        });

        const payments = leases.flatMap(l => l.payments);

        // --- CALCULATION ENGINE ---

        // 1. Aggregates (Yearly / Monthly)
        const currentYear = new Date().getFullYear();

        let totalIncome = 0;
        let totalExpenses = 0;
        let deductibleExpenses = 0;

        // Group by Month for Charts (Last 12 months)
        const monthlyData = Array.from({ length: 12 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (11 - i));
            return {
                name: d.toLocaleString('default', { month: 'short' }),
                month: d.getMonth(),
                year: d.getFullYear(),
                income: 0,
                expenses: 0,
                cashflow: 0
            };
        });

        // Process Payments (Income)
        payments.forEach(p => {
            if (p.status === "PAID") {
                const year = p.date.getFullYear();
                if (year === currentYear) totalIncome += p.amount;

                // Add to monthly chart
                const monthIndex = monthlyData.findIndex(m => m.month === p.date.getMonth() && m.year === p.date.getFullYear());
                if (monthIndex !== -1) monthlyData[monthIndex].income += p.amount;
            }
        });

        // Process Expenses
        expenses.forEach(e => {
            const year = e.date.getFullYear();
            if (year === currentYear) {
                totalExpenses += e.amount;
                if (e.isDeductible) deductibleExpenses += e.amount;
            }

            // Add to monthly chart
            const monthIndex = monthlyData.findIndex(m => m.month === e.date.getMonth() && m.year === e.date.getFullYear());
            if (monthIndex !== -1) monthlyData[monthIndex].expenses += e.amount;
        });

        // Calculate Cashflow per month
        monthlyData.forEach(m => m.cashflow = m.income - m.expenses);


        // 2. Loan Simulation (Mocked for "Ultra" Demo as we lack Loan Model)
        // Assume 70% LTV, 4% rate, 20 years for all properties
        // In real app, this would be computed from Property.loans relation
        const totalPropertyValue = 450000; // Mock total portfolio value
        const loanAmount = totalPropertyValue * 0.7;
        const interestRate = 0.04;
        const monthlyPayment = (loanAmount * interestRate / 12) / (1 - Math.pow(1 + interestRate / 12, -240));
        const annualLoanPayment = monthlyPayment * 12;
        const annualInterest = loanAmount * interestRate; // Simplified for first year
        const annualCapital = annualLoanPayment - annualInterest;


        // 3. Fiscal Simulation (The "Expert" Logic)
        const TMI = 0.30; // User Tranche Marginale (30%)
        const CSG = 0.172; // Prélèvements Sociaux (17.2%)

        // Micro-Foncier (Abattement 30%)
        const taxMicro = Math.max(0, (totalIncome * 0.7) * (TMI + CSG));

        // LMNP Réel (Amortissement ~3% du bien + Meubles)
        const amortization = totalPropertyValue * 0.85 * 0.03; // We amortize 85% of value (terrain excluded) over ~30y
        const taxableLMNP = Math.max(0, totalIncome - deductibleExpenses - amortization - annualInterest);
        const taxLMNP = taxableLMNP * (TMI + CSG);

        // SCI IS (15% up to 42500, then 25%)
        // Deduct expenses + amortization + interest
        const resultSCI = totalIncome - deductibleExpenses - amortization - annualInterest;
        const taxSCI = resultSCI > 0 ? (resultSCI < 42500 ? resultSCI * 0.15 : 42500 * 0.15 + (resultSCI - 42500) * 0.25) : 0;


        // 4. "Radar" - Suggestions
        const suggestions = [];
        if (deductibleExpenses / totalIncome < 0.1) {
            suggestions.push({
                type: 'WARNING',
                message: "Vos charges semblent faibles (<10%). Avez-vous pensé à déduire tous vos déplacements ?"
            });
        }
        if (totalIncome < 15000 && taxMicro > taxLMNP) {
            suggestions.push({
                type: 'TIP',
                message: "Le régime Micro-Foncier semble moins intéressant que le Réel cette année."
            });
        }


        return {
            success: true,
            data: {
                kpi: {
                    income: totalIncome,
                    expenses: totalExpenses,
                    cashflow: totalIncome - totalExpenses - annualLoanPayment,
                    yieldGross: totalPropertyValue > 0 ? (totalIncome / totalPropertyValue * 100).toFixed(1) : 0,
                },
                charts: {
                    monthly: monthlyData
                },
                fiscal: {
                    micro: taxMicro,
                    lmnp: taxLMNP,
                    sci: taxSCI,
                    amortization,
                    deductibleExpenses
                },
                loan: {
                    totalDebt: loanAmount,
                    capitalAmortized: annualCapital,
                    interestsPaid: annualInterest,
                    monthlyPayment
                },
                transactions: [
                    ...payments.map(p => ({
                        id: p.id,
                        date: p.date,
                        amount: p.amount,
                        type: 'INCOME',
                        category: 'Loyer',
                        description: `Loyer ${p.lease.tenantName}`,
                        status: p.status
                    })),
                    ...expenses.map(e => ({
                        id: e.id,
                        date: e.date,
                        amount: e.amount,
                        type: 'EXPENSE',
                        category: e.category,
                        description: e.description || e.category,
                        status: 'COMPLETED'
                    }))
                ].sort((a, b) => b.date.getTime() - a.date.getTime()), // Sort by date desc
                suggestions
            }
        };

    } catch (error) {
        console.error("Error fetching financial stats:", error);
        return { success: false, error: "Failed to fetch financials" };
    }
}


