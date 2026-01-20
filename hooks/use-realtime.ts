"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ========================================
// REAL-TIME FALLBACK HOOK
// Uses Pusher when available, falls back to polling
// ========================================

interface UseRealtimeOptions<T> {
    // Pusher channel name
    channel: string;
    // Event name to listen for
    event: string;
    // Fallback fetch function
    fetcher: () => Promise<T>;
    // Polling interval in ms (when falling back)
    pollInterval?: number;
    // Whether to start polling immediately
    immediate?: boolean;
    // Callback when new data arrives
    onData?: (data: T) => void;
}

interface UseRealtimeResult<T> {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
    isPolling: boolean;
    isWebSocket: boolean;
    refresh: () => Promise<void>;
}

/**
 * Hook that uses Pusher for real-time updates with polling fallback
 * Automatically switches to polling if WebSocket connection fails
 */
export function useRealtime<T>({
    channel,
    event,
    fetcher,
    pollInterval = 30000, // 30 seconds default
    immediate = true,
    onData
}: UseRealtimeOptions<T>): UseRealtimeResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [isWebSocket, setIsWebSocket] = useState(false);

    const pollingRef = useRef<NodeJS.Timeout | null>(null);
    const pusherRef = useRef<any>(null);

    // Fetch data function
    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const result = await fetcher();
            setData(result);
            setError(null);
            onData?.(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Fetch failed"));
        } finally {
            setIsLoading(false);
        }
    }, [fetcher, onData]);

    // Start polling
    const startPolling = useCallback(() => {
        if (pollingRef.current) return;

        setIsPolling(true);
        setIsWebSocket(false);

        pollingRef.current = setInterval(fetchData, pollInterval);
        console.log("[Realtime] Polling started");
    }, [fetchData, pollInterval]);

    // Stop polling
    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
            setIsPolling(false);
        }
    }, []);

    // Try to connect Pusher
    const connectPusher = useCallback(async () => {
        try {
            // Dynamic import to avoid SSR issues
            const { pusherClient } = await import("@/lib/pusher-client");

            if (!pusherClient) {
                throw new Error("Pusher client not available");
            }

            const channelInstance = pusherClient.subscribe(channel);

            channelInstance.bind(event, (newData: T) => {
                setData(newData);
                onData?.(newData);
            });

            // Handle connection state
            pusherClient.connection.bind("connected", () => {
                setIsWebSocket(true);
                stopPolling();
                console.log("[Realtime] WebSocket connected");
            });

            pusherClient.connection.bind("disconnected", () => {
                setIsWebSocket(false);
                startPolling();
                console.log("[Realtime] WebSocket disconnected, falling back to polling");
            });

            pusherClient.connection.bind("error", () => {
                setIsWebSocket(false);
                startPolling();
                console.log("[Realtime] WebSocket error, falling back to polling");
            });

            pusherRef.current = { client: pusherClient, channel: channelInstance };

            // If already connected, set state
            if (pusherClient.connection.state === "connected") {
                setIsWebSocket(true);
            } else {
                // Start polling until WS connects
                startPolling();
            }

        } catch (err) {
            console.log("[Realtime] Pusher not available, using polling");
            startPolling();
        }
    }, [channel, event, onData, startPolling, stopPolling]);

    // Initial setup
    useEffect(() => {
        if (immediate) {
            fetchData();
        }
        connectPusher();

        return () => {
            stopPolling();
            if (pusherRef.current) {
                pusherRef.current.channel.unbind_all();
                pusherRef.current.client.unsubscribe(channel);
            }
        };
    }, []);

    return {
        data,
        isLoading,
        error,
        isPolling,
        isWebSocket,
        refresh: fetchData
    };
}

/**
 * Simpler hook for just polling (no Pusher)
 */
export function usePolling<T>(
    fetcher: () => Promise<T>,
    intervalMs: number = 30000,
    immediate: boolean = true
) {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetch = useCallback(async () => {
        try {
            setIsLoading(true);
            const result = await fetcher();
            setData(result);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Fetch failed"));
        } finally {
            setIsLoading(false);
        }
    }, [fetcher]);

    useEffect(() => {
        if (immediate) fetch();

        const interval = setInterval(fetch, intervalMs);
        return () => clearInterval(interval);
    }, [fetch, intervalMs, immediate]);

    return { data, isLoading, error, refresh: fetch };
}
