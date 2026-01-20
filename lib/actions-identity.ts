"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { sendVerificationEmail as sendEmail } from "@/lib/email";
import { v4 as uuidv4 } from "uuid";

export async function sendVerificationEmail() {
    const user = await getCurrentUser();
    if (!user || !user.email) throw new Error("Unauthorized or No Email");

    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // 24h

    // Delete existing tokens
    await prisma.verificationToken.deleteMany({
        where: { identifier: user.email }
    });

    await prisma.verificationToken.create({
        data: {
            identifier: user.email,
            token,
            expires
        }
    });

    return await sendEmail(user.email, token);
}

export async function verifyEmailToken(token: string) {
    const record = await prisma.verificationToken.findUnique({
        where: { token }
    });

    if (!record) return { success: false, error: "Jeton invalide" };
    if (new Date() > record.expires) return { success: false, error: "Jeton expiré" };

    const user = await prisma.user.findUnique({ where: { email: record.identifier } });
    if (!user) return { success: false, error: "Utilisateur introuvable" };

    await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
    });

    await prisma.verificationToken.delete({ where: { token } });

    return { success: true };
}
