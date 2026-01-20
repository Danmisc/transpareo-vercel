"use client";

import { useEffect, useRef } from "react";

export function useWatchTime(postId: string, isActive: boolean) {
    const startTimeRef = useRef<number | null>(null);
    const accumulatedTimeRef = useRef<number>(0);

    useEffect(() => {
        if (isActive) {
            // Start Timer
            startTimeRef.current = Date.now();
        } else {
            // Stop Timer & Accumulate
            if (startTimeRef.current) {
                const sessionTime = Date.now() - startTimeRef.current;
                accumulatedTimeRef.current += sessionTime;
                startTimeRef.current = null;

                // TODO: Here we would trigger an API call if meaningful time
                // sendAnalytics(postId, sessionTime);
                console.log(`[Analytics] Post ${postId} watched for ${sessionTime}ms (Total: ${accumulatedTimeRef.current}ms)`);
            }
        }

        return () => {
            // Cleanup on unmount (e.g. user closes modal)
            if (startTimeRef.current) {
                const sessionTime = Date.now() - startTimeRef.current;
                accumulatedTimeRef.current += sessionTime;
                console.log(`[Analytics] Post ${postId} closed after ${sessionTime}ms`);
            }
        };
    }, [isActive, postId]);
}
