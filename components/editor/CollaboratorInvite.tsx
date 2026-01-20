"use client";

import { useState, useCallback, useEffect } from "react";
import { Users, Search, X, Check, Loader2, UserPlus, Crown, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { inviteCollaborator, respondToCollaboration, getCollaborationInvites } from "@/lib/actions-content";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface UserResult {
    id: string;
    name: string;
    avatar?: string;
    email?: string;
}

interface Collaborator {
    id: string;
    userId: string;
    role: "CONTRIBUTOR" | "CO_AUTHOR";
    status: "PENDING" | "ACCEPTED" | "DECLINED";
    user: UserResult;
}

interface CollaboratorInviteProps {
    postId?: string;
    collaborators?: Collaborator[];
    onInvite?: (userId: string, role: "CONTRIBUTOR" | "CO_AUTHOR") => void;
    onRemove?: (userId: string) => void;
    trigger?: React.ReactNode;
    disabled?: boolean;
}

export function CollaboratorInvite({
    postId,
    collaborators = [],
    onInvite,
    onRemove,
    trigger,
    disabled = false,
}: CollaboratorInviteProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<UserResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedRole, setSelectedRole] = useState<"CONTRIBUTOR" | "CO_AUTHOR">("CONTRIBUTOR");

    const debouncedQuery = useDebounce(searchQuery, 300);

    // Search users
    const searchUsers = useCallback(async (query: string) => {
        if (!query || query.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&limit=5`);
            if (response.ok) {
                const data = await response.json();
                // Filter out already invited users
                const existingIds = collaborators.map(c => c.userId);
                setSearchResults(data.users?.filter((u: UserResult) => !existingIds.includes(u.id)) || []);
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setSearching(false);
        }
    }, [collaborators]);

    useEffect(() => {
        if (debouncedQuery) {
            searchUsers(debouncedQuery);
        } else {
            setSearchResults([]);
        }
    }, [debouncedQuery, searchUsers]);

    const handleInvite = async (user: UserResult) => {
        if (postId) {
            const result = await inviteCollaborator(postId, user.id, selectedRole);
            if (result.success) {
                toast.success(`${user.name} invité comme ${selectedRole === "CO_AUTHOR" ? "co-auteur" : "contributeur"}`);
                setSearchQuery("");
                setSearchResults([]);
            } else {
                toast.error(result.error);
            }
        } else {
            // Draft mode - just callback
            onInvite?.(user.id, selectedRole);
            toast.success(`${user.name} sera invité à la publication`);
            setSearchQuery("");
            setSearchResults([]);
        }
    };

    const getRoleIcon = (role: string) => {
        return role === "CO_AUTHOR" ? Crown : User;
    };

    const getRoleBadge = (role: string, status: string) => {
        const Icon = getRoleIcon(role);
        return (
            <span className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
                status === "PENDING" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                status === "ACCEPTED" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                status === "DECLINED" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            )}>
                <Icon size={10} />
                {role === "CO_AUTHOR" ? "Co-auteur" : "Contributeur"}
                {status === "PENDING" && " • En attente"}
            </span>
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" disabled={disabled} className="gap-2">
                        <Users size={16} />
                        Collaborateurs
                        {collaborators.length > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 text-[10px]">
                                {collaborators.length}
                            </span>
                        )}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="text-orange-500" size={20} />
                        Inviter des collaborateurs
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    {/* Role selector */}
                    <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                        {[
                            { value: "CONTRIBUTOR" as const, label: "Contributeur", icon: User, desc: "Peut commenter et éditer" },
                            { value: "CO_AUTHOR" as const, label: "Co-auteur", icon: Crown, desc: "Affiché comme auteur" },
                        ].map((role) => (
                            <button
                                key={role.value}
                                onClick={() => setSelectedRole(role.value)}
                                className={cn(
                                    "flex-1 flex items-center gap-2 px-3 py-2 rounded-md transition-all",
                                    selectedRole === role.value
                                        ? "bg-white dark:bg-zinc-700 shadow-sm"
                                        : "hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50"
                                )}
                            >
                                <role.icon size={14} className={selectedRole === role.value ? "text-orange-500" : "text-zinc-400"} />
                                <div className="text-left">
                                    <p className="text-sm font-medium">{role.label}</p>
                                    <p className="text-[10px] text-zinc-400">{role.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher un utilisateur..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50"
                        />
                        {searching && (
                            <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 animate-spin" />
                        )}
                    </div>

                    {/* Search results */}
                    {searchResults.length > 0 && (
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                            {searchResults.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => handleInvite(user)}
                                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-medium">{user.name}</p>
                                        {user.email && (
                                            <p className="text-xs text-zinc-400">{user.email}</p>
                                        )}
                                    </div>
                                    <UserPlus size={16} className="text-orange-500" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Current collaborators */}
                    {collaborators.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">
                                Collaborateurs invités
                            </p>
                            <div className="space-y-2">
                                {collaborators.map((collab) => (
                                    <div
                                        key={collab.id}
                                        className="flex items-center gap-3 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={collab.user.avatar} />
                                            <AvatarFallback>{collab.user.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{collab.user.name}</p>
                                            {getRoleBadge(collab.role, collab.status)}
                                        </div>
                                        {onRemove && (
                                            <button
                                                onClick={() => onRemove(collab.userId)}
                                                className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
                        <p className="text-sm text-zinc-400 text-center py-4">
                            Aucun utilisateur trouvé
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// --- Collaboration Invites Panel (for receiving invites) ---
interface CollaborationInvitesPanelProps {
    trigger?: React.ReactNode;
}

export function CollaborationInvitesPanel({ trigger }: CollaborationInvitesPanelProps) {
    const [open, setOpen] = useState(false);
    const [invites, setInvites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open) {
            loadInvites();
        }
    }, [open]);

    const loadInvites = async () => {
        setLoading(true);
        const result = await getCollaborationInvites();
        if (result.success) {
            setInvites(result.invites);
        }
        setLoading(false);
    };

    const handleRespond = async (postId: string, accept: boolean) => {
        const result = await respondToCollaboration(postId, accept);
        if (result.success) {
            toast.success(accept ? "Invitation acceptée" : "Invitation refusée");
            setInvites(invites.filter(i => i.postId !== postId));
        } else {
            toast.error(result.error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="sm" className="gap-2">
                        <UserPlus size={16} />
                        Invitations
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Invitations à collaborer</DialogTitle>
                </DialogHeader>

                <div className="space-y-3 mt-2">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="animate-spin text-zinc-400" size={24} />
                        </div>
                    ) : invites.length === 0 ? (
                        <p className="text-center text-zinc-400 py-8">
                            Aucune invitation en attente
                        </p>
                    ) : (
                        invites.map((invite) => (
                            <div
                                key={invite.id}
                                className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700"
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={invite.post.author.avatar} />
                                        <AvatarFallback>{invite.post.author.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="text-sm">
                                            <span className="font-medium">{invite.post.author.name}</span>
                                            {" vous invite à collaborer"}
                                        </p>
                                        <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                                            {invite.post.content}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="flex-1 bg-orange-500 hover:bg-orange-600"
                                        onClick={() => handleRespond(invite.postId, true)}
                                    >
                                        <Check size={14} className="mr-1" />
                                        Accepter
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => handleRespond(invite.postId, false)}
                                    >
                                        <X size={14} className="mr-1" />
                                        Refuser
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

