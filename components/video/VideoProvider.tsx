"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface VideoContextType {
    isMuted: boolean;
    toggleMute: () => void;
    setMuted: (muted: boolean) => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export function VideoProvider({ children }: { children: React.ReactNode }) {
    // Default to true (muted) for better UX/Browser Policy
    const [isMuted, setIsMuted] = useState(true);

    // Persist preference in localStorage
    useEffect(() => {
        const stored = localStorage.getItem("transpareo_video_muted");
        if (stored !== null) {
            setIsMuted(JSON.parse(stored));
        }
    }, []);

    const toggleMute = () => {
        setIsMuted((prev) => {
            const newVal = !prev;
            localStorage.setItem("transpareo_video_muted", JSON.stringify(newVal));
            return newVal;
        });
    };

    const setMuted = (muted: boolean) => {
        setIsMuted(muted);
        localStorage.setItem("transpareo_video_muted", JSON.stringify(muted));
    };

    return (
        <VideoContext.Provider value={{ isMuted, toggleMute, setMuted }}>
            {children}
        </VideoContext.Provider>
    );
}

export function useVideo() {
    const context = useContext(VideoContext);
    if (context === undefined) {
        throw new Error("useVideo must be used within a VideoProvider");
    }
    return context;
}

