"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Share2, MoreHorizontal, Bookmark, Play, MapPin, BarChart2, Flag, AlertCircle, Pin, PinOff } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ReactionPicker } from "./ReactionPicker";
import { CommentSection } from "./CommentSection";
import type { Interaction } from "@prisma/client";
import { Comment, UserProfile } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ReportDialog } from "@/components/feed/ReportDialog";
import { ShareDialog } from "@/components/feed/ShareDialog";
import { cn } from "@/lib/utils";
import { savePost, unsavePost, checkIsSaved, unsavePostByPostId } from "@/lib/bookmark-actions";
import { togglePinPost } from "@/lib/actions";
import { MiniBadge } from "@/components/gamification/MiniBadge";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { SmartPropertyCard } from "./SmartPropertyCard";
import { motion } from "framer-motion";
import { useVideoFeed } from "./VideoFeedProvider";
import { useRef, useEffect } from "react";
import { pusherClient } from "@/lib/pusher";
import { AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";

interface PostCardProps {
    id: string;
    authorId: string;
    currentUser?: UserProfile;
    author?: {
        name: string;
        role: string;
        avatar: string;
        badge?: any;
    };
    content: string;
    type?: string;
    mediaUrl?: string;
    metadata?: any;
    image?: string;
    published?: string;
    metrics?: {
        likes: number;
        comments: number;
        shares: number;
        saves?: number;
    };
    rankingScore?: number;
    userInteraction?: Interaction | null;
    initialComments?: Comment[];
    isSaved?: boolean;
    isPinned?: boolean;
}

export function PostCard({
    id,
    authorId,
    currentUser,
    author = { name: "Utilisateur", role: "Membre", avatar: "/avatars/default.svg" },
    content,
    type = "TEXT",
    mediaUrl,
    metadata,
    image,
    published = "À l'instant",
    metrics = { likes: 0, comments: 0, shares: 0 },
    rankingScore,
    userInteraction,
    initialComments = [],
    isSaved: initialIsSaved = false,
    isPinned = false
}: PostCardProps) {
    // Determine effective media and metadata
    const displayImage = mediaUrl || image;
    const effectiveMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;



    const [isReportOpen, setIsReportOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(initialIsSaved);
    const [savedId, setSavedId] = useState<string | null>(null);

    // Real-time Metrics
    const [metricsState, setMetricsState] = useState(metrics);
    const [showHeartAnimation, setShowHeartAnimation] = useState(false);

    useEffect(() => {
        const channel = pusherClient.subscribe(`post-${id}`);

        channel.bind("reaction-update", (data: any) => {
            setMetricsState(prev => ({ ...prev, likes: data.count }));

            // Show animation if someone else liked it
            if (data.reaction && data.triggerUserId !== currentUser?.id) {
                setShowHeartAnimation(true);
                setTimeout(() => setShowHeartAnimation(false), 2000);
            }
        });

        channel.bind("comment-update", (data: any) => {
            setMetricsState(prev => ({ ...prev, comments: data.count }));
        });

        return () => {
            pusherClient.unsubscribe(`post-${id}`);
        };
    }, [id, currentUser?.id]);




    // Video Autoplay Logic
    const { registerVideo, unregisterVideo, activeVideoId } = useVideoFeed();
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const isVideo = type === "VIDEO";

    useEffect(() => {
        if (isVideo && videoContainerRef.current) {
            registerVideo(id, videoContainerRef.current);
            return () => unregisterVideo(id);
        }
    }, [id, isVideo, registerVideo, unregisterVideo]);

    const handlePin = async () => {
        if (!currentUser) return;
        await togglePinPost(currentUser.id, id);
        // We rely on full page revalidation from server action for visual update of pinned section
        // But we could optimize locally if we wanted.
        // For now, simpler to just await.
    };

    const [isPend, setIsPend] = useState(false);

    const handleSave = async () => {
        if (!currentUser) return;
        setIsPend(true);
        if (isSaved) {
            const res = await unsavePostByPostId(id);
            if (res.success) setIsSaved(false);
        } else {
            const res = await savePost(id);
            if (res.success) setIsSaved(true);
        }
        setIsPend(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
        >
            <Card className={cn(
                "glass-card mb-6 overflow-hidden",
                isPinned && "border-emerald-500/50 bg-emerald-50/10 dark:bg-emerald-900/10 shadow-emerald-500/10"
            )}>
                <CardHeader className="flex flex-row items-center gap-3 p-5 pb-3">
                    <div className="relative group">
                        <Avatar className="cursor-pointer h-10 w-10 ring-2 ring-white dark:ring-zinc-900 transition-transform group-hover:scale-105">
                            <AvatarImage src={author.avatar} alt={author.name} />
                            <AvatarFallback>{author.name[0]}</AvatarFallback>
                        </Avatar>
                        {author.badge && (
                            <div className="absolute -bottom-1 -right-1 scale-75">
                                <MiniBadge badge={author.badge} />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <div className="group cursor-pointer">
                                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 transition-colors">
                                    {author.name}
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                                    {author.role} <span className="text-zinc-300 dark:text-zinc-700">•</span> {published}
                                </p>
                            </div>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="w-48 p-1">
                                    {currentUser?.id === authorId && (
                                        <Button variant="ghost" size="sm" className="w-full justify-start text-xs gap-2" onClick={handlePin}>
                                            {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                                            {isPinned ? "Désépingler" : "Épingler en haut"}
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs gap-2" onClick={handleSave} disabled={isPend}>
                                        <Bookmark className={cn("h-4 w-4", isSaved ? "fill-emerald-500 text-emerald-500" : "")} />
                                        {isSaved ? "Enregistré" : "Sauvegarder"}
                                    </Button>
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => setIsReportOpen(true)}>
                                        <Flag className="h-4 w-4" /> Signaler le contenu
                                    </Button>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-5 pt-1 space-y-4">
                    {/* Content rendering */}
                    <div className="text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words font-normal">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>

                    {/* Media Rendering */}
                    {type === "MEDIA" && displayImage && (
                        <div className="relative rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm aspect-video sm:aspect-auto sm:max-h-[500px]">
                            <img
                                src={displayImage}
                                alt="Post Media"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerHTML = '<div class="flex items-center justify-center h-40 bg-zinc-50 text-zinc-400 text-xs"><AlertCircle class="h-4 w-4 mr-2"/>Image indisponible</div>';
                                }}
                            />
                        </div>
                    )}

                    {/* Poll Rendering */}
                    {type === "POLL" && effectiveMetadata?.options && (
                        <div className="space-y-3 mt-2 p-4 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
                            <div className="flex items-center gap-2 mb-1 font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                                <BarChart2 className="h-4 w-4 text-emerald-500" />
                                <span>Sondage</span>
                            </div>
                            {effectiveMetadata.options.map((opt: string, idx: number) => (
                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    key={idx}
                                    className="relative h-10 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center px-4 cursor-pointer hover:border-emerald-500/50 transition-colors overflow-hidden"
                                >
                                    <span className="z-10 text-sm font-medium">{opt}</span>
                                </motion.div>
                            ))}
                            <p className="text-xs text-zinc-400 text-right">0 votes • Fin dans 24h</p>
                        </div>
                    )}

                    {/* Property Rendering (NEW SMART CARD) */}
                    {type === "PROPERTY" && effectiveMetadata && (
                        <SmartPropertyCard
                            price={effectiveMetadata.price}
                            location={effectiveMetadata.location}
                            surface={effectiveMetadata.surface}
                            rooms={effectiveMetadata.rooms}
                            image={displayImage}
                        />
                    )}





                    {/* Video Rendering */}
                    {type === "VIDEO" && displayImage && (
                        <div ref={videoContainerRef} className="mt-2 rounded-xl overflow-hidden shadow-sm" data-video-id={id}>
                            <VideoPlayer src={displayImage} shouldPlay={activeVideoId === id} />
                        </div>
                    )}

                </CardContent>

                <CardFooter className="p-3 px-5 border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-zinc-900/30">
                    <div className="w-full space-y-4">
                        {/* Actions Bar */}
                        <div className="flex items-center justify-between">
                            <ReactionPicker
                                targetId={id}
                                targetType="POST"
                                activeReaction={userInteraction?.type === 'REACTION' ? userInteraction.value || '👍' : undefined}
                                count={metricsState.likes}
                                currentUserId={currentUser?.id}
                            />

                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-emerald-600 gap-1.5 h-8 px-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/20" onClick={() => {
                                    const el = document.getElementById(`comments-${id}`);
                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }}>
                                    <span className="text-xs font-medium">{metricsState.comments}</span>
                                    <span className="text-[10px] hidden sm:inline">commentaires</span>
                                </Button>

                                <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-emerald-600 gap-1.5 h-8 px-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/20" onClick={() => setIsShareOpen(true)}>
                                    <Share2 className="h-3.5 w-3.5" />
                                    <span className="text-xs hidden sm:inline">{metricsState.shares}</span>
                                </Button>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div id={`comments-${id}`}>
                            <CommentSection
                                postId={id}
                                postAuthorId={authorId}
                                initialComments={initialComments}
                                currentUser={currentUser}
                            />
                        </div>
                    </div>
                </CardFooter>

                {/* Floating Heart Animation */}
                <AnimatePresence>
                    {showHeartAnimation && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0, y: 0 }}
                            animate={{ scale: 1.5, opacity: 1, y: -100 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
                        >
                            <Heart className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-lg" />
                        </motion.div>
                    )}
                </AnimatePresence>

                <ReportDialog
                    open={isReportOpen}
                    onOpenChange={setIsReportOpen}
                    targetId={id}
                    targetType="POST"
                    userId={currentUser?.id}
                />
                <ShareDialog
                    open={isShareOpen}
                    onOpenChange={setIsShareOpen}
                    postId={id}
                    postUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/post/${id}`}
                />
            </Card>
        </motion.div>
    );
}
