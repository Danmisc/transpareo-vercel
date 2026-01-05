"use server";

import { stripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function createPaymentIntent(amount: number) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // Convert EUR to cents
    const amountInCents = Math.round(amount * 100);

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: "eur",
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                userId: user.id,
            },
        });

        return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
        console.error("Stripe Error:", error);
        return { error: "Erreur lors de l'initialisation du paiement" };
    }
}
