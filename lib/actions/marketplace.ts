"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function searchAddress(query: string) {
    if (!query || query.length < 1) return [];

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=fr`, {
            headers: {
                "User-Agent": "TranspareoApp/1.0 (contact@transpareo.com)"
            }
        });

        if (!response.ok) {
            throw new Error(`Nominatim error: ${response.status}`);
        }

        const data = await response.json();
        return data; // Returns array of places
    } catch (error) {
        console.error("Error searching address:", error);
        return [];
    }
}

export async function getListings(filters: any = {}) {
    try {
        const { minPrice, maxPrice, minSurface, maxSurface, type, rooms, query, bounds } = filters;

        const where: any = {};

        if (type) where.type = type;
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice);
            if (maxPrice) where.price.lte = parseFloat(maxPrice);
        }
        if (minSurface || maxSurface) {
            where.surface = {};
            if (minSurface) where.surface.gte = parseFloat(minSurface);
            if (maxSurface) where.surface.lte = parseFloat(maxSurface);
        }
        if (rooms) {
            where.rooms = { gte: parseInt(rooms) };
        }

        // Text Search (OmniSearch)
        if (query && query.length > 0) {
            where.OR = [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { address: { contains: query, mode: 'insensitive' } },
                // City/Zip could be extracted from address or separate fields if available
            ];
        }

        // Map Bounds Search (NorthEast, SouthWest)
        if (bounds && typeof bounds === 'object' && '_northEast' in bounds && '_southWest' in bounds) {
            // Leaflet bounds object structure
            const ne = bounds._northEast;
            const sw = bounds._southWest;

            if (ne && sw) {
                where.latitude = {
                    gte: sw.lat,
                    lte: ne.lat
                };
                where.longitude = {
                    gte: sw.lng,
                    lte: ne.lng
                };
            }
        }

        // Sorting
        let orderBy: any = { createdAt: 'desc' }; // Default
        if (filters.sort) {
            switch (filters.sort) {
                case 'price_asc':
                    orderBy = { price: 'asc' };
                    break;
                case 'price_desc':
                    orderBy = { price: 'desc' };
                    break;
                case 'date_asc':
                    orderBy = { createdAt: 'asc' };
                    break;
                case 'date_desc':
                    orderBy = { createdAt: 'desc' };
                    break;
                case 'surface_desc':
                    orderBy = { surface: 'desc' };
                    break;
                default:
                    orderBy = { createdAt: 'desc' };
            }
        }

        // 1. Fetch data (filtered by basic criteria)
        let listings = await prisma.listing.findMany({
            where,
            include: {
                images: true,
                user: {
                    select: {
                        name: true,
                        image: true,
                    }
                }
            },
            orderBy
        });

        // 2. Filter by Polygon if exists (In-Memory Refinement)
        if (filters.polygon && Array.isArray(filters.polygon) && filters.polygon.length > 0) {
            const { isPointInPolygon } = await import("@/lib/utils/geometry");
            listings = listings.filter(listing =>
                isPointInPolygon([listing.latitude, listing.longitude], filters.polygon)
            );
        }

        return { success: true, data: listings };
    } catch (error) {
        console.error("Error fetching listings:", error);
        return { success: false, error: "Failed to fetch listings" };
    }
}

export async function createListing(data: any, userId: string) {
    try {
        const listing = await prisma.listing.create({
            data: {
                title: data.title,
                description: data.description,
                price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
                surface: typeof data.surface === 'string' ? parseFloat(data.surface) : data.surface,
                rooms: typeof data.rooms === 'string' ? parseInt(data.rooms) : data.rooms,
                type: data.type, // RENT or SALE
                propertyType: data.propertyType,
                address: data.address,
                latitude: data.latitude,
                longitude: data.longitude,
                userId: userId,
                virtualTourUrl: data.virtualTourUrl || null,
                amenities: Array.isArray(data.amenities) ? data.amenities.join(",") : data.amenities,

                // Technical Headers
                bedrooms: data.bedrooms ? (typeof data.bedrooms === 'string' ? parseInt(data.bedrooms) : data.bedrooms) : null,
                floor: data.floor ? (typeof data.floor === 'string' ? parseInt(data.floor) : data.floor) : null,
                totalFloors: data.totalFloors ? (typeof data.totalFloors === 'string' ? parseInt(data.totalFloors) : data.totalFloors) : null,
                isFurnished: data.isFurnished === 'true' || data.isFurnished === true,
                heatingType: data.heatingType || null,

                // Energy Headers
                energyClass: data.energyClass || null,
                dpeValue: data.dpeValue ? (typeof data.dpeValue === 'string' ? parseInt(data.dpeValue) : data.dpeValue) : null,
                gesValue: data.gesValue ? (typeof data.gesValue === 'string' ? parseInt(data.gesValue) : data.gesValue) : null,

                // Financial Headers
                charges: data.charges ? (typeof data.charges === 'string' ? parseFloat(data.charges) : data.charges) : null,
                deposit: data.deposit ? (typeof data.deposit === 'string' ? parseFloat(data.deposit) : data.deposit) : null,

                // Contact
                contactName: data.contactName,
                contactPhone: data.contactPhone,
                contactEmail: data.contactEmail,

                images: {
                    create: (data.images || []).map((url: string) => ({ url }))
                }
            }
        });
        revalidatePath("/marketplace");
        return { success: true, data: listing };
    } catch (error) {
        console.error("Detailed Error creating listing:", JSON.stringify(error, null, 2));
        console.error("Original Error:", error);
        return { success: false, error: "Failed to create listing. Check server logs." };
    }
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getListingById(id: string) {
    if (!id) return { success: false, error: "Listing ID is required" };

    try {
        const listing = await prisma.listing.findUnique({
            where: { id },
            include: {
                images: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        role: true, // To distinguish Agency/Owner
                        createdAt: true, // For "Joined since..."
                    }
                }
            }
        });

        if (!listing) return { success: false, error: "Listing not found" };

        return { success: true, data: listing };
    } catch (error) {
        console.error("Error fetching listing:", error);
        return { success: false, error: "Failed to fetch listing" };
    }
}

export async function sendListingInquiry(formData: FormData) {
    const listingId = formData.get('listingId') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const message = formData.get('message') as string;

    if (!listingId || !email || !message) {
        return { success: false, error: "Missing required fields" };
    }

    try {
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            include: { user: true }
        });

        if (!listing) return { success: false, error: "Listing not found" };

        await delay(1000); // Simulate network

        console.log(`[INQUIRY] From: ${email} To: ${listing.user.email} | Msg: ${message}`);

        return { success: true, message: "Votre demande a bien été envoyée." };

    } catch (error) {
        console.error("Error sending inquiry:", error);
        return { success: false, error: "Failed to send message" };
    }
}

export async function getSimilarListings(listingId: string) {
    try {
        const currentListing = await prisma.listing.findUnique({
            where: { id: listingId },
            select: { price: true, type: true, rooms: true }
        });

        if (!currentListing) return [];

        const minPrice = currentListing.price * 0.8;
        const maxPrice = currentListing.price * 1.2;

        const similar = await prisma.listing.findMany({
            where: {
                id: { not: listingId },
                type: currentListing.type,
                price: { gte: minPrice, lte: maxPrice },
                // rooms: { gte: currentListing.rooms - 1 } // Optional: relaxed constraint
            },
            take: 3,
            include: { images: true }
        });

        return similar;
    } catch (error) {
        console.error("Error fetching similar listings:", error);
        return [];
    }
}
