"use client";

import { Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PlanName } from "@/lib/subscription/plans";

interface FeatureGateProps {
    children: React.ReactNode;
    isAllowed: boolean;
    requiredPlan?: PlanName;
    feature?: string;
    onUpgrade?: () => void;
    blurContent?: boolean;
    showLock?: boolean;
    className?: string;
}

/**
 * FeatureGate Component
 * 
 * Wraps content that requires a specific plan to access.
 * If user doesn't have access, shows a blur overlay with upgrade CTA.
 * 
 * Usage:
 * <FeatureGate 
 *   isAllowed={userPlan !== "FREE"} 
 *   requiredPlan="PLUS" 
 *   feature="Voir qui a visité votre profil"
 *   onUpgrade={() => openUpgradeModal()}
 * >
 *   <ProfileViewsList />
 * </FeatureGate>
 */
export function FeatureGate({
    children,
    isAllowed,
    requiredPlan = "PLUS",
    feature,
    onUpgrade,
    blurContent = true,
    showLock = true,
    className
}: FeatureGateProps) {
    if (isAllowed) {
        return <>{children}</>;
    }

    return (
        <div className={cn("relative", className)}>
            {/* Blurred content */}
            <div className={cn(
                "transition-all",
                blurContent && "blur-sm opacity-50 pointer-events-none select-none"
            )}>
                {children}
            </div>

            {/* Overlay */}
            {showLock && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-[2px] rounded-xl">
                    <div className="text-center p-6 max-w-sm">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-4">
                            <Lock className="h-6 w-6 text-orange-600" />
                        </div>

                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-white mb-2">
                            Fonctionnalité {requiredPlan}
                        </h3>

                        {feature && (
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                                {feature}
                            </p>
                        )}

                        {onUpgrade && (
                            <Button
                                onClick={onUpgrade}
                                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                            >
                                <Crown className="h-4 w-4 mr-2" />
                                Passer à {requiredPlan}
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Simple inline upgrade prompt
 */
export function UpgradePrompt({
    requiredPlan = "PLUS",
    feature,
    onUpgrade,
    compact = false
}: {
    requiredPlan?: PlanName;
    feature?: string;
    onUpgrade?: () => void;
    compact?: boolean;
}) {
    if (compact) {
        return (
            <button
                onClick={onUpgrade}
                className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 text-sm font-medium"
            >
                <Crown className="h-3 w-3" />
                <span>Upgrade</span>
            </button>
        );
    }

    return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
            <Lock className="h-5 w-5 text-orange-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                    Fonctionnalité {requiredPlan}
                </p>
                {feature && (
                    <p className="text-xs text-orange-700 dark:text-orange-300 truncate">
                        {feature}
                    </p>
                )}
            </div>
            {onUpgrade && (
                <Button
                    size="sm"
                    onClick={onUpgrade}
                    className="bg-orange-600 hover:bg-orange-700 text-white flex-shrink-0"
                >
                    Upgrade
                </Button>
            )}
        </div>
    );
}

