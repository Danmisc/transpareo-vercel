"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function currentUser() {
    const session = await auth();
    return session?.user;
}

// --- TICKETS ---

export async function getMaintenanceTickets() {
    const user = await currentUser();
    if (!user) return [];

    // Get properties owned by user
    const tickets = await prisma.maintenanceTicket.findMany({
        where: {
            property: {
                ownerId: user.id
            }
        },
        include: {
            property: true,
            contractor: true,
            messages: true
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    return tickets;
}

export async function createMaintenanceTicket(data: {
    title: string;
    description: string;
    category?: string;
    subCategory?: string; // Stored in description or separate if we add field
    priority: string;
    urgency?: string;     // AI determined
    propertyId?: string;  // If not provided, will pick first available or dummy
}) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // Find a property if not specified (Demo mode)
    let propertyId = data.propertyId;
    if (!propertyId) {
        const property = await prisma.property.findFirst({
            where: { ownerId: user.id }
        });
        if (property) propertyId = property.id;
        else throw new Error("No property found to attach ticket.");
    }

    const ticket = await prisma.maintenanceTicket.create({
        data: {
            title: data.title,
            description: data.description + (data.subCategory ? `\n\nSub-Category: ${data.subCategory}` : ""),
            category: data.category,
            priority: data.urgency === 'HIGH' ? 'HIGH' : 'MEDIUM', // Map urgency to priority
            status: "OPEN",
            propertyId: propertyId!,
            timeline: {
                create: {
                    type: "STATUS_CHANGE",
                    title: "Ticket Created",
                    description: "Ticket created via Smart Diagnostic Wizard."
                }
            }
        }
    });

    revalidatePath("/owner/maintenance");
    return ticket;
}

export async function updateTicketStatus(ticketId: string, status: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    await prisma.maintenanceTicket.update({
        where: { id: ticketId },
        data: { status }
    });

    revalidatePath("/owner/maintenance");
}

export async function updateTicketPriority(ticketId: string, priority: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    await prisma.maintenanceTicket.update({
        where: { id: ticketId },
        data: { priority }
    });

    revalidatePath("/owner/maintenance");
}

export async function deleteMaintenanceTicket(ticketId: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    await prisma.maintenanceTicket.delete({
        where: { id: ticketId }
    });

    revalidatePath("/owner/maintenance");
}

// --- ASSETS (PREDICTIVE) ---

export async function getOwnerAssets() {
    const user = await currentUser();
    if (!user) return [];

    const assets = await prisma.propertyAsset.findMany({
        where: {
            property: {
                ownerId: user.id
            }
        },
        include: {
            property: true
        }
    });

    return assets;
}

export async function addAsset(data: {
    name: string;
    type: string;
    installDate: Date;
    lifespan: number;
    propertyId: string;
}) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // Calculate initial health
    const age = (new Date().getTime() - data.installDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    let health = 100 - (age / data.lifespan * 100);
    health = Math.max(0, Math.min(100, health)); // Clamp 0-100

    let status = "GOOD";
    if (health < 30) status = "CRITICAL";
    else if (health < 60) status = "WARNING";

    // Next service default: 1 year from now
    const nextService = new Date();
    nextService.setFullYear(nextService.getFullYear() + 1);

    await prisma.propertyAsset.create({
        data: {
            propertyId: data.propertyId,
            name: data.name,
            type: data.type,
            installDate: data.installDate,
            lifespan: data.lifespan,
            healthScore: Math.round(health),
            status: status,
            nextServiceDate: nextService
        }
    });

    revalidatePath("/owner/maintenance");
    return { success: true };
}

export async function deleteAsset(assetId: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    await prisma.propertyAsset.delete({
        where: { id: assetId }
    });

    revalidatePath("/owner/maintenance");
    return { success: true };
}

export async function getAssetHistory(assetId: string) {
    const user = await currentUser();
    if (!user) return [];

    const asset = await prisma.propertyAsset.findUnique({
        where: { id: assetId },
        include: { property: true }
    });
    if (!asset) return [];

    // 1. Installation Event
    const history = [{
        id: "install",
        date: asset.installDate,
        type: "INSTALLATION",
        title: "Installation",
        description: `Installation neuve (${asset.lifespan} ans de durée de vie estimée).`
    }];

    // 2. Next Service (Future)
    if (asset.nextServiceDate) {
        history.push({
            id: "next_service",
            date: asset.nextServiceDate,
            type: "PLANNED",
            title: "Prochain Entretien",
            description: "Maintenance préventive recommandée."
        });
    }

    // 3. Related Tickets (Same Property) - Simple Heuristic
    // In a real app we'd filter by Asset ID relation
    const recentTickets = await prisma.maintenanceTicket.findMany({
        where: {
            propertyId: asset.propertyId,
            // Optional: category matches asset.type?
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    recentTickets.forEach(ticket => {
        history.push({
            id: ticket.id,
            date: ticket.createdAt,
            type: "TICKET",
            title: `Ticket: ${ticket.title}`,
            description: ticket.status === 'DONE' ? "Intervention terminée." : `Statut: ${ticket.status}`
        });
    });

    // Sort by date desc
    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// --- CONTRACTORS (DIRECTORY) ---

export async function getContractors() {
    const user = await currentUser();
    if (!user) return [];

    const contractors = await prisma.contractor.findMany({
        where: {
            ownerId: user.id
        }
    });

    return contractors;
}

export async function addContractor(data: {
    name: string;
    jobType: string;
    phone?: string;
    email?: string;
    location?: string;
    description?: string;
}) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    await prisma.contractor.create({
        data: {
            ownerId: user.id,
            name: data.name,
            jobType: data.jobType,
            phone: data.phone,
            email: data.email,
            isVerified: false, // User added
            rating: 0
        }
    });

    revalidatePath("/owner/maintenance");
    return { success: true };
}

export async function deleteContractor(contractorId: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    await prisma.contractor.delete({
        where: { id: contractorId }
    });

    revalidatePath("/owner/maintenance");
    return { success: true };
}

export async function submitPartnerRequest(data: any) {
    const user = await currentUser();
    // In a real app, this would email the sales team or create a CRM lead
    // Simulating a delay for "processing"
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("RICH Partner Application:", JSON.stringify(data, null, 2), "User:", user?.id);
    return { success: true };
}

// --- DEMO SEEDING (Optional helper) ---
export async function seedDemoMaintenanceData() {
    const user = await currentUser();
    if (!user) return;

    // Get a property
    const property = await prisma.property.findFirst({ where: { ownerId: user.id } });
    if (!property) return;

    // 1. Check if contractors exist, if not create
    const existingContractors = await prisma.contractor.count({ where: { ownerId: user.id } });
    if (existingContractors === 0) {
        await prisma.contractor.createMany({
            data: [
                { ownerId: user.id, name: "Plomberie Express", jobType: "Plomberie", rating: 4.9, isVerified: true, phone: "0102030405", email: "contact@plombexpress.fr" },
                { ownerId: user.id, name: "Elec'City", jobType: "Electricité", rating: 4.5, isVerified: true, phone: "0607080910" }
            ]
        });
    }

    // 2. Check assets
    const existingAssets = await prisma.propertyAsset.count({ where: { propertyId: property.id } });
    if (existingAssets === 0) {
        await prisma.propertyAsset.createMany({
            data: [
                { propertyId: property.id, name: "Chaudière Gaz", type: "Heating", installDate: new Date("2018-09-15"), lifespan: 15, healthScore: 78, status: "GOOD", nextServiceDate: new Date("2024-09-15") },
                { propertyId: property.id, name: "Toiture Zinc", type: "Structure", installDate: new Date("2005-06-01"), lifespan: 30, healthScore: 45, status: "WARNING", nextServiceDate: new Date("2024-06-01") }
            ]
        });
    }
}

// --- TICKET DETAIL & CHAT ---

export async function getTicketDetails(ticketId: string) {
    const user = await currentUser();
    if (!user) return null;

    return await prisma.maintenanceTicket.findUnique({
        where: { id: ticketId },
        include: {
            property: true,
            messages: {
                orderBy: { createdAt: 'asc' }
            },
            timeline: {
                orderBy: { createdAt: 'desc' }
            },
            contractor: true,
            attachments: true
        }
    });
}

export async function addTicketMessage(ticketId: string, content: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    await prisma.ticketMessage.create({
        data: {
            ticketId,
            content,
            senderName: user.name || "Moi",
            senderRole: "OWNER",
            isMe: true
        }
    });

    revalidatePath("/owner/maintenance");
}

export async function assignContractor(ticketId: string, contractorId: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    await prisma.maintenanceTicket.update({
        where: { id: ticketId },
        data: { contractorId }
    });

    revalidatePath("/owner/maintenance");
}

export async function scheduleIntervention(ticketId: string, date: Date) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    await prisma.maintenanceTicket.update({
        where: { id: ticketId },
        data: { scheduledDate: date }
    });

    revalidatePath("/owner/maintenance");
}

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

// ... existing code ...

export async function uploadTicketAttachment(formData: FormData) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const ticketId = formData.get("ticketId") as string;
    const file = formData.get("file") as File;

    if (!ticketId || !file) throw new Error("Missing required fields");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const extension = file.name.split('.').pop();
    const filename = `${uniqueSuffix}.${extension}`;

    // Ensure uploads directory exists
    const uploadDir = join(process.cwd(), "public", "uploads");
    try {
        await mkdir(uploadDir, { recursive: true });
    } catch (e) {
        // Ignore if exists
    }

    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Public URL
    const url = `/uploads/${filename}`;
    const type = file.type.startsWith("image/") ? "IMAGE" : "DOCUMENT";

    await prisma.ticketAttachment.create({
        data: {
            ticketId,
            name: file.name,
            url,
            type
        }
    });

    revalidatePath("/owner/maintenance");
    return { success: true };
}
