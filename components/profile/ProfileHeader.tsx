"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    MapPin, Link as LinkIcon, Calendar, MessageSquare,
    MoreHorizontal, UserPlus, FileText, Share2,
    CheckCircle2, Building, ShieldCheck, Trophy,
    TrendingUp, Ban, Edit, Download, Briefcase, Phone, Video, Globe,
    Linkedin, Twitter, Instagram, Camera, Eye
} from "lucide-react";
import { useState, useTransition, useEffect } from "react";

import { NetworkDialog } from "./NetworkDialog";
import { cn } from "@/lib/utils";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { followUser, unfollowUser, blockUser, unblockUser, toggleMuteUser, updateRelationshipType } from "@/lib/follow-actions";
import { SearchHistoryService } from "@/lib/services/search-history.service"; // Assume exists or imported
import { VideoPitch } from "./VideoPitch";

// Types
interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: "USER" | "ADMIN" | "PRO";
    bio?: string;
    location?: string;
    website?: string;
    coverImage?: string;
    joinedAt: string;
    stats: {
        followers: number;
        following: number;
        posts: number;
    };
    reputation?: number;
    badges?: any[];
    links?: string; // JSON string
    lastActive?: Date;
    isVerified?: boolean;

    // Extended Real Estate Fields
    headline?: string;
    pronouns?: string;
    currentStatus?: string;
    company?: string;
    companyWebsite?: string;
    siren?: string;
    experienceYears?: number;
    dealsCount?: number;
    assetsUnderManagement?: string;
    specialities?: string;
    avatarDecoration?: string;
    calendlyUrl?: string; // New
    languages?: string;
    whatsapp?: string;
    experiences?: any[];
}

interface ProfileHeaderProps {
    user: UserProfile & {
        // relationship logic props...
        relationship?: {
            isFollowing: boolean;
            isMuted: boolean;
            relationshipType: string | null;
            isBlocked: boolean;
            isBlockedByTarget: boolean;
        } | null;
        isFollowing?: boolean; // shortcut
    };
    isCurrentUser: boolean;
    onEdit?: () => void;
    onFollow?: () => void;
    profileViewsCount?: number;
    pitchData?: {
        videoUrl?: string | null;
        thumbnailUrl?: string | null;
        duration?: number | null;
    };
    onEditProfile?: (tab?: string) => void;
}

