"use client";

import { useState } from "react";
import { PostCard } from "@/components/feed/PostCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageSquare, Image as ImageIcon, FileText, Pin, Grid, BarChart3, TrendingUp, Filter } from "lucide-react";
import { DEMO_USER_ID } from "@/lib/constants";

interface ProfileActivityProps {
    user: any;
    currentUser: any;
    posts: any[];
}

export function ProfileActivity({ user, currentUser, posts }: ProfileActivityProps) {
    const [filter, setFilter] = useState<"ALL" | "POSTS" | "COMMENTS" | "MEDIA">("ALL");
    const [visibleCount, setVisibleCount] = useState(3); // Default show 3

    // Reset visible count when filter changes
    const onFilterChange = (newFilter: "ALL" | "POSTS" | "COMMENTS" | "MEDIA") => {
        setFilter(newFilter);
        setVisibleCount(3);
    };

    // 1. Calculate Stats
    const stats = {
        totalPosts: posts.length,
        totalLikes: posts.reduce((acc, post) => acc + (post.interactions?.filter((i: any) => i.type === "LIKE" || i.type === "REACTION").length || 0), 0),
        totalComments: posts.reduce((acc, post) => acc + (post.comments?.length || 0), 0),
        lastActivity: posts.length > 0 ? new Date(posts[0].createdAt).toLocaleDateString() : "N/A"
    };

    // 2. Filter Logic
    const filteredPosts = posts.filter(post => {
        if (post.id === user.pinnedPost?.id) return false; // Handle pinned separately

        if (filter === "ALL") return true;
        if (filter === "POSTS") return !post.image && !post.video; // Text only
        if (filter === "MEDIA") return !!post.image || !!post.video; // Media only
        // Comments filter logic placeholder
        return true;
    });

    const displayedPosts = filteredPosts.slice(0, visibleCount);

    // Helper for comments
    function serializeComments(comments: any[]): any[] {
        if (!comments) return [];
        return comments.map(c => ({
            id: c.id,
            content: c.content,
            createdAt: c.createdAt,
            userId: c.userId,
            postId: c.postId,
            user: {
                id: c.user.id,
                name: c.user.name,
                avatar: c.user.avatar,
                role: c.user.role
            },
            children: []
        }));
    }

    return (
        <div className="space-y-6">

            {/* DASHBOARD / STATS */}
            <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-zinc-500" />
                        Tableau de bord
                    </h3>

                    <Button
                        size="sm"
                        variant="default"
                        className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                        onClick={() => window.location.href = "/?action=create_post"}
                    >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Créer un post
                    </Button>
                </div>
                {/* ... Stats Grid ... */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
                        <div className="text-xs text-zinc-500 mb-1">Publications</div>
                        <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{stats.totalPosts}</div>
                    </div>
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
                        <div className="text-xs text-zinc-500 mb-1">Likes reçus</div>
                        <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{stats.totalLikes}</div>
                    </div>
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
                        <div className="text-xs text-zinc-500 mb-1">Commentaires</div>
                        <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{stats.totalComments}</div>
                    </div>
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
                        <div className="text-xs text-zinc-500 mb-1">Dernière activité</div>
                        <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1">{stats.lastActivity}</div>
                    </div>
                </div>
            </div>

            {/* FILTERS */}
            <div className="flex flex-wrap gap-2 items-center">
                <Button
                    variant={filter === "ALL" ? "default" : "outline"}
                    size="sm"
                    className={cn("rounded-full h-8", filter === "ALL" && "bg-orange-600 hover:bg-orange-700 text-white border-transparent")}
                    onClick={() => onFilterChange("ALL")}
                >
                    Tout
                </Button>
                <Button
                    variant={filter === "POSTS" ? "default" : "outline"}
                    size="sm"
                    className={cn("rounded-full h-8 gap-2", filter === "POSTS" && "bg-orange-600 hover:bg-orange-700 text-white border-transparent")}
                    onClick={() => onFilterChange("POSTS")}
                >
                    <FileText className="w-3.5 h-3.5" /> Publications
                </Button>
                <Button
                    variant={filter === "MEDIA" ? "default" : "outline"}
                    size="sm"
                    className={cn("rounded-full h-8 gap-2", filter === "MEDIA" && "bg-orange-600 hover:bg-orange-700 text-white border-transparent")}
                    onClick={() => onFilterChange("MEDIA")}
                >
                    <ImageIcon className="w-3.5 h-3.5" /> Images & Vidéos
                </Button>
            </div>

            {/* PINNED POST */}
            {user.pinnedPost && filter === "ALL" && (
                <div className="bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    <div className="flex items-center gap-2 text-xs font-bold text-primary mb-3 uppercase tracking-wider pl-2">
                        <Pin className="h-3.5 w-3.5 fill-current" /> Publication Épinglée
                    </div>
                    <PostCard
                        id={user.pinnedPost.id}
                        authorId={user.pinnedPost.authorId}
                        currentUser={currentUser ? {
                            id: currentUser.id,
                            name: currentUser.name || "User",
                            avatar: currentUser.avatar || "/avatars/default.svg",
                            role: currentUser.role as "USER" | "ADMIN" | "PRO"
                        } : undefined}
                        author={{
                            name: user.pinnedPost.author.name || "Utilisateur",
                            role: user.pinnedPost.author.role,
                            avatar: user.pinnedPost.author.avatar || "/avatars/01.png",
                            badge: user.pinnedPost.author.badges?.[0]?.badge || null
                        }}
                        published={new Date(user.pinnedPost.createdAt).toLocaleDateString()}
                        content={user.pinnedPost.content}
                        image={user.pinnedPost.image || undefined}
                        rankingScore={0}
                        type={user.pinnedPost.type}
                        metadata={(function () {
                            try {
                                return user.pinnedPost.metadata ? JSON.parse(user.pinnedPost.metadata) : undefined;
                            } catch (e) { return undefined; }
                        })()}
                        initialComments={serializeComments(user.pinnedPost.comments)}
                        userInteraction={user.pinnedPost.interactions.find((i: any) => i.userId === DEMO_USER_ID) || null}
                        metrics={{
                            likes: user.pinnedPost.interactions.filter((i: any) => i.type === "REACTION" || i.type === "LIKE").length,
                            comments: user.pinnedPost.comments.length,
                            shares: 0
                        }}
                        isPinned={true}
                    />
                </div>
            )}

            {/* FEED */}
            <div className="space-y-4">
                {displayedPosts.length > 0 ? (
                    <>
                        {displayedPosts.map((post) => {
                            const parsedMetadata = (function () {
                                try {
                                    return post.metadata ? JSON.parse(post.metadata) : undefined;
                                } catch (e) { return undefined; }
                            })();
                            return (
                                <PostCard
                                    key={post.id}
                                    id={post.id}
                                    authorId={post.authorId}
                                    currentUser={currentUser ? {
                                        id: currentUser.id,
                                        name: currentUser.name || "User",
                                        avatar: currentUser.avatar || "/avatars/default.svg",
                                        role: currentUser.role as "USER" | "ADMIN" | "PRO"
                                    } : undefined}
                                    author={{
                                        name: post.author.name || "Utilisateur",
                                        role: post.author.role,
                                        avatar: post.author.avatar || "/avatars/01.png",
                                        badge: post.author.badges?.[0]?.badge || null
                                    }}
                                    published={new Date(post.createdAt).toLocaleDateString()}
                                    content={post.content}
                                    image={post.image || undefined}
                                    rankingScore={0}
                                    type={post.type}
                                    metadata={parsedMetadata}
                                    initialComments={serializeComments(post.comments)}
                                    userInteraction={post.interactions.find((i: any) => i.userId === DEMO_USER_ID) || null}
                                    metrics={{
                                        likes: post.interactions.filter((i: any) => i.type === "REACTION" || i.type === "LIKE").length,
                                        comments: post.comments.length,
                                        shares: 0
                                    }}
                                />
                            )
                        })}

                        {/* SHOW MORE BUTTON */}
                        {visibleCount < filteredPosts.length && (
                            <div className="pt-4 flex justify-center">
                                <Button
                                    variant="ghost"
                                    className="w-full md:w-auto text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                                    onClick={() => setVisibleCount(prev => prev + 10)}
                                >
                                    Voir tout ({filteredPosts.length - visibleCount} restants)
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 mx-auto flex items-center justify-center mb-3">
                            <Filter className="w-6 h-6 text-zinc-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Aucune activité</h3>
                        <p className="text-xs text-zinc-500 max-w-[200px] mx-auto mt-1">
                            Aucun contenu ne correspond à ce filtre pour le moment.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
