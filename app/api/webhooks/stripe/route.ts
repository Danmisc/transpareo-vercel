import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const userId = paymentIntent.metadata.userId;
        const amount = paymentIntent.amount / 100; // Convert cents to EUR

        console.log(`💰 Payment Succeeded: ${amount}€ for user ${userId}`);

        // Credit User Wallet
        await prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({ where: { userId } });

            if (wallet) {
                await tx.wallet.update({
                    where: { userId },
                    data: { balance: { increment: amount } }
                });

                await tx.transaction.create({
                    data: {
                        walletId: wallet.id,
                        amount,
                        type: "DEPOSIT",
                        status: "COMPLETED",
                        description: `Dépôt Carte Bancaire (Stripe)`,
                        metadata: JSON.stringify({ stripeId: paymentIntent.id })
                    }
                });
            }
        });
    }

    return new NextResponse(null, { status: 200 });
}
