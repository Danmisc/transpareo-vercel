"use client";

import React from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users,
    Calendar,
    Globe,
    Lock,
    Shield,
    Crown,
    MessageSquare,
    FileText,
    Link as LinkIcon,
    Instagram,
    Twitter,
    Facebook,
    Linkedin,
    ExternalLink,
    TrendingUp,
    Eye,
    Heart
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CommunityAdmin {
    id: string;
    name: string;
    avatar?: string | null;
    role: "ADMIN" | "MODERATOR";
    joinedAt?: Date;
}

interface CommunityRule {
    id: string;
    title: string;
    description?: string;
}

interface CommunityStats {
    members: number;
    posts: number;
    activeToday?: number;
    growth?: number; // percentage
}

interface SocialLink {
    platform: "instagram" | "twitter" | "facebook" | "linkedin" | "website";
    url: string;
}

interface CommunityAboutTabProps {
    community: {
        id: string;
        name: string;
        slug: string;
        description?: string | null;
        type: "PUBLIC" | "PRIVATE";
        createdAt: Date;
        coverImage?: string | null;
    };
    stats: CommunityStats;
    admins: CommunityAdmin[];
    rules?: CommunityRule[];
    socialLinks?: SocialLink[];
    isAdmin?: boolean;
    isMember?: boolean;
}

const SOCIAL_ICONS = {
    instagram: Instagram,
    twitter: Twitter,
    facebook: Facebook,
    linkedin: Linkedin,
    website: Globe
};

const SOCIAL_COLORS = {
    instagram: "hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/30",
    twitter: "hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/30",
    facebook: "hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30",
    linkedin: "hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30",
    website: "hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30"
};

export function CommunityAboutTab({
    community,
    stats,
    admins,
    rules = [],
    socialLinks = [],
    isAdmin = false,
    isMember = false
}: CommunityAboutTabProps) {
    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
                <StatCard
                    icon={<Users className="w-5 h-5 text-orange-500" />}
                    label="Membres"
                    value={stats.members.toLocaleString()}
                    trend={stats.growth ? `+${stats.growth}%` : undefined}
                />
                <StatCard
                    icon={<FileText className="w-5 h-5 text-blue-500" />}
                    label="Publications"
                    value={stats.posts.toLocaleString()}
                />
                <StatCard
                    icon={<Eye className="w-5 h-5 text-green-500" />}
                    label="Actifs aujourd'hui"
                    value={stats.activeToday?.toLocaleString() || "—"}
                />
                <StatCard
                    icon={<Calendar className="w-5 h-5 text-purple-500" />}
                    label="Créée le"
                    value={format(new Date(community.createdAt), "dd MMM yyyy", { locale: fr })}
                />
            </motion.div>

            {/* Description Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-orange-500" />
                            À propos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                            {community.description || "Aucune description disponible pour cette communauté."}
                        </p>

                        {/* Community Type Badge */}
                        <div className="mt-4 flex items-center gap-2">
                            <span className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                                community.type === "PUBLIC"
                                    ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                    : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                            )}>
                                {community.type === "PUBLIC" ? (
                                    <><Globe className="w-3.5 h-3.5" /> Communauté publique</>
                                ) : (
                                    <><Lock className="w-3.5 h-3.5" /> Communauté privée</>
                                )}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Social Links */}
            {socialLinks.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                >
                    <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <LinkIcon className="w-4 h-4 text-orange-500" />
                                Liens
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {socialLinks.map((link, index) => {
                                    const Icon = SOCIAL_ICONS[link.platform];
                                    return (
                                        <a
                                            key={index}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={cn(
                                                "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
                                                "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
                                                "transition-all duration-200",
                                                SOCIAL_COLORS[link.platform]
                                            )}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                                            <ExternalLink className="w-3 h-3 opacity-50" />
                                        </a>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Administrators */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Shield className="w-4 h-4 text-orange-500" />
                            Équipe de modération
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {admins.map((admin) => (
                                <Link
                                    key={admin.id}
                                    href={`/profile/${admin.id}`}
                                    className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                                >
                                    <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-orange-200 dark:group-hover:ring-orange-800 transition-all">
                                        <AvatarImage src={admin.avatar || undefined} alt={admin.name} />
                                        <AvatarFallback className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 text-orange-700 dark:text-orange-300 font-semibold">
                                            {admin.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                                                {admin.name}
                                            </span>
                                            {admin.role === "ADMIN" && (
                                                <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                            )}
                                        </div>
                                        <span className={cn(
                                            "text-xs",
                                            admin.role === "ADMIN"
                                                ? "text-amber-600 dark:text-amber-400"
                                                : "text-blue-600 dark:text-blue-400"
                                        )}>
                                            {admin.role === "ADMIN" ? "Administrateur" : "Modérateur"}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Community Rules */}
            {rules.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.25 }}
                >
                    <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <FileText className="w-4 h-4 text-orange-500" />
                                Règles de la communauté
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {rules.map((rule, index) => (
                                    <div key={rule.id} className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                            <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                                                {index + 1}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                                                {rule.title}
                                            </h4>
                                            {rule.description && (
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                                    {rule.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Admin Actions */}
            {isAdmin && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    <Card className="border-orange-200/50 dark:border-orange-800/30 bg-orange-50/50 dark:bg-orange-950/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                        <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                                            Zone admin
                                        </h4>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            Gérer les paramètres de la communauté
                                        </p>
                                    </div>
                                </div>
                                <Button size="sm" variant="outline" className="border-orange-200 dark:border-orange-800 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30">
                                    Paramètres
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}

// Stat Card Component
function StatCard({
    icon,
    label,
    value,
    trend
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    trend?: string;
}) {
    return (
        <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                        {icon}
                    </div>
                    {trend && (
                        <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3" />
                            {trend}
                        </span>
                    )}
                </div>
                <div className="mt-2">
                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
}
