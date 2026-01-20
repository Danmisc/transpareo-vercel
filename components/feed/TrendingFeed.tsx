"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Hash, TrendingUp, Users, MoreHorizontal, Flame, Zap,
    MapPin, ChevronRight, Sparkles, Eye, MessageCircle,
    Heart, Play, Globe, Clock, ArrowUp, Search, Bell,
    BellOff, X, BarChart3, Home, Building2, Wallet,
    Laptop, Newspaper, Star, Bookmark, Share2, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Types
interface TrendingTopic {
    id: string;
    tag: string;
    category?: string;
    postCount: number;
    isHot?: boolean;
    velocity?: number;
    previewImage?: string;
    chartData?: number[];
}

interface SuggestedUser {
    id: string;
    name: string;
    username?: string;
    avatar?: string;
    bio?: string;
    isVerified?: boolean;
    followersCount?: number;
}

interface TrendingPost {
    id: string;
    content: string;
    image?: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
        isVerified?: boolean;
    };
    likes: number;
    comments: number;
    shares?: number;
    isVideo?: boolean;
    createdAt?: string;
}

interface TrendingFeedProps {
    trends?: TrendingTopic[];
    users?: SuggestedUser[];
    posts?: TrendingPost[];
    loading?: boolean;
}

// Categories with icons (no emojis)
const CATEGORIES = [
    { id: "all", label: "Tout", icon: Globe },
    { id: "immobilier", label: "Immobilier", icon: Home },
    { id: "finance", label: "Finance", icon: Wallet },
    { id: "lifestyle", label: "Lifestyle", icon: Star },
    { id: "tech", label: "Tech", icon: Laptop },
    { id: "actualites", label: "Actualités", icon: Newspaper },
];

