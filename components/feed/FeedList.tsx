"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PostCard } from "./PostCard";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/lib/types";
import { useInView } from "react-intersection-observer"; // We might need to install this or implement raw
import { pusherClient } from "@/lib/pusher";
import { AnimatePresence, motion } from "framer-motion";
import { FeedDiscoveryWidget } from "./FeedDiscoveryWidget";
import { CheckCircle2 } from "lucide-react";

// Simple Hook for raw intersection observer if we don't want extra deps
function useIntersectionObserver(callback: () => void) {
    const observer = useRef<IntersectionObserver | null>(null);
    const ref = useCallback((node: HTMLDivElement | null) => {
        if (observer.current) observer.current.disconnect();
        if (node) {
            observer.current = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting) {
                    callback();
                }
            });
            observer.current.observe(node);
        }
    }, [callback]);
    return ref;
}

interface FeedListProps {
    initialPosts: any[];
    userId: string;
    currentUserProfile: UserProfile;
    feedType: string;
}

export function FeedList({ initialPosts, userId, currentUserProfile, feedType }: FeedListProps) {
    const [posts, setPosts] = useState(initialPosts);
    const [cursor, setCursor] = useState<string | null>(
        initialPosts.length > 0 ? initialPosts[initialPosts.length - 1].id : null
    );
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initialPosts.length >= 10); // Assume page size 10
    const [newPostsAvailable, setNewPostsAvailable] = useState(false); // This state is now redundant with newPostsQueue

    // Real-time Queue
    const [newPostsQueue, setNewPostsQueue] = useState<any[]>([]);

    useEffect(() => {
        // Subscribe to global feed
        const channel = pusherClient.subscribe("feed-global");

        channel.bind("new-post", (post: any) => {
            // Avoid duplicates if user created it (optional check, or just ignore since author is local)
            // Ideally check authorId vs currentUserId, but we don't have currentUserId easily in this scope unless prop passed down or from session hook
            // For now, simpler: just add. 
            // If post.id exists in posts, don't add?
            setNewPostsQueue(prev => {
                if (prev.some(p => p.id === post.id)) return prev;
                return [post, ...prev];
            });
        });

        return () => {
            pusherClient.unsubscribe("feed-global");
        };
    }, []);

    const handleLoadNewPosts = () => {
        setPosts(prev => [...newPostsQueue, ...prev]);
        setNewPostsQueue([]);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Reset when feed type changes
    useEffect(() => {
        setPosts(initialPosts);
        setCursor(initialPosts.length > 0 ? initialPosts[initialPosts.length - 1].id : null);
        setHasMore(initialPosts.length >= 10);
        setNewPostsAvailable(false);
    }, [feedType, initialPosts]);

    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore || !cursor) return;
        setIsLoading(true);

        try {
            const res = await fetch(`/api/feed?type=${feedType}&cursor=${cursor}`);
            if (!res.ok) throw new Error("Failed to fetch");

            const data = await res.json();
            if (data.posts.length > 0) {
                // Filter duplicates just in case
                setPosts(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const uniqueNew = data.posts.filter((p: any) => !existingIds.has(p.id));
                    return [...prev, ...uniqueNew];
                });
                setCursor(data.nextCursor);
                if (!data.nextCursor) setHasMore(false);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [cursor, feedType, hasMore, isLoading]);

    const loadMoreRef = useIntersectionObserver(loadMore);

    // Helpers to serialize/parse
    const serializeComments = (comments: any[]): any[] => {
        if (!comments) return [];
        return comments.map(c => ({
            id: c.id, content: c.content,
            createdAt: c.createdAt, userId: c.userId, postId: c.postId,
            user: c.user, children: []
        }));
    };

    return (
        <div className="space-y-6">
            {/* New Posts Pill */}
            <AnimatePresence>
                {newPostsQueue.length > 0 && (
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        className="sticky top-20 z-30 flex justify-center mb-4 pointer-events-none"
                    >
                        <button
                            onClick={handleLoadNewPosts}
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg font-medium text-sm flex items-center gap-2 pointer-events-auto hover:scale-105 transition-transform"
                        >
                            <RefreshCw className="w-3 h-3" />
                            <span>↑ {newPostsQueue.length} nouveaux posts</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>





            {posts.map((post: any, index: number) => {
                let parsedMetadata;
                try { parsedMetadata = post.metadata ? JSON.parse(post.metadata) : undefined; } catch { }

                return (
                    <div key={post.id}>
                        <PostCard
                            id={post.id}
                            authorId={post.authorId}
                            currentUser={currentUserProfile}
                            author={{
                                name: post.author.name || "Utilisateur",
                                role: post.author.role,
                                avatar: post.author.avatar || "/avatars/01.png",
                                badge: post.author.badges?.[0]?.badge || null
                            }}
                            published={new Date(post.createdAt).toLocaleDateString()}
                            content={post.content}
                            image={post.image}
                            rankingScore={post.score}
                            type={post.type}
                            metadata={parsedMetadata}
                            isSaved={post.savedBy && post.savedBy.length > 0}
                            initialComments={serializeComments(post.comments)}
                            userInteraction={post.interactions.find((i: any) => i.userId === userId) || null}
                            metrics={{
                                likes: post.interactions.filter((i: any) => i.type === "REACTION" || i.type === "LIKE").length,
                                comments: post.comments.length,
                                shares: 0
                            }}
                        />
                        {/* Inject Discovery Widget after 5th post */}
                        {index === 4 && <FeedDiscoveryWidget />}
                    </div>
                );
            })}

            {hasMore && (
                <div ref={loadMoreRef} className="py-8 flex justify-center">
                    {isLoading && <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />}
                </div>
            )}

            {!hasMore && posts.length > 0 && (
                <div className="flex justify-center py-8">
                    <div className="glass px-10 py-8 rounded-2xl flex flex-col items-center text-center space-y-4 max-w-sm mx-4">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/50 dark:to-emerald-900/20 flex items-center justify-center shadow-inner">
                            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 drop-shadow-sm" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Vous êtes à jour !</h3>
                            <p className="text-sm text-muted-foreground mt-1">Vous avez vu tous les nouveaux posts.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
