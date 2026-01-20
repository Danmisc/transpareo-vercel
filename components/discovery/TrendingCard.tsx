"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    TrendingUp, Hash, Flame, MapPin, Clock, ArrowUp, ArrowRight,
    BarChart2, Users, Globe, Zap, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface TrendingHashtag {
    tag: string;
    count: number;
    velocity?: number;
    category?: string;
}

interface TrendingCardProps {
    hashtag: TrendingHashtag;
    rank: number;
    showVelocity?: boolean;
}

export function TrendingCard({ hashtag, rank, showVelocity = false }: TrendingCardProps) {
    const isHot = hashtag.velocity && hashtag.velocity > 50;
    const isBursting = hashtag.velocity && hashtag.velocity > 100;

    // Guard against undefined tag
    if (!hashtag || !hashtag.tag) return null;

    return (
        <Link href={`/hashtag/${encodeURIComponent((hashtag.tag || '').replace('#', ''))}`}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rank * 0.05 }}
                className={cn(
                    "group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer",
                    "bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800",
                    "hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/5",
                    isBursting && "border-red-500/30 bg-gradient-to-r from-red-50/50 to-orange-50/50 dark:from-red-900/10 dark:to-orange-900/10"
                )}
            >
                {/* Rank badge */}
                <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                    rank === 0 && "bg-gradient-to-br from-yellow-400 to-orange-500 text-white",
                    rank === 1 && "bg-gradient-to-br from-zinc-300 to-zinc-400 text-white",
                    rank === 2 && "bg-gradient-to-br from-amber-600 to-amber-700 text-white",
                    rank > 2 && "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                )}>
                    {rank + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <Hash size={14} className="text-orange-500 flex-shrink-0" />
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-orange-500 transition-colors">
                            {hashtag.tag.replace('#', '')}
                        </span>
                        {isBursting && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold animate-pulse">
                                <Flame size={10} /> HOT
                            </span>
                        )}
                        {isHot && !isBursting && (
                            <Zap size={14} className="text-orange-500" />
                        )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                            <BarChart2 size={12} />
                            {(hashtag.count || 0).toLocaleString()} posts
                        </span>
                        {hashtag.category && (
                            <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                                {hashtag.category}
                            </span>
                        )}
                    </div>
                </div>

                {/* Velocity indicator */}
                {showVelocity && hashtag.velocity && (
                    <div className={cn(
                        "flex items-center gap-1 text-xs font-medium",
                        hashtag.velocity > 0 ? "text-emerald-500" : "text-red-500"
                    )}>
                        {hashtag.velocity > 0 ? <ArrowUp size={14} /> : null}
                        +{hashtag.velocity}%
                    </div>
                )}

                {/* Arrow */}
                <ArrowRight size={16} className="text-zinc-300 dark:text-zinc-600 group-hover:text-orange-500 transition-colors" />
            </motion.div>
        </Link>
    );
}

// Skeleton for loading
export function TrendingCardSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="w-12 h-4" />
        </div>
    );
}

// Geographic trending section
interface GeographicTrendingProps {
    location: string;
    hashtags: TrendingHashtag[];
}

export function GeographicTrendingCard({ location, hashtags }: GeographicTrendingProps) {
    return (
        <Card className="border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-900/10 dark:to-cyan-900/10">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin size={16} className="text-blue-500" />
                    Tendances à {location}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {hashtags.filter(h => h && h.tag).slice(0, 5).map((h, i) => (
                    <Link
                        key={h.tag || i}
                        href={`/hashtag/${encodeURIComponent((h.tag || '').replace('#', ''))}`}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/50 dark:hover:bg-zinc-800/50 transition-colors group"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-400">{i + 1}</span>
                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-blue-500 transition-colors">
                                #{(h.tag || '').replace('#', '')}
                            </span>
                        </div>
                        <span className="text-xs text-zinc-500">{(h.count || 0)} posts</span>
                    </Link>
                ))}
            </CardContent>
        </Card>
    );
}

// Bursting topics section (viral content)
interface BurstingTopicsProps {
    topics: TrendingHashtag[];
}

export function BurstingTopicsSection({ topics }: BurstingTopicsProps) {
    // Filter out any topics without a valid tag
    const validTopics = topics.filter(t => t && t.tag);
    if (!validTopics.length) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-500">
                    <Flame size={18} className="text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100">En explosion</h3>
                    <p className="text-xs text-zinc-500">Croissance exceptionnelle en ce moment</p>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                {validTopics.map((topic, i) => (
                    <Link
                        key={topic.tag || i}
                        href={`/hashtag/${encodeURIComponent((topic.tag || '').replace('#', ''))}`}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="relative overflow-hidden p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 group hover:shadow-lg transition-all cursor-pointer"
                        >
                            {/* Animated background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 animate-pulse" />

                            <div className="relative">
                                <div className="flex items-center gap-2 mb-2">
                                    <Hash size={16} className="text-red-500" />
                                    <span className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-red-500 transition-colors">
                                        {(topic.tag || '').replace('#', '')}
                                    </span>
                                    <span className="flex items-center gap-1 ml-auto text-xs font-bold text-emerald-500">
                                        <ArrowUp size={12} />
                                        +{topic.velocity}%
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                    {(topic.count || 0).toLocaleString()} posts • {topic.category || "Général"}
                                </p>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

// Category filter chips
const CATEGORIES = [
    { id: "all", label: "Tous", icon: Sparkles },
    { id: "immobilier", label: "Immobilier", icon: Globe },
    { id: "tech", label: "Tech", icon: Zap },
    { id: "finance", label: "Finance", icon: BarChart2 },
    { id: "lifestyle", label: "Lifestyle", icon: Users },
];

interface CategoryFilterProps {
    selected: string;
    onChange: (category: string) => void;
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => onChange(cat.id)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                        selected === cat.id
                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    )}
                >
                    <cat.icon size={14} />
                    {cat.label}
                </button>
            ))}
        </div>
    );
}

// Main trending list component
interface TrendingListProps {
    hashtags: TrendingHashtag[];
    loading?: boolean;
    showVelocity?: boolean;
}

export function TrendingList({ hashtags, loading = false, showVelocity = false }: TrendingListProps) {
    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <TrendingCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (!hashtags.length) {
        return (
            <div className="text-center py-12 text-zinc-500">
                <TrendingUp size={48} className="mx-auto mb-4 opacity-20" />
                <p>Aucune tendance pour le moment</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {hashtags.filter(h => h && h.tag).map((hashtag, i) => (
                <TrendingCard
                    key={hashtag.tag || i}
                    hashtag={hashtag}
                    rank={i}
                    showVelocity={showVelocity}
                />
            ))}
        </div>
    );
}

