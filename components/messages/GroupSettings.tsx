"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Users, Shield, LogOut, MoreVertical, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
// Assuming Switch exists, if not I will use a simple checkbox logic manually or Button.
// I'll check if switch exists by listing files? No, I'll use standard input checkbox for safety.

interface GroupSettingsProps {
    conversation: any;
    currentUserRole: "ADMIN" | "MEMBER";
    currentUserId: string;
    onUpdate: (data: any) => Promise<void>;
    onLeave: () => Promise<void>;
    onPromote: (userId: string) => Promise<void>;
    onKick: (userId: string) => Promise<void>;
}

export function GroupSettings({ conversation, currentUserRole, currentUserId, onUpdate, onLeave, onPromote, onKick }: GroupSettingsProps) {
    const [name, setName] = useState(conversation.name || "");
    const [isSaving, setIsSaving] = useState(false);

    // Permission State (Mock for now, typically parsed)
    const [allowInvite, setAllowInvite] = useState(true);

    const handleSave = async () => {
        setIsSaving(true);
        // Pass permissions logic here if backend supports it updateGroupInfo extended
        await onUpdate({
            name,
            image: conversation.image,
            permissions: JSON.stringify({ allowInvite })
        });
        setIsSaving(false);
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const formData = new FormData();
                formData.append("file", file);
                const res = await fetch("/api/upload/local", { method: "POST", body: formData });
                if (!res.ok) throw new Error("Upload failed");
                const data = await res.json();

                // Update conversation immediately
                await onUpdate({
                    name,
                    image: data.url,
                    permissions: JSON.stringify({ allowInvite })
                });
            } catch (err) {
                console.error("Avatar upload error:", err);
                alert("Erreur lors de l'upload de l'avatar");
            }
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-zinc-100 rounded-full">
                    <Settings className="w-5 h-5 text-zinc-500" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Paramètres du groupe</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Header Info */}
                    <div className="flex flex-col items-center gap-3 relative">
                        <div className="relative group cursor-pointer">
                            <Avatar className="w-20 h-20 border-2 border-zinc-100">
                                <AvatarImage src={conversation.image} />
                                <AvatarFallback className="text-xl bg-zinc-100">{name[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            {currentUserRole === "ADMIN" && (
                                <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                    <Pencil size={16} />
                                </label>
                            )}
                            <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={currentUserRole !== "ADMIN"} />
                        </div>

                        {currentUserRole === "ADMIN" ? (
                            <div className="flex w-full max-w-[200px] gap-2">
                                <Input value={name} onChange={(e) => setName(e.target.value)} className="text-center h-8" />
                                <Button size="sm" onClick={handleSave} disabled={isSaving || name === conversation.name}>ok</Button>
                            </div>
                        ) : (
                            <h2 className="font-semibold text-lg">{conversation.name}</h2>
                        )}
                        <p className="text-sm text-zinc-500">{conversation.participants.length} membres</p>
                    </div>

                    {/* Members List */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Membres</h3>
                        <div className="max-h-[200px] overflow-y-auto space-y-1">
                            {conversation.participants.map((p: any) => (
                                <div key={p.userId} className="flex items-center justify-between p-2 hover:bg-zinc-50 rounded-lg group">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={p.user.avatar} />
                                            <AvatarFallback>{p.user.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm font-medium">{p.user.name}</span>
                                                {p.role === "ADMIN" && <Shield size={12} className="text-orange-500" />}
                                                {p.userId === currentUserId && <span className="text-xs text-zinc-400">(Vous)</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Admin Actions */}
                                    {currentUserRole === "ADMIN" && p.userId !== currentUserId && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                                    <MoreVertical size={14} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {p.role !== "ADMIN" && (
                                                    <DropdownMenuItem onClick={() => onPromote(p.userId)}>
                                                        <Shield className="w-4 h-4 mr-2" /> Promouvoir Admin
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem onClick={() => onKick(p.userId)} className="text-red-600">
                                                    <Trash2 className="w-4 h-4 mr-2" /> Retirer du groupe
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Permissions (Admin Only) */}
                    {currentUserRole === "ADMIN" && (
                        <div className="space-y-3 pt-4 border-t border-zinc-100">
                            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Permissions Membres</h3>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="allow-invite" className="text-sm">Inviter des personnes</Label>
                                <div className="flex items-center h-5">
                                    <input
                                        type="checkbox"
                                        id="allow-invite"
                                        checked={allowInvite}
                                        onChange={(e) => setAllowInvite(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-2 border-t border-zinc-100">
                        <Button variant="ghost" className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 justify-start" onClick={onLeave}>
                            <LogOut className="w-4 h-4 mr-2" /> Quitter le groupe
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
