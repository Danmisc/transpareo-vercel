"use client";

export interface RecentSearchItem {
    id: string;
    term: string;
    timestamp: number;
}

export interface RecentProfileItem {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
    timestamp: number;
}

const SEARCH_KEY = "transpareo_recent_searches";
const VIEWS_KEY = "transpareo_recent_views";
const MAX_ITEMS = 5;

export const SearchHistoryService = {
    // --- SEARCHES ---
    getRecentSearches: (): RecentSearchItem[] => {
        if (typeof window === "undefined") return [];
        try {
            const stored = localStorage.getItem(SEARCH_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    },

    addRecentSearch: (term: string) => {
        if (typeof window === "undefined" || !term.trim()) return;
        const current = SearchHistoryService.getRecentSearches();

        // Remove duplicates (case insensitive) and keep only last 9
        const filtered = current.filter(i => i.term.toLowerCase() !== term.toLowerCase());

        const newItem: RecentSearchItem = {
            id: crypto.randomUUID(),
            term: term.trim(),
            timestamp: Date.now()
        };

        const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
        localStorage.setItem(SEARCH_KEY, JSON.stringify(updated));
    },

    removeSearch: (id: string) => {
        if (typeof window === "undefined") return;
        const current = SearchHistoryService.getRecentSearches();
        const updated = current.filter(i => i.id !== id);
        localStorage.setItem(SEARCH_KEY, JSON.stringify(updated));
    },

    // --- PROFILE VIEWS ---
    getRecentViews: (): RecentProfileItem[] => {
        if (typeof window === "undefined") return [];
        try {
            const stored = localStorage.getItem(VIEWS_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    },

    addRecentView: (user: { id: string, name: string, avatar?: string | null, role?: string }) => {
        if (typeof window === "undefined" || !user.id) return;
        const current = SearchHistoryService.getRecentViews();

        const filtered = current.filter(i => i.id !== user.id);

        const newItem: RecentProfileItem = {
            id: user.id,
            name: user.name,
            avatar: user.avatar || undefined,
            role: user.role,
            timestamp: Date.now()
        };

        const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
        localStorage.setItem(VIEWS_KEY, JSON.stringify(updated));
    },

    clearAll: () => {
        if (typeof window === "undefined") return;
        localStorage.removeItem(SEARCH_KEY);
        localStorage.removeItem(VIEWS_KEY);
    }
};
