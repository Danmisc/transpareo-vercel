"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    ShieldAlert,
    BarChart3,
    Settings
} from "lucide-react";

const Icons = {
    overview: LayoutDashboard,
    members: Users,
    moderation: ShieldAlert,
    analytics: BarChart3,
    settings: Settings
};

export type IconKey = keyof typeof Icons;

interface NavLinkProps {
    item: {
        name: string;
        href: string;
        iconName: IconKey;
    };
}

export function NavLink({ item }: NavLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === item.href;
    const Icon = Icons[item.iconName] || LayoutDashboard;

    return (
        <Link
            href={item.href}
            className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            )}
        >
            <Icon
                className={cn(
                    "flex-shrink-0 -ml-1 mr-3 h-5 w-5 transition-colors",
                    isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-zinc-400 group-hover:text-zinc-500 dark:text-zinc-500 dark:group-hover:text-zinc-300"
                )}
            />
            <span className="truncate">{item.name}</span>
        </Link>
    );
}
