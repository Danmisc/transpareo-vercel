"use client";

import { Crown, Sparkles, Zap, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PlanName } from "@/lib/subscription/plans";

interface PlanBadgeProps {
    plan: PlanName;
    size?: "xs" | "sm" | "md" | "lg";
    showIcon?: boolean;
    className?: string;
}

const BADGE_CONFIG: Record<PlanName, { label: string; icon: React.ReactNode; className: string }> = {
    FREE: {
        label: "Gratuit",
        icon: <Zap className="h-3 w-3" />,
        className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
    },
    PLUS: {
        label: "Plus",
        icon: <Sparkles className="h-3 w-3" />,
        className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
    },
    PRO: {
        label: "Pro",
        icon: <Crown className="h-3 w-3" />,
        className: "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
    },
    BUSINESS: {
        label: "Business",
        icon: <Building2 className="h-3 w-3" />,
        className: "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
    }
};

export function PlanBadge({ plan, size = "sm", showIcon = true, className }: PlanBadgeProps) {
    const config = BADGE_CONFIG[plan] || BADGE_CONFIG.FREE;

    const sizeClasses = {
        xs: "text-[10px] px-1.5 py-0",
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-3 py-1",
        lg: "text-base px-4 py-1.5"
    };

    return (
        <Badge
            className={cn(
                "font-semibold flex items-center gap-1",
                config.className,
                sizeClasses[size],
                className
            )}
        >
            {showIcon && config.icon}
            {config.label}
        </Badge>
    );
}

// Verified badge with plan indicator
export function VerifiedBadge({ plan }: { plan: PlanName }) {
    if (plan === "FREE") return null;

    const colors = {
        PLUS: "text-blue-500",
        PRO: "text-orange-500",
        BUSINESS: "text-zinc-900 dark:text-white"
    };

    return (
        <span className={cn("inline-flex items-center", colors[plan as keyof typeof colors])}>
            {plan === "PRO" && <Crown className="h-4 w-4 fill-current" />}
            {plan === "BUSINESS" && <Building2 className="h-4 w-4 fill-current" />}
            {plan === "PLUS" && <Sparkles className="h-4 w-4" />}
        </span>
    );
}

