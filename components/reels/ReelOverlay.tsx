"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, MoreHorizontal, Music2, Volume2, VolumeX, Bookmark, Divide, Check, BadgeCheck, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import { toggleReaction, toggleSave, toggleFollow } from "@/lib/actions";
import { useSession } from "next-auth/react";
import { CommentsSheet } from "./CommentsSheet";
import { ShareSheet } from "./ShareSheet";

interface ReelOverlayProps {
    post: any;
    isPlaying: boolean;
    isMuted: boolean;
    onToggleMute: (e: React.MouseEvent) => void;
    progress: number;
    showHeartAnimation: boolean;
    isDesktop?: boolean;
}

export function ReelOverlay({ post, isPlaying, isMuted, onToggleMute, progress, showHeartAnimation, isDesktop = false }: ReelOverlayProps) {
    const { data: session } = useSession();
    // ... (keep existing state) ...
    // Local State for Optimistic Updates
    const [liked, setLiked] = useState(post.userHasLiked);
    const [likeCount, setLikeCount] = useState(post._count?.interactions || 0);
    const [saved, setSaved] = useState(post.userHasSaved || false);

    // Sheets State
    const [showComments, setShowComments] = useState(false);
    const [showShare, setShowShare] = useState(false);

    // Re-sync if props accept external heart animation double-tap
    if (showHeartAnimation && !liked) {
        setLiked(true);
        setLikeCount((p: number) => p + 1);
    }

    const handleLike = async () => {
        if (!session?.user?.id) return; // Trigger auth modal?
        const newVal = !liked;
        setLiked(newVal);
        setLikeCount((prev: number) => newVal ? prev + 1 : prev - 1);

        await toggleReaction(post.id, session.user.id, "POST", "REACTION", "LIKE");
    };

    const handleSave = async () => {
        if (!session?.user?.id) return;
        const newVal = !saved;
        setSaved(newVal);
        await toggleSave(session.user.id, post.id);
    };

    // Prevent propagation
    const preventProp = (e: React.MouseEvent) => e.stopPropagation();

    return (
        <>
            {/* Global Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none z-0" />

            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4">

                {/* Top Row */}
                <div className="flex justify-between items-start pointer-events-auto mt-8 md:mt-4">
                    {/* Live / Status Indicators could go here */}
                    <div />

                    {/* Sound Toggle */}
                    <div onClick={onToggleMute} className="flex items-center gap-2 bg-black/20 backdrop-blur-md p-2 rounded-full cursor-pointer hover:bg-black/30 transition border border-white/10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isMuted ? "muted" : "unmuted"}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                            >
                                {isMuted ? <VolumeX size={18} className="text-white" /> : <Volume2 size={18} className="text-white" />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Heart Burst Animation (Center) */}
                <AnimatePresence>
                    {showHeartAnimation && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                            <motion.div
                                initial={{ scale: 0, opacity: 0, rotate: -30 }}
                                animate={{ scale: 1.5, opacity: 1, rotate: 0 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            >
                                <Heart size={100} className="fill-red-500 text-red-500 drop-shadow-[0_10px_20px_rgba(239,68,68,0.5)]" />
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Play/Pause Indicator (Subtle) */}
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-black/30 p-6 rounded-full backdrop-blur-md border border-white/10">
                            <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[24px] border-l-white border-b-[12px] border-b-transparent ml-1" />
                        </div>
                    </div>
                )}

                {/* Bottom Row */}
                <div className="flex items-end justify-between w-full mt-auto mb-4 md:mb-2">

                    {/* Left: Info */}
                    <div className="flex-1 flex flex-col gap-4 text-white pointer-events-auto pb-2 max-w-[75%] md:max-w-[70%] z-10">

                        {/* Author & Follow */}
                        <div className="flex items-center gap-3">
                            <Link href={`/profile/${post.author.id}`} className="relative group">
                                <Avatar className="h-11 w-11 border-2 border-white cursor-pointer transition-transform group-hover:scale-105">
                                    <AvatarImage src={post.author.avatar} />
                                    <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-0.5 border-2 border-black">
                                    <Plus size={10} className="text-white" />
                                </div>
                            </Link>

                            <div className="flex flex-col">
                                <Link href={`/profile/${post.author.id}`} className="font-bold text-base hover:underline flex items-center gap-1 drop-shadow-md">
                                    {post.author.name}
                                    <BadgeCheck className="w-4 h-4 text-blue-400 fill-blue-400/10" />
                                </Link>
                                <span className="text-xs text-white/80 font-medium">Sponsorisé • Abonné</span>
                            </div>
                        </div>

                        {/* Description & Tags */}
                        <div className="space-y-2">
                            <p className="text-[15px] leading-snug drop-shadow-md text-white/95 font-medium line-clamp-3 md:line-clamp-none">
                                {post.content} <span className="font-bold text-white">#immo #lyon #luxe</span>
                            </p>

                            {/* Music/Sound Info (Glass Pill) */}
                            <div className="flex items-center gap-2 text-xs font-semibold bg-white/10 hover:bg-white/20 transition w-fit px-4 py-1.5 rounded-full backdrop-blur-md border border-white/5 cursor-pointer">
                                <Music2 size={14} className="animate-pulse" />
                                <div className="max-w-[150px] overflow-hidden whitespace-nowrap mask-linear-fade">
                                    <div className="animate-marquee inline-block">
                                        Son original - {post.author.name} • {post.author.name} •
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions (Floating Glass Bar) */}
                    <div className="flex flex-col items-center gap-5 text-white pointer-events-auto pb-4 z-10">

                        {/* Like */}
                        <div className="flex flex-col items-center gap-1">
                            <motion.button
                                whileTap={{ scale: 0.8 }}
                                onClick={(e) => { preventProp(e); handleLike(); }}
                                className="p-2 transition-transform active:scale-90"
                            >
                                <Heart size={32} strokeWidth={2.5} className={cn("drop-shadow-lg filter", liked ? "fill-red-500 text-red-500" : "text-white hover:text-white/90")} />
                            </motion.button>
                            <span className="text-xs font-bold drop-shadow-md">{likeCount}</span>
                        </div>

                        {/* Comment */}
                        <div className="flex flex-col items-center gap-1">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => { preventProp(e); setShowComments(true); }}
                                className="p-2 transition-transform active:scale-90"
                            >
                                <MessageCircle size={32} strokeWidth={2.5} className="drop-shadow-lg text-white hover:text-white/90" />
                            </motion.button>
                            <span className="text-xs font-bold drop-shadow-md">{post._count?.comments || 0}</span>
                        </div>

                        {/* Save */}
                        <div className="flex flex-col items-center gap-1">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => { preventProp(e); handleSave(); }}
                                className="p-2 transition-transform active:scale-90"
                            >
                                <Bookmark size={32} strokeWidth={2.5} className={cn("drop-shadow-lg", saved ? "fill-yellow-400 text-yellow-400" : "text-white hover:text-white/90")} />
                            </motion.button>
                            <span className="text-xs font-bold drop-shadow-md">{saved ? "Enregistré" : "Sauvegarder"}</span>
                        </div>

                        {/* Share */}
                        <div className="flex flex-col items-center gap-1">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => { preventProp(e); setShowShare(true); }}
                                className="p-2 transition-transform active:scale-90"
                            >
                                <Share2 size={32} strokeWidth={2.5} className="drop-shadow-lg text-white hover:text-white/90" />
                            </motion.button>
                            <span className="text-xs font-bold drop-shadow-md">Partager</span>
                        </div>

                        {/* Property Mini-Card (Bottom Right) */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="h-10 w-10 rounded-md border-2 border-white/80 bg-cover bg-center shadow-2xl cursor-pointer hover:scale-105 transition-transform mt-2"
                            style={{ backgroundImage: "url('/avatars/house-placeholder.jpg')" }}
                        >
                            <div className="absolute -bottom-2 -right-2 bg-primary text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">
                                VENDU
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Progress Bar (Bottom Edge - Glowy) */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20 group cursor-pointer hover:h-2 transition-all">
                    <motion.div
                        className="h-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.5)]"
                        style={{ width: `${progress}%` }}
                        transition={{ ease: "linear", duration: 0.1 }}
                    />
                </div>
            </div>

            {/* Sheets */}
            <CommentsSheet
                postId={post.id}
                postAuthorId={post.author.id}
                isOpen={showComments}
                onClose={() => setShowComments(false)}
                commentCount={post._count?.comments || 0}
            />

            <ShareSheet
                post={post}
                isOpen={showShare}
                onClose={() => setShowShare(false)}
            />
        </>
    );
}
