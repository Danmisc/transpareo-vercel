
import { Header } from "@/components/layout/Header";
import { SidebarLeft } from "@/components/layout/SidebarLeft";
import { SidebarRight } from "@/components/layout/SidebarRight";
import { PostCard } from "@/components/feed/PostCard";
import { VideoFeedProvider } from "@/components/feed/VideoFeedProvider";
import { prisma } from "@/lib/prisma";
import { Compass, Hash, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Leaderboard } from "@/components/gamification/Leaderboard";
import { MiniBadge } from "@/components/gamification/MiniBadge";
import { auth } from "@/lib/auth";
import { DEMO_USER_ID } from "@/lib/constants";

// Helper for interactions
function serializeComments(comments: any[]): any[] {
    if (!comments) return [];
    return comments.map(c => ({
        id: c.id,
        content: c.content,
        createdAt: new Date(c.createdAt).toISOString(),
        userId: c.userId,
        postId: c.postId,
        user: {
            id: c.user.id,
            name: c.user.name,
            avatar: c.user.avatar,
            role: c.user.role
        },
        children: [] // Simplified for feed
    }));
}

export default async function ExplorePage() {
    const session = await auth();
    const currentUserId = session?.user?.id || DEMO_USER_ID;

    // 1. Trending Hashtags (Top 5 by usage)
    const trendingHashtags = await prisma.hashtag.findMany({
        orderBy: {
            posts: { _count: 'desc' }
        },
        take: 5,
        include: { _count: { select: { posts: true } } }
    });

    // 2. Trending Posts (Most interactions in last 48h - SIMULATED by just taking most recent with interactions for MVP)
    // In a real app, we'd query Interactions table or aggregated scores.
    const trendingPosts = await prisma.post.findMany({
        where: {
            published: true,
            // Simple heuristic: Posts that have at least one interaction or comment
            OR: [
                { interactions: { some: {} } },
                { comments: { some: {} } }
            ]
        },
        orderBy: { interactions: { _count: 'desc' } },
        take: 10,
        include: {
            author: {
                include: {
                    badges: {
                        take: 1,
                        include: { badge: true }
                    }
                }
            },
            comments: {
                include: { user: true },
                orderBy: { createdAt: "desc" },
                take: 3
            },
            interactions: true
        }
    });

    const currentUser = await prisma.user.findUnique({ where: { id: currentUserId } });

    return (
        <VideoFeedProvider>
            <div className="font-sans text-zinc-900 pb-20 md:pb-0">
                <div className="hidden md:block">
                    <Header />
                </div>

                {/* Mobile Header */}
                <div className="md:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-4 h-14 flex items-center gap-3">
                    <Compass className="h-5 w-5 text-orange-600" />
                    <span className="font-bold text-lg tracking-tight">Explorer</span>
                </div>

                <div className="container max-w-full xl:max-w-[1800px] mx-auto px-0 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr_400px] gap-6 lg:gap-12 pt-0 md:pt-6">

                        {/* Left Sidebar */}
                        <aside className="hidden md:block sticky top-[5.5rem] h-[calc(100vh-6rem)] overflow-y-auto scrollbar-none pb-10">
                            <SidebarLeft />
                        </aside>

                        {/* Main Content */}
                        <main className="flex flex-col gap-6 w-full max-w-2xl mx-auto md:max-w-none md:mx-0 px-4 md:px-0">

                            {/* Trending Hashtags - Glass Cards */}
                            {trendingHashtags.length > 0 && (
                                <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm">
                                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-orange-500" />
                                        Tendances
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {trendingHashtags.map(term => (
                                            <Link key={term.id} href={`/hashtag/${term.tag}`} className="group bg-white hover:bg-orange-50 border border-zinc-200 hover:border-orange-200 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 hover:shadow-md">
                                                <Hash className="h-3.5 w-3.5 text-zinc-400 group-hover:text-orange-500" />
                                                {term.tag}
                                                <span className="text-[10px] text-zinc-500 bg-zinc-100 group-hover:bg-orange-100 px-1.5 py-0.5 rounded-full">{term._count.posts}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Feed */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold tracking-tight">Populaire en ce moment</h2>
                                </div>
                                <div className="space-y-6">
                                    {trendingPosts.map((post) => {
                                        const parsedMetadata = post.metadata ? JSON.parse(post.metadata) : undefined;
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
                                                userInteraction={post.interactions.find((i: any) => i.userId === currentUserId) || null}
                                                metrics={{
                                                    likes: post.interactions.filter((i: any) => i.type === "REACTION" || i.type === "LIKE").length,
                                                    comments: post.comments.length,
                                                    shares: 0
                                                }}
                                            />
                                        )
                                    })}
                                    {trendingPosts.length === 0 && (
                                        <div className="text-center py-12 bg-white/40 rounded-3xl border border-white/40">
                                            <p className="text-muted-foreground">Aucune tendance pour le moment.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </main>

                        {/* Right Sidebar */}
                        <aside className="hidden lg:flex flex-col gap-6 sticky top-[5.5rem] h-[calc(100vh-6rem)] overflow-y-auto scrollbar-none pb-10">
                            <Leaderboard />
                            <SidebarRight />
                        </aside>
                    </div>
                </div>
            </div>
        </VideoFeedProvider>
    );
}


