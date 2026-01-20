"use client";

import { Crown, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProBadgeProps {
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
    className?: string;
}

export function ProBadge({ size = "md", showLabel = false, className }: ProBadgeProps) {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6"
    };

    const containerClasses = {
        sm: "px-1.5 py-0.5 text-[10px]",
        md: "px-2 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm"
    };

    if (showLabel) {
        return (
            <div className={cn(
                "inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full font-bold shadow-lg shadow-orange-500/25",
                containerClasses[size],
                className
            )}>
                <Crown className={sizeClasses[size]} />
                <span>PRO</span>
            </div>
        );
    }

    return (
        <div className={cn(
            "inline-flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-full shadow-lg shadow-orange-500/25",
            size === "sm" ? "w-5 h-5" : size === "md" ? "w-6 h-6" : "w-8 h-8",
            className
        )}>
            <Crown className={cn(sizeClasses[size], "drop-shadow")} />
        </div>
    );
}

interface VerifiedBadgeProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function VerifiedBadge({ size = "md", className }: VerifiedBadgeProps) {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6"
    };

    return (
        <div className={cn(
            "inline-flex items-center justify-center bg-blue-500 text-white rounded-full",
            size === "sm" ? "w-4 h-4" : size === "md" ? "w-5 h-5" : "w-6 h-6",
            className
        )}>
            <Check className={cn(
                size === "sm" ? "w-2.5 h-2.5" : size === "md" ? "w-3 h-3" : "w-4 h-4",
                "stroke-[3]"
            )} />
        </div>
    );
}

// Combined badge display
interface ProfileBadgesProps {
    isPro: boolean;
    isVerified: boolean;
    size?: "sm" | "md" | "lg";
}

export function ProfileBadges({ isPro, isVerified, size = "md" }: ProfileBadgesProps) {
    if (!isPro && !isVerified) return null;

    return (
        <div className="inline-flex items-center gap-1">
            {isVerified && <VerifiedBadge size={size} />}
            {isPro && <ProBadge size={size} />}
        </div>
    );
}

