"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PricingTable } from "@/components/subscription/PricingTable";
import { createCheckoutSession } from "@/lib/subscription/service";
import type { PlanName } from "@/lib/subscription/plans";

interface PricingPageClientProps {
    currentPlan: PlanName;
}

export function PricingPageClient({ currentPlan }: PricingPageClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSelectPlan = async (planName: PlanName, isYearly: boolean) => {
        if (planName === "FREE") {
            toast.info("Vous utilisez déjà le plan gratuit");
            return;
        }

        if (planName === currentPlan) {
            toast.info("C'est déjà votre plan actuel");
            return;
        }

        setIsLoading(true);

        try {
            const result = await createCheckoutSession(planName, isYearly);

            if (result.url) {
                // Redirect to Stripe Checkout
                window.location.href = result.url;
            } else {
                toast.error("Erreur lors de la création du paiement");
            }
        } catch (error: any) {
            console.error("Checkout error:", error);
            toast.error(error.message || "Une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PricingTable
            currentPlan={currentPlan}
            onSelectPlan={handleSelectPlan}
            isLoading={isLoading}
        />
    );
}

