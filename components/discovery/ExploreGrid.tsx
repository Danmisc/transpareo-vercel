"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    Play, Heart, MessageCircle, Bookmark, MoreHorizontal,
    Image as ImageIcon, Video, FileText, Home, MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExplorePost {
    id: string;
    type: string;
    image?: string | null;
    mediaUrl?: string;
    content: string;
    author: {
        name: string;
        avatar?: string;
    };
    metrics?: {
        likes: number;
        comments: number;
    };
    attachments?: { url: string; type: string }[];
}

interface ExploreGridProps {
    posts: ExplorePost[];
    loading?: boolean;
    onLoadMore?: () => void;
    hasMore?: boolean;
}

export function ExploreGrid({
    posts,
    loading = false,
    onLoadMore,
    hasMore = false
}: ExploreGridProps) {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Infinite scroll observer
    useEffect(() => {
        if (!onLoadMore || !hasMore) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    onLoadMore();
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => observerRef.current?.disconnect();
    }, [onLoadMore, hasMore, loading]);

    if (!posts.length && !loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                <ImageIcon size={48} className="mb-4 opacity-20" />
                <p>Aucun contenu à explorer</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Masonry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2">
                {posts.map((post, index) => (
                    <ExploreGridItem
                        key={post.id}
                        post={post}
                        index={index}
                    />
                ))}
            </div>

            {/* Loading skeleton */}
            {loading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="aspect-square bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse"
                        />
                    ))}
                </div>
            )}

            {/* Load more trigger */}
            {hasMore && <div ref={loadMoreRef} className="h-10" />}
        </div>
    );
}

interface ExploreGridItemProps {
    post: ExplorePost;
    index: number;
}

function ExploreGridItem({ post, index }: ExploreGridItemProps) {
    const [isHovered, setIsHovered] = useState(false);

    // Get image URL from post or attachments
    const imageUrl = post.image || post.mediaUrl ||
        post.attachments?.find(a => a.type === "IMAGE")?.url;

    const isVideo = post.type === "VIDEO" ||
        post.attachments?.some(a => a.type === "VIDEO");

    // Determine if this should be a large item (featured layout)
    const isLarge = index === 0 || (index % 7 === 0);

    return (
        <Link href={`/post/${post.id}`}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={cn(
                    "relative overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 cursor-pointer group",
                    isLarge ? "col-span-2 row-span-2 aspect-square" : "aspect-square"
                )}
            >
                {/* Media */}
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800">
                        {post.type === "PROPERTY" ? (
                            <Home size={32} className="text-zinc-400" />
                        ) : (
                            <FileText size={32} className="text-zinc-400" />
                        )}
                    </div>
                )}

                {/* Video indicator */}
                {isVideo && (
                    <div className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full">
                        <Play size={14} className="text-white fill-white" />
                    </div>
                )}

                {/* Multi-image indicator */}
                {post.attachments && post.attachments.length > 1 && (
                    <div className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full">
                        <div className="flex items-center gap-0.5">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            <div className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                        </div>
                    </div>
                )}

                {/* Hover overlay */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center"
                        >
                            <div className="flex items-center gap-6 text-white">
                                <div className="flex items-center gap-2">
                                    <Heart size={18} className="fill-white" />
                                    <span className="font-bold text-sm">
                                        {post.metrics?.likes || 0}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MessageCircle size={18} className="fill-white" />
                                    <span className="font-bold text-sm">
                                        {post.metrics?.comments || 0}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Type badge */}
                {post.type === "PROPERTY" && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 bg-orange-500 text-white text-[10px] font-bold rounded-full">
                        <Home size={10} />
                        Bien
                    </div>
                )}
            </motion.div>
        </Link>
    );
}

// Category tabs for explore
const EXPLORE_CATEGORIES = [
    { id: "all", label: "Pour vous", icon: "✨" },
    { id: "immobilier", label: "Immobilier", icon: "🏠" },
    { id: "lifestyle", label: "Lifestyle", icon: "🌟" },
    { id: "tech", label: "Tech", icon: "💻" },
    { id: "finance", label: "Finance", icon: "📊" },
    { id: "community", label: "Communauté", icon: "👥" },
];

interface ExploreCategoryTabsProps {
    selected: string;
    onChange: (category: string) => void;
}

export function ExploreCategoryTabs({ selected, onChange }: ExploreCategoryTabsProps) {
    return (
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
            <div className="flex gap-2" style={{ minWidth: "max-content" }}>
                {EXPLORE_CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => onChange(cat.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                            selected === cat.id
                                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        )}
                    >
                        <span>{cat.icon}</span>
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

// Featured post card (larger, more detailed)
interface FeaturedPostProps {
    post: ExplorePost;
}

export function FeaturedPostCard({ post }: FeaturedPostProps) {
    const imageUrl = post.image || post.mediaUrl ||
        post.attachments?.find(a => a.type === "IMAGE")?.url;

    return (
        <Link href={`/post/${post.id}`}>
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden group">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-500 to-pink-500" />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <img
                            src={post.author.avatar || "/avatars/default.svg"}
                            alt={post.author.name}
                            className="w-10 h-10 rounded-full border-2 border-white"
                        />
                        <span className="text-white font-medium">{post.author.name}</span>
                    </div>
                    <p className="text-white text-lg font-medium line-clamp-2">
                        {post.content}
                    </p>
                    <div className="flex items-center gap-4 mt-4 text-white/80 text-sm">
                        <span className="flex items-center gap-1">
                            <Heart size={14} /> {post.metrics?.likes || 0}
                        </span>
                        <span className="flex items-center gap-1">
                            <MessageCircle size={14} /> {post.metrics?.comments || 0}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

