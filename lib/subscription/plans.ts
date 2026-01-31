// Subscription Plans Configuration
// Sprint 9: Freemium Subscription System

export type PlanName = "FREE" | "PLUS" | "PRO" | "BUSINESS";

export interface PlanFeatures {
    // Messages
    messages_per_day: number; // -1 = unlimited
    group_messages: boolean;
    inmails_per_month: number;
    scheduled_messages: boolean;

    // Communities
    communities_limit: number; // -1 = unlimited

    // Profile
    profile_views_days: number; // 0 = none, 30 = last 30 days, -1 = unlimited
    see_hidden_viewers: boolean;
    invisible_mode: boolean;
    verified_badge: string | null; // null, "bronze", "pro", "business"
    custom_background: boolean;

    // Dossier Locataire
    dossier_documents: number;
    video_pitch_seconds: number;
    recommendations: number; // -1 = unlimited
    dossier_shares: number; // -1 = unlimited
    solvency_certification: boolean;

    // Marketplace
    search_alerts: number; // -1 = unlimited
    advanced_filters: boolean;
    priority_application: boolean;
    direct_contact: boolean;
    price_history: boolean;
    market_data: boolean;

    // Owner/Agency
    properties_limit: number; // -1 = unlimited
    owner_dashboard: boolean;
    tenant_screening: boolean;
    legal_templates: boolean;
    maintenance_alerts: boolean;
    signature_electronic: boolean;
    accounting: boolean;

    // P2P Lending
    min_investment: number;
    auto_invest: "none" | "basic" | "advanced" | "full";
    early_access_hours: number;
    tax_report: boolean;

    // Analytics
    analytics_days: number; // 7, 30, -1 = unlimited
    export_data: boolean;
    competitor_comparison: boolean;

    // Team
    team_members: number;

    // Support
    support_level: "forum" | "email" | "priority";
    support_response_hours: number;

    // Extras
    post_boosts_per_week: number;
    sponsored_listings_per_month: number;
}

export interface Plan {
    name: PlanName;
    displayName: string;
    description: string;
    price: number;
    yearlyPrice: number;
    features: PlanFeatures;
    isPopular?: boolean;
}

export const PLAN_FEATURES: Record<PlanName, PlanFeatures> = {
    FREE: {
        // Messages
        messages_per_day: -1,
        group_messages: false,
        inmails_per_month: 0,
        scheduled_messages: false,

        // Communities
        communities_limit: 3,

        // Profile
        profile_views_days: 0,
        see_hidden_viewers: false,
        invisible_mode: false,
        verified_badge: null,
        custom_background: false,

        // Dossier
        dossier_documents: 4,
        video_pitch_seconds: 0,
        recommendations: 0,
        dossier_shares: 1,
        solvency_certification: false,

        // Marketplace
        search_alerts: 3,
        advanced_filters: false,
        priority_application: false,
        direct_contact: false,
        price_history: false,
        market_data: false,

        // Owner
        properties_limit: 0,
        owner_dashboard: false,
        tenant_screening: false,
        legal_templates: false,
        maintenance_alerts: false,
        signature_electronic: false,
        accounting: false,

        // P2P
        min_investment: 100,
        auto_invest: "none",
        early_access_hours: 0,
        tax_report: false,

        // Analytics
        analytics_days: 7,
        export_data: false,
        competitor_comparison: false,

        // Team
        team_members: 1,

        // Support
        support_level: "forum",
        support_response_hours: 72,

        // Extras
        post_boosts_per_week: 0,
        sponsored_listings_per_month: 0,
    },

    PLUS: {
        // Messages
        messages_per_day: -1,
        group_messages: true,
        inmails_per_month: 0,
        scheduled_messages: false,

        // Communities
        communities_limit: -1,

        // Profile
        profile_views_days: 30,
        see_hidden_viewers: false,
        invisible_mode: false,
        verified_badge: "bronze",
        custom_background: true,

        // Dossier
        dossier_documents: 10,
        video_pitch_seconds: 30,
        recommendations: 1,
        dossier_shares: 5,
        solvency_certification: true,

        // Marketplace
        search_alerts: 10,
        advanced_filters: true,
        priority_application: false,
        direct_contact: false,
        price_history: false,
        market_data: false,

        // Owner
        properties_limit: 0,
        owner_dashboard: false,
        tenant_screening: false,
        legal_templates: false,
        maintenance_alerts: false,
        signature_electronic: false,
        accounting: false,

        // P2P
        min_investment: 50,
        auto_invest: "basic",
        early_access_hours: 0,
        tax_report: false,

        // Analytics
        analytics_days: 30,
        export_data: false,
        competitor_comparison: false,

        // Team
        team_members: 1,

        // Support
        support_level: "email",
        support_response_hours: 48,

        // Extras
        post_boosts_per_week: 0,
        sponsored_listings_per_month: 0,
    },

    PRO: {
        // Messages
        messages_per_day: -1,
        group_messages: true,
        inmails_per_month: 10,
        scheduled_messages: true,

        // Communities
        communities_limit: -1,

        // Profile
        profile_views_days: -1,
        see_hidden_viewers: true,
        invisible_mode: true,
        verified_badge: "pro",
        custom_background: true,

        // Dossier
        dossier_documents: -1,
        video_pitch_seconds: 120,
        recommendations: -1,
        dossier_shares: -1,
        solvency_certification: true,

        // Marketplace
        search_alerts: -1,
        advanced_filters: true,
        priority_application: true,
        direct_contact: true,
        price_history: true,
        market_data: true,

        // Owner
        properties_limit: 5,
        owner_dashboard: true,
        tenant_screening: true,
        legal_templates: true,
        maintenance_alerts: true,
        signature_electronic: false,
        accounting: false,

        // P2P
        min_investment: 20,
        auto_invest: "advanced",
        early_access_hours: 24,
        tax_report: true,

        // Analytics
        analytics_days: -1,
        export_data: true,
        competitor_comparison: true,

        // Team
        team_members: 1,

        // Support
        support_level: "email",
        support_response_hours: 24,

        // Extras
        post_boosts_per_week: 0,
        sponsored_listings_per_month: 0,
    },

    BUSINESS: {
        // Messages
        messages_per_day: -1,
        group_messages: true,
        inmails_per_month: -1,
        scheduled_messages: true,

        // Communities
        communities_limit: -1,

        // Profile
        profile_views_days: -1,
        see_hidden_viewers: true,
        invisible_mode: true,
        verified_badge: "business",
        custom_background: true,

        // Dossier
        dossier_documents: -1,
        video_pitch_seconds: 120,
        recommendations: -1,
        dossier_shares: -1,
        solvency_certification: true,

        // Marketplace
        search_alerts: -1,
        advanced_filters: true,
        priority_application: true,
        direct_contact: true,
        price_history: true,
        market_data: true,

        // Owner
        properties_limit: -1,
        owner_dashboard: true,
        tenant_screening: true,
        legal_templates: true,
        maintenance_alerts: true,
        signature_electronic: true,
        accounting: true,

        // P2P
        min_investment: 1,
        auto_invest: "full",
        early_access_hours: 48,
        tax_report: true,

        // Analytics
        analytics_days: -1,
        export_data: true,
        competitor_comparison: true,

        // Team
        team_members: 5,

        // Support
        support_level: "priority",
        support_response_hours: 4,

        // Extras
        post_boosts_per_week: 1,
        sponsored_listings_per_month: 3,
    },
};

