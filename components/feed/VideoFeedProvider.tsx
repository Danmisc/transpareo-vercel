"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";

interface VideoFeedContextType {
    registerVideo: (id: string, element: HTMLElement) => void;
    unregisterVideo: (id: string) => void;
    activeVideoId: string | null;
}

const VideoFeedContext = createContext<VideoFeedContextType | undefined>(undefined);

export function VideoFeedProvider({ children }: { children: React.ReactNode }) {
    const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
    const observer = useRef<IntersectionObserver | null>(null);
    const registry = useRef<Map<string, HTMLElement>>(new Map());



    // Better Strategy:
    // Store intersection state of all tracked items. Recalculate "Winner" on every change.
    const intersectionStates = useRef<Map<string, number>>(new Map());

    const checkBestVideo = useCallback(() => {
        let bestId: string | null = null;
        let maxRatio = 0.5;

        intersectionStates.current.forEach((ratio, id) => {
            if (ratio > maxRatio) {
                maxRatio = ratio;
                bestId = id;
            }
        });

        // Optimization: Don't flip-flop if the current active is still "good enough" (e.g. > 0.6)
        // to prevent jitter.
        setActiveVideoId(prev => {
            if (prev && intersectionStates.current.get(prev)! > 0.6) return prev;
            return bestId;
        });

    }, []);

    useEffect(() => {
        observer.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.getAttribute("data-video-id");
                if (id) {
                    intersectionStates.current.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
                }
            });
            checkBestVideo();
        }, {
            threshold: [0, 0.25, 0.5, 0.75, 1.0],
            rootMargin: "-20% 0px -20% 0px" // Focus area in center
        });

        return () => {
            observer.current?.disconnect();
        };
    }, [checkBestVideo]);

    const registerVideo = useCallback((id: string, element: HTMLElement) => {
        registry.current.set(id, element);
        element.setAttribute("data-video-id", id);
        observer.current?.observe(element);
    }, []);

    const unregisterVideo = useCallback((id: string) => {
        const el = registry.current.get(id);
        if (el) {
            observer.current?.unobserve(el);
            registry.current.delete(id);
            intersectionStates.current.delete(id);
        }
        if (activeVideoId === id) setActiveVideoId(null);
    }, [activeVideoId]);

    return (
        <VideoFeedContext.Provider value={{ registerVideo, unregisterVideo, activeVideoId }}>
            {children}
        </VideoFeedContext.Provider>
    );
}

export const useVideoFeed = () => {
    const context = useContext(VideoFeedContext);
    if (!context) {
        throw new Error("useVideoFeed must be used within a VideoFeedProvider");
    }
    return context;
};
