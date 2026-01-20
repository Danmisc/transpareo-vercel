"use client";

import { useCallback } from "react";

type HapticType = "success" | "warning" | "error" | "light" | "medium" | "heavy" | "selection";

export function useHaptic() {
    const trigger = useCallback((type: HapticType = "medium") => {
        if (typeof window === "undefined" || !window.navigator?.vibrate) return;

        switch (type) {
            case "success":
                window.navigator.vibrate([10, 30, 10]);
                break;
            case "warning":
                window.navigator.vibrate([30, 50, 10]);
                break;
            case "error":
                window.navigator.vibrate([50, 100, 50]);
                break;
            case "light":
                window.navigator.vibrate(5);
                break;
            case "medium":
                window.navigator.vibrate(10);
                break;
            case "heavy":
                window.navigator.vibrate(20);
                break;
            case "selection":
                window.navigator.vibrate(2); // Very subtle
                break;
        }
    }, []);

    return { trigger };
}
