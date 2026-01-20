"use client";

import {
    Twitter,
    Linkedin,
    Instagram,
    Facebook,
    Youtube,
    Globe,
    Link as LinkIcon,
    ExternalLink,
    Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SocialLink {
    platform: string;
    url: string;
    label?: string;
}

interface SocialLinksProps {
    links: SocialLink[];
    isOwner: boolean;
    onEdit?: () => void;
    compact?: boolean;
}

const PLATFORM_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    twitter: { icon: Twitter, color: "bg-sky-100 text-sky-600 hover:bg-sky-200", label: "Twitter" },
    linkedin: { icon: Linkedin, color: "bg-blue-100 text-blue-600 hover:bg-blue-200", label: "LinkedIn" },
    instagram: { icon: Instagram, color: "bg-pink-100 text-pink-600 hover:bg-pink-200", label: "Instagram" },
    facebook: { icon: Facebook, color: "bg-indigo-100 text-indigo-600 hover:bg-indigo-200", label: "Facebook" },
    youtube: { icon: Youtube, color: "bg-red-100 text-red-600 hover:bg-red-200", label: "YouTube" },
    website: { icon: Globe, color: "bg-zinc-100 text-zinc-600 hover:bg-zinc-200", label: "Site web" },
    other: { icon: LinkIcon, color: "bg-zinc-100 text-zinc-600 hover:bg-zinc-200", label: "Lien" },
};

export function SocialLinks({ links, isOwner, onEdit, compact = false }: SocialLinksProps) {
    if (links.length === 0 && !isOwner) {
        return null;
    }

    if (compact) {
        return (
            <div className="flex items-center gap-2 px-4">
                {links.map((link, i) => {
                    const config = PLATFORM_CONFIG[link.platform.toLowerCase()] || PLATFORM_CONFIG.other;
                    const Icon = config.icon;
                    return (
                        <Link
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                config.color
                            )}
                            title={link.label || config.label}
                        >
                            <Icon className="w-4 h-4" />
                        </Link>
                    );
                })}
                {isOwner && onEdit && (
                    <button
                        onClick={onEdit}
                        className="w-8 h-8 rounded-full border-2 border-dashed border-zinc-300 flex items-center justify-center hover:border-orange-500 hover:bg-orange-50 transition-colors"
                    >
                        <Plus className="w-4 h-4 text-zinc-400" />
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white/50 dark:bg-zinc-900/30 backdrop-blur-xl rounded-2xl p-4 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-zinc-500" />
                    <h4 className="font-semibold text-sm">Liens</h4>
                </div>
                {isOwner && onEdit && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onEdit}
                        className="h-7 text-xs"
                    >
                        Modifier
                    </Button>
                )}
            </div>

            <div className="space-y-2">
                {links.map((link, i) => {
                    const config = PLATFORM_CONFIG[link.platform.toLowerCase()] || PLATFORM_CONFIG.other;
                    const Icon = config.icon;
                    return (
                        <Link
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                        >
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", config.color)}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{link.label || config.label}</p>
                                <p className="text-xs text-zinc-500 truncate">{link.url}</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    );
                })}

                {links.length === 0 && isOwner && onEdit && (
                    <button
                        onClick={onEdit}
                        className="w-full p-4 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg text-center hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                    >
                        <Plus className="w-5 h-5 text-zinc-400 mx-auto mb-1" />
                        <p className="text-sm text-zinc-500">Ajouter des liens</p>
                    </button>
                )}
            </div>
        </div>
    );
}

