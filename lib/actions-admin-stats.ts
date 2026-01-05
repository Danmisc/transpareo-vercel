"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkAdmin() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }
}

export async function getAdminStats() {
    await checkAdmin();

    const [userCount, reportCount, revenueMock] = await Promise.all([
        prisma.user.count(),
        prisma.report.count({ where: { status: "PENDING" } }),
        45231 // Mock revenue
    ]);

    // Generate Mock Historical Data for Charts (Last 7 days)
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const activityData = days.map(day => ({
        name: day,
        visitors: Math.floor(Math.random() * 1000) + 500,
        signups: Math.floor(Math.random() * 50) + 10,
    }));

    const revenueData = days.map(day => ({
        name: day,
        revenue: Math.floor(Math.random() * 5000) + 1000,
    }));

    return {
        counts: {
            users: userCount,
            reports: reportCount,
            revenue: revenueMock,
            systemHealth: "99.9%"
        },
        charts: {
            activity: activityData,
            revenue: revenueData
        }
    };
}
