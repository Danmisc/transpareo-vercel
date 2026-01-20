"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useSession } from "next-auth/react";
import { createChannel } from "@/lib/services/messaging.service";
import { useRouter } from "next/navigation";
import { Hash, Lock, Globe } from "lucide-react";

export function CreateChannelDialog({
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
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name || !session?.user?.id) return;
        setLoading(true);

        const res = await createChannel(
            session.user.id,
            name,
            description,
            isPublic
        );

        if (res.success && res.data) {
            const newConv = {
                id: res.data.id,
                name: res.data.name,
                isGroup: true,
                type: res.data.type,
                avatar: null,
                lastMessage: "Channel created",
                lastMessageAt: new Date(),
                unreadCount: 0
            };
            onSuccess(newConv);
            router.push(`/messages/${res.data.id}`);
        } else {
            console.error("Failed to create channel");
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Créer un salon</DialogTitle>
                    <DialogDescription>
                        Les salons sont des espaces de discussion thématiques.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="channel-name">Nom du salon</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">#</span>
                            <Input
                                id="channel-name"
                                value={name}
                                onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                placeholder="ex: investissements-louisiane"
                                className="pl-7 lowercase"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description (optionnel)</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="De quoi parle ce salon ?"
                            className="resize-none"
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-xl bg-zinc-50">
                        <div className="space-y-0.5">
                            <Label className="text-base flex items-center gap-2">
                                {isPublic ? <Globe size={16} className="text-blue-500" /> : <Lock size={16} className="text-amber-500" />}
                                Salon {isPublic ? "Public" : "Privé"}
                            </Label>
                            <p className="text-xs text-zinc-500 max-w-[250px]">
                                {isPublic
                                    ? "Tout le monde peut voir et rejoindre ce salon."
                                    : "Seuls les membres invités peuvent voir ce salon."}
                            </p>
                        </div>
                        <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                    <Button onClick={handleCreate} disabled={!name || loading} className="bg-orange-500 hover:bg-orange-600 min-w-[120px]">
                        {loading ? "Création..." : "Créer le salon"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

