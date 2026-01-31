"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type SearchResultType = "PAGE" | "MEMBER" | "POST" | "SETTING" | "MODERATION";

export interface SearchResult {
    id: string;
    type: SearchResultType;
    title: string;
    subtitle?: string;
    url: string;
    metadata?: Record<string, any>;
}

export interface GroupedSearchResults {
    pages: SearchResult[];
    members: SearchResult[];
    settings: SearchResult[];
    posts: SearchResult[];
}

const MANAGE_PAGES = [
    { title: "Vue d'ensemble", url: "/manage", keywords: ["dashboard", "home", "stats", "overview"], subtitle: "Tableau de bord principal" },
    { title: "Membres", url: "/manage/members", keywords: ["users", "people", "roles", "permissions"], subtitle: "Gérer les membres et rôles" },
    { title: "Modération", url: "/manage/moderation", keywords: ["reports", "bans", "audit", "safety"], subtitle: "Signalements et journal d'audit" },
    { title: "Statistiques", url: "/manage/analytics", keywords: ["growth", "engagement", "charts", "data"], subtitle: "Analyse détaillée" },
    { title: "Paramètres", url: "/manage/settings", keywords: ["config", "edit", "community", "delete"], subtitle: "Configuration générale" },
    { title: "Rôles & Permissions", url: "/manage/members?tab=roles", keywords: ["roles", "permissions", "admin", "mod"], subtitle: "Configurer les accès" },
    { title: "Invitations", url: "/manage/members?tab=invites", keywords: ["invite", "link", "code"], subtitle: "Liens d'invitation" },
    { title: "Journal d'audit", url: "/manage/moderation?tab=audit", keywords: ["logs", "history", "actions"], subtitle: "Historique des actions" },
];

const SETTING_KEYS = [
    { title: "Changer le nom", url: "/manage/settings", keywords: ["name", "rename"] },
    { title: "URL / Slug", url: "/manage/settings", keywords: ["url", "link", "address"] },
    { title: "Logo & Couverture", url: "/manage/settings", keywords: ["image", "avatar", "picture", "banner"] },
    { title: "Confidentialité", url: "/manage/settings", keywords: ["privacy", "private", "public"] },
    { title: "Apparence / Thème", url: "/manage/settings", keywords: ["theme", "color", "dark", "light"] },
];

export async function searchCommunityDashboard(communitySlug: string, query: string): Promise<GroupedSearchResults> {
    if (!query || query.length < 2) {
        return { pages: [], members: [], settings: [], posts: [] };
    }

    const normalizedQuery = query.toLowerCase();

    // Parse filters
    const typeFilter = normalizedQuery.match(/is:(\w+)/)?.[1];
    const statusFilter = normalizedQuery.match(/status:(\w+)/)?.[1];

    // Clean query for text search (remove filters)
    const textQuery = normalizedQuery
        .replace(/is:\w+/g, "")
        .replace(/status:\w+/g, "")
        .trim();

    const results: GroupedSearchResults = {
        pages: [],
        members: [],
        settings: [],
        posts: []
    };

    try {
        const shouldSearch = (type: string) => !typeFilter || typeFilter === type;

        // 1. Search Static Pages
        if (shouldSearch("page")) {
            results.pages = MANAGE_PAGES.filter(page =>
                page.title.toLowerCase().includes(textQuery) ||
                page.keywords.some(k => k.includes(textQuery))
            ).map(page => ({
                id: `page-${page.url}`,
                type: "PAGE",
                title: page.title,
                subtitle: page.subtitle,
                url: `/communities/${communitySlug}${page.url}`
            }));
        }

        // 2. Search Settings
        if (shouldSearch("setting")) {
            results.settings = SETTING_KEYS.filter(setting =>
                setting.title.toLowerCase().includes(textQuery) ||
                setting.keywords.some(k => k.includes(textQuery))
            ).map(setting => ({
                id: `setting-${setting.title}`,
                type: "SETTING",
                title: setting.title,
                subtitle: "Paramètre",
                url: `/communities/${communitySlug}${setting.url}`
            }));
        }

        // 3. Database Search: Get Community ID first
        const community = await prisma.community.findUnique({
            where: { slug: communitySlug },
            select: { id: true }
        });

        if (community) {
            // Search Members
            if (shouldSearch("member") || shouldSearch("user")) {
                const members = await prisma.communityMember.findMany({
                    where: {
                        communityId: community.id,
                        user: {
                            OR: [
                                { name: { contains: textQuery, mode: "insensitive" } },
                                { email: { contains: textQuery, mode: "insensitive" } }
                            ]
                        },
                        // Apply status filter if present (e.g. status:admin -> check role)
                        ...(statusFilter === "admin" ? { role: "ADMIN" } : {}),
                        ...(statusFilter === "mod" ? { role: "MODERATOR" } : {})
                    },
                    take: 5,
                    include: { user: true }
                });

                results.members = members.map(member => ({
                    id: member.userId,
                    type: "MEMBER",
                    title: member.user.name || "Utilisateur inconnu",
                    subtitle: member.role,
                    url: `/communities/${communitySlug}/manage/members?search=${member.user.email}`,
                    metadata: { avatar: member.user.avatar || member.user.image }
                }));
            }

            // Search Posts
            if (shouldSearch("post")) {
                const posts = await prisma.post.findMany({
                    where: {
                        communityId: community.id,
                        content: { contains: textQuery, mode: "insensitive" }
                    },
                    take: 5,
                    orderBy: { createdAt: "desc" }
                });

                results.posts = posts.map(post => ({
                    id: post.id,
                    type: "POST",
                    title: post.content.substring(0, 50) + (post.content.length > 50 ? "..." : ""),
                    subtitle: "Publication récente",
                    url: `/communities/${communitySlug}/post/${post.id}`
                }));
            }
        }

    } catch (error) {
        console.error("Search error:", error);
    }

    return results;
}
