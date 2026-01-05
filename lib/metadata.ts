import * as cheerio from 'cheerio';

export interface LinkMetadata {
    url: string;
    title?: string;
    description?: string;
    image?: string;
    favicon?: string;
}

export async function fetchMetadata(url: string): Promise<LinkMetadata | null> {
    try {
        // Ensure URL has protocol
        const safeUrl = url.startsWith('http') ? url : `https://${url}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(safeUrl, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Transpareo-Bot/1.0'
            }
        });
        clearTimeout(timeoutId);

        if (!response.ok) return null;

        const html = await response.text();
        const $ = cheerio.load(html);

        const title = $('meta[property="og:title"]').attr('content') || $('title').text();
        const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content');
        const image = $('meta[property="og:image"]').attr('content');

        let favicon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href');
        if (favicon && !favicon.startsWith('http')) {
            const urlObj = new URL(safeUrl);
            favicon = `${urlObj.protocol}//${urlObj.host}${favicon}`;
        }

        return {
            url: safeUrl,
            title: title?.trim(),
            description: description?.trim(),
            image,
            favicon
        };
    } catch (error) {
        console.warn(`Failed to fetch metadata for ${url}:`, error);
        return null;
    }
}
