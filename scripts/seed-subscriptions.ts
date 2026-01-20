// Seed Subscription Plans
// Run: npx ts-node scripts/seed-subscriptions.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PLANS = [
    {
        name: "FREE",
        displayName: "Gratuit",
        description: "Pour découvrir Transpareo",
        price: 0,
        yearlyPrice: 0,
        order: 0,
        isPopular: false,
        features: JSON.stringify({
            messages_per_day: 10,
            group_messages: false,
            inmails_per_month: 0,
            communities_limit: 3,
            profile_views_days: 0,
            invisible_mode: false,
            dossier_documents: 4,
            video_pitch_seconds: 0,
            search_alerts: 3,
            priority_application: false,
            direct_contact: false,
            properties_limit: 0,
            min_investment: 100,
            auto_invest: "none",
            early_access_hours: 0,
            analytics_days: 7,
            team_members: 1,
            support_level: "forum"
        })
    },
    {
        name: "PLUS",
        displayName: "Plus",
        description: "Pour les particuliers actifs",
        price: 9.99,
        yearlyPrice: 95.90,
        order: 1,
        isPopular: false,
        // TODO: Add Stripe Price IDs after creating products in Stripe Dashboard
        // stripePriceIdMonthly: "price_xxx",
        // stripePriceIdYearly: "price_yyy",
        features: JSON.stringify({
            messages_per_day: -1,
            group_messages: true,
            inmails_per_month: 0,
            communities_limit: -1,
            profile_views_days: 30,
            invisible_mode: false,
            dossier_documents: 10,
            video_pitch_seconds: 30,
            search_alerts: 10,
            priority_application: false,
            direct_contact: false,
            properties_limit: 0,
            min_investment: 50,
            auto_invest: "basic",
            early_access_hours: 0,
            analytics_days: 30,
            team_members: 1,
            support_level: "email"
        })
    },
    {
        name: "PRO",
        displayName: "Pro",
        description: "Pour les professionnels de l'immobilier",
        price: 24.99,
        yearlyPrice: 239.90,
        order: 2,
        isPopular: true,
        features: JSON.stringify({
            messages_per_day: -1,
            group_messages: true,
            inmails_per_month: 10,
            communities_limit: -1,
            profile_views_days: -1,
            invisible_mode: true,
            dossier_documents: -1,
            video_pitch_seconds: 120,
            search_alerts: -1,
            priority_application: true,
            direct_contact: true,
            properties_limit: 5,
            min_investment: 20,
            auto_invest: "advanced",
            early_access_hours: 24,
            analytics_days: -1,
            team_members: 1,
            support_level: "priority"
        })
    },
    {
        name: "BUSINESS",
        displayName: "Business",
        description: "Pour les agences et investisseurs",
        price: 79.99,
        yearlyPrice: 767.90,
        order: 3,
        isPopular: false,
        features: JSON.stringify({
            messages_per_day: -1,
            group_messages: true,
            inmails_per_month: -1,
            communities_limit: -1,
            profile_views_days: -1,
            invisible_mode: true,
            dossier_documents: -1,
            video_pitch_seconds: 120,
            search_alerts: -1,
            priority_application: true,
            direct_contact: true,
            properties_limit: -1,
            min_investment: 1,
            auto_invest: "full",
            early_access_hours: 48,
            analytics_days: -1,
            team_members: 5,
            support_level: "dedicated"
        })
    }
];

async function main() {
    console.log("🌱 Seeding subscription plans...\n");

    for (const plan of PLANS) {
        const result = await prisma.subscriptionPlan.upsert({
            where: { name: plan.name },
            update: {
                displayName: plan.displayName,
                description: plan.description,
                price: plan.price,
                yearlyPrice: plan.yearlyPrice,
                order: plan.order,
                isPopular: plan.isPopular,
                features: plan.features,
                isActive: true
            },
            create: {
                name: plan.name,
                displayName: plan.displayName,
                description: plan.description,
                price: plan.price,
                yearlyPrice: plan.yearlyPrice,
                order: plan.order,
                isPopular: plan.isPopular,
                features: plan.features,
                isActive: true
            }
        });

        console.log(`  ✅ ${plan.displayName} (${plan.name}) - ${plan.price}€/mois`);
    }

    console.log("\n✨ Done! Subscription plans seeded successfully.");
    console.log("\n📋 Next steps:");
    console.log("   1. Create products in Stripe Dashboard (test mode)");
    console.log("   2. Update stripePriceIdMonthly and stripePriceIdYearly for each plan");
    console.log("   3. Test the checkout flow at /pricing");
}

main()
    .catch((e) => {
        console.error("❌ Error seeding plans:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