export const PLANS: Plan[] = [
    {
        name: "FREE",
        displayName: "Gratuit",
        description: "Pour découvrir Transpareo",
        price: 0,
        yearlyPrice: 0,
        features: PLAN_FEATURES.FREE,
    },
    {
        name: "PLUS",
        displayName: "Plus",
        description: "Pour les particuliers actifs",
        price: 9.99,
        yearlyPrice: 95.90, // 7.99/month
        features: PLAN_FEATURES.PLUS,
    },
    {
        name: "PRO",
        displayName: "Pro",
        description: "Pour les professionnels de l'immobilier",
        price: 24.99,
        yearlyPrice: 239.90, // 19.99/month
        features: PLAN_FEATURES.PRO,
        isPopular: true,
    },
    {
        name: "BUSINESS",
        displayName: "Business",
        description: "Pour les agences et investisseurs",
        price: 79.99,
        yearlyPrice: 767.90, // 63.99/month
        features: PLAN_FEATURES.BUSINESS,
    },
];

// Helper to get plan features
export function getPlanFeatures(planName: PlanName): PlanFeatures {
    return PLAN_FEATURES[planName] || PLAN_FEATURES.FREE;
}

// Helper to check if a plan has a specific feature
export function hasFeature(planName: PlanName, feature: keyof PlanFeatures): boolean {
    const features = getPlanFeatures(planName);
    const value = features[feature];

    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") return value !== "none" && value !== null;
    return false;
}

// Helper to get feature limit
export function getFeatureLimit(planName: PlanName, feature: keyof PlanFeatures): number | string | boolean | null {
    return getPlanFeatures(planName)[feature];
}

// Commission rates by plan
export const COMMISSION_RATES = {
    P2P_INVESTMENT: {
        FREE: 0.02,      // 2%
        PLUS: 0.015,     // 1.5%
        PRO: 0.01,       // 1%
        BUSINESS: 0.005, // 0.5%
    },
    P2P_REPAYMENT: {
        FREE: 0.01,      // 1%
        PLUS: 0.0075,    // 0.75%
        PRO: 0.005,      // 0.5%
        BUSINESS: 0.0025, // 0.25%
    },
    MARKETPLACE: {
        FREE: 0,
        PLUS: 0,
        PRO: 0,
        BUSINESS: 0,
    },
} as const;

export function getCommissionRate(type: keyof typeof COMMISSION_RATES, planName: PlanName): number {
    return COMMISSION_RATES[type][planName] || COMMISSION_RATES[type].FREE;
}