// Mini Sparkline Chart Component
function MiniChart({ data, color = "orange" }: { data: number[]; color?: string }) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((value - min) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    const isUp = data[data.length - 1] > data[0];
    const chartColor = isUp ? "#10b981" : "#ef4444";

    return (
        <div className="w-16 h-8 relative">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                <polyline
                    points={points}
                    fill="none"
                    stroke={chartColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-sm"
                />
                <polyline
                    points={`0,100 ${points} 100,100`}
                    fill={`url(#gradient-${isUp ? 'up' : 'down'})`}
                    opacity="0.2"
                />
                <defs>
                    <linearGradient id="gradient-up" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="gradient-down" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}

// Main TrendingFeed Component
export function TrendingFeed({ trends = [], users = [], posts = [], loading = false }: TrendingFeedProps) {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [showAllTrends, setShowAllTrends] = useState(false);
    const [subscribedTags, setSubscribedTags] = useState<Set<string>>(new Set());

    // Generate mock chart data for trends
    const trendsWithCharts = trends.map(t => ({
        ...t,
        chartData: t.chartData || Array.from({ length: 7 }, () => Math.floor(Math.random() * 100) + (t.velocity || 0))
    }));

    // Filter trends by category and search
    const filteredTrends = trendsWithCharts
        .filter(t => selectedCategory === "all" || t.category?.toLowerCase() === selectedCategory)
        .filter(t => !searchQuery || (t.tag || '').toLowerCase().includes(searchQuery.toLowerCase()));

    const displayedTrends = showAllTrends ? filteredTrends : filteredTrends.slice(0, 8);

    const toggleSubscription = (tag: string) => {
        setSubscribedTags(prev => {
            const next = new Set(prev);
            if (next.has(tag)) {
                next.delete(tag);
                toast.success(`Notifications désactivées pour #${tag}`);
            } else {
                next.add(tag);
                toast.success(`Notifications activées pour #${tag}`);
            }
            return next;
        });
    };

    return (
        <div className="space-y-0">
            {/* Header with search */}
            <div className="sticky top-[7rem] md:top-[8rem] z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-b border-zinc-100 dark:border-zinc-800/50">
                {/* Live indicator row */}
                <div className="px-4 md:px-0 py-2.5 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="relative flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                            <div className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping opacity-75" />
                        </div>
                        <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                            En direct
                        </span>
                    </div>
                    <div className="flex-1" />
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                        <Clock size={12} />
                        Mis à jour à l'instant
                    </span>
                </div>

                {/* Search bar */}
                <div className="px-4 md:px-0 pb-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <Input
                            placeholder="Rechercher dans les tendances..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-9 h-10 bg-zinc-100 dark:bg-zinc-800/50 border-0 rounded-xl focus-visible:ring-1 focus-visible:ring-orange-500"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Category tabs */}
                <div className="overflow-x-auto scrollbar-hide">
                    <div className="flex px-4 md:px-0 pb-2 gap-1" style={{ minWidth: "max-content" }}>
                        {CATEGORIES.map(cat => {
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                                        selectedCategory === cat.id
                                            ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg"
                                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    )}
                                >
                                    <Icon size={14} />
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {loading ? (
                <TrendingListSkeleton />
            ) : (
                <>
                    {/* Featured Hot Topics */}
                    {trendsWithCharts.filter(t => t.isHot).length > 0 && (
                        <div className="pt-4 pb-2">
                            <div className="px-4 md:px-0 mb-3 flex items-center gap-2">
                                <Flame size={18} className="text-orange-500" />
                                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                                    En ce moment
                                </h2>
                            </div>
                            <div className="overflow-x-auto scrollbar-hide">
                                <div className="flex px-4 md:px-0 gap-3 pb-2" style={{ minWidth: "max-content" }}>
                                    {trendsWithCharts.filter(t => t.isHot).slice(0, 4).map((topic) => (
                                        <HotTopicCard
                                            key={topic.id || topic.tag}
                                            topic={topic}
                                            isSubscribed={subscribedTags.has(topic.tag)}
                                            onToggleSubscribe={() => toggleSubscription(topic.tag)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Trending Posts Section */}
                    {posts.length > 0 && (
                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                            <div className="px-4 md:px-0 mb-3 flex items-center gap-2">
                                <TrendingUp size={18} className="text-blue-500" />
                                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                                    Posts populaires
                                </h2>
                            </div>
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                {posts.slice(0, 3).map((post) => (
                                    <TrendingPostCard key={post.id} post={post} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Main Trending List */}
                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                        <div className="px-4 md:px-0 mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BarChart3 size={18} className="text-purple-500" />
                                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                                    Tendances
                                </h2>
                            </div>
                            <span className="text-xs text-zinc-400">
                                {filteredTrends.length} sujets
                            </span>
                        </div>

                        {filteredTrends.length === 0 ? (
                            <div className="py-12 text-center">
                                <Search size={40} className="mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
                                <p className="text-zinc-500 text-sm">Aucune tendance trouvée</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                {displayedTrends.map((trend, i) => (
                                    <TrendItem
                                        key={trend.id || trend.tag}
                                        trend={trend}
                                        rank={i + 1}
                                        isSubscribed={subscribedTags.has(trend.tag)}
                                        onToggleSubscribe={() => toggleSubscription(trend.tag)}
                                    />
                                ))}
                            </div>
                        )}

                        {filteredTrends.length > 8 && !showAllTrends && (
                            <button
                                onClick={() => setShowAllTrends(true)}
                                className="w-full py-4 text-orange-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                Afficher {filteredTrends.length - 8} de plus
                                <ChevronRight size={16} />
                            </button>
                        )}
                    </div>

                    {/* Suggestions Section */}
                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                        <div className="px-4 md:px-0 mb-3 flex items-center gap-2">
                            <Users size={18} className="text-teal-500" />
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                                Comptes à suivre
                            </h2>
                        </div>
                        <SuggestedUsersList users={users} />
                    </div>

                    {/* Local Trends */}
                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                        <div className="px-4 md:px-0 mb-3 flex items-center gap-2">
                            <MapPin size={18} className="text-rose-500" />
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                                Près de chez vous
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 gap-2 px-4 md:px-0 pb-4">
                            {trendsWithCharts.slice(0, 6).map((trend, i) => (
                                <LocalTrendCard key={`local-${trend.id || trend.tag}`} trend={trend} />
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-4 md:px-0 py-8 text-center border-t border-zinc-100 dark:border-zinc-800/50">
                        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                            Les tendances sont personnalisées selon votre localisation, vos abonnements et vos centres d'intérêt.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}

// Hot Topic Card - Innovative glass design
function HotTopicCard({
    topic,
    isSubscribed,
    onToggleSubscribe
}: {
    topic: TrendingTopic;
    isSubscribed: boolean;
    onToggleSubscribe: () => void;
}) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="relative w-44 flex-shrink-0"
        >
            <Link href={`/hashtag/${encodeURIComponent((topic.tag || '').replace('#', ''))}`}>
                <div className="relative h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-800 dark:to-zinc-900 group cursor-pointer">
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Glass effect overlay */}
                    <div className="absolute inset-0 backdrop-blur-[1px]" />

                    {/* Content */}
                    <div className="relative h-full p-4 flex flex-col justify-between">
                        {/* Top row */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-orange-500/20 text-orange-400">
                                <Flame size={12} />
                                <span className="text-[10px] font-bold">HOT</span>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    onToggleSubscribe();
                                }}
                                className={cn(
                                    "p-1.5 rounded-full transition-colors",
                                    isSubscribed
                                        ? "bg-orange-500 text-white"
                                        : "bg-white/10 text-white/60 hover:bg-white/20"
                                )}
                            >
                                {isSubscribed ? <Bell size={12} /> : <BellOff size={12} />}
                            </button>
                        </div>

                        {/* Center - Chart */}
                        <div className="flex-1 flex items-center justify-center py-2">
                            {topic.chartData && (
                                <div className="w-full h-12 opacity-60">
                                    <MiniChart data={topic.chartData} />
                                </div>
                            )}
                        </div>

                        {/* Bottom */}
                        <div>
                            <p className="text-white font-bold text-sm leading-tight line-clamp-2">
                                #{(topic.tag || '').replace('#', '')}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-white/50 text-xs">
                                    {(topic.postCount || 0).toLocaleString()} posts
                                </span>
                                {topic.velocity && topic.velocity > 0 && (
                                    <span className="flex items-center gap-0.5 text-emerald-400 text-xs font-medium">
                                        <ArrowUp size={12} />
                                        {topic.velocity}%
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

// Trending Post Card
function TrendingPostCard({ post }: { post: TrendingPost }) {
    return (
        <Link href={`/post/${post.id}`}>
            <div className="px-4 md:px-0 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer group">
                <div className="flex gap-3">
                    {/* Author avatar */}
                    <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={post.author.avatar || "/avatars/default.svg"} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-400 to-pink-500 text-white font-bold text-sm">
                            {post.author.name?.[0]}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        {/* Author info */}
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-semibold text-sm text-zinc-900 dark:text-white truncate">
                                {post.author.name}
                            </span>
                            {post.author.isVerified && (
                                <svg className="w-4 h-4 text-orange-500 flex-shrink-0" viewBox="0 0 22 22" fill="currentColor">
                                    <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
                                </svg>
                            )}
                            <span className="text-zinc-400 text-xs">
                                · {post.createdAt || "2h"}
                            </span>
                        </div>

                        {/* Content */}
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2 mb-2">
                            {post.content}
                        </p>

                        {/* Image preview */}
                        {post.image && (
                            <div className="relative rounded-xl overflow-hidden mb-2 aspect-video max-w-sm">
                                <img
                                    src={post.image}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                                {post.isVideo && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                                            <Play size={20} className="text-zinc-900 ml-1" fill="currentColor" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Metrics */}
                        <div className="flex items-center gap-6 text-zinc-500">
                            <span className="flex items-center gap-1.5 text-xs hover:text-rose-500 transition-colors">
                                <Heart size={14} />
                                {post.likes}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs hover:text-blue-500 transition-colors">
                                <MessageCircle size={14} />
                                {post.comments}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs hover:text-emerald-500 transition-colors">
                                <Share2 size={14} />
                                {post.shares || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// Trend Item with chart
function TrendItem({
    trend,
    rank,
    isSubscribed,
    onToggleSubscribe
}: {
    trend: TrendingTopic;
    rank: number;
    isSubscribed: boolean;
    onToggleSubscribe: () => void;
}) {
    const getCategoryIcon = (category?: string) => {
        switch (category?.toLowerCase()) {
            case "immobilier": return Home;
            case "finance": return Wallet;
            case "tech": return Laptop;
            case "lifestyle": return Star;
            case "actualites": return Newspaper;
            default: return Globe;
        }
    };

    const CategoryIcon = getCategoryIcon(trend.category);

    return (
        <div className="px-4 md:px-0 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors group">
            <div className="flex items-center gap-3">
                {/* Rank */}
                <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0",
                    rank <= 3
                        ? "bg-gradient-to-br from-orange-500 to-pink-500 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                )}>
                    {rank}
                </div>

                {/* Content */}
                <Link
                    href={`/hashtag/${encodeURIComponent((trend.tag || '').replace('#', ''))}`}
                    className="flex-1 min-w-0"
                >
                    <div className="flex items-center gap-2 mb-0.5">
                        <CategoryIcon size={12} className="text-zinc-400" />
                        <span className="text-xs text-zinc-500">{trend.category || "Tendance"}</span>
                        {trend.isHot && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold">
                                <Flame size={10} />
                                Hot
                            </span>
                        )}
                    </div>
                    <p className="font-bold text-[15px] text-zinc-900 dark:text-white group-hover:text-orange-500 transition-colors">
                        #{(trend.tag || '').replace('#', '')}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                        {(trend.postCount || 0).toLocaleString()} posts
                    </p>
                </Link>

                {/* Chart */}
                {trend.chartData && (
                    <div className="hidden sm:block">
                        <MiniChart data={trend.chartData} />
                    </div>
                )}

                {/* Velocity */}
                {trend.velocity !== undefined && trend.velocity !== 0 && (
                    <div className={cn(
                        "flex items-center gap-0.5 text-xs font-semibold",
                        trend.velocity > 0 ? "text-emerald-500" : "text-rose-500"
                    )}>
                        <ArrowUp size={14} className={trend.velocity < 0 ? "rotate-180" : ""} />
                        {Math.abs(trend.velocity)}%
                    </div>
                )}

                {/* Subscribe button */}
                <button
                    onClick={onToggleSubscribe}
                    className={cn(
                        "p-2 rounded-full transition-all opacity-0 group-hover:opacity-100",
                        isSubscribed
                            ? "bg-orange-100 dark:bg-orange-900/30 text-orange-500"
                            : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
                    )}
                >
                    {isSubscribed ? <Bell size={16} /> : <BellOff size={16} />}
                </button>
            </div>
        </div>
    );
}

// Local Trend Card - Compact grid style
function LocalTrendCard({ trend }: { trend: TrendingTopic }) {
    return (
        <Link href={`/hashtag/${encodeURIComponent((trend.tag || '').replace('#', ''))}`}>
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
            >
                <div className="flex items-center gap-2 mb-1">
                    <MapPin size={12} className="text-rose-500" />
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wide">Local</span>
                </div>
                <p className="font-semibold text-sm text-zinc-900 dark:text-white truncate group-hover:text-orange-500 transition-colors">
                    #{(trend.tag || '').replace('#', '')}
                </p>
                <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-zinc-500">{(trend.postCount || 0).toLocaleString()}</span>
                    {trend.velocity && trend.velocity > 0 && (
                        <span className="text-emerald-500 text-[10px] font-medium flex items-center">
                            <ArrowUp size={10} />
                            {trend.velocity}%
                        </span>
                    )}
                </div>
            </motion.div>
        </Link>
    );
}

// Suggested Users List
function SuggestedUsersList({ users }: { users: SuggestedUser[] }) {
    if (!users.length) {
        return (
            <div className="py-8 text-center">
                <Users size={32} className="mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
                <p className="text-zinc-500 text-sm">Aucune suggestion disponible</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {users.slice(0, 4).map((user) => (
                <UserItem key={user.id} user={user} />
            ))}
            <Link
                href="/discover/people"
                className="flex items-center justify-center gap-2 px-4 md:px-0 py-4 text-orange-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 text-sm font-semibold transition-colors"
            >
                Voir plus
                <ChevronRight size={16} />
            </Link>
        </div>
    );
}

// User Item
function UserItem({ user }: { user: SuggestedUser }) {
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleFollow = async () => {
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 400));
        setIsFollowing(!isFollowing);
        setIsLoading(false);
        toast.success(isFollowing ? "Abonnement annulé" : "Abonnement ajouté");
    };

    return (
        <div className="px-4 md:px-0 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
            <div className="flex items-center gap-3">
                <Link href={`/profile/${user.id}`}>
                    <Avatar className="h-11 w-11 flex-shrink-0 ring-2 ring-white dark:ring-zinc-900">
                        <AvatarImage src={user.avatar || "/avatars/default.svg"} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-400 to-pink-500 text-white font-bold">
                            {user.name?.[0]}
                        </AvatarFallback>
                    </Avatar>
                </Link>

                <div className="flex-1 min-w-0">
                    <Link href={`/profile/${user.id}`}>
                        <div className="flex items-center gap-1">
                            <span className="font-semibold text-sm text-zinc-900 dark:text-white truncate hover:underline">
                                {user.name}
                            </span>
                            {user.isVerified && (
                                <svg className="w-4 h-4 text-orange-500 flex-shrink-0" viewBox="0 0 22 22" fill="currentColor">
                                    <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
                                </svg>
                            )}
                        </div>
                        <p className="text-xs text-zinc-500 truncate">
                            @{user.username || user.name?.toLowerCase().replace(/\s/g, '')}
                        </p>
                    </Link>
                </div>

                <Button
                    size="sm"
                    variant={isFollowing ? "outline" : "default"}
                    onClick={handleFollow}
                    disabled={isLoading}
                    className={cn(
                        "rounded-full h-8 text-xs font-semibold px-4",
                        !isFollowing && "bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
                    )}
                >
                    {isFollowing ? "Suivi" : "Suivre"}
                </Button>
            </div>
        </div>
    );
}

// Skeleton
function TrendingListSkeleton() {
    return (
        <div className="px-4 md:px-0 pt-4">
            <div className="flex gap-3 pb-4 overflow-hidden">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="w-44 h-48 rounded-2xl flex-shrink-0" />
                ))}
            </div>
            <div className="space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="py-3 flex items-center gap-3">
                        <Skeleton className="w-7 h-7 rounded-lg" />
                        <div className="flex-1">
                            <Skeleton className="h-3 w-20 mb-2" />
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="w-16 h-8" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// Wrapper
interface TrendingFeedWrapperProps {
    trendingData: TrendingTopic[];
    recommendedUsers: SuggestedUser[];
    trendingPosts?: TrendingPost[];
}

export function TrendingFeedWrapper({ trendingData, recommendedUsers, trendingPosts = [] }: TrendingFeedWrapperProps) {
    return (
        <TrendingFeed
            trends={trendingData}
            users={recommendedUsers}
            posts={trendingPosts}
            loading={false}
        />
    );
}

