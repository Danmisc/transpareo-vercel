"use server";

// ========================================
// GIF API ACTIONS (Giphy/Tenor)
// ========================================

const GIPHY_API_KEY = process.env.GIPHY_API_KEY || "";
const USE_GIPHY = !!GIPHY_API_KEY;

interface GifResult {
    id: string;
    url: string;
    previewUrl: string;
    width: number;
    height: number;
    title: string;
}

/**
 * Search for GIFs
 */
export async function searchGifs(
    query: string,
    limit: number = 20,
    offset: number = 0
): Promise<{ success: boolean; data?: GifResult[]; error?: string }> {
    try {
        if (!USE_GIPHY) {
            // Return mock data if no API key
            return {
                success: true,
                data: getMockGifs(query, limit)
            };
        }

        const res = await fetch(
            `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}&rating=g&lang=fr`,
            { next: { revalidate: 3600 } } // Cache for 1 hour
        );

        if (!res.ok) {
            throw new Error("Giphy API error");
        }

        const json = await res.json();

        const gifs: GifResult[] = json.data.map((gif: any) => ({
            id: gif.id,
            url: gif.images.fixed_height.url,
            previewUrl: gif.images.fixed_height_small.url || gif.images.fixed_height.url,
            width: parseInt(gif.images.fixed_height.width),
            height: parseInt(gif.images.fixed_height.height),
            title: gif.title
        }));

        return { success: true, data: gifs };
    } catch (error) {
        console.error("[GIF Search] Error:", error);
        return { success: false, error: "Erreur lors de la recherche de GIFs" };
    }
}

/**
 * Get trending GIFs
 */
export async function getTrendingGifs(
    limit: number = 20
): Promise<{ success: boolean; data?: GifResult[]; error?: string }> {
    try {
        if (!USE_GIPHY) {
            return {
                success: true,
                data: getMockGifs("trending", limit)
            };
        }

        const res = await fetch(
            `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=${limit}&rating=g`,
            { next: { revalidate: 300 } } // Cache for 5 min
        );

        if (!res.ok) {
            throw new Error("Giphy API error");
        }

        const json = await res.json();

        const gifs: GifResult[] = json.data.map((gif: any) => ({
            id: gif.id,
            url: gif.images.fixed_height.url,
            previewUrl: gif.images.fixed_height_small.url || gif.images.fixed_height.url,
            width: parseInt(gif.images.fixed_height.width),
            height: parseInt(gif.images.fixed_height.height),
            title: gif.title
        }));

        return { success: true, data: gifs };
    } catch (error) {
        console.error("[GIF Trending] Error:", error);
        return { success: false, error: "Erreur lors du chargement des GIFs" };
    }
}

/**
 * Mock GIFs for development/demo without API key
 */
function getMockGifs(query: string, limit: number): GifResult[] {
    // Using placeholder GIFs from reliable sources
    const mockGifs = [
        { id: "1", url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif", title: "Applause" },
        { id: "2", url: "https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif", title: "Thumbs Up" },
        { id: "3", url: "https://media.giphy.com/media/3oEjHAUOqG3lSS0f1C/giphy.gif", title: "Wow" },
        { id: "4", url: "https://media.giphy.com/media/l3V0j3ytFyGHqiV7W/giphy.gif", title: "Party" },
        { id: "5", url: "https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif", title: "Heart" },
        { id: "6", url: "https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif", title: "Celebrate" },
        { id: "7", url: "https://media.giphy.com/media/l41lGvinEgARjB2HC/giphy.gif", title: "Happy" },
        { id: "8", url: "https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif", title: "Excited" },
    ];

    return mockGifs.slice(0, limit).map(gif => ({
        ...gif,
        previewUrl: gif.url,
        width: 200,
        height: 150,
    }));
}
