"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * Fetch basic user stats for the Mini-Profile
 */
export async function getSidebarStats(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                reputation: true,
                _count: {
                    select: {
                        badges: true,
                        followers: true,
                        following: true
                    }
                },
                badges: {
                    take: 1,
                    orderBy: { awardedAt: 'desc' },
                    include: { badge: true }
                }
            }
        });
        return user;
    } catch (error) {
        return null;
    }
}

/**
 * Fetch communities the user is a member of
 */
export async function getUserCommunities(userId: string) {
    try {
        const memberships = await prisma.communityMember.findMany({
            where: { userId },
            include: {
                community: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        image: true,
                        _count: { select: { members: true } }
                    }
                }
            },
            take: 5
        });
        return memberships.map(m => m.community);
    } catch (error) {
        return [];
    }
}

/**
 * Fetch recommended real estate listings (Simple Location Match)
 */
export async function getRecommendedListings(userId?: string) {
    try {
        let locationFilter = {};

        if (userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { location: true }
            });

            // Simple string match for city name if available
            if (user?.location) {
                // In a real app, this would be more robust (PostGIS or similar)
                // For now, we perform a broad search or just return recent if no match
                // locationFilter = { address: { contains: user.location } }; 
                // SQLite 'contains' might be limited, let's just fetch recents and filter in code or just fetch recents
            }
        }

        const listings = await prisma.listing.findMany({
            where: {
                // ...locationFilter
            },
            orderBy: { createdAt: 'desc' },
            take: 3,
            include: {
                images: { take: 1 }
            }
        });

        return listings;
    } catch (error) {
        console.error("Listing fetch error:", error);
        return [];
    }
}

/**
 * Fetch stats for the "Daily Brief"
 */
/**
 * Fetch stats for the "Daily Brief"
 */
export async function getDailyBriefStats(userId: string) {
    try {
        // Fetch user context for Actions
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                tenantDossier: {
                    select: { status: true, id: true }
                },
                leases: {
                    where: { status: "ACTIVE" },
                    take: 1,
                    include: { property: { select: { address: true } } }
                },
                listings: {
                    where: { applications: { some: { status: "SENT" } } },
                    select: { id: true, applications: { where: { status: "SENT" } } }
                }
            }
        });

        // 1. Unread Notifications
        const unreadNotifications = await prisma.notification.count({
            where: {
                userId,
                read: false
            }
        });

        // 2. New Listings (Last 24h)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const newListings = await prisma.listing.count({
            where: {
                createdAt: {
                    gte: yesterday
                }
            }
        });

        // 3. Next Action Logic
        let nextEvent = null;

        // Priority 1: Pending Applications (Owner Side)
        const pendingApps = user?.listings.reduce((acc, l) => acc + l.applications.length, 0) || 0;

        if (pendingApps > 0) {
            nextEvent = {
                title: "Candidatures reçues",
                time: `${pendingApps} en attente`,
                location: "Mes Annonces",
                type: "ACTION"
            };
        }
        // Priority 2: Incomplete Dossier (Tenant Side)
        else if (user?.tenantDossier?.status === "INCOMPLETE") {
            nextEvent = {
                title: "Dossier Incomplet",
                time: "Action requise",
                location: "Mon Dossier",
                type: "ALERT"
            };
        }
        // Priority 3: Rent Due (Tenant Side - Active Lease)
        else if (user?.leases && user.leases.length > 0) {
            const today = new Date();
            // Assume rent is due on the 5th of next month
            const nextRentDate = new Date(today.getFullYear(), today.getMonth() + 1, 5);
            const dateStr = nextRentDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

            nextEvent = {
                title: "Prochain Loyer",
                time: dateStr,
                location: user.leases[0].property.address.split(',')[0], // Shorten address
                type: "INFO"
            };
        }

        return {
            unreadNotifications,
            newListings,
            nextEvent
        };
    } catch (error) {
        console.error("DailyBrief Error:", error);
        return { unreadNotifications: 0, newListings: 0, nextEvent: null };
    }
}
