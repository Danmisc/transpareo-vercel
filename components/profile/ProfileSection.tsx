"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ProfileSectionProps {
    title?: string;
    children: ReactNode;
    action?: ReactNode;
    className?: string;
    noPadding?: boolean;
}

export function ProfileSection({ title, children, action, className, noPadding = false }: ProfileSectionProps) {
    return (
        <section className={cn(
            "bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden mb-6 group hover:shadow-md transition-all duration-300",
            className
        )}>
            {title && (
                <div className="px-6 py-5 flex items-center justify-between border-b border-border/30 bg-gradient-to-r from-zinc-50/50 to-white/50 dark:from-zinc-900/50 dark:to-zinc-950/50 backdrop-blur-sm">
                    <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                        {title}
                    </h2>
                    {action && (
                        <div className="flex-shrink-0 ml-4 animate-in fade-in slide-in-from-right-4 duration-500">
                            {action}
                        </div>
                    )}
                </div>
            )}
            <div className={cn(
                "relative",
                noPadding ? "" : "p-6"
            )}>
                {children}
            </div>
        </section>
    );
}
