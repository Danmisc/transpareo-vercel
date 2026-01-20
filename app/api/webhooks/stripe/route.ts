import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { logSecurityEvent } from "@/lib/security";
import { syncSubscriptionFromStripe, handleSubscriptionDeleted } from "@/lib/subscription/service";
import Stripe from "stripe";

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        console.error("[Stripe Webhook] Signature verification failed:", error.message);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    // ========================================
    // HANDLE CHECKOUT SESSION COMPLETED
    // ========================================
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};

        // Check if this is a P2P investment
        if (metadata.type === "p2p_investment") {
            await handleInvestmentPayment(session);
        }

        // Check if this is a subscription
        if (metadata.type === "subscription" && session.subscription) {
            await syncSubscriptionFromStripe(session.subscription as string);
        }
    }

    // ========================================
    // HANDLE SUBSCRIPTION EVENTS
    // ========================================
    if (event.type === "customer.subscription.created" ||
        event.type === "customer.subscription.updated") {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscriptionFromStripe(subscription.id);
    }

    if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription.id);
    }

    // ========================================
    // HANDLE INVOICE EVENTS (for subscription renewals)
    // ========================================
    if (event.type === "invoice.paid") {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription;
        if (subscriptionId && typeof subscriptionId === "string") {
            await syncSubscriptionFromStripe(subscriptionId);
            console.log(`💳 Subscription invoice paid: ${invoice.id}`);
        }
    }

    if (event.type === "invoice.payment_failed") {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription;
        if (subscriptionId && typeof subscriptionId === "string") {
            // Update subscription status to PAST_DUE
            await prisma.userSubscription.updateMany({
                where: { stripeSubscriptionId: subscriptionId },
                data: { status: "PAST_DUE" }
            });
            console.log(`⚠️ Subscription payment failed: ${invoice.id}`);
        }
    }

    // ========================================
    // HANDLE PAYMENT INTENT SUCCEEDED (Legacy support)
    // ========================================
    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const userId = paymentIntent.metadata.userId;

        // Only handle wallet top-ups (legacy)
        if (userId && !paymentIntent.metadata.type) {
            const amount = paymentIntent.amount / 100;
            console.log(`💰 Legacy Wallet Top-Up: ${amount}€ for user ${userId}`);

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
    }

    return new NextResponse(null, { status: 200 });
}

// ========================================
// HANDLE INVESTMENT PAYMENT
// ========================================

async function handleInvestmentPayment(session: Stripe.Checkout.Session) {
    const { userId, loanId, amount: amountStr } = session.metadata || {};

    if (!userId || !loanId || !amountStr) {
        console.error("[Investment Webhook] Missing metadata:", session.metadata);
        return;
    }

    const amount = parseFloat(amountStr);

    console.log(`🎯 Processing Investment: ${amount}€ from ${userId} into loan ${loanId}`);

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Get or create wallet
            let wallet = await tx.wallet.findUnique({ where: { userId } });

            if (!wallet) {
                wallet = await tx.wallet.create({
                    data: {
                        userId,
                        balance: 0,
                        invested: 0,
                        locked: 0,
                        currency: "EUR"
                    }
                });
            }

            // 2. Check if investment already exists (idempotency)
            const existingInvestment = await tx.investment.findFirst({
                where: {
                    walletId: wallet.id,
                    loanId,
                    // Check by Stripe session ID in transaction references
                }
            });

            // For safety, check by recently created investments to prevent duplicates
            const recentInvestment = await tx.investment.findFirst({
                where: {
                    walletId: wallet.id,
                    loanId,
                    amount,
                    createdAt: {
                        gte: new Date(Date.now() - 60 * 1000) // Last 60 seconds
                    }
                }
            });

            if (recentInvestment) {
                console.log(`[Investment Webhook] Duplicate detected, skipping: ${recentInvestment.id}`);
                return;
            }

            // 3. Create investment
            const investment = await tx.investment.create({
                data: {
                    walletId: wallet.id,
                    loanId,
                    amount,
                    status: "ACTIVE"
                }
            });

            // 4. Update wallet invested amount
            await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    invested: { increment: amount }
                }
            });

            // 5. Update loan funded amount
            const updatedLoan = await tx.loanProject.update({
                where: { id: loanId },
                data: {
                    funded: { increment: amount }
                }
            });

            // 6. Check if loan is fully funded
            if (updatedLoan.funded >= updatedLoan.amount) {
                await tx.loanProject.update({
                    where: { id: loanId },
                    data: { status: "FUNDED" }
                });
                console.log(`🎉 Loan ${loanId} is now fully funded!`);
            }

            // 7. Record transaction
            await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    amount: -amount, // Negative because money is being invested
                    type: "INVESTMENT",
                    status: "COMPLETED",
                    category: "INVESTMENT",
                    reference: loanId,
                    description: `Investissement: ${updatedLoan.title}`,
                    metadata: JSON.stringify({
                        stripeSessionId: session.id,
                        investmentId: investment.id
                    })
                }
            });

            console.log(`✅ Investment created: ${investment.id} - ${amount}€`);
        });

        await logSecurityEvent(userId, "INVESTMENT_COMPLETED", "SUCCESS", {
            loanId,
            amount,
            stripeSessionId: session.id
        });

    } catch (error) {
        console.error("[Investment Webhook] Transaction failed:", error);
        await logSecurityEvent(userId, "INVESTMENT_FAILED", "FAILURE", {
            loanId,
            amount,
            error: String(error)
        });
    }
}
