"use client";

import { Search, MoreHorizontal, TrendingUp, Flame, MapPin, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { followUser, unfollowUser } from "@/lib/follow-actions";

interface TrendingHashtag {
    id: string;
    tag: string;
    _count?: { posts: number };
    velocity?: number;
}

interface SuggestedUser {
    id: string;
    name: string | null;
    avatar: string | null;
    role: string;
    reason?: string;
    _count?: { followedBy: number };
}

export function SidebarRight() {
    const [trendingHashtags, setTrendingHashtags] = useState<TrendingHashtag[]>([]);
    const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
    const [burstingHashtags, setBurstingHashtags] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        async function fetchData() {
            try {
                const [trendingRes, suggestionsRes, burstingRes] = await Promise.all([
                    fetch("/api/discovery/trending"),
                    fetch("/api/discovery/suggestions"),
                    fetch("/api/discovery/bursting")
                ]);

                if (trendingRes.ok) {
                    const data = await trendingRes.json();
                    setTrendingHashtags(data.hashtags || []);
                }

                if (suggestionsRes.ok) {
                    const data = await suggestionsRes.json();
                    setSuggestedUsers(data.users || []);
                }

                if (burstingRes.ok) {
                    const data = await burstingRes.json();
                    setBurstingHashtags(data.bursting || []);
                }
            } catch (error) {
                console.error("[SidebarRight] Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const handleFollow = async (userId: string) => {
        try {
            await followUser(userId);
            setFollowingIds(prev => new Set([...prev, userId]));
        } catch (error) {
            console.error("Follow error:", error);
        }
    };

    const handleUnfollow = async (userId: string) => {
        try {
            await unfollowUser(userId);
            setFollowingIds(prev => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
        } catch (error) {
            console.error("Unfollow error:", error);
        }
    };

    return (
        <div className="space-y-6 py-4 pr-4 h-full overflow-y-auto scrollbar-hide">

            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-800 transition-colors" />
                <input
                    type="text"
                    placeholder="Rechercher sur Transpareo..."
                    className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 transition-all placeholder:text-zinc-500"
                />
            </div>

            {/* Premium Subscribe (Glass) */}
            <div className="relative overflow-hidden bg-black dark:bg-zinc-900 rounded-2xl p-5 text-white shadow-xl shadow-zinc-900/10 group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-purple-500/20 blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:opacity-75 transition-opacity" />
                <h3 className="relative z-10 font-bold text-lg mb-1">Passez Pro</h3>
                <p className="relative z-10 text-zinc-300 text-xs mb-4 leading-relaxed max-w-[90%]">
                    Débloquez les analytics, le badge vérifié et les outils d'investissement avancés.
                </p>
                <Link href="/analytics" className="relative z-10 block w-full py-2.5 bg-white text-black rounded-xl text-xs font-bold hover:bg-zinc-100 transition-colors text-center">
                    Voir mes Analytics
                </Link>
            </div>

            {/* Bursting Hashtags - En ce moment 🔥 */}
            {burstingHashtags.length > 0 && (
                <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-4 border border-orange-200/60 dark:border-orange-800/60 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">En ce moment</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {burstingHashtags.slice(0, 5).map((tag, i) => (
                            <Link
                                key={i}
                                href={`/hashtag/${tag.name}`}
                                className="bg-white/80 dark:bg-zinc-800/80 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-orange-100 transition-colors flex items-center gap-1"
                            >
                                <span className="text-orange-500">#</span>
                                {tag.name}
                                <span className="text-[10px] text-orange-500 font-bold">↑{Math.round(tag.velocity)}x</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Trending Section - REAL DATA */}
            <div className="bg-white/50 dark:bg-zinc-900/30 backdrop-blur-xl rounded-2xl p-4 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Tendances</h3>
                </div>
                <div className="space-y-3">
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse">
                                    <div className="h-3 bg-zinc-200 rounded w-1/3 mb-1"></div>
                                    <div className="h-4 bg-zinc-200 rounded w-2/3 mb-1"></div>
                                    <div className="h-3 bg-zinc-200 rounded w-1/4"></div>
                                </div>
                            ))}
                        </div>
                    ) : trendingHashtags.length > 0 ? (
                        trendingHashtags.slice(0, 4).map((trend, i) => (
                            <TrendItem
                                key={trend.id || i}
                                category="Immobilier • France"
                                tag={`#${trend.tag}`}
                                posts={`${trend._count?.posts || 0}`}
                                href={`/hashtag/${trend.tag}`}
                            />
                        ))
                    ) : (
                        <p className="text-xs text-zinc-500">Aucune tendance pour le moment</p>
                    )}
                </div>
            </div>

            {/* Who to follow - REAL DATA */}
            <div className="bg-white/50 dark:bg-zinc-900/30 backdrop-blur-xl rounded-2xl p-4 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-500" />
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Suggestions</h3>
                    </div>
                </div>
                <div className="space-y-4">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-2 animate-pulse">
                                    <div className="w-9 h-9 bg-zinc-200 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-zinc-200 rounded w-2/3 mb-1"></div>
                                        <div className="h-3 bg-zinc-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : suggestedUsers.length > 0 ? (
                        suggestedUsers.slice(0, 3).map((user) => (
                            <SuggestionItem
                                key={user.id}
                                userId={user.id}
                                name={user.name || "Utilisateur"}
                                reason={user.reason}
                                src={user.avatar || "/avatars/default.svg"}
                                followersCount={user._count?.followedBy || 0}
                                isFollowing={followingIds.has(user.id)}
                                onFollow={() => handleFollow(user.id)}
                                onUnfollow={() => handleUnfollow(user.id)}
                            />
                        ))
                    ) : (
                        <p className="text-xs text-zinc-500">Aucune suggestion pour le moment</p>
                    )}
                </div>
            </div>

            {/* Leaderboard - Quick Access */}
            <Link href="/leaderboard" className="block">
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-2xl p-4 border border-yellow-200/60 dark:border-yellow-800/60 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/25">
                            <span className="text-lg">🏆</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 transition-colors">Classement</h3>
                            <p className="text-xs text-zinc-500">Top contributeurs</p>
                        </div>
                        <span className="text-zinc-400 group-hover:text-amber-500 transition-colors">→</span>
                    </div>
                </div>
            </Link>

            {/* Footer Links (Compact) */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 px-2">
                {["Conditions", "Confidentialité", "Cookies", "Accessibilité", "Plus"].map((link) => (
                    <a key={link} href="#" className="text-[11px] text-zinc-400 hover:underline decoration-zinc-300">
                        {link}
                    </a>
                ))}
                <span className="text-[11px] text-zinc-400">© 2025 Transpareo</span>
            </div>
        </div>
    );
}

