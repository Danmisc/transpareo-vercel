"use server";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/session";
import { PLANS, PLAN_FEATURES, type PlanName } from "./plans";
import { revalidatePath } from "next/cache";

// ============================================
// GET USER SUBSCRIPTION
// ============================================

export async function getUserSubscription(userId: string) {
    try {
        const subscription = await prisma.userSubscription.findUnique({
            where: { userId },
            include: { plan: true }
        });

        if (!subscription) {
            // Return FREE plan info
            return {
                planName: "FREE" as PlanName,
                status: "ACTIVE",
                features: PLAN_FEATURES.FREE,
                subscription: null
            };
        }

        return {
            planName: subscription.plan.name as PlanName,
            status: subscription.status,
            features: PLAN_FEATURES[subscription.plan.name as PlanName] || PLAN_FEATURES.FREE,
            subscription
        };
    } catch (error) {
        console.error("Error getting user subscription:", error);
        return {
            planName: "FREE" as PlanName,
            status: "ACTIVE",
            features: PLAN_FEATURES.FREE,
            subscription: null
        };
    }
}

// ============================================
// CREATE CHECKOUT SESSION
// ============================================

export async function createCheckoutSession(planName: PlanName, isYearly: boolean = false) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Non autorisé");

    const plan = PLANS.find(p => p.name === planName);
    if (!plan || planName === "FREE") {
        throw new Error("Plan invalide");
    }

    // Get or create Stripe customer
    let stripeCustomerId: string;

    const existingSub = await prisma.userSubscription.findUnique({
        where: { userId: user.id }
    });

    if (existingSub?.stripeCustomerId) {
        stripeCustomerId = existingSub.stripeCustomerId;
    } else {
        const customer = await stripe.customers.create({
            email: user.email!,
            name: user.name || undefined,
            metadata: { userId: user.id }
        });
        stripeCustomerId = customer.id;
    }

    // Get Stripe price ID from plan
    const dbPlan = await prisma.subscriptionPlan.findUnique({
        where: { name: planName }
    });

    if (!dbPlan) {
        throw new Error("Plan non trouvé en base");
    }

    const priceId = isYearly ? dbPlan.stripePriceIdYearly : dbPlan.stripePriceIdMonthly;
    if (!priceId) {
        throw new Error("Prix Stripe non configuré");
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/subscription?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?cancelled=true`,
        metadata: {
            userId: user.id,
            planName,
            type: "subscription"
        },
        subscription_data: {
            metadata: {
                userId: user.id,
                planName
            }
        },
        allow_promotion_codes: true,
    });

    return { url: session.url };
}

// ============================================
// CREATE CUSTOMER PORTAL SESSION
// ============================================

export async function createPortalSession() {
    const user = await getCurrentUser();
    if (!user) throw new Error("Non autorisé");

    const subscription = await prisma.userSubscription.findUnique({
        where: { userId: user.id }
    });

    if (!subscription?.stripeCustomerId) {
        throw new Error("Pas d'abonnement actif");
    }

    const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/subscription`,
    });

    return { url: session.url };
}

// ============================================
// CANCEL SUBSCRIPTION
// ============================================

export async function cancelSubscription() {
    const user = await getCurrentUser();
    if (!user) throw new Error("Non autorisé");

    const subscription = await prisma.userSubscription.findUnique({
        where: { userId: user.id }
    });

    if (!subscription?.stripeSubscriptionId) {
        throw new Error("Pas d'abonnement à annuler");
    }

    // Cancel at period end (not immediately)
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true
    });

    await prisma.userSubscription.update({
        where: { userId: user.id },
        data: { cancelAtPeriodEnd: true }
    });

    revalidatePath("/settings/subscription");
    return { success: true };
}

// ============================================
// RESUME SUBSCRIPTION
// ============================================

export async function resumeSubscription() {
    const user = await getCurrentUser();
    if (!user) throw new Error("Non autorisé");

    const subscription = await prisma.userSubscription.findUnique({
        where: { userId: user.id }
    });

    if (!subscription?.stripeSubscriptionId) {
        throw new Error("Pas d'abonnement");
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false
    });

    await prisma.userSubscription.update({
        where: { userId: user.id },
        data: { cancelAtPeriodEnd: false }
    });

    revalidatePath("/settings/subscription");
    return { success: true };
}

// ============================================
// SYNC WITH STRIPE (for webhooks)
// ============================================

export async function syncSubscriptionFromStripe(stripeSubscriptionId: string) {
    const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const userId = stripeSub.metadata.userId;

    if (!userId) {
        console.error("No userId in subscription metadata");
        return;
    }

    const planName = stripeSub.metadata.planName as PlanName;
    const dbPlan = await prisma.subscriptionPlan.findUnique({
        where: { name: planName }
    });

    if (!dbPlan) {
        console.error("Plan not found:", planName);
        return;
    }

    // Map Stripe status to our status
    const statusMap: Record<string, string> = {
        active: "ACTIVE",
        past_due: "PAST_DUE",
        canceled: "CANCELLED",
        unpaid: "PAST_DUE",
        trialing: "TRIALING",
        incomplete: "PENDING",
        incomplete_expired: "EXPIRED",
    };

    await prisma.$transaction([
        prisma.userSubscription.upsert({
            where: { userId },
            create: {
                userId,
                planId: dbPlan.id,
                status: statusMap[stripeSub.status] || "ACTIVE",
                stripeCustomerId: stripeSub.customer as string,
                stripeSubscriptionId: stripeSubscriptionId,
                currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
                currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
                cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
                trialEnd: stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000) : null,
            },
            update: {
                planId: dbPlan.id,
                status: statusMap[stripeSub.status] || "ACTIVE",
                currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
                currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
                cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
                trialEnd: stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000) : null,
            }
        }),
        prisma.user.update({
            where: { id: userId },
            data: { currentPlan: planName }
        })
    ]);

    console.log(`✅ Synced subscription for user ${userId}: ${planName} (${stripeSub.status})`);
}

// ============================================
// HANDLE SUBSCRIPTION DELETED
// ============================================

export async function handleSubscriptionDeleted(stripeSubscriptionId: string) {
    const subscription = await prisma.userSubscription.findFirst({
        where: { stripeSubscriptionId }
    });

    if (!subscription) return;

    await prisma.$transaction([
        prisma.userSubscription.update({
            where: { id: subscription.id },
            data: { status: "EXPIRED" }
        }),
        prisma.user.update({
            where: { id: subscription.userId },
            data: { currentPlan: "FREE" }
        })
    ]);

    console.log(`🔴 Subscription expired for user ${subscription.userId}`);
}

// ============================================
// SEED PLANS (run once)
// ============================================

export async function seedSubscriptionPlans() {
    for (const plan of PLANS) {
        await prisma.subscriptionPlan.upsert({
            where: { name: plan.name },
            update: {
                displayName: plan.displayName,
                description: plan.description,
                price: plan.price,
                yearlyPrice: plan.yearlyPrice,
                features: JSON.stringify(plan.features),
                isPopular: plan.isPopular || false,
                order: PLANS.indexOf(plan),
            },
            create: {
                name: plan.name,
                displayName: plan.displayName,
                description: plan.description,
                price: plan.price,
                yearlyPrice: plan.yearlyPrice,
                features: JSON.stringify(plan.features),
                isPopular: plan.isPopular || false,
                order: PLANS.indexOf(plan),
            }
        });
    }

    console.log("✅ Subscription plans seeded");
}
