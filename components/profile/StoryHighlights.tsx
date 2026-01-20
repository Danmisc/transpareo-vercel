"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import {
    Plus, Camera, X, ChevronLeft, ChevronRight, Loader2, Send,
    Heart, Eye, Trash2, MoreHorizontal, MessageCircle, Share2,
    Bookmark, Pause, Play, Volume2, VolumeX, Users, Upload, ImageIcon,
    Video, Clock, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    createStory, getStories, markStoryAsSeen, deleteStory,
    reactToStory, replyToStory, getStoryViewers
} from "@/lib/actions-stories";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// ==========================================
// TYPES
// ==========================================

interface Story {
    id: string;
    mediaUrl: string;
    mediaType: string;
    caption?: string | null;
    createdAt: Date | string;
    expiresAt?: Date | string;
    isSeen?: boolean;
    viewCount?: number;
}

interface StoryGroup {
    user: {
        id: string;
        name: string | null;
        image?: string | null;
        role?: string;
    };
    items: Story[];
    hasUnseen: boolean;
    totalViews: number;
}

interface StoryViewer {
    id: string;
    name: string | null;
    image?: string | null;
    viewedAt: Date;
}

interface StoryHighlightsProps {
    isOwner: boolean;
    userId: string;
    userName?: string;
    userAvatar?: string;
    highlights?: any[];
}

// Emoji reactions - Instagram style
const REACTIONS = ["❤️", "🔥", "😍", "😮", "😢", "👏"];

// Sample images for quick story creation
const SAMPLE_IMAGES = [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=800&fit=crop",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=800&fit=crop",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=800&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=800&fit=crop"
];

// ==========================================
// MAIN COMPONENT
// ==========================================

