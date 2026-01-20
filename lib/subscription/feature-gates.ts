"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { PLAN_FEATURES, type PlanName, type PlanFeatures } from "./plans";
import { format } from "date-fns";

// ============================================
// FEATURE GATE TYPES
// ============================================

export type FeatureCheckResult = {
    allowed: boolean;
    limit?: number;
    used?: number;
    remaining?: number;
    requiredPlan?: PlanName;
    message?: string;
};

// ============================================
// GET USER PLAN & FEATURES
// ============================================

export async function getUserPlanFeatures(userId?: string): Promise<{ plan: PlanName; features: PlanFeatures }> {
    let uid = userId;

    if (!uid) {
        const user = await getCurrentUser();
        if (!user) return { plan: "FREE", features: PLAN_FEATURES.FREE };
        uid = user.id;
    }

    const user = await prisma.user.findUnique({
        where: { id: uid },
        select: { currentPlan: true }
    });

    const plan = (user?.currentPlan || "FREE") as PlanName;
    return { plan, features: PLAN_FEATURES[plan] || PLAN_FEATURES.FREE };
}

// ============================================
// FEATURE USAGE TRACKING
// ============================================

async function getUsage(userId: string, feature: string, periodType: "daily" | "monthly" = "daily"): Promise<number> {
    const period = periodType === "daily"
        ? format(new Date(), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM");

    const usage = await prisma.featureUsage.findUnique({
        where: {
            userId_feature_period: { userId, feature, period }
        }
    });

    return usage?.count || 0;
}

async function incrementUsage(userId: string, feature: string, periodType: "daily" | "monthly" = "daily"): Promise<number> {
    const period = periodType === "daily"
        ? format(new Date(), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM");

    const usage = await prisma.featureUsage.upsert({
        where: {
            userId_feature_period: { userId, feature, period }
        },
        create: {
            userId,
            feature,
            period,
            count: 1
        },
        update: {
            count: { increment: 1 }
        }
    });

    return usage.count;
}

// ============================================
// CHECK SPECIFIC FEATURES
// ============================================

// Check if user can send messages today
export async function canSendMessage(userId: string): Promise<FeatureCheckResult> {
    const { plan, features } = await getUserPlanFeatures(userId);

    if (features.messages_per_day === -1) {
        return { allowed: true };
    }

    const used = await getUsage(userId, "messages_sent", "daily");
    const remaining = features.messages_per_day - used;

    if (remaining <= 0) {
        return {
            allowed: false,
            limit: features.messages_per_day,
            used,
            remaining: 0,
            requiredPlan: "PLUS",
            message: `Limite de ${features.messages_per_day} messages/jour atteinte. Passez à Plus pour des messages illimités.`
        };
    }

    return { allowed: true, limit: features.messages_per_day, used, remaining };
}

// Record message sent
export async function recordMessageSent(userId: string): Promise<void> {
    await incrementUsage(userId, "messages_sent", "daily");
}

// Check if user can send InMail
export async function canSendInMail(userId: string): Promise<FeatureCheckResult> {
    const { plan, features } = await getUserPlanFeatures(userId);

    if (features.inmails_per_month === 0) {
        return {
            allowed: false,
            limit: 0,
            requiredPlan: "PRO",
            message: "Les InMails sont réservés aux abonnés Pro et Business."
        };
    }

    if (features.inmails_per_month === -1) {
        return { allowed: true };
    }

    const used = await getUsage(userId, "inmails_sent", "monthly");
    const remaining = features.inmails_per_month - used;

    if (remaining <= 0) {
        return {
            allowed: false,
            limit: features.inmails_per_month,
            used,
            remaining: 0,
            requiredPlan: "BUSINESS",
            message: `Limite de ${features.inmails_per_month} InMails/mois atteinte.`
        };
    }

    return { allowed: true, limit: features.inmails_per_month, used, remaining };
}

// Check if user can join more communities
export async function canJoinCommunity(userId: string): Promise<FeatureCheckResult> {
    const { plan, features } = await getUserPlanFeatures(userId);

    if (features.communities_limit === -1) {
        return { allowed: true };
    }

    const membershipCount = await prisma.communityMember.count({
        where: { userId }
    });

    if (membershipCount >= features.communities_limit) {
        return {
            allowed: false,
            limit: features.communities_limit,
            used: membershipCount,
            remaining: 0,
            requiredPlan: "PLUS",
            message: `Limite de ${features.communities_limit} communautés atteinte.`
        };
    }

    return { allowed: true, limit: features.communities_limit, used: membershipCount, remaining: features.communities_limit - membershipCount };
}

// Check if user can see profile views
export async function canSeeProfileViews(userId: string): Promise<FeatureCheckResult> {
    const { plan, features } = await getUserPlanFeatures(userId);

    if (features.profile_views_days === 0) {
        return {
            allowed: false,
            requiredPlan: "PLUS",
            message: "Passez à Plus pour voir qui a visité votre profil."
        };
    }

    return {
        allowed: true,
        limit: features.profile_views_days // -1 = unlimited, or number of days
    };
}

// Check if user can use invisible mode
export async function canUseInvisibleMode(userId: string): Promise<FeatureCheckResult> {
    const { features } = await getUserPlanFeatures(userId);

    if (!features.invisible_mode) {
        return {
            allowed: false,
            requiredPlan: "PRO",
            message: "Le mode invisible est réservé aux abonnés Pro et Business."
        };
    }

    return { allowed: true };
}

// Check if user can create search alerts
export async function canCreateSearchAlert(userId: string): Promise<FeatureCheckResult> {
    const { features } = await getUserPlanFeatures(userId);

    if (features.search_alerts === -1) {
        return { allowed: true };
    }

    // Count existing alerts (assuming you have an Alert model)
    // For now, use feature usage as a placeholder
    const used = await getUsage(userId, "search_alerts_created", "monthly");

    if (used >= features.search_alerts) {
        return {
            allowed: false,
            limit: features.search_alerts,
            used,
            remaining: 0,
            requiredPlan: "PLUS",
            message: `Limite de ${features.search_alerts} alertes atteinte.`
        };
    }

    return { allowed: true, limit: features.search_alerts, used, remaining: features.search_alerts - used };
}

// Check if user has priority applications
export async function hasPriorityApplication(userId: string): Promise<boolean> {
    const { features } = await getUserPlanFeatures(userId);
    return features.priority_application;
}

// Check if user can contact directly
export async function canContactDirectly(userId: string): Promise<FeatureCheckResult> {
    const { features } = await getUserPlanFeatures(userId);

    if (!features.direct_contact) {
        return {
            allowed: false,
            requiredPlan: "PRO",
            message: "Le contact direct avec les propriétaires est réservé aux abonnés Pro."
        };
    }

    return { allowed: true };
}

// Check owner dashboard access
export async function canAccessOwnerDashboard(userId: string): Promise<FeatureCheckResult> {
    const { features } = await getUserPlanFeatures(userId);

    if (!features.owner_dashboard) {
        return {
            allowed: false,
            requiredPlan: "PRO",
            message: "Le tableau de bord propriétaire nécessite un abonnement Pro."
        };
    }

    return { allowed: true };
}

// Check property limit
export async function canAddProperty(userId: string): Promise<FeatureCheckResult> {
    const { features } = await getUserPlanFeatures(userId);

    if (features.properties_limit === 0) {
        return {
            allowed: false,
            requiredPlan: "PRO",
            message: "La gestion de biens est réservée aux abonnés Pro."
        };
    }

    if (features.properties_limit === -1) {
        return { allowed: true };
    }

    const propertyCount = await prisma.property.count({
        where: { ownerId: userId }
    });

    if (propertyCount >= features.properties_limit) {
        return {
            allowed: false,
            limit: features.properties_limit,
            used: propertyCount,
            remaining: 0,
            requiredPlan: "BUSINESS",
            message: `Limite de ${features.properties_limit} biens atteinte. Passez à Business pour illimité.`
        };
    }

    return { allowed: true, limit: features.properties_limit, used: propertyCount, remaining: features.properties_limit - propertyCount };
}

// Check P2P early access
export async function getP2PEarlyAccessHours(userId: string): Promise<number> {
    const { features } = await getUserPlanFeatures(userId);
    return features.early_access_hours;
}

// Check minimum investment
export async function getMinInvestment(userId: string): Promise<number> {
    const { features } = await getUserPlanFeatures(userId);
    return features.min_investment;
}

// Check auto-invest level
export async function getAutoInvestLevel(userId: string): Promise<string> {
    const { features } = await getUserPlanFeatures(userId);
    return features.auto_invest;
}

// Check analytics access
export async function getAnalyticsDaysLimit(userId: string): Promise<number> {
    const { features } = await getUserPlanFeatures(userId);
    return features.analytics_days; // -1 = unlimited
}

// ============================================
// GENERIC FEATURE CHECK
// ============================================

export async function checkFeature(
    userId: string,
    feature: keyof PlanFeatures
): Promise<FeatureCheckResult> {
    const { features } = await getUserPlanFeatures(userId);
    const value = features[feature];

    if (typeof value === "boolean") {
        return { allowed: value };
    }

    if (typeof value === "number") {
        return { allowed: value !== 0, limit: value === -1 ? undefined : value };
    }

    if (typeof value === "string") {
        return { allowed: value !== "none" && value !== null };
    }

    return { allowed: false };
}
