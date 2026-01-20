"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getFollowers, getFollowing } from "@/lib/actions";

interface FollowDialogProps {
    userId: string;
    trigger: React.ReactNode;
    initialTab?: "followers" | "following";
}

export function FollowDialog({ userId, trigger, initialTab = "followers" }: FollowDialogProps) {
    const [followers, setFollowers] = useState<any[]>([]);
    const [following, setFollowing] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [followersRes, followingRes] = await Promise.all([
                getFollowers(userId),
                getFollowing(userId)
            ]);
            if (followersRes.success) setFollowers(followersRes.data || []);
            if (followingRes.success) setFollowing(followingRes.data || []);
            setLoading(false);
        };
        fetchData();
    }, [userId]);

    const UserList = ({ users }: { users: any[] }) => (
        <ScrollArea className="h-[300px] w-full pr-4">
            <div className="space-y-4">
                {users.map((user) => (
                    <div key={user.id} className="flex items-center gap-3">
                        <Link href={`/profile/${user.id}`} className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity">
                            <Avatar className="h-10 w-10 border">
                                <AvatarImage src={user.avatar || "/avatars/default.svg"} />
                                <AvatarFallback>{user.name?.[0] || "?"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium truncate">{user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.bio || "Membre"}</p>
                            </div>
                        </Link>
                    </div>
                ))}
                {users.length === 0 && !loading && (
                    <p className="text-center text-sm text-muted-foreground py-8">Aucun utilisateur trouvé.</p>
                )}
            </div>
        </ScrollArea>
    );

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center">Réseau</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue={initialTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="followers">Abonnés ({followers.length})</TabsTrigger>
                        <TabsTrigger value="following">Abonnements ({following.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="followers" className="mt-4">
                        <UserList users={followers} />
                    </TabsContent>
                    <TabsContent value="following" className="mt-4">
                        <UserList users={following} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

