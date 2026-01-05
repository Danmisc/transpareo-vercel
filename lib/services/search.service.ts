import { prisma } from "@/lib/prisma";

export const searchService = {
    /**
     * Global search across multiple entities
     */
    /**
     * "God Mode" Global Search
     * Handles natural language parsing, advanced filtering, and weighted ranking.
     */
    search: async (
        rawQuery: string,
        type: 'all' | 'users' | 'posts' | 'communities' | 'marketplace' = 'all',
        filters: {
            role?: string;
            location?: string;
            verified?: boolean;
            minPrice?: number;
            maxPrice?: number;
            school?: string;
            industry?: string;
            // Advanced
            availability?: string;
            isVerified?: boolean;

            // Marketplace
            minSurface?: number;
            maxSurface?: number;
            amenities?: string; // Comma separated for now (e.g. "WIFI,PARKING")

            // Posts
            date?: string;
            contentType?: string;

            // Communities
            category?: string;
        } = {},
        page: number = 1,
        limit: number = 10
    ) => {
        // 1. SMART PARSE: Extract intent from query if not manually filtered
        const { query, detectedFilters } = smartParse(rawQuery);

        // Merge manual filters with detected filters (manual overrides smart)
        const finalFilters = { ...detectedFilters, ...filters };
        const searchTerm = query || rawQuery; // Fallback

        const skip = (page - 1) * limit;

        if ((!searchTerm || searchTerm.length < 2) && Object.keys(finalFilters).length === 0) {
            return { users: [], posts: [], communities: [], listings: [] };
        }

        const results: any = {
            users: [],
            posts: [],
            communities: [],
            listings: [] // Marketplace
        };

        // --- 2. USERS SEARCH (Weighted) ---
        if (type === 'all' || type === 'users') {
            const whereClause: any = {
                OR: [
                    { name: { contains: searchTerm } },
                    { bio: { contains: searchTerm } },
                    {
                        // Search by Role if query matches a role keyword roughly
                        role: { equals: mapQueryToRole(searchTerm) || undefined }
                    }
                ]
            };

            // Apply Filters
            if (finalFilters.role) whereClause.role = finalFilters.role;
            if (finalFilters.location) whereClause.location = { contains: finalFilters.location };

            // LinkedIn Fidelity Filters
            if (finalFilters.company) whereClause.company = { contains: finalFilters.company };
            if (finalFilters.school) whereClause.school = { contains: finalFilters.school };
            if (finalFilters.industry) whereClause.industry = { contains: finalFilters.industry };

            results.users = await prisma.user.findMany({
                where: whereClause,
                take: 10,
                orderBy: [
                    // Boost Verified / Premium users (custom logic needed, using role for now)
                    { role: 'desc' },
                    { name: 'asc' }
                ],
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                    role: true,
                    location: true,
                    bio: true,
                    company: true, // NEW
                    school: true,  // NEW
                    headline: true, // NEW
                    _count: { select: { followedBy: true } }
                }
            });
        }

        // --- 3. POSTS SEARCH ---
        if (type === 'all' || type === 'posts') {
            const postWhere: any = {
                content: { contains: searchTerm },
                published: true
            };

            // Date Filter
            if (finalFilters.date) {
                const now = new Date();
                let dateLimit = new Date();
                if (finalFilters.date === 'today') dateLimit.setDate(now.getDate() - 1);
                if (finalFilters.date === 'week') dateLimit.setDate(now.getDate() - 7);
                if (finalFilters.date === 'month') dateLimit.setMonth(now.getMonth() - 1);

                postWhere.createdAt = { gte: dateLimit };
            }

            // Content Type Filter
            if (finalFilters.contentType) {
                if (finalFilters.contentType === 'Vidéo') postWhere.video = { isNot: null };
                if (finalFilters.contentType === 'Image') postWhere.image = { not: null };
                // Basic text mapping for now
            }

            results.posts = await prisma.post.findMany({
                where: postWhere,
                take: 10,
                orderBy: { createdAt: 'desc' }, // Freshness first
                include: {
                    author: { select: { name: true, avatar: true, role: true } },
                    _count: { select: { comments: true } },
                    interactions: true,
                    video: true // Include video to check existence
                }
            });

            // Map interactions
            results.posts = results.posts.map((p: any) => ({
                ...p,
                likeCount: p.interactions.filter((i: any) => i.type === 'LIKE').length
            }));
        }

        // --- 4. COMMUNITIES ---
        if (type === 'all' || type === 'communities') {
            results.communities = await prisma.community.findMany({
                where: {
                    name: { contains: searchTerm },
                    category: finalFilters.category // Exact match for category
                },
                take: limit,
                skip: skip,
                select: {
                    id: true,
                    name: true,
                    image: true,
                    description: true,
                    _count: { select: { members: true } }
                }
            });
        }
        // End Communities Search

        // --- 5. MARKETPLACE LISTINGS ---
        if (type === 'all' || type === 'marketplace') {
            const listingWhere: any = {
                OR: [
                    { title: { contains: searchTerm } },
                    { description: { contains: searchTerm } },
                    { address: { contains: searchTerm } }
                ]
            };

            if (finalFilters.minPrice || finalFilters.maxPrice) {
                listingWhere.price = {};
                if (finalFilters.minPrice) listingWhere.price.gte = Number(finalFilters.minPrice);
                if (finalFilters.maxPrice) listingWhere.price.lte = Number(finalFilters.maxPrice);
            }

            // Amenities Filter (Fuzzy check in amenities string)
            if (finalFilters.amenities) {
                // e.g. "WIFI"
                // This is rudimentary. In production, use JSON_EXTRACT or relation.
                listingWhere.amenities = { contains: finalFilters.amenities };
            }

            if (finalFilters.minSurface || finalFilters.maxSurface) {
                listingWhere.surface = {};
                if (finalFilters.minSurface) listingWhere.surface.gte = Number(finalFilters.minSurface);
                if (finalFilters.maxSurface) listingWhere.surface.lte = Number(finalFilters.maxSurface);
            }

            if (finalFilters.location) {
                listingWhere.address = { contains: finalFilters.location };
            }

            results.listings = await prisma.listing.findMany({
                where: listingWhere,
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    images: { take: 1 },
                    user: { select: { name: true, avatar: true, role: true } }
                }
            });
        }

        return results;
    },

    /**
     * Helper to get autocomplete suggestions
     */
    getSuggestions: async (partial: string) => {
        if (!partial || partial.length < 2) return [];

        const term = partial.toLowerCase();

        // 1. Users (Top 3)
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: term } },
                    { role: { contains: term } } // Match role too
                ]
            },
            take: 3,
            select: { id: true, name: true, avatar: true, role: true }
        });

        // 2. Mock Companies/Schools (Phase 2 prep)
        const entities = [
            { id: "mock-1", name: "Transpareo", type: "COMPANY", avatar: null },
            { id: "mock-2", name: "Immo France", type: "COMPANY", avatar: null },
            { id: "mock-3", name: "ESSEC", type: "SCHOOL", avatar: null }
        ].filter(e => e.name.toLowerCase().includes(term));

        return [
            ...users.map(u => ({ ...u, type: "USER" })),
            ...entities
        ];
    },


    getHistory: async (userId: string) => {
        return await prisma.searchHistory.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: { query: true, createdAt: true } // Distinct is hard in Prisma without groupBy, keeping simple for now
        });
    },

    addToHistory: async (userId: string, query: string) => {
        if (!userId || !query) return;

        // Delete previous entry of same query to "bump" it to top
        try {
            // Using deleteMany to avoid error if not found (delete throws on unique constraint if not found? No, deleteMany is safe)
            // But query is not unique in schema, so this removes all past instances.
            await prisma.searchHistory.deleteMany({
                where: { userId, query }
            });

            await prisma.searchHistory.create({
                data: { userId, query }
            });
        } catch (e) {
            console.error("Failed to save search history", e);
        }
    }
};

