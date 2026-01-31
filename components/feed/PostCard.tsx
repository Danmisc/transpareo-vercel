"use client";

import Link from "next/link";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Share2, MoreHorizontal, Bookmark, Pin, PinOff, Flag, Heart, Pencil } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ReactionPicker } from "./ReactionPicker";
import { PollDisplay } from "./PollDisplay";
import { EditPostModal } from "./EditPostModal";
import { QuotedPostEmbed } from "./QuotedPostEmbed";
import { CommentSection } from "./CommentSection";
import type { Interaction } from "@prisma/client";
import { UserProfile, Comment } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ReportDialog } from "@/components/feed/ReportDialog";
import { ShareDialog } from "@/components/feed/ShareDialog";
import { cn } from "@/lib/utils";
import { savePost, unsavePostByPostId } from "@/lib/bookmark-actions";
import { togglePinPost } from "@/lib/actions";
import { MiniBadge } from "@/components/gamification/MiniBadge";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { SmartPropertyCard } from "./SmartPropertyCard";
import { motion, AnimatePresence } from "framer-motion";
import { useVideoFeed } from "./VideoFeedProvider";
import { pusherClient } from "@/lib/pusher";
import { VoiceRecorder } from "@/components/ui/voice-recorder";

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
    attachments?: { url: string; type: string }[];
    isEdited?: boolean;
    createdAt?: Date;
    quotedPost?: {
        id: string;
        content: string;
        author: {
            name: string;
            avatar?: string;
            role?: string;
        };
        createdAt: Date;
        image?: string;
    };
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
    userInteraction,
    initialComments = [],
    isSaved: initialIsSaved = false,
    isPinned = false,
    attachments,
    isEdited = false,
    createdAt,
    quotedPost
}: PostCardProps) {

    // --- State & Logic Restoration ---
    const displayImage = mediaUrl || image;
    const effectiveMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;

    const [isReportOpen, setIsReportOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(initialIsSaved);
    const [isPend, setIsPend] = useState(false);
    const [metricsState, setMetricsState] = useState(metrics);
    const [showHeartAnimation, setShowHeartAnimation] = useState(false);
    const [editableContent, setEditableContent] = useState(content);

    // Check if post is editable (owner + within 15 min)
    const isOwner = currentUser?.id === authorId;
    const canEdit = isOwner && createdAt && (() => {
        const diffMinutes = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60);
        return diffMinutes <= 15;
    })();

    // Pusher Real-time Logic
    useEffect(() => {
        const channel = pusherClient.subscribe(`post-${id}`);
        channel.bind("reaction-update", (data: any) => {
            setMetricsState(prev => ({ ...prev, likes: data.count }));
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

    // Video Logic
    const { registerVideo, unregisterVideo, activeVideoId } = useVideoFeed();
    const videoContainerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (type === "VIDEO" && videoContainerRef.current) {
            registerVideo(id, videoContainerRef.current);
            return () => unregisterVideo(id);
        }
    }, [id, type, registerVideo, unregisterVideo]);

    // Actions
    const handlePin = async () => {
        if (!currentUser) return;
        await togglePinPost(currentUser.id, id);
    };

    const handleSave = async () => {
        if (!currentUser) return;
        setIsPend(true);
        if (isSaved) {
            await unsavePostByPostId(id);
            setIsSaved(false);
        } else {
            await savePost(id);
            setIsSaved(true);
        }
        setIsPend(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6"
        >
            <Card className={cn(
                "border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 backdrop-blur-sm overflow-hidden shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.06)] hover:border-zinc-300/50 dark:hover:border-zinc-700",
                isPinned && "border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-900/5"
            )}>
                {/* Header */}
                <CardHeader className="flex flex-row items-center gap-4 p-5 pb-2">
                    <Avatar className="h-11 w-11 border border-zinc-100 dark:border-zinc-800 ring-2 ring-white dark:ring-zinc-950">
                        <AvatarImage src={author.avatar} />
                        <AvatarFallback>{author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                                <h3 className="text-[15px] font-bold text-zinc-900 dark:text-zinc-50 hover:underline cursor-pointer tracking-tight">
                                    {author.name}
                                </h3>
                                <p className="text-[13px] text-zinc-500 font-medium">
                                    {author.role} <span className="text-zinc-300 mx-1">•</span> {published}
                                    {isEdited && (
                                        <span className="text-zinc-400 ml-1" title="Ce post a été modifié">(modifié)</span>
                                    )}
                                </p>
                            </div>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="w-48 p-1">
                                    {canEdit && (
                                        <Button variant="ghost" size="sm" className="w-full justify-start text-xs gap-2" onClick={() => setIsEditOpen(true)}>
                                            <Pencil className="h-4 w-4" /> Modifier
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs gap-2" onClick={handleSave}>
                                        <Bookmark className={cn("h-4 w-4", isSaved ? "fill-emerald-500 text-emerald-500" : "")} />
                                        {isSaved ? "Enregistré" : "Sauvegarder"}
                                    </Button>
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs gap-2 text-red-500" onClick={() => setIsReportOpen(true)}>
                                        <Flag className="h-4 w-4" /> Signaler
                                    </Button>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </CardHeader>

                {/* Content */}
                <CardContent className="p-4 pt-1 space-y-3">
                    <div className="text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>

                    {/* Media Types */}
                    {/* Carousel for multiple attachments */}
                    {attachments && attachments.length > 0 ? (
                        <div className="rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800 relative group">
                            {/* Scroll Container */}
                            <div
                                id={`carousel-${id}`}
                                className="flex overflow-x-auto snap-x snap-mandatory h-[500px] scroll-smooth no-scrollbar"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {attachments.map((att, i) => (
                                    <div key={i} className="flex-none w-full min-w-full h-full snap-center relative bg-black">
                                        {att.type === "VIDEO" ? (
                                            <VideoPlayer src={att.url} shouldPlay={false} />
                                        ) : (
                                            <img src={att.url} alt={`Slide ${i}`} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Controls Overlay */}
                            {attachments.length > 1 && (
                                <>
                                    {/* Navigation Arrows (Desktop) */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const el = document.getElementById(`carousel-${id}`);
                                            if (el) el.scrollBy({ left: -el.offsetWidth, behavior: 'smooth' });
                                        }}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                                        aria-label="Previous"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const el = document.getElementById(`carousel-${id}`);
                                            if (el) el.scrollBy({ left: el.offsetWidth, behavior: 'smooth' });
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                                        aria-label="Next"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                    </button>

                                    {/* Pagination Dots */}
                                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                                        {attachments.map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-1.5 h-1.5 rounded-full bg-white/60 backdrop-blur-sm shadow-sm"
                                            />
                                        ))}
                                    </div>

                                    {/* Counter Badge */}
                                    <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md pointer-events-none">
                                        1/{attachments.length}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (type === "MEDIA" || type === "IMAGE") && displayImage && (
                        <div className="rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
                            <img src={displayImage} alt="Post content" className="w-full h-auto max-h-[500px] object-cover" />
                        </div>
                    )}

                    {type === "PROPERTY" && effectiveMetadata && (
                        <SmartPropertyCard {...effectiveMetadata} image={displayImage} />
                    )}

                    {type === "AUDIO" && displayImage && (
                        <div className="py-2">
                            <VoiceRecorder
                                initialAudioUrl={displayImage}
                                readOnly
                            />
                        </div>
                    )}

                    {type === "VIDEO" && displayImage && (
                        <div ref={videoContainerRef} className="rounded-xl overflow-hidden relative group cursor-pointer">
                            <Link href={`/reels/${id}`} className="block">
                                <VideoPlayer src={displayImage} shouldPlay={activeVideoId === id} />
                                {/* Overlay Hint */}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                    <span className="bg-black/60 text-white text-sm px-3 py-1.5 rounded-full font-medium backdrop-blur-md">
                                        Voir en Reels
                                    </span>
                                </div>
                            </Link>
                        </div>
                    )}

                    {type === "POLL" && effectiveMetadata?.options && (
                        <PollDisplay
                            postId={id}
                            options={effectiveMetadata.options}
                            currentUserId={currentUser?.id}
                            endDate={effectiveMetadata.endDate ? new Date(effectiveMetadata.endDate) : undefined}
                        />
                    )}

                    {/* Code Blocks Display */}
                    {effectiveMetadata?.codeBlocks && effectiveMetadata.codeBlocks.length > 0 && (
                        <div className="mt-3 space-y-3">
                            {effectiveMetadata.codeBlocks.map((block: any, idx: number) => (
                                <div key={idx} className="rounded-lg overflow-hidden border border-zinc-700/50">
                                    <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-800 border-b border-zinc-700">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] uppercase text-zinc-400 font-mono">
                                                {block.language || 'text'}
                                            </span>
                                            {block.filename && (
                                                <>
                                                    <span className="text-zinc-600">•</span>
                                                    <span className="text-[10px] text-zinc-400">{block.filename}</span>
                                                </>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(block.code);
                                            }}
                                            className="text-zinc-400 hover:text-white transition-colors text-xs"
                                        >
                                            Copier
                                        </button>
                                    </div>
                                    <pre className="p-4 bg-zinc-900 text-zinc-100 text-xs font-mono overflow-x-auto max-h-72">
                                        <code>{block.code}</code>
                                    </pre>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Link Previews Display */}
                    {effectiveMetadata?.linkPreviews && effectiveMetadata.linkPreviews.length > 0 && (
                        <div className="mt-3 space-y-2">
                            {effectiveMetadata.linkPreviews.map((link: any, idx: number) => (
                                <a
                                    key={idx}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all group"
                                >
                                    {link.imageUrl && (
                                        <div className="h-32 bg-zinc-100 dark:bg-zinc-800">
                                            <img
                                                src={link.imageUrl}
                                                alt={link.title || ""}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                                            />
                                        </div>
                                    )}
                                    <div className="p-3">
                                        <p className="text-[10px] text-zinc-400 uppercase tracking-wide mb-1">
                                            {link.siteName || new URL(link.url).hostname}
                                        </p>
                                        {link.title && (
                                            <h4 className="font-semibold text-sm line-clamp-2 text-zinc-800 dark:text-zinc-200 group-hover:text-orange-500 transition-colors">
                                                {link.title}
                                            </h4>
                                        )}
                                        {link.description && (
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                                                {link.description}
                                            </p>
                                        )}
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Map Embed Display */}
                    {effectiveMetadata?.mapEmbeds && effectiveMetadata.mapEmbeds.length > 0 && (
                        <div className="mt-3">
                            {effectiveMetadata.mapEmbeds.map((mapEmbed: any, idx: number) => (
                                <a
                                    key={idx}
                                    href={`https://www.openstreetmap.org/?mlat=${mapEmbed.latitude}&mlon=${mapEmbed.longitude}#map=15/${mapEmbed.latitude}/${mapEmbed.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 hover:border-orange-500/50 transition-colors group"
                                >
                                    <div className="relative bg-zinc-100 dark:bg-zinc-800">
                                        <iframe
                                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapEmbed.longitude - 0.01},${mapEmbed.latitude - 0.01},${mapEmbed.longitude + 0.01},${mapEmbed.latitude + 0.01}&layer=mapnik&marker=${mapEmbed.latitude},${mapEmbed.longitude}`}
                                            className="w-full h-40 border-0 pointer-events-none"
                                            loading="lazy"
                                            title="Location"
                                        />
                                        <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors" />
                                    </div>
                                    {mapEmbed.address && (
                                        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 flex-shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                            <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                                                {mapEmbed.address}
                                            </p>
                                        </div>
                                    )}
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Quoted Post Display */}
                    {quotedPost && (
                        <QuotedPostEmbed post={quotedPost} />
                    )}
                </CardContent>

                {/* Footer / Actions */}
                <CardFooter className="p-3 px-5 bg-gradient-to-b from-white to-zinc-50/50 dark:from-zinc-900/0 dark:to-zinc-900/30 border-t border-zinc-100 dark:border-zinc-800/50 block">
                    <div className="flex items-center justify-between">
                        <ReactionPicker
                            targetId={id}
                            targetType="POST"
                            activeReaction={userInteraction?.type === 'REACTION' ? (userInteraction.value || undefined) : undefined}
                            count={metricsState.likes}
                            currentUserId={currentUser?.id}
                        />

                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-zinc-500 gap-1.5 h-8 px-2" onClick={() => {
                                const el = document.getElementById(`comments-${id}`);
                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}>
                                <span className="text-xs font-bold">{metricsState.comments}</span>
                                <span className="text-xs hidden sm:inline">coms</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="text-zinc-500 gap-1.5 h-8 px-2" onClick={() => setIsShareOpen(true)}>
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Comment Section (Restored) */}
                    <div id={`comments-${id}`}>
                        <CommentSection
                            postId={id}
                            postAuthorId={authorId}
                            initialComments={initialComments}
                            currentUser={currentUser}
                        />
                    </div>
                </CardFooter>

                {/* Overlays */}
                <AnimatePresence>
                    {showHeartAnimation && (
                        <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1.5, opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                            <Heart className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-lg" />
                        </motion.div>
                    )}
                </AnimatePresence>

                <ReportDialog open={isReportOpen} onOpenChange={setIsReportOpen} targetId={id} targetType="POST" userId={currentUser?.id} />
                <ShareDialog
                    open={isShareOpen}
                    onOpenChange={setIsShareOpen}
                    postId={id}
                    postUrl={`/post/${id}`}
                    postContent={content}
                    postAuthor={author}
                    postCreatedAt={createdAt}
                    postImage={displayImage}
                    currentUserId={currentUser?.id}
                />
                {currentUser && createdAt && (
                    <EditPostModal
                        isOpen={isEditOpen}
                        onClose={() => setIsEditOpen(false)}
                        postId={id}
                        userId={currentUser.id}
                        currentContent={editableContent}
                        createdAt={createdAt}
                    />
                )}
            </Card>
        </motion.div>
    );
}