export function ProfileHeader({ user, isCurrentUser, profileViewsCount, pitchData, onEditProfile }: ProfileHeaderProps) {
    const [networkOpen, setNetworkOpen] = useState(false);
    const [networkTab, setNetworkTab] = useState<"followers" | "following">("followers");

    // Optimistic UI for relationship
    const [relationship, setRelationship] = useState(user.relationship || {
        isFollowing: false, isMuted: false, isBlocked: false, isBlockedByTarget: false, relationshipType: null
    });
    const isFollowing = relationship.isFollowing;
    const isBlocked = relationship.isBlocked;
    const isMuted = relationship.isMuted;

    const [isPending, startTransition] = useTransition();

    const handleFollow = () => {
        startTransition(async () => {
            if (isFollowing) {
                await unfollowUser(user.id);
                setRelationship((prev: any) => ({ ...prev, isFollowing: false, relationshipType: null }));
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

    // Parse status color/label
    const getStatusInfo = (status: string) => {
        switch (status) {
            case "ACTIVE_HUNTING": return { label: "En chasse active", color: "bg-green-500", border: "border-green-500" };
            case "OPEN_TO_WORK": return { label: "Ã€ l'Ã©coute", color: "bg-blue-500", border: "border-blue-500" };
            case "HIRING": return { label: "Recrute", color: "bg-purple-600", border: "border-purple-600" };
            case "RAISING_FUNDS": return { label: "LevÃ©e de fonds", color: "bg-amber-500", border: "border-amber-500" };
            default: return null;
        }
    };
    const statusInfo = user.currentStatus ? getStatusInfo(user.currentStatus) : null;

    return (
        <>


            <NetworkDialog
                isOpen={networkOpen}
                onClose={() => setNetworkOpen(false)}
                userId={user.id}
                initialTab={networkTab}
            />

            {/* ULTRA PREMIUM HEADER DESIGN */}
            <div className="mb-8 relative group font-sans">

                {/* 1. Cinematic Cover Image */}
                <div className="h-48 md:h-64 w-full overflow-hidden relative rounded-t-2xl shadow-sm bg-zinc-100 dark:bg-zinc-900 border-x border-t border-border/40">
                    {user.coverImage ? (
                        <img
                            src={user.coverImage}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-300 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-950 flex items-center justify-center">
                            <div className="text-zinc-300 dark:text-zinc-700 flex flex-col items-center gap-3">
                                <div className="p-4 rounded-full bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                                    <Building className="w-8 h-8 opacity-40" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cover Actions (Edit btn for owner) */}
                    {isCurrentUser && (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-black shadow-sm backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            onClick={() => onEditProfile?.("appearance")}
                        >
                            <Camera className="w-4 h-4 mr-2" />
                            Modifier la couverture
                        </Button>
                    )}
                </div>

                {/* 2. Main Profile Card */}
                <div className="relative bg-card dark:bg-zinc-950 rounded-b-2xl border-x border-b border-border/60 shadow-sm px-6 pb-8">

                    {/* Top Row: Actions Alignment (Avatar is now absolute) */}
                    <div className="flex flex-col md:flex-row items-end mb-5 gap-4 pt-16 md:pt-20">

                        {/* Avatar (Absolutely Positioned) */}
                        <div className="absolute -top-[70px] md:-top-[94px] left-6 z-10">
                            <div className="p-1.5 rounded-full bg-card dark:bg-zinc-950 relative shadow-sm">
                                <Avatar className="w-32 h-32 md:w-44 md:h-44 border border-zinc-100 dark:border-zinc-800 shadow-inner bg-zinc-50 dark:bg-zinc-900">
                                    <AvatarImage src={user.avatar || ""} className="object-cover" />
                                    <AvatarFallback className="text-5xl bg-zinc-100 text-zinc-300">{(user.name || "U")[0]}</AvatarFallback>
                                </Avatar>
                            </div>

                            {/* Status Chip */}
                            {statusInfo && (
                                <div className={cn(
                                    "absolute bottom-2 left-1/2 -translate-x-1/2 w-max px-3 py-1 rounded-full text-[10px] uppercase tracking-wide font-bold text-white shadow-md border border-white/20 flex items-center justify-center backdrop-blur-sm",
                                    statusInfo.color
                                )}>
                                    {statusInfo.label}
                                </div>
                            )}
                        </div>

                        {/* Spacer for Flex - now just pushing actions to right on desktop */}
                        <div className="flex-1 hidden md:block" />

                        {/* Desktop Actions Row */}
                        <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end mb-2 pt-4 md:pt-0 md:absolute md:top-6 md:right-6 md:mb-0">
                            {/* Video Pitch - Primary CTA */}
                            {(isCurrentUser || pitchData?.videoUrl) && (
                                <div className="mr-2 hidden md:block">
                                    <VideoPitch
                                        userId={user.id}
                                        videoUrl={pitchData?.videoUrl || undefined}
                                        thumbnailUrl={pitchData?.thumbnailUrl || undefined}
                                        isCurrentUser={isCurrentUser}
                                        avatarUrl={user.avatar || undefined}
                                    />
                                </div>
                            )}

                            {isCurrentUser ? (
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        className="gap-2 border-zinc-300 dark:border-zinc-700 font-medium"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span className="hidden sm:inline">Voir en tant que visiteur</span>
                                    </Button>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="icon" className="border-zinc-300 dark:border-zinc-700">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onEditProfile?.("identity")}>
                                                <Edit className="w-4 h-4 mr-2" />
                                                Modifier le profil
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>
                                                <Share2 className="w-4 h-4 mr-2" />
                                                Partager le profil
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    {/* Follow / Connect */}
                                    <Button
                                        className={cn(
                                            "font-semibold shadow-sm transition-all h-10 px-6",
                                            isFollowing
                                                ? "bg-white border-2 border-primary text-primary hover:bg-primary/5"
                                                : "bg-[#0A66C2] hover:bg-[#004182] text-white"
                                        )}
                                        onClick={handleFollow}
                                    >
                                        {isFollowing ? (
                                            <>
                                                <MessageSquare className="w-4 h-4 mr-2" />
                                                Message
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="w-4 h-4 mr-2" />
                                                Se connecter
                                            </>
                                        )}
                                    </Button>

                                    {/* Following State / Unfollow */}
                                    {isFollowing && (
                                        <Button
                                            variant="ghost"
                                            className="text-zinc-600 dark:text-zinc-400 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                            onClick={handleUnfollow}
                                        >
                                            Suivi
                                        </Button>
                                    )}

                                    {/* More Menu */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="icon" className="rounded-full border-zinc-300 dark:border-zinc-700 w-10 h-10">
                                                <MoreHorizontal className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem onClick={handleMute}>
                                                {isMuted ? "Rétablir les posts" : "Masquer les posts"}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={handleBlock} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                                {isBlocked ? "Débloquer cet utilisateur" : "Bloquer cet utilisateur"}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>Signaler le profil</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content Areas */}
                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 pt-16 md:pt-4">

                        {/* LEFT: Identity, Headlines, Badges */}
                        <div className="flex-1 min-w-0 space-y-5">

                            {/* Name & Role */}
                            <div>
                                <div className="flex items-center gap-2 md:gap-3 flex-wrap mb-2">
                                    <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
                                        {user.name}
                                    </h1>

                                    {user.isVerified && (
                                        <div className="text-blue-500 bg-blue-50 dark:bg-blue-900/20 p-1 rounded-full" title="Compte vérifié">
                                            <ShieldCheck className="h-5 w-5 fill-blue-500/10" />
                                        </div>
                                    )}

                                    {user.pronouns && (
                                        <span className="text-sm text-muted-foreground/80 font-medium">
                                            ({user.pronouns})
                                        </span>
                                    )}
                                </div>

                                {/* Headline / Bio */}
                                {user.headline ? (
                                    <p className="text-lg md:text-xl font-medium text-foreground/80 leading-snug max-w-2xl">
                                        {user.headline}
                                    </p>
                                ) : (
                                    <p className="text-base text-muted-foreground">{user.bio?.substring(0, 80)}...</p>
                                )}
                            </div>

                            {/* Metadata Grid (Location, Role, Portfolio) */}
                            <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-sm text-muted-foreground/90 font-medium">
                                {user.location && (
                                    <>
                                        <div className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-default">
                                            <MapPin className="h-4 w-4 shrink-0 text-zinc-400" />
                                            <span>{user.location}</span>
                                        </div>
                                        <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">•</span>
                                    </>
                                )}

                                {user.website && (
                                    <>
                                        <a
                                            href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-primary hover:underline"
                                        >
                                            <LinkIcon className="h-4 w-4 shrink-0" />
                                            <span>Site web</span>
                                        </a>
                                        <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">•</span>
                                    </>

                                )}
                                <div className="flex items-center gap-1.5 text-muted-foreground/70">

                                    <Calendar className="h-4 w-4 shrink-0" />
                                    <span>A rejoint en {new Date(user.joinedAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                                </div>
                            </div>

                            {/* Tags / Badges Row (Optional Future Slot) */}
                            {user.role === "PRO" && (
                                <div className="pt-2">
                                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                        <Briefcase className="w-3 h-3" />
                                        Compte Professionnel
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* RIGHT: High-Priority Stats & Socials */}
                        <div className="lg:w-72 flex flex-col gap-6 pt-2 lg:-mt-10">


                            {/* Network Stats Block - Design LinkedIn Style */}
                            <div className="flex flex-wrap gap-6 text-sm p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50">
                                {/* Followers */}
                                <button
                                    onClick={() => { setNetworkTab("followers"); setNetworkOpen(true); }}
                                    className="flex flex-col gap-0.5 flex-1"
                                >
                                    <span className="text-2xl font-bold text-foreground hover:text-primary transition-colors tabular-nums">
                                        {user.stats.followers}
                                    </span>
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Abonnés
                                    </span>
                                </button>

                                <div className="w-px bg-zinc-200 dark:bg-zinc-800 h-10 self-center hidden sm:block" />

                                {/* Following */}
                                <button
                                    onClick={() => { setNetworkTab("following"); setNetworkOpen(true); }}
                                    className="flex flex-col gap-0.5 flex-1"
                                >
                                    <span className="text-2xl font-bold text-foreground hover:text-primary transition-colors tabular-nums">
                                        {user.stats.following}
                                    </span>
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Suivis
                                    </span>
                                </button>
                            </div>


                            {/* Social Icons Row */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {user.calendlyUrl && (
                                    <a href={user.calendlyUrl} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" size="sm" className="h-9 gap-2 rounded-full border-zinc-200 dark:border-zinc-800 hover:border-[#0069ff] hover:text-[#0069ff] transition-colors">
                                            <Calendar className="w-4 h-4" />
                                            <span className="hidden xl:inline">Rdv</span>
                                        </Button>
                                    </a>
                                )}

                                {user.whatsapp && (
                                    <a href={`https://wa.me/${user.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-full border-zinc-200 dark:border-zinc-800 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all">
                                            <MessageSquare className="w-4 h-4" />
                                        </Button>
                                    </a>
                                )}

                                {user.links && (() => {
                                    try {
                                        const socials = JSON.parse(user.links);
                                        return (
                                            <>
                                                {socials.linkedin && (
                                                    <a href={socials.linkedin} target="_blank" rel="noopener noreferrer">
                                                        <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-full border-zinc-200 dark:border-zinc-800 hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5] transition-all">
                                                            <Linkedin className="w-4 h-4" />
                                                        </Button>
                                                    </a>
                                                )}
                                                {socials.twitter && (
                                                    <a href={socials.twitter} target="_blank" rel="noopener noreferrer">
                                                        <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-full border-zinc-200 dark:border-zinc-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                                                            {/* X Icon */}
                                                            <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>
                                                        </Button>
                                                    </a>
                                                )}
                                                {socials.instagram && (
                                                    <a href={socials.instagram} target="_blank" rel="noopener noreferrer">
                                                        <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-full border-zinc-200 dark:border-zinc-800 hover:bg-[#E4405F] hover:text-white hover:border-[#E4405F] transition-all">
                                                            <Instagram className="w-4 h-4" />
                                                        </Button>
                                                    </a>
                                                )}
                                            </>
                                        );
                                    } catch (e) { return null; }
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Video Pitch (If exists, shown below on small screens) */}
                    {(isCurrentUser || pitchData?.videoUrl) && (
                        <div className="block md:hidden mt-6 pt-4 border-t border-border/50">
                            <div className="font-semibold text-sm mb-2 text-muted-foreground">Ma présentation vidéo</div>
                            <VideoPitch
                                userId={user.id}
                                videoUrl={pitchData?.videoUrl || undefined}
                                thumbnailUrl={pitchData?.thumbnailUrl || undefined}
                                isCurrentUser={isCurrentUser}
                                avatarUrl={user.avatar || undefined}
                            />
                        </div>
                    )}

                </div >
            </div >
        </>
    );
}

