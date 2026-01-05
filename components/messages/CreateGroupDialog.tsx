"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { createConversation, searchUsers } from "@/lib/services/messaging.service";
import { useRouter } from "next/navigation";
import { Check, X, Search, Loader2 } from "lucide-react";

export function CreateGroupDialog({
    open,
    onOpenChange,
    onSuccess
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (conv: any) => void;
}) {
    const { data: session } = useSession();
    const router = useRouter();
    const [groupName, setGroupName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [contacts, setContacts] = useState<any[]>([]);
    const [loadingContacts, setLoadingContacts] = useState(true);

    useEffect(() => {
        if (open) {
            const load = async () => {
                setLoadingContacts(true);
                const res = await searchUsers(""); // Fetch all/recent
                if (res.success && res.data) {
                    // Filter out self
                    setContacts(res.data.filter((u: any) => u.id !== session?.user?.id));
                }
                setLoadingContacts(false);
            };
            load();
        }
    }, [open, session?.user?.id]);

    const toggleUser = (userId: string) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(prev => prev.filter(id => id !== userId));
        } else {
            setSelectedUsers(prev => [...prev, userId]);
        }
    };

    const handleCreate = async () => {
        if (!groupName || selectedUsers.length === 0 || !session?.user?.id) return;
        setLoading(true);

        const res = await createConversation(
            [session.user.id, ...selectedUsers],
            true, // isGroup
            groupName
        );

        if (res.success && res.data) {
            // Transform data to match list expectation if needed
            const newConv = {
                id: res.data.id,
                name: res.data.name,
                isGroup: true,
                avatar: null,
                lastMessage: "Group created",
                lastMessageAt: new Date(),
                unreadCount: 0
            };
            onSuccess(newConv);
            router.push(`/messages/${res.data.id}`);
        } else {
            console.error("Failed to create group");
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Créer un groupe</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nom du groupe</Label>
                        <Input
                            id="name"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Ex: Team Projet Immo"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Participants</Label>
                        <div className="h-[200px] overflow-y-auto border rounded-xl p-2 space-y-1">
                            {loadingContacts ? (
                                <div className="flex justify-center items-center h-full">
                                    <Loader2 className="animate-spin text-zinc-400" />
                                </div>
                            ) : contacts.length === 0 ? (
                                <div className="text-center text-sm text-zinc-500 py-4">Aucun contact trouvé</div>
                            ) : (
                                contacts.map(contact => (
                                    <div
                                        key={contact.id}
                                        onClick={() => toggleUser(contact.id)}
                                        className={cn(
                                            "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                                            selectedUsers.includes(contact.id) ? "bg-orange-50 border border-orange-100" : "hover:bg-zinc-50"
                                        )}
                                    >
                                        <div className="relative">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={contact.avatar || contact.image} />
                                                <AvatarFallback>{contact.name?.[0] || "?"}</AvatarFallback>
                                            </Avatar>
                                            {selectedUsers.includes(contact.id) && (
                                                <div className="absolute -top-1 -right-1 bg-orange-500 rounded-full p-0.5 border-2 border-white">
                                                    <Check size={8} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium">{contact.name}</span>
                                    </div>
                                )))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleCreate} disabled={!groupName || selectedUsers.length === 0 || loading} className="bg-orange-500 hover:bg-orange-600">
                        {loading ? "Création..." : "Créer le groupe"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}
