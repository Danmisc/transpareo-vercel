"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Heart, MessageSquare, UserPlus, AtSign, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { pusherClient } from "@/lib/pusher";
import { cn } from "@/lib/utils";

interface NotificationFeedProps {
    userId: string;
}

export function NotificationFeed({ userId }: NotificationFeedProps) {
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("ALL"); // ALL, UNREAD, MENTIONS

    useEffect(() => {
        const fetchNotifs = async () => {
            setIsLoading(true);
            const res = await getNotifications(userId);
            if (res.success && res.data) {
                setNotifications(res.data);
            }
            setIsLoading(false);
        };
        fetchNotifs();

        const channel = pusherClient.subscribe(`user-${userId}`);
        channel.bind("new-notification", (data: any) => {
            setNotifications(prev => [data, ...prev]);
        });

        return () => {
            pusherClient.unsubscribe(`user-${userId}`);
        };
    }, [userId]);

    const handleMarkAllRead = async () => {
        await markAllNotificationsRead(userId);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        toast.success("Toutes les notifications marquées comme lues");
        router.refresh();
    };

    const handleMarkRead = async (id: string) => {
        await markNotificationRead(id);
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? ({ ...n, read: true }) : n));
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === "UNREAD") return !n.read;
        if (filter === "MENTIONS") return n.type === "MENTION";
        return true;
    });

    const getIcon = (type: string) => {
        switch (type) {
            case "LIKE": return <Heart className="h-5 w-5 text-red-500 fill-red-500" />;
            case "COMMENT": return <MessageSquare className="h-5 w-5 text-blue-500" />;
            case "REPLY": return <MessageSquare className="h-5 w-5 text-blue-500" />;
            case "MENTION": return <AtSign className="h-5 w-5 text-orange-500" />;
            case "FOLLOW": return <UserPlus className="h-5 w-5 text-green-500" />;
            // Smart notifications
            case "PROFILE_VIEWS": return <span className="text-lg">👁️</span>;
            case "POST_TRENDING": return <span className="text-lg">🔥</span>;
            case "MILESTONE": return <span className="text-lg">🎉</span>;
            case "WEEKLY_SUMMARY": return <span className="text-lg">📊</span>;
            case "DAILY_DIGEST": return <span className="text-lg">📊</span>;
            case "ENGAGEMENT_SPIKE": return <span className="text-lg">📈</span>;
            case "NETWORK_GROWTH": return <span className="text-lg">🚀</span>;
            case "SYSTEM_TIP": return <span className="text-lg">💡</span>;
            case "ACHIEVEMENT": return <span className="text-lg">🏆</span>;
            case "BEST_TIME": return <span className="text-lg">⏰</span>;
            case "PROPERTY_INTEREST": return <span className="text-lg">🏠</span>;
            case "PROPERTY_LEADS": return <span className="text-lg">📞</span>;
            case "INACTIVE_REMINDER": return <span className="text-lg">👋</span>;
            default: return <Bell className="h-5 w-5 text-gray-500" />;
        }
    };

    const getMessage = (n: any) => {
        const sender = n.sender?.name || "Un utilisateur";
        switch (n.type) {
            case "LIKE": return <span><span className="font-semibold">{sender}</span> a aimé votre publication.</span>;
            case "COMMENT": return <span><span className="font-semibold">{sender}</span> a commenté : <span className="italic text-muted-foreground">"{n.message}"</span></span>;
            case "REPLY": return <span><span className="font-semibold">{sender}</span> a répondu : <span className="italic text-muted-foreground">"{n.message}"</span></span>;
            case "MENTION": return <span><span className="font-semibold">{sender}</span> vous a mentionné.</span>;
            case "FOLLOW": return <span><span className="font-semibold">{sender}</span> a commencé à vous suivre.</span>;
            // Smart notifications - just display the message directly
            case "PROFILE_VIEWS":
            case "POST_TRENDING":
            case "MILESTONE":
            case "WEEKLY_SUMMARY":
            case "DAILY_DIGEST":
            case "ENGAGEMENT_SPIKE":
            case "NETWORK_GROWTH":
            case "SYSTEM_TIP":
            case "ACHIEVEMENT":
            case "BEST_TIME":
            case "PROPERTY_INTEREST":
            case "PROPERTY_LEADS":
            case "INACTIVE_REMINDER":
                return <span className="font-medium">{n.message}</span>;
            default: return <span>{n.message}</span>;
        }
    };

    // Special styling for smart notifications
    const getNotificationStyle = (type: string) => {
        switch (type) {
            case "POST_TRENDING":
                return "bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-l-4 border-l-orange-500";
            case "MILESTONE":
            case "ACHIEVEMENT":
                return "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-l-4 border-l-yellow-500";
            case "WEEKLY_SUMMARY":
            case "DAILY_DIGEST":
                return "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-l-blue-500";
            case "PROFILE_VIEWS":
            case "ENGAGEMENT_SPIKE":
            case "NETWORK_GROWTH":
                return "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-l-4 border-l-green-500";
            case "SYSTEM_TIP":
            case "BEST_TIME":
                return "bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20 border-l-4 border-l-purple-500";
            case "PROPERTY_INTEREST":
            case "PROPERTY_LEADS":
                return "bg-gradient-to-r from-cyan-50 to-sky-50 dark:from-cyan-900/20 dark:to-sky-900/20 border-l-4 border-l-cyan-500";
            case "INACTIVE_REMINDER":
                return "bg-gradient-to-r from-zinc-50 to-slate-50 dark:from-zinc-900/20 dark:to-slate-900/20 border-l-4 border-l-zinc-400";
            default:
                return "";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                    <p className="text-muted-foreground mt-1">Restez informé de ce qui se passe.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                        <Check className="mr-2 h-4 w-4" /> Tout marquer comme lu
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="ALL" className="w-full" onValueChange={setFilter}>
                <TabsList className="grid w-full md:w-[400px] grid-cols-3 mb-6">
                    <TabsTrigger value="ALL">Toutes</TabsTrigger>
                    <TabsTrigger value="UNREAD">Non lues</TabsTrigger>
                    <TabsTrigger value="MENTIONS">Mentions</TabsTrigger>
                </TabsList>

                <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-8 space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-4 p-4 animate-pulse">
                                        <div className="h-10 w-10 bg-muted rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-muted rounded w-3/4" />
                                            <div className="h-3 bg-muted rounded w-1/4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                                <div className="bg-muted/50 p-4 rounded-full mb-4">
                                    <Bell className="h-8 w-8 opacity-40" />
                                </div>
                                <h3 className="font-medium text-lg text-foreground">C'est calme par ici</h3>
                                <p>Aucune notification à afficher pour le moment.</p>
                            </div>
                        ) : (
                            <ScrollArea className="h-[70vh]">
                                <div className="flex flex-col">
                                    {filteredNotifications.map((n) => (
                                        <div
                                            key={n.id}
                                            onClick={() => !n.read && handleMarkRead(n.id)}
                                            className={cn(
                                                "relative flex gap-4 p-5 hover:bg-muted/40 transition-all border-b last:border-0 cursor-pointer group",
                                                !n.read ? "bg-primary/5 hover:bg-primary/10" : "",
                                                getNotificationStyle(n.type)
                                            )}
                                        >
                                            {/* Unread indicator dot */}
                                            {!n.read && (
                                                <span className="absolute left-2 top-6 h-2 w-2 rounded-full bg-primary shadow-sm" />
                                            )}

                                            <div className="mt-1 flex-shrink-0">
                                                {n.sender ? (
                                                    <div className="relative">
                                                        <Avatar className="h-10 w-10 border border-border/50 shadow-sm">
                                                            <AvatarImage src={n.sender.avatar} />
                                                            <AvatarFallback>{n.sender.name[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-sm border border-border">
                                                            {getIcon(n.type)}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border border-border/50">
                                                        {getIcon(n.type)}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col justify-center h-full space-y-0.5">
                                                    <p className="text-sm text-foreground/90 leading-snug">
                                                        {getMessage(n)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground font-medium">
                                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </CardContent>
                </Card>
            </Tabs>
        </div>
    );
}

