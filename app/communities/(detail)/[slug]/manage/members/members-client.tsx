"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MoreVertical, ShieldBan, UserX, UserCheck, Mail, Check, X, Copy } from "lucide-react";
import { banUser, kickUser, createInvitation, handleJoinRequest } from "@/lib/community-management-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";

interface Member {
    id: string; // Membership ID
    role: string;
    joinedAt: Date;
    user: {
        id: string;
        name: string | null;
        avatar: string | null;
        email: string | null;
    };
}

interface Invite {
    id: string;
    token: string;
    status: string;
    expiresAt: Date;
    uses: number;
    maxUses: number;
    role: { name: string } | null;
    inviter: { name: string | null };
}

interface JoinRequest {
    id: string;
    status: string; // PENDING
    message: string | null;
    createdAt: Date;
    user: {
        id: string;
        name: string | null;
        avatar: string | null;
        email: string | null;
    };
}

interface Role {
    id: string;
    name: string;
    color: string;
}

interface MembersClientProps {
    communityId: string;
    currentUserId: string;
    initialMembers: Member[];
    initialInvites: Invite[];
    initialRequests: JoinRequest[];
    roles: Role[];
    totalPages?: number;
}

export default function MembersClient({
    communityId,
    currentUserId,
    initialMembers,
    initialInvites,
    initialRequests,
    roles
}: MembersClientProps) {
    const [members, setMembers] = useState(initialMembers);
    const [invites, setInvites] = useState(initialInvites);
    const [requests, setRequests] = useState(initialRequests);
    const [searchQuery, setSearchQuery] = useState("");
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Invite Form
    const [inviteRole, setInviteRole] = useState("MEMBER"); // Role ID or "MEMBER" (default)
    const [maxUses, setMaxUses] = useState("1");
    const [expiryDays, setExpiryDays] = useState("7");

    const router = useRouter();

    const filteredMembers = members.filter(member =>
        member.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- ACTIONS ---

    const handleBan = async (targetUserId: string, targetName: string) => {
        if (!confirm(`Êtes-vous sûr de vouloir bannir ${targetName} ?`)) return;
        const result = await banUser(communityId, currentUserId, targetUserId, "Violation des règles");
        if (result.success) {
            toast.success(`${targetName} a été banni.`);
            setMembers(prev => prev.filter(m => m.user.id !== targetUserId));
            router.refresh();
        } else toast.error("Échec du bannissement.");
    };

    const handleKick = async (targetUserId: string) => {
        if (!confirm("Êtes-vous sûr ?")) return;
        const result = await kickUser(communityId, currentUserId, targetUserId);
        if (result.success) {
            toast.success("Expulsé avec succès");
            setMembers(prev => prev.filter(m => m.user.id !== targetUserId));
            router.refresh();
        } else toast.error("Échec de l'expulsion");
    };

    const handleCreateInvite = async () => {
        setIsLoading(true);
        const roleId = inviteRole === "MEMBER" ? undefined : inviteRole;
        const uses = parseInt(maxUses);
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + parseInt(expiryDays));

        const res = await createInvitation(communityId, currentUserId, {
            maxUses: uses,
            expiresAt: expiry,
            roleId
        });
        setIsLoading(false);

        if (res.success && res.data) {
            toast.success("Invitation créée !");
            setIsInviteOpen(false);
            setInvites([...invites, res.data as Invite]); // Add to list
            // Show link via toast? or detailed modal? For now just add to list.
            // We can also copy to clipboard right away if needed but the user sees it in the list.
        } else {
            toast.error("Erreur lors de la création de l'invitation");
        }
    };

    const onResolveRequest = async (reqId: string, action: "APPROVE" | "REJECT") => {
        const res = await handleJoinRequest(communityId, currentUserId, reqId, action);
        if (res.success) {
            toast.success(`Demande ${action === "APPROVE" ? "approuvée" : "rejetée"}`);
            setRequests(prev => prev.filter(r => r.id !== reqId));
            if (action === "APPROVE") router.refresh(); // To update member count/list
        } else {
            toast.error("Erreur lora du traitement");
        }
    };

    const copyInviteLink = (token: string) => {
        const url = `${window.location.origin}/invite/${token}`;
        navigator.clipboard.writeText(url);
        toast.success("Lien copié !");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Gestion des Membres</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Gérez les accès, les rôles et les invitations.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsInviteOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Mail className="w-4 h-4 mr-2" />
                        Inviter
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="members" className="w-full">
                <TabsList className="grid w-full md:w-[400px] grid-cols-3">
                    <TabsTrigger value="members">Membres</TabsTrigger>
                    <TabsTrigger value="requests">Demandes
                        {requests.length > 0 && <Badge variant="secondary" className="ml-2 h-5 px-1.5 min-w-[1.25rem]">{requests.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="invites">Invitations</TabsTrigger>
                </TabsList>

                {/* MEMBERS TAB */}
                <TabsContent value="members" className="mt-6 space-y-4">
                    <div className="flex items-center gap-2 max-w-sm relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Rechercher..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        {filteredMembers.map((member) => (
                            <div key={member.id} className="p-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={member.user.avatar || undefined} />
                                        <AvatarFallback>{member.user.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium text-zinc-900 dark:text-white flex items-center gap-2">
                                            {member.user.name}
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                                {member.role}
                                            </span>
                                        </div>
                                        <div className="text-xs text-zinc-500">{member.user.email} • Rejoint le {new Date(member.joinedAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleKick(member.user.id)}>
                                            <UserX className="mr-2 h-4 w-4" /> Expulser
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600" onClick={() => handleBan(member.user.id, member.user.name || "User")}>
                                            <ShieldBan className="mr-2 h-4 w-4" /> Bannir
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}
                        {filteredMembers.length === 0 && <div className="p-8 text-center text-zinc-500">Aucun membre trouvé.</div>}
                    </div>
                </TabsContent>

                {/* REQUESTS TAB */}
                <TabsContent value="requests" className="mt-6">
                    <div className="space-y-4">
                        {requests.length === 0 ? (
                            <div className="text-center py-12 border rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border-dashed">
                                <UserCheck className="mx-auto h-10 w-10 text-zinc-300 mb-2" />
                                <h3 className="text-lg font-medium">Aucune demande en attente</h3>
                                <p className="text-zinc-500 text-sm">Les utilisateurs demandant à rejoindre votre communauté privée apparaîtront ici.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {requests.map(req => (
                                    <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-zinc-950 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={req.user.avatar || undefined} />
                                                <AvatarFallback>{req.user.name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{req.user.name}</div>
                                                <div className="text-sm text-zinc-500">{req.message || "Je souhaite rejoindre cette communauté."}</div>
                                                <div className="text-xs text-zinc-400 mt-1">Demandé le {new Date(req.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => onResolveRequest(req.id, "REJECT")} disabled={isLoading} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                <X className="w-4 h-4 mr-1" /> Refuser
                                            </Button>
                                            <Button size="sm" onClick={() => onResolveRequest(req.id, "APPROVE")} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white">
                                                <Check className="w-4 h-4 mr-1" /> Accepter
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* INVITES TAB */}
                <TabsContent value="invites" className="mt-6">
                    <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <div className="p-4 border-b text-sm font-medium text-zinc-500 grid grid-cols-12 gap-4">
                            <div className="col-span-5">Lien / Token</div>
                            <div className="col-span-2">Rôle</div>
                            <div className="col-span-2">Utilisations</div>
                            <div className="col-span-2">Expiration</div>
                            <div className="col-span-1"></div>
                        </div>
                        {invites.map(invite => (
                            <div key={invite.id} className="p-4 grid grid-cols-12 gap-4 items-center border-b last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                <div className="col-span-5 font-mono text-xs truncate text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 rounded px-2 py-1 flex items-center justify-between">
                                    {invite.token}
                                    <Button variant="ghost" size="icon" className="h-5 w-5 ml-2" onClick={() => copyInviteLink(invite.token)}>
                                        <Copy className="w-3 h-3" />
                                    </Button>
                                </div>
                                <div className="col-span-2 text-sm">
                                    {invite.role?.name || "Membre"}
                                </div>
                                <div className="col-span-2 text-sm">
                                    <span className={invite.uses >= invite.maxUses ? "text-red-500" : "text-green-500"}>
                                        {invite.uses} / {invite.maxUses}
                                    </span>
                                </div>
                                <div className="col-span-2 text-xs text-zinc-500">
                                    {new Date(invite.expiresAt).toLocaleDateString()}
                                </div>
                                <div className="col-span-1 text-right">
                                    {/* Delete/Revoke action could go here */}
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500">
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {invites.length === 0 && <div className="p-8 text-center text-zinc-500">Aucune invitation active.</div>}
                    </div>
                </TabsContent>
            </Tabs>

            {/* CREATE INVITE DIALOG */}
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Créer une Invitation</DialogTitle>
                        <DialogDescription>Générez un lien unique pour inviter des membres.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Rôle à attribuer</Label>
                            <Select value={inviteRole} onValueChange={setInviteRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un rôle" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MEMBER">Membre (Défaut)</SelectItem>
                                    {roles.map(r => (
                                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nombre d'utilisations</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={maxUses}
                                    onChange={(e) => setMaxUses(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Expire dans (jours)</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={expiryDays}
                                    onChange={(e) => setExpiryDays(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInviteOpen(false)}>Annuler</Button>
                        <Button onClick={handleCreateInvite} disabled={isLoading}>
                            {isLoading ? "Création..." : "Générer le lien"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
