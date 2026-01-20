import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json(
                { error: "Token de vérification requis." },
                { status: 400 }
            );
        }

        // Find the token
        const verificationToken = await prisma.emailVerificationToken.findUnique({
            where: { token }
        });

        if (!verificationToken) {
            return NextResponse.json(
                { error: "Lien invalide ou déjà utilisé." },
                { status: 400 }
            );
        }

        // Check if token is expired
        if (new Date() > verificationToken.expiresAt) {
            // Delete expired token
            await prisma.emailVerificationToken.delete({
                where: { id: verificationToken.id }
            });

            return NextResponse.json(
                { error: "Ce lien a expiré. Veuillez vous reconnecter pour en recevoir un nouveau.", expired: true },
                { status: 400 }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: verificationToken.email },
            select: { id: true, emailVerified: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: "Compte non trouvé." },
                { status: 400 }
            );
        }

        // Update user as verified (transaction)
        await prisma.$transaction([
            // Mark email as verified
            prisma.user.update({
                where: { id: user.id },
                data: { emailVerified: new Date() }
            }),

            // Delete the token (one-time use)
            prisma.emailVerificationToken.delete({
                where: { id: verificationToken.id }
            }),

            // Delete any other tokens for this email
            prisma.emailVerificationToken.deleteMany({
                where: {
                    email: verificationToken.email,
                    id: { not: verificationToken.id }
                }
            }),

            // Log security event
            prisma.securityLog.create({
                data: {
                    userId: user.id,
                    action: "EMAIL_VERIFIED",
                    status: "SUCCESS",
                    metadata: JSON.stringify({ timestamp: new Date().toISOString() }),
                    ipAddress: "server",
                    userAgent: "server"
                }
            })
        ]);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[Auth] Email verification error:", error);
        return NextResponse.json(
            { error: "Une erreur est survenue lors de la vérification." },
            { status: 500 }
        );
    }
}