export function StoryHighlights({ isOwner, userId, userName, userAvatar, highlights = [] }: StoryHighlightsProps) {
    const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [activeGroupIndex, setActiveGroupIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // Load stories
    const loadStories = useCallback(async () => {
        try {
            const data = await getStories(userId);
            setStoryGroups(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadStories();
    }, [loadStories]);

    // Check scroll position
    useEffect(() => {
        const checkScroll = () => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                setCanScrollLeft(scrollLeft > 0);
                setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
            }
        };
        checkScroll();
        scrollRef.current?.addEventListener("scroll", checkScroll);
        return () => scrollRef.current?.removeEventListener("scroll", checkScroll);
    }, [storyGroups]);

    const myStories = storyGroups.find(g => g.user.id === userId);
    const otherStories = storyGroups.filter(g => g.user.id !== userId);

    const openViewer = (groupIndex: number) => {
        setActiveGroupIndex(groupIndex);
        setViewerOpen(true);
    };

    const handleStoryCreated = () => {
        loadStories();
        setCreateOpen(false);
        toast.success("🎉 Story publiée!", { description: "Visible pendant 24 heures" });
    };

    const handleStoryDeleted = () => {
        loadStories();
        toast.success("Story supprimée");
    };

    // Smooth scroll
    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const amount = direction === "left" ? -180 : 180;
            scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
        }
    };

    return (
        <>
            {/* Stories Row - Premium Design */}
            <div className="relative group/stories">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-50/50 via-pink-50/30 to-purple-50/50 dark:from-orange-950/20 dark:via-pink-950/10 dark:to-purple-950/20 rounded-2xl -z-10" />

                {/* Scroll buttons with fade effect */}
                {canScrollLeft && (
                    <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white dark:from-zinc-900 to-transparent z-10 flex items-center justify-start pl-1 opacity-0 group-hover/stories:opacity-100 transition-opacity">
                        <button
                            onClick={() => scroll("left")}
                            className="w-9 h-9 bg-white dark:bg-zinc-800 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform border border-zinc-200 dark:border-zinc-700"
                        >
                            <ChevronLeft className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                        </button>
                    </div>
                )}
                {canScrollRight && (
                    <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white dark:from-zinc-900 to-transparent z-10 flex items-center justify-end pr-1 opacity-0 group-hover/stories:opacity-100 transition-opacity">
                        <button
                            onClick={() => scroll("right")}
                            className="w-9 h-9 bg-white dark:bg-zinc-800 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform border border-zinc-200 dark:border-zinc-700"
                        >
                            <ChevronRight className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                        </button>
                    </div>
                )}

                {/* Stories container */}
                <div
                    ref={scrollRef}
                    className="flex gap-5 overflow-x-auto scrollbar-hide py-5 px-4"
                >
                    {/* Add/My Story - Premium design */}
                    {isOwner && (
                        <div className="flex-shrink-0">
                            {myStories && myStories.items.length > 0 ? (
                                <div className="relative">
                                    <StoryAvatar
                                        name="Ma story"
                                        image={userAvatar}
                                        hasUnseen={false}
                                        storyCount={myStories.items.length}
                                        onClick={() => openViewer(storyGroups.indexOf(myStories))}
                                        isOwn
                                    />
                                    <button
                                        onClick={() => setCreateOpen(true)}
                                        className="absolute -bottom-0.5 -right-0.5 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/30 border-[3px] border-white dark:border-zinc-900 hover:scale-110 transition-transform z-20"
                                    >
                                        <Plus className="w-4 h-4 text-white stroke-[3]" />
                                    </button>
                                </div>
                            ) : (
                                <CreateStoryButton
                                    userAvatar={userAvatar}
                                    onClick={() => setCreateOpen(true)}
                                />
                            )}
                        </div>
                    )}

                    {/* Other users' stories */}
                    {otherStories.map((group) => (
                        <StoryAvatar
                            key={group.user.id}
                            name={group.user.name?.split(" ")[0] || "User"}
                            image={group.user.image}
                            hasUnseen={group.hasUnseen}
                            storyCount={group.items.length}
                            onClick={() => openViewer(storyGroups.indexOf(group))}
                        />
                    ))}

                    {/* Loading skeleton */}
                    {loading && (
                        <>
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
                                    <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600 animate-pulse" />
                                    <div className="w-14 h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full animate-pulse" />
                                </div>
                            ))}
                        </>
                    )}

                    {/* Empty state */}
                    {!loading && storyGroups.length === 0 && !isOwner && (
                        <div className="flex items-center gap-3 text-zinc-500 py-4 px-2">
                            <Camera className="w-5 h-5" />
                            <span className="text-sm">Aucune story pour le moment</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Story Modal */}
            <CreateStoryDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onSuccess={handleStoryCreated}
                userAvatar={userAvatar}
                userName={userName}
            />

            {/* Story Viewer */}
            {viewerOpen && (
                <FullscreenStoryViewer
                    open={viewerOpen}
                    onOpenChange={setViewerOpen}
                    groups={storyGroups}
                    initialGroupIndex={activeGroupIndex}
                    currentUserId={userId}
                    isOwner={isOwner}
                    onStoryDeleted={handleStoryDeleted}
                />
            )}
        </>
    );
}

// ==========================================
// CREATE STORY BUTTON
// ==========================================

function CreateStoryButton({ userAvatar, onClick }: { userAvatar?: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center gap-2 group"
        >
            <div className="relative">
                {/* Outer glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-0 group-hover:opacity-30 blur-xl transition-opacity" />

                {/* Main circle */}
                <div className="relative w-[80px] h-[80px] rounded-full bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-700 border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex items-center justify-center group-hover:border-blue-400 group-hover:from-blue-50 group-hover:to-blue-100 dark:group-hover:from-blue-900/30 transition-all overflow-hidden">
                    {userAvatar ? (
                        <>
                            <Image
                                src={userAvatar}
                                alt=""
                                fill
                                className="object-cover opacity-40 group-hover:opacity-60 transition-opacity"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        </>
                    ) : null}
                    <Camera className="w-8 h-8 text-zinc-400 group-hover:text-blue-500 transition-colors relative z-10" />
                </div>

                {/* Plus badge */}
                <div className="absolute -bottom-0.5 -right-0.5 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/30 border-[3px] border-white dark:border-zinc-900 group-hover:scale-110 transition-transform">
                    <Plus className="w-4 h-4 text-white stroke-[3]" />
                </div>
            </div>
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 group-hover:text-blue-500 transition-colors">
                Créer
            </span>
        </button>
    );
}

