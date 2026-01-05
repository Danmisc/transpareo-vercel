"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusher";
import { useSession } from "next-auth/react";
import { updatePresence } from "@/lib/services/messaging.service";

interface PresenceContextType {
    onlineUsers: Set<string>;
}

const PresenceContext = createContext<PresenceContextType>({
    onlineUsers: new Set()
});

export function PresenceProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!session?.user?.id) return;

        // 1. Heartbeat (Server DB update)
        updatePresence(session.user.id);
        const interval = setInterval(() => {
            updatePresence(session.user.id!);
        }, 120 * 1000); // 2 mins

        // 2. Real-time Subscription (Pusher Presence)
        console.log("Subscribing to presence-global");
        const channel = pusherClient.subscribe("presence-global");

        channel.bind("pusher:subscription_succeeded", (members: any) => {
            const initialMembers = new Set<string>();
            members.each((member: any) => initialMembers.add(member.id));
            setOnlineUsers(initialMembers);
        });

        channel.bind("pusher:member_added", (member: any) => {
            setOnlineUsers(prev => new Set(prev).add(member.id));
        });

        channel.bind("pusher:member_removed", (member: any) => {
            setOnlineUsers(prev => {
                const next = new Set(prev);
                next.delete(member.id);
                return next;
            });
        });

        return () => {
            pusherClient.unsubscribe("presence-global");
            clearInterval(interval);
        };
    }, [session?.user?.id]);

    return (
        <PresenceContext.Provider value={{ onlineUsers }}>
            {children}
        </PresenceContext.Provider>
    );
}

export const usePresence = () => useContext(PresenceContext);
