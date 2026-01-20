"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getNetwork } from "@/lib/follow-actions";
import Link from "next/link";
import { UserMinus, UserPlus, Loader2 } from "lucide-react";

interface NetworkDialogProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    initialTab?: "followers" | "following";
}

export function NetworkDialog({ isOpen, onClose, userId, initialTab = "followers" }: NetworkDialogProps) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadUsers(activeTab);
        }
    }, [isOpen, activeTab, userId]);

    // Keep activeTab in sync if prop changes while closed
    useEffect(() => {
        if (isOpen) setActiveTab(initialTab);
    }, [initialTab, isOpen]);

    const loadUsers = async (tab: string) => {
        setLoading(true);
        const type = tab === "followers" ? "FOLLOWERS" : "FOLLOWING";
        const res = await getNetwork(userId, type);
        if (res.success) {
            setUsers(res.data || []);
        }
        setLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md h-[500px] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-center">{activeTab === "followers" ? "Abonnés" : "Abonnements"}</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue={initialTab} value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full h-full flex flex-col">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="followers">Abonnés</TabsTrigger>
                        <TabsTrigger value="following">Abonnements</TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto mt-4 pr-2">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                Aucun utilisateur trouvé.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {users.map((u) => (
                                    <div key={u.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={u.avatar || "/avatars/default.svg"} />
                                                <AvatarFallback>{u.name?.[0] || "U"}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <Link href={`/profile/${u.id}`} onClick={onClose} className="font-semibold hover:underline">
                                                    {u.name}
                                                </Link>
                                                {u.bio && (
                                                    <span className="text-xs text-muted-foreground line-clamp-1 max-w-[150px]">
                                                        {u.bio}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {/* Action buttons could go here (Follow/Unfollow) - kept simple for now */}
                                        <Link href={`/profile/${u.id}`} onClick={onClose}>
                                            <Button variant="ghost" size="sm">Profil</Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

