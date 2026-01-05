"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- SECURITY CHECK ---
async function checkAdmin() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required.");
    }
    return session;
}

// --- USER MANAGEMENT ---

export async function getUsers(query: string = "", role: string = "ALL", page: number = 1) {
    await checkAdmin();

    const PAGE_SIZE = 10;
    const skip = (page - 1) * PAGE_SIZE;

    const where: any = {};

    if (query) {
        where.OR = [
            { name: { contains: query } }, // SQLite is case-insensitive by default for ASCII
            { email: { contains: query } }
        ];
    }

    if (role !== "ALL") {
        where.role = role;
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: PAGE_SIZE,
            skip,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                createdAt: true,
                lastActive: true,
                _count: {
                    select: {
                        posts: true,
                        listings: true
                    }
                }
            }
        }),
        prisma.user.count({ where })
    ]);

    return {
        users,
        total,
        totalPages: Math.ceil(total / PAGE_SIZE)
    };
}

export async function toggleUserBan(userId: string) {
    await checkAdmin();
    // In a real app we might have a specific 'isBanned' or 'status' field.
    // For now, let's assume we might change their role to 'BANNED' or add a flag.
    // Let's verify if we need to add a status field or just use role. 
    // The schema has 'role'. Let's use that for now or assume a status field exists/should exist.
    // Looking at schema, standard User model. I will just update the role to "BANNED" if not banned, or "USER" if banned.

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const newRole = user.role === "BANNED" ? "USER" : "BANNED";

    await prisma.user.update({
        where: { id: userId },
        data: { role: newRole }
    });

    revalidatePath("/admin/users");
    return { success: true, newRole };
}

export async function updateUserRole(userId: string, newRole: string) {
    await checkAdmin();

    await prisma.user.update({
        where: { id: userId },
        data: { role: newRole }
    });

    revalidatePath("/admin/users");
}

export async function verifyUserIdentity(userId: string) {
    await checkAdmin();
    // If we had a verification system (e.g. Stripe Identity), we would trigger it here.
    // For now, let's manually verify email date? Or add a 'verified' badge.
    // Schema has 'emailVerified'.
    await prisma.user.update({
        where: { id: userId },
        data: { emailVerified: new Date() }
    });
    revalidatePath("/admin/users");
}
