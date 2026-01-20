"use client";

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { PlanName, PlanFeatures } from "@/lib/subscription/plans";
import { PLAN_FEATURES } from "@/lib/subscription/plans";

interface SubscriptionState {
    plan: PlanName;
    features: PlanFeatures;
    isLoading: boolean;
    error: string | null;
}

interface UseSubscriptionReturn extends SubscriptionState {
    isPaid: boolean;
    isPro: boolean;
    isBusiness: boolean;
    canAccess: (feature: keyof PlanFeatures) => boolean;
    getLimit: (feature: keyof PlanFeatures) => number;
    openUpgradeModal: (feature?: string, requiredPlan?: PlanName) => void;
    goToPricing: () => void;
    refetch: () => Promise<void>;
}

// Default state that is STABLE for SSR/client hydration
const DEFAULT_STATE: SubscriptionState = {
    plan: "FREE",
    features: PLAN_FEATURES.FREE,
    isLoading: false, // Start as false to avoid hydration mismatch
    error: null
};

/**
 * Hook to access subscription state and utilities
 * 
 * Usage:
 * const { plan, isPro, canAccess, openUpgradeModal } = useSubscription();
 */
export function useSubscription(initialPlan?: PlanName): UseSubscriptionReturn {
    const router = useRouter();

    // Use stable initial state to prevent hydration mismatch
    const [state, setState] = useState<SubscriptionState>(() => ({
        plan: initialPlan || "FREE",
        features: PLAN_FEATURES[initialPlan || "FREE"],
        isLoading: false,
        error: null
    }));

    // Track if we've mounted (client-side only)
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    // Fetch subscription data only on client after mount
    const fetchSubscription = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            const response = await fetch("/api/subscription/current");
            if (!response.ok) throw new Error("Failed to fetch subscription");

            const data = await response.json();
            const planName = data.planName || "FREE";

            setState({
                plan: planName,
                features: data.features || PLAN_FEATURES[planName] || PLAN_FEATURES.FREE,
                isLoading: false,
                error: null
            });
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: "Erreur lors du chargement de l'abonnement"
            }));
        }
    }, []);

    // Only fetch after mount to avoid hydration issues
    useEffect(() => {
        if (hasMounted && !initialPlan) {
            fetchSubscription();
        }
    }, [hasMounted, initialPlan, fetchSubscription]);

    // Computed values
    const isPaid = state.plan !== "FREE";
    const isPro = state.plan === "PRO" || state.plan === "BUSINESS";
    const isBusiness = state.plan === "BUSINESS";

    // Check if user can access a feature
    const canAccess = useCallback((feature: keyof PlanFeatures): boolean => {
        if (!state.features) return false;

        const value = state.features[feature];

        if (typeof value === "boolean") return value;
        if (typeof value === "number") return value !== 0;
        if (typeof value === "string") return value !== "none" && value !== null;

        return false;
    }, [state.features]);

    // Get numeric limit for a feature
    const getLimit = useCallback((feature: keyof PlanFeatures): number => {
        if (!state.features) return 0;

        const value = state.features[feature];
        return typeof value === "number" ? value : 0;
    }, [state.features]);

    // Open upgrade modal (can be connected to a global state or modal provider)
    const openUpgradeModal = useCallback((feature?: string, requiredPlan?: PlanName) => {
        // For now, just navigate to pricing with params
        const params = new URLSearchParams();
        if (feature) params.set("feature", feature);
        if (requiredPlan) params.set("plan", requiredPlan);

        router.push(`/pricing?${params.toString()}`);
    }, [router]);

    // Navigate to pricing page
    const goToPricing = useCallback(() => {
        router.push("/pricing");
    }, [router]);

    return {
        ...state,
        isPaid,
        isPro,
        isBusiness,
        canAccess,
        getLimit,
        openUpgradeModal,
        goToPricing,
        refetch: fetchSubscription
    };
}

// ============================================
// SUBSCRIPTION CONTEXT (optional for app-wide state)
// ============================================

interface SubscriptionContextValue extends UseSubscriptionReturn { }

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children, initialPlan }: { children: ReactNode; initialPlan?: PlanName }) {
    const subscription = useSubscription(initialPlan);

    return (
        <SubscriptionContext.Provider value={subscription}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscriptionContext(): SubscriptionContextValue {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error("useSubscriptionContext must be used within SubscriptionProvider");
    }
    return context;
}

