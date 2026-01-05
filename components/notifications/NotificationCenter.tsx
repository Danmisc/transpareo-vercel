"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Trash2, MessageSquare, Heart, UserPlus, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/actions";
import { Badge } from "@/components/ui/badge";
import { pusherClient } from "@/lib/pusher";
import { toast } from "sonner";

interface NotificationCenterProps {
    userId: string;
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const fetchNotifications = async () => {
        setIsLoading(true);
        const res = await getNotifications(userId);
        if (res.success && res.data) {
            setNotifications(res.data);
            setUnreadCount(res.data.filter((n: any) => !n.read).length);
        }
        setIsLoading(false);
    };

    // Helper for Toast text
    const getMessageText = (n: any) => {
        const sender = n.sender?.name || "Un utilisateur";
        if (n.message) return `${sender}: ${n.message}`;
        switch (n.type) {
            case "LIKE": return `${sender} a aimé votre post.`;
            case "FOLLOW": return `${sender} vous suit.`;
            default: return "Nouvelle activité.";
        }
    };

    useEffect(() => {
        // Initial Fetch
        fetchNotifications();

        // Pusher Real-time Subscription
        const channel = pusherClient.subscribe(`user-${userId}`);
        channel.bind("new-notification", (data: any) => {
            setNotifications((prev) => [data, ...prev]);
            setUnreadCount((prev) => prev + 1);
            toast.info("Nouvelle notification", {
                description: getMessageText(data)
            });
        });

        // Polling fallback (30s)
        const interval = setInterval(fetchNotifications, 30000);

        return () => {
            pusherClient.unsubscribe(`user-${userId}`);
            clearInterval(interval);
        };
    }, [userId]);

    const handleMarkAllRead = async () => {
        await markAllNotificationsRead(userId);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const handleMarkRead = async (id: string) => {
        await markNotificationRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? ({ ...n, read: true }) : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "LIKE": return <Heart className="h-4 w-4 text-red-500 fill-red-500" />;
            case "COMMENT": return <MessageSquare className="h-4 w-4 text-blue-500" />;
            case "REPLY": return <MessageSquare className="h-4 w-4 text-blue-500" />;
            case "MENTION": return <AtSign className="h-4 w-4 text-orange-500" />;
            case "FOLLOW": return <UserPlus className="h-4 w-4 text-green-500" />;
            default: return <Bell className="h-4 w-4 text-gray-500" />;
        }
    };

    const getMessage = (n: any) => {
        const sender = n.sender?.name || "Un utilisateur";
        switch (n.type) {
            case "LIKE": return <span><b>{sender}</b> a aimé votre post.</span>;
            case "COMMENT": return <span><b>{sender}</b> a commenté : "{n.message}"</span>;
            case "REPLY": return <span><b>{sender}</b> a répondu : "{n.message}"</span>;
            case "MENTION": return <span><b>{sender}</b> vous a mentionné.</span>;
            case "FOLLOW": return <span><b>{sender}</b> vous suit.</span>;
            default: return <span>{n.message}</span>;
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (open) fetchNotifications();
        }}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-background animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 overflow-hidden shadow-lg border-border/60">
                <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                    <h4 className="font-semibold text-sm">Notifications ({unreadCount})</h4>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={handleMarkAllRead}>
                            <Check className="mr-1 h-3 w-3" /> Tout lire
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            Pas de notifications
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={cn(
                                        "flex gap-3 p-3 text-sm border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer",
                                        !n.read && "bg-blue-50/50 dark:bg-blue-950/20"
                                    )}
                                    onClick={() => !n.read && handleMarkRead(n.id)}
                                >
                                    <div className="mt-0.5 min-w-[20px]">{getIcon(n.type)}</div>
                                    <div className="flex-1 space-y-1">
                                        <p className="leading-snug text-foreground/90">{getMessage(n)}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    {!n.read && <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <div className="p-2 border-t bg-muted/30">
                    <Button variant="ghost" className="w-full h-8 text-xs text-muted-foreground hover:text-primary" onClick={() => window.location.href = '/notifications'}>
                        Voir toutes les notifications
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