// --- HELPERS ---

function smartParse(raw: string) {
    let query = raw;
    const detectedFilters: any = {};

    // 1. Detect City (Naive list for demo, ideally use a geolocation service or DB check)
    const majorCities = ["Paris", "Lyon", "Marseille", "Bordeaux", "Lille", "Nantes", "Strasbourg", "Toulouse", "Nice"];

    // Check if query contains a city
    for (const city of majorCities) {
        const regex = new RegExp(`\\b${city}\\b`, 'i');
        if (regex.test(query)) {
            detectedFilters.location = city;
            // Remove city from query to clean it specific filtering? 
            // query = query.replace(regex, "").trim(); 
            // Actually, keep it for broad text matching too, unless we are sure.
        }
    }

    // 2. Detect Role Intent
    const roleMap: Record<string, string> = {
        "agence": "AGENCY",
        "agent": "AGENCY",
        "immo": "AGENCY",
        "proprio": "OWNER",
        "locataire": "TENANT"
    };

    for (const [key, role] of Object.entries(roleMap)) {
        if (query.toLowerCase().includes(key)) {
            detectedFilters.role = role;
        }
    }

    return { query, detectedFilters };
}

function mapQueryToRole(term: string) {
    const t = term.toLowerCase();
    if (t.includes("agence") || t.includes("immobilier")) return "AGENCY";
    if (t.includes("proprietaire") || t.includes("bailleur")) return "OWNER";
    if (t.includes("locataire")) return "TENANT";
    return null;
}
