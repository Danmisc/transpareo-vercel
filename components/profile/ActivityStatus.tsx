"use client";

import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Circle, Clock, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityStatusProps {
    lastSeen: Date | string | null;
    showActivityStatus: boolean;
    isOnline?: boolean;
    className?: string;
}

export function ActivityStatus({ lastSeen, showActivityStatus, isOnline, className }: ActivityStatusProps) {
    if (!showActivityStatus) {
        return null;
    }

    // Consider online if lastSeen within last 5 minutes
    const lastSeenDate = lastSeen ? new Date(lastSeen) : null;
    const isCurrentlyOnline = isOnline || (lastSeenDate && (Date.now() - lastSeenDate.getTime()) < 5 * 60 * 1000);

    if (isCurrentlyOnline) {
        return (
            <div className={cn("inline-flex items-center gap-1.5 text-xs", className)}>
                <Circle className="w-2.5 h-2.5 fill-green-500 text-green-500 animate-pulse" />
                <span className="text-green-600 dark:text-green-400 font-medium">En ligne</span>
            </div>
        );
    }

    if (lastSeenDate) {
        const timeAgo = formatDistanceToNow(lastSeenDate, { addSuffix: true, locale: fr });
        return (
            <div className={cn("inline-flex items-center gap-1.5 text-xs text-zinc-500", className)}>
                <Clock className="w-3 h-3" />
                <span>Actif {timeAgo}</span>
            </div>
        );
    }

    return null;
}

// Toggle component for settings
export function ActivityStatusToggle({
    showStatus,
    onToggle
}: {
    showStatus: boolean;
    onToggle: (value: boolean) => void;
}) {
    return (
        <button
            onClick={() => onToggle(!showStatus)}
            className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm",
                showStatus
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            )}
        >
            {showStatus ? (
                <>
                    <Eye className="w-4 h-4" />
                    <span>Statut d'activité visible</span>
                </>
            ) : (
                <>
                    <EyeOff className="w-4 h-4" />
                    <span>Statut d'activité masqué</span>
                </>
            )}
        </button>
    );
}

