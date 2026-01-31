"use client";

import { useState, useEffect } from "react";

export interface RecentSearch {
    id: string;
    query: string;
    type: "query" | "page" | "member";
    title: string;
    url: string;
    timestamp: number;
}

const STORAGE_KEY = "dashboard_search_history";
const MAX_ITEMS = 5;

export function useSearchHistory() {
    const [history, setHistory] = useState<RecentSearch[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setHistory(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse search history", e);
            }
        }
    }, []);

    const addToHistory = (item: Omit<RecentSearch, "timestamp">) => {
        const newItem = { ...item, timestamp: Date.now() };

        setHistory((prev) => {
            // Remove exact duplicates by ID or URL
            const filtered = prev.filter((i) => i.id !== item.id && i.url !== item.url);

            // Add new item to top, limit to MAX_ITEMS
            const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);

            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    const removeFromHistory = (id: string) => {
        setHistory((prev) => {
            const updated = prev.filter((item) => item.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    return { history: isMounted ? history : [], addToHistory, clearHistory, removeFromHistory };
}
