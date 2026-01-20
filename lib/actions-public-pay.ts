"use server";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe"; // Ensure you have this or import directly if needed

export async function createPublicPaymentIntent(amount: number, targetWalletId: string) {
    if (amount <= 0) return null;

    try {
        // Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // cents
            currency: "eur",
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                type: "PUBLIC_PAYMENT",
                targetWalletId: targetWalletId
            }
        });

        return paymentIntent.client_secret;
    } catch (error) {
        console.error("Stripe Error:", error);
        return null;
    }
}