function TrendItem({ category, tag, posts, href }: { category: string, tag: string, posts: string, href: string }) {
    return (
        <Link href={href} className="block cursor-pointer group">
            <div className="flex justify-between items-start">
                <span className="text-[10px] text-zinc-500 font-medium">{category}</span>
                <button className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-600 transition-opacity">
                    <MoreHorizontal size={14} />
                </button>
            </div>
            <p className="font-bold text-sm text-zinc-800 dark:text-zinc-200 mt-0.5 group-hover:text-orange-600 transition-colors">{tag}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">{posts} posts</p>
        </Link>
    );
}

function SuggestionItem({
    userId,
    name,
    reason,
    src,
    followersCount,
    isFollowing,
    onFollow,
    onUnfollow
}: {
    userId: string;
    name: string;
    reason?: string;
    src: string;
    followersCount: number;
    isFollowing: boolean;
    onFollow: () => void;
    onUnfollow: () => void;
}) {
    return (
        <div className="flex items-center justify-between group">
            <Link href={`/profile/${userId}`} className="flex items-center gap-2.5 overflow-hidden flex-1 min-w-0">
                <Avatar className="w-9 h-9 border border-zinc-200 dark:border-zinc-700 shrink-0">
                    <AvatarImage src={src} />
                    <AvatarFallback>{name[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{name}</p>
                    <p className="text-[10px] text-zinc-500 truncate">
                        {reason || `${followersCount} abonnés`}
                    </p>
                </div>
            </Link>
            <Button
                size="sm"
                variant={isFollowing ? "outline" : "default"}
                className={`h-7 px-3 text-xs rounded-full shrink-0 ${isFollowing
                    ? "border-zinc-300 hover:border-red-300 bg-white hover:bg-red-50 text-zinc-700 hover:text-red-600"
                    : "bg-zinc-900 hover:bg-zinc-800 text-white"
                    }`}
                onClick={isFollowing ? onUnfollow : onFollow}
            >
                {isFollowing ? "Suivi" : "Suivre"}
            </Button>
        </div>
    );
}

