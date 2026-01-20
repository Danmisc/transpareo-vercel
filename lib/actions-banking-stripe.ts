"use server";

import { getCurrentUser } from "@/lib/session";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-12-18.acacia",
});

export async function createPaymentIntent(amount: number) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: "eur",
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                userId: user.id
            }
        });

        return { clientSecret: paymentIntent.client_secret };
    } catch (error: any) {
        console.error("Stripe Payment Intent Error:", error);
        return { error: error.message };
    }
}
