"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Link as LinkIcon, Calendar, Edit, MessageSquare, UserPlus, Check, Trophy, MoreVertical, BellOff, Ban, UserMinus, ChevronDown } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/lib/types";
import { EditProfileDialog } from "./EditProfileDialog";
import { NetworkDialog } from "./NetworkDialog";
import { SearchHistoryService } from "@/components/search/SearchHistoryService";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FollowDialog } from "./FollowDialog";
import { followUser, unfollowUser, blockUser, unblockUser, toggleMuteUser, updateRelationshipType } from "@/lib/follow-actions";

interface ProfileHeaderProps {
    user: UserProfile & {
        bio?: string;
        location?: string;
        website?: string;
        joinedAt?: string;
        coverImage?: string;
        stats: {
            followers: number;
            following: number;
            posts: number;
        };
        isFollowing?: boolean;
        reputation?: number;
        badges?: any[];
        relationship?: {
            isFollowing: boolean;
            isMuted: boolean;
            relationshipType: string | null;
            isBlocked: boolean;
            isBlockedByTarget: boolean;
        } | null;
    };
    isCurrentUser: boolean;
    onEdit?: () => void;
    onFollow?: () => void;
}

export function ProfileHeader({ user, isCurrentUser, onEdit, onFollow }: ProfileHeaderProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [networkOpen, setNetworkOpen] = useState(false);
    const [networkTab, setNetworkTab] = useState<"followers" | "following">("followers");
    const [isPending, startTransition] = useTransition();

    // Local state for optimistic updates
    const [relationship, setRelationship] = useState(user.relationship || {
        isFollowing: !!user.isFollowing,
        isMuted: false,
        relationshipType: "FOLLOWER",
        isBlocked: false,
        isBlockedByTarget: false
    });

    const isFollowing = relationship?.isFollowing;
    const isBlocked = relationship?.isBlocked;
    const isMuted = relationship?.isMuted;
    const relationshipType = relationship?.relationshipType || "FOLLOWER";

    const handleFollow = () => {
        startTransition(async () => {
            if (isFollowing) {
                // ...
            } else {
                await followUser(user.id);
                setRelationship((prev: any) => ({ ...prev, isFollowing: true, relationshipType: "FOLLOWER" }));
            }
        });
    };

    const handleUnfollow = () => {
        startTransition(async () => {
            await unfollowUser(user.id);
            setRelationship((prev: any) => ({ ...prev, isFollowing: false, relationshipType: null }));
        });
    };

    const handleBlock = () => {
        startTransition(async () => {
            if (isBlocked) {
                await unblockUser(user.id);
                setRelationship((prev: any) => ({ ...prev, isBlocked: false }));
            } else {
                await blockUser(user.id);
                setRelationship((prev: any) => ({ ...prev, isBlocked: true, isFollowing: false }));
            }
        });
    };

    const handleMute = () => {
        startTransition(async () => {
            await toggleMuteUser(user.id, !isMuted);
            setRelationship((prev: any) => ({ ...prev, isMuted: !isMuted }));
        });
    };


    // ... inside ProfileHeader
    const handleTypeChange = (type: string) => {
        startTransition(async () => {
            await updateRelationshipType(user.id, type);
            setRelationship((prev: any) => ({ ...prev, relationshipType: type }));
        });
    };

    // Track View on Mount
    useEffect(() => {
        if (!isCurrentUser && user) {
            SearchHistoryService.addRecentView({
                id: user.id,
                name: user.name || "Utilisateur",
                avatar: user.avatar,
                role: user.role
            });
        }
    }, [user, isCurrentUser]);

    if (relationship?.isBlockedByTarget) {
        return (
            <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden mb-6 p-12 text-center text-muted-foreground">
                <Ban className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h2 className="text-xl font-bold">Profil indisponible</h2>
                <p>Vous ne pouvez pas voir ce profil.</p>
            </div>
        )
    }

    return (
        <>
            <EditProfileDialog
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                user={{
                    id: user.id,
                    name: user.name || "",
                    bio: user.bio,
                    location: user.location,
                    website: user.website,
                    coverImage: user.coverImage || undefined,
                    avatar: user.avatar || undefined,
                    links: user.links || undefined
                }}
            />

            <NetworkDialog
                isOpen={networkOpen}
                onClose={() => setNetworkOpen(false)}
                userId={user.id}
                initialTab={networkTab}
            />

            <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden mb-6">
                {/* Cover Image */}
                <div className="h-48 md:h-64 bg-gradient-to-r from-orange-400 to-red-500 relative">
                    {user.coverImage && (
                        <img
                            src={user.coverImage || ""}
                            alt="Cover"
                            className="w-full h-full object-cover opacity-90"
                        />
                    )}
                </div>

                <div className="px-6 pb-6 relative">
                    {/* Avatar & Actions Row */}
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between -mt-16 md:-mt-20 mb-4 gap-4">
                        <div className="relative">
                            {isCurrentUser ? (
                                <div className="h-32 w-32 md:h-40 md:w-40 relative group cursor-pointer" onClick={() => setIsEditOpen(true)}>
                                    <Avatar className="h-full w-full border-4 border-card shadow-lg transition-transform hover:scale-105">
                                        <AvatarImage src={user.avatar || ""} className="object-cover" />
                                        <AvatarFallback className="text-4xl">{(user.name || "U")[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Edit className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-secondary shadow-md flex items-center justify-center">
                                        <Edit className="h-4 w-4" />
                                    </div>
                                </div>
                            ) : (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-card shadow-lg cursor-zoom-in transition-transform hover:scale-105">
                                            <AvatarImage src={user.avatar || ""} className="object-cover" />
                                            <AvatarFallback className="text-4xl">{(user.name || "U")[0]}</AvatarFallback>
                                        </Avatar>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-transparent border-none shadow-none text-center flex items-center justify-center">
                                        <div className="sr-only">
                                            <DialogTitle>Avatar de {user.name}</DialogTitle>
                                            <DialogDescription>Agrandissement de la photo de profil</DialogDescription>
                                        </div>
                                        <img
                                            src={user.avatar || "/avatars/default.svg"}
                                            alt={user.name || "Avatar"}
                                            className="max-h-[80vh] w-auto rounded-lg shadow-2xl"
                                        />
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>

                        <div className="flex items-center gap-3 mt-2 md:mt-0 md:mb-2 ml-auto md:ml-0">
                            {isCurrentUser ? (
                                <Button variant="outline" onClick={() => setIsEditOpen(true)} className="gap-2">
                                    <Edit className="h-4 w-4" />
                                    Éditer le profil
                                </Button>
                            ) : (
                                <>
                                    <Button variant="outline" size="icon">
                                        <MessageSquare className="h-4 w-4" />
                                    </Button>

                                    {isBlocked ? (
                                        <Button variant="destructive" onClick={handleBlock}>
                                            <Ban className="h-4 w-4 mr-2" /> Débloquer
                                        </Button>
                                    ) : isFollowing ? (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    className={cn("gap-2 w-32", "bg-muted text-muted-foreground hover:bg-muted/80")}
                                                    variant="secondary"
                                                    disabled={isPending}
                                                >
                                                    <Check className="h-4 w-4" /> Suivi <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56">
                                                <DropdownMenuLabel>Relation</DropdownMenuLabel>
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger>
                                                        <span>Type: {relationshipType}</span>
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuRadioGroup value={relationshipType} onValueChange={handleTypeChange}>
                                                            <DropdownMenuRadioItem value="FOLLOWER">Abonné</DropdownMenuRadioItem>
                                                            <DropdownMenuRadioItem value="FRIEND">Ami</DropdownMenuRadioItem>
                                                            <DropdownMenuRadioItem value="NEIGHBOR">Voisin</DropdownMenuRadioItem>
                                                            <DropdownMenuRadioItem value="COLLEAGUE">Collègue</DropdownMenuRadioItem>
                                                            <DropdownMenuRadioItem value="FAMILY">Famille</DropdownMenuRadioItem>
                                                        </DropdownMenuRadioGroup>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem onClick={handleMute}>
                                                    <BellOff className="h-4 w-4 mr-2" />
                                                    {isMuted ? "Rétablir les notifications" : "Masquer les posts (Mute)"}
                                                </DropdownMenuItem>

                                                <DropdownMenuItem onClick={handleUnfollow} className="text-red-500 hover:text-red-600 focus:text-red-600">
                                                    <UserMinus className="h-4 w-4 mr-2" />
                                                    Ne plus suivre
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem onClick={handleBlock} className="text-red-500 hover:text-red-600 focus:text-red-600">
                                                    <Ban className="h-4 w-4 mr-2" />
                                                    Bloquer
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ) : (
                                        <Button
                                            className="gap-2 w-32"
                                            onClick={handleFollow}
                                            disabled={isPending}
                                        >
                                            <UserPlus className="h-4 w-4" /> Suivre
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl font-bold">{user.name}</h1>
                                {user.role === "PRO" && <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Pro</Badge>}
                            </div>
                            <p className="text-muted-foreground font-medium">@{user.id.slice(0, 8)}</p>
                        </div>

                        {user.bio && (
                            <p className="max-w-2xl text-sm leading-relaxed whitespace-pre-line">
                                {user.bio}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            {user.location && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {user.location}
                                </div>
                            )}
                            {user.website && (
                                <div className="flex items-center gap-1">
                                    <LinkIcon className="h-4 w-4" />
                                    <a href={user.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                        {user.website.replace(/^https?:\/\//, '')}
                                    </a>
                                </div>
                            )}
                            {user.joinedAt && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    A rejoint en {user.joinedAt}
                                </div>
                            )}
                        </div>

                        {/* Social Links from Links JSON */}
                        {(() => {
                            try {
                                const links = user.links ? JSON.parse(user.links as any) : {};
                                return (
                                    <div className="flex gap-2 mt-2">
                                        {links.twitter && (
                                            <a href={links.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded-full hover:bg-blue-100 hover:text-blue-500 transition-colors">
                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                            </a>
                                        )}
                                        {links.linkedin && (
                                            <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors">
                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" /></svg>
                                            </a>
                                        )}
                                        {links.instagram && (
                                            <a href={links.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded-full hover:bg-pink-100 hover:text-pink-600 transition-colors">
                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                            </a>
                                        )}
                                    </div>
                                );
                            } catch (e) {
                                return null;
                            }
                        })()}

                        {/* Stats */}
                    </div>

                    {/* Reputation & Badges */}
                    {(user.reputation !== undefined || (user.badges && user.badges.length > 0)) && (
                        <div className="pt-4 border-t mt-4">
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <Trophy className="h-4 w-4 text-yellow-500" />
                                Réputation: <span className="text-foreground text-base">{user.reputation || 0}</span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {user.badges?.map((ub: any) => (
                                    <div key={ub.badge.id} className="flex items-center gap-1.5 bg-secondary/50 px-2 pl-1.5 py-1 rounded-full border border-secondary text-xs font-medium" title={ub.badge.description}>
                                        <span className="text-base">
                                            {ub.badge.icon === "Heart" ? "❤️" :
                                                ub.badge.icon === "MapPin" ? "📍" :
                                                    ub.badge.icon === "Briefcase" ? "💼" :
                                                        ub.badge.icon === "Star" ? "⭐" : "🏅"}
                                        </span>
                                        {ub.badge.name}
                                    </div>
                                ))}
                                {(!user.badges || user.badges.length === 0) && (
                                    <span className="text-xs text-muted-foreground italic">Aucun badge pour le moment.</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