// ==========================================
// STORY AVATAR
// ==========================================

function StoryAvatar({
    name,
    image,
    hasUnseen,
    storyCount = 1,
    onClick,
    isOwn = false
}: {
    name: string;
    image?: string | null;
    hasUnseen: boolean;
    storyCount?: number;
    onClick: () => void;
    isOwn?: boolean;
}) {
    const [imageError, setImageError] = useState(false);

    return (
        <button onClick={onClick} className="flex-shrink-0 flex flex-col items-center gap-2 group">
            <div className="relative">
                {/* Animated gradient ring */}
                <div className={cn(
                    "w-[82px] h-[82px] rounded-full p-[3px] transition-all duration-300 group-hover:scale-105",
                    hasUnseen
                        ? "bg-gradient-to-tr from-yellow-400 via-orange-500 via-pink-500 to-purple-600 shadow-lg shadow-orange-500/20"
                        : isOwn
                            ? "bg-gradient-to-tr from-zinc-400 to-zinc-500 dark:from-zinc-500 dark:to-zinc-400"
                            : "bg-gradient-to-tr from-zinc-300 to-zinc-400 dark:from-zinc-600 dark:to-zinc-500"
                )}>
                    {/* Inner white ring */}
                    <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 p-[3px]">
                        <Avatar className="w-full h-full">
                            {!imageError && image ? (
                                <AvatarImage
                                    src={image}
                                    className="object-cover"
                                    onError={() => setImageError(true)}
                                />
                            ) : null}
                            <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/40 dark:to-pink-900/40 text-orange-600 dark:text-orange-400">
                                {name[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>

                {/* Story count badge */}
                {storyCount > 1 && (
                    <div className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 bg-gradient-to-br from-orange-500 to-pink-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-zinc-900">
                        {storyCount > 9 ? "9+" : storyCount}
                    </div>
                )}

                {/* Live indicator for unseen */}
                {hasUnseen && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2">
                        <div className="w-2 h-2 bg-gradient-to-br from-green-400 to-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                    </div>
                )}
            </div>
            <span className={cn(
                "text-xs font-semibold truncate max-w-[80px] transition-colors",
                hasUnseen
                    ? "text-zinc-900 dark:text-white"
                    : "text-zinc-600 dark:text-zinc-400 group-hover:text-orange-500"
            )}>
                {name}
            </span>
        </button>
    );
}

// ==========================================
// CREATE STORY DIALOG
// ==========================================

function CreateStoryDialog({
    open,
    onOpenChange,
    onSuccess,
    userAvatar,
    userName
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    userAvatar?: string;
    userName?: string;
}) {
    const [mediaUrl, setMediaUrl] = useState("");
    const [caption, setCaption] = useState("");
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<"IMAGE" | "VIDEO">("IMAGE");
    const [tab, setTab] = useState<"url" | "samples">("url");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUrlChange = (url: string) => {
        setMediaUrl(url);
        if (url.match(/^https?:\/\/.+/i)) {
            setPreview(url);
            setMediaType(url.match(/\.(mp4|webm|mov)$/i) ? "VIDEO" : "IMAGE");
        } else {
            setPreview(null);
        }
    };

    const handleSampleSelect = (url: string) => {
        setMediaUrl(url);
        setPreview(url);
        setMediaType("IMAGE");
        setTab("url");
    };

    const handleSubmit = async () => {
        if (!mediaUrl) return;
        setLoading(true);
        try {
            const result = await createStory(mediaUrl, mediaType, caption || undefined);
            if (result.success) {
                setMediaUrl("");
                setCaption("");
                setPreview(null);
                onSuccess();
            } else {
                toast.error(result.error || "Erreur");
            }
        } catch (e) {
            toast.error("Erreur lors de la création");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setMediaUrl("");
        setCaption("");
        setPreview(null);
        setTab("url");
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-white dark:bg-zinc-900 border-0 shadow-2xl">
                {/* Header */}
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600" />
                    <div className="absolute inset-0 bg-[url('/patterns/dots.svg')] opacity-10" />
                    <div className="relative p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-white font-bold text-xl">Nouvelle Story</h2>
                                <p className="text-white/80 text-sm flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Disparaît après 24 heures
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-5 space-y-5">
                    {/* Preview */}
                    {preview && (
                        <div className="relative aspect-[9/16] max-h-[300px] w-full bg-gradient-to-br from-zinc-900 to-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                            {mediaType === "VIDEO" ? (
                                <video src={preview} className="w-full h-full object-contain" controls muted playsInline />
                            ) : (
                                <Image
                                    src={preview}
                                    alt="Preview"
                                    fill
                                    className="object-contain"
                                    onError={() => setPreview(null)}
                                />
                            )}
                            <button
                                onClick={() => { setPreview(null); setMediaUrl(""); }}
                                className="absolute top-3 right-3 w-9 h-9 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>

                            {/* Preview overlay info */}
                            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                                <Avatar className="w-8 h-8 ring-2 ring-white/30">
                                    <AvatarImage src={userAvatar} />
                                    <AvatarFallback>{userName?.[0]}</AvatarFallback>
                                </Avatar>
                                <span className="text-white text-sm font-medium">{userName || "Vous"}</span>
                            </div>
                        </div>
                    )}

                    {/* Tabs */}
                    {!preview && (
                        <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                            <button
                                onClick={() => setTab("url")}
                                className={cn(
                                    "flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all",
                                    tab === "url"
                                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-700"
                                )}
                            >
                                <ImageIcon className="w-4 h-4 inline mr-2" />
                                URL
                            </button>
                            <button
                                onClick={() => setTab("samples")}
                                className={cn(
                                    "flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all",
                                    tab === "samples"
                                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-700"
                                )}
                            >
                                <Sparkles className="w-4 h-4 inline mr-2" />
                                Suggestions
                            </button>
                        </div>
                    )}

                    {/* URL Input */}
                    {tab === "url" && !preview && (
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                URL de l'image ou vidéo
                            </label>
                            <div className="relative">
                                <Input
                                    value={mediaUrl}
                                    onChange={e => handleUrlChange(e.target.value)}
                                    placeholder="https://exemple.com/ma-photo.jpg"
                                    className="pl-10 h-12 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl"
                                />
                                <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {["JPG", "PNG", "GIF", "WEBP", "MP4"].map(fmt => (
                                    <span key={fmt} className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-500">
                                        {fmt}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sample images */}
                    {tab === "samples" && !preview && (
                        <div className="grid grid-cols-2 gap-3">
                            {SAMPLE_IMAGES.map((url, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSampleSelect(url)}
                                    className="relative aspect-[4/5] rounded-xl overflow-hidden group hover:ring-2 ring-orange-500 transition-all"
                                >
                                    <Image src={url} alt="" fill className="object-cover group-hover:scale-105 transition-transform" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        Immobilier #{i + 1}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Caption */}
                    {preview && (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                Légende <span className="text-zinc-400 font-normal">(optionnel)</span>
                            </label>
                            <Textarea
                                value={caption}
                                onChange={e => setCaption(e.target.value)}
                                placeholder="Ajoutez une légende à votre story..."
                                maxLength={150}
                                rows={2}
                                className="resize-none bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl"
                            />
                            <p className="text-xs text-zinc-400 text-right">{caption.length}/150</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            className="flex-1 h-12 rounded-xl"
                            onClick={() => onOpenChange(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 hover:opacity-90 text-white border-0 shadow-lg shadow-orange-500/25"
                            onClick={handleSubmit}
                            disabled={loading || !mediaUrl}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Publier
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ==========================================
// FULLSCREEN STORY VIEWER
// ==========================================

function FullscreenStoryViewer({
    open,
    onOpenChange,
    groups,
    initialGroupIndex,
    currentUserId,
    isOwner,
    onStoryDeleted
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groups: StoryGroup[];
    initialGroupIndex: number;
    currentUserId: string;
    isOwner: boolean;
    onStoryDeleted: () => void;
}) {
    const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
    const [storyIndex, setStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [paused, setPaused] = useState(false);
    const [muted, setMuted] = useState(true);
    const [showReply, setShowReply] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [showViewers, setShowViewers] = useState(false);
    const [viewers, setViewers] = useState<StoryViewer[]>([]);
    const [loadingViewers, setLoadingViewers] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const [imageError, setImageError] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentGroup = groups[groupIndex];
    const currentStory = currentGroup?.items[storyIndex];
    const isMyStory = currentGroup?.user.id === currentUserId;
    const DURATION = currentStory?.mediaType === "VIDEO" ? 15000 : 5000;

    // Reset on open
    useEffect(() => {
        if (open) {
            setGroupIndex(initialGroupIndex);
            setStoryIndex(0);
            setProgress(0);
            setPaused(false);
            setShowReply(false);
            setShowViewers(false);
            setShowReactions(false);
            setImageError(false);
        }
    }, [open, initialGroupIndex]);

    // Keyboard navigation
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case "ArrowLeft":
                    goPrev();
                    break;
                case "ArrowRight":
                    goNext();
                    break;
                case " ":
                    e.preventDefault();
                    setPaused(p => !p);
                    break;
                case "Escape":
                    onOpenChange(false);
                    break;
                case "m":
                    setMuted(m => !m);
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, groupIndex, storyIndex]);

    // Progress timer
    useEffect(() => {
        if (!open || paused || !currentStory || showReply || showViewers) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        // Mark as seen
        markStoryAsSeen(currentStory.id);

        const start = Date.now();
        timerRef.current = setInterval(() => {
            const elapsed = Date.now() - start;
            const pct = Math.min((elapsed / DURATION) * 100, 100);
            setProgress(pct);

            if (pct >= 100) {
                goNext();
            }
        }, 30);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [groupIndex, storyIndex, open, paused, showReply, showViewers, DURATION]);

    const goNext = () => {
        setImageError(false);
        if (currentGroup && storyIndex < currentGroup.items.length - 1) {
            setStoryIndex(storyIndex + 1);
            setProgress(0);
        } else if (groupIndex < groups.length - 1) {
            setGroupIndex(groupIndex + 1);
            setStoryIndex(0);
            setProgress(0);
        } else {
            onOpenChange(false);
        }
    };

    const goPrev = () => {
        setImageError(false);
        if (progress > 15 || storyIndex === 0) {
            setProgress(0);
            if (videoRef.current) videoRef.current.currentTime = 0;
        } else if (storyIndex > 0) {
            setStoryIndex(storyIndex - 1);
            setProgress(0);
        } else if (groupIndex > 0) {
            setGroupIndex(groupIndex - 1);
            const prevGroup = groups[groupIndex - 1];
            setStoryIndex(prevGroup.items.length - 1);
            setProgress(0);
        }
    };

    const handleTap = (e: React.MouseEvent) => {
        if (showReply || showViewers || showReactions) return;

        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;

        if (x < 0.25) goPrev();
        else if (x > 0.75) goNext();
        else setPaused(!paused);
    };

    const handleReact = async (emoji: string) => {
        if (!currentStory) return;
        setShowReactions(false);
        await reactToStory(currentStory.id, emoji);
        toast.success(`${emoji} envoyé!`);
    };

    const handleSendReply = async () => {
        if (!replyText.trim() || !currentStory) return;
        const result = await replyToStory(currentStory.id, replyText);
        if (result.success) {
            toast.success("Réponse envoyée!");
            setReplyText("");
            setShowReply(false);
            setPaused(false);
        } else {
            toast.error("Erreur lors de l'envoi");
        }
    };

    const handleDelete = async () => {
        if (!currentStory) return;
        const result = await deleteStory(currentStory.id);
        if (result.success) {
            onStoryDeleted();
            if (currentGroup.items.length === 1) {
                onOpenChange(false);
            } else {
                goNext();
            }
        }
    };

    const loadViewers = async () => {
        if (!currentStory) return;
        setLoadingViewers(true);
        const result = await getStoryViewers(currentStory.id);
        if (result.success) {
            setViewers(result.viewers as StoryViewer[]);
        }
        setLoadingViewers(false);
        setShowViewers(true);
        setPaused(true);
    };

    if (!currentGroup || !currentStory) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                ref={containerRef}
                className="max-w-[420px] h-[92vh] max-h-[850px] p-0 bg-black border-none overflow-hidden shadow-2xl"
            >
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none z-10" />

                {/* Progress bars */}
                <div className="absolute top-4 left-4 right-4 z-30 flex gap-1.5">
                    {currentGroup.items.map((_, i) => (
                        <div key={i} className="flex-1 h-[3px] bg-white/25 rounded-full overflow-hidden backdrop-blur-sm">
                            <div
                                className="h-full bg-white rounded-full transition-all duration-75 ease-linear"
                                style={{
                                    width: i < storyIndex ? '100%' : i === storyIndex ? `${progress}%` : '0%'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="absolute top-10 left-4 right-4 z-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-11 h-11 ring-2 ring-white/40 shadow-lg">
                            <AvatarImage src={currentGroup.user.image || "/avatars/default.svg"} />
                            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-pink-500 text-white">
                                {currentGroup.user.name?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-white font-bold text-sm drop-shadow-lg">{currentGroup.user.name}</p>
                            <p className="text-white/70 text-xs drop-shadow">
                                {formatDistanceToNow(new Date(currentStory.createdAt), { addSuffix: true, locale: fr })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setPaused(!paused)}
                            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
                        >
                            {paused ? <Play className="w-5 h-5 text-white" /> : <Pause className="w-5 h-5 text-white" />}
                        </button>

                        {currentStory.mediaType === "VIDEO" && (
                            <button
                                onClick={() => setMuted(!muted)}
                                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
                            >
                                {muted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                            </button>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors">
                                    <MoreHorizontal className="w-5 h-5 text-white" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                                {isMyStory && (
                                    <>
                                        <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-500">
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Supprimer cette story
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                )}
                                <DropdownMenuItem>
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Partager
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Bookmark className="w-4 h-4 mr-2" />
                                    Enregistrer
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <button
                            onClick={() => onOpenChange(false)}
                            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Story Content */}
                <div
                    className="w-full h-full flex items-center justify-center cursor-pointer select-none"
                    onClick={handleTap}
                >
                    {currentStory.mediaType === "VIDEO" ? (
                        <video
                            ref={videoRef}
                            src={currentStory.mediaUrl}
                            className="w-full h-full object-contain"
                            autoPlay
                            muted={muted}
                            playsInline
                            loop={false}
                            onError={() => setImageError(true)}
                        />
                    ) : imageError ? (
                        <div className="flex flex-col items-center gap-4 text-white/60">
                            <ImageIcon className="w-16 h-16" />
                            <p>Image non disponible</p>
                        </div>
                    ) : (
                        <Image
                            src={currentStory.mediaUrl}
                            alt="Story"
                            fill
                            className="object-contain"
                            priority
                            onError={() => setImageError(true)}
                        />
                    )}

                    {/* Pause overlay */}
                    {paused && !showReply && !showViewers && !showReactions && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                            <div className="w-20 h-20 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                <Pause className="w-10 h-10 text-white" />
                            </div>
                        </div>
                    )}

                    {/* Navigation hints */}
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                        <ChevronLeft className="w-10 h-10 text-white/50 drop-shadow-lg" />
                    </div>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                        <ChevronRight className="w-10 h-10 text-white/50 drop-shadow-lg" />
                    </div>
                </div>

                {/* Caption */}
                {currentStory.caption && (
                    <div className="absolute bottom-32 left-5 right-5 z-20">
                        <p className="text-white text-sm bg-black/50 backdrop-blur-md px-5 py-3.5 rounded-2xl shadow-xl">
                            {currentStory.caption}
                        </p>
                    </div>
                )}

                {/* Bottom Actions */}
                <div className="absolute bottom-5 left-5 right-5 z-20">
                    {isMyStory ? (
                        /* Owner view */
                        <div className="flex items-center justify-between">
                            <button
                                onClick={loadViewers}
                                className="flex items-center gap-2.5 text-white/90 text-sm bg-black/40 backdrop-blur-md px-5 py-3 rounded-full hover:bg-black/60 transition-colors shadow-lg"
                            >
                                <Eye className="w-5 h-5" />
                                <span className="font-medium">{currentStory.viewCount || 0} vues</span>
                            </button>
                            <div className="flex items-center gap-2">
                                <button className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-colors">
                                    <Share2 className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>
                    ) : showReply ? (
                        /* Reply input */
                        <div className="flex gap-2">
                            <Input
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                placeholder={`Répondre à ${currentGroup.user.name?.split(" ")[0]}...`}
                                className="flex-1 h-12 bg-white/15 backdrop-blur-md border-white/20 text-white placeholder:text-white/50 rounded-full px-5"
                                autoFocus
                                onKeyDown={e => e.key === "Enter" && handleSendReply()}
                            />
                            <Button
                                size="icon"
                                onClick={handleSendReply}
                                className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 shadow-lg"
                            >
                                <Send className="w-5 h-5" />
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => { setShowReply(false); setPaused(false); }}
                                className="w-12 h-12 rounded-full text-white hover:bg-white/10"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    ) : (
                        /* Reactions and reply */
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => { setShowReply(true); setPaused(true); }}
                                className="flex-1 flex items-center gap-3 bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-5 py-3.5 text-white/70 text-sm hover:bg-white/25 transition-colors"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Envoyer un message...
                            </button>

                            {/* Quick reactions */}
                            <div className="flex gap-1.5">
                                {REACTIONS.slice(0, 3).map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => handleReact(emoji)}
                                        className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all text-xl shadow-lg"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Viewers Modal */}
                {showViewers && (
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-40 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
                        <div className="flex items-center justify-between p-5 border-b border-white/10">
                            <div className="flex items-center gap-3 text-white">
                                <Users className="w-5 h-5" />
                                <span className="font-bold text-lg">{viewers.length} spectateur{viewers.length > 1 ? "s" : ""}</span>
                            </div>
                            <button
                                onClick={() => { setShowViewers(false); setPaused(false); }}
                                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-3">
                            {loadingViewers ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                            ) : viewers.length === 0 ? (
                                <div className="text-center py-12">
                                    <Eye className="w-12 h-12 text-white/30 mx-auto mb-3" />
                                    <p className="text-white/60">Aucun spectateur pour le moment</p>
                                </div>
                            ) : (
                                viewers.map(viewer => (
                                    <div key={viewer.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                        <Avatar className="w-12 h-12 ring-2 ring-white/10">
                                            <AvatarImage src={viewer.image || "/avatars/default.svg"} />
                                            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-pink-500 text-white">
                                                {viewer.name?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="text-white font-semibold">{viewer.name}</p>
                                            <p className="text-white/50 text-sm">
                                                {formatDistanceToNow(new Date(viewer.viewedAt), { addSuffix: true, locale: fr })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

