"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// MOCK PERSISTENCE (In a real app, use Redis or DB)
let SYSTEM_FLAGS = {
    maintenanceMode: false,
    disableRegistrations: false,
    debugMode: true,
    betaFeatures: false
};

async function checkAdmin() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required.");
    }
}

export async function getSystemStatus() {
    await checkAdmin();
    // Simulate API calls or DB checks for health
    return {
        flags: SYSTEM_FLAGS,
        health: {
            database: "Operational",
            api: "Operational",
            storage: "Operational",
            latency: Math.floor(Math.random() * 50) + 10 // Mock latency 10-60ms
        }
    };
}

export async function toggleSystemFlag(flag: keyof typeof SYSTEM_FLAGS, value: boolean) {
    await checkAdmin();

    if (flag in SYSTEM_FLAGS) {
        SYSTEM_FLAGS[flag] = value;
    }

    revalidatePath("/admin/system");
    return { success: true, flags: SYSTEM_FLAGS };
}
