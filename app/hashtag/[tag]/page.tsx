
import { Header } from "@/components/layout/Header";
import { SidebarLeft } from "@/components/layout/SidebarLeft";
import { SidebarRight } from "@/components/layout/SidebarRight";
import { PostCard } from "@/components/feed/PostCard";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Hash } from "lucide-react";
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

export default async function HashtagPage({ params }: { params: Promise<{ tag: string }> }) {
    const { tag } = await params;
    const session = await auth();
    const currentUserId = session?.user?.id || DEMO_USER_ID;

    // Decode tag in case of special chars 
    const decodedTag = decodeURIComponent(tag);

    const hashtag = await prisma.hashtag.findUnique({
        where: { tag: decodedTag },
        include: {
            posts: {
                include: {
                    author: true,
                    comments: {
                        include: { user: true },
                        orderBy: { createdAt: "desc" },
                        take: 3
                    },
                    interactions: true
                },
                orderBy: { createdAt: "desc" }
            },
            _count: {
                select: { posts: true }
            }
        }
    });

    if (!hashtag) {
        // Tag doesn't exist in DB yet
        return (
            <div className="min-h-screen bg-background font-sans">
                <Header />
                <div className="container max-w-4xl mx-auto py-8">
                    <div className="text-center py-12">
                        <div className="bg-muted p-4 rounded-full w-fit mx-auto mb-4">
                            <Hash className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">#{decodedTag}</h1>
                        <p className="text-muted-foreground">Ce hashtag n'existe pas encore. Soyez le premier à l'utiliser !</p>
                    </div>
                </div>
            </div>
        );
    }

    const currentUser = await prisma.user.findUnique({ where: { id: currentUserId } });

    return (
        <div className="min-h-screen bg-background font-sans">
            <Header />
            <div className="container grid flex-1 gap-6 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr_320px] lg:gap-10 mt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <aside className="hidden w-[200px] flex-col md:flex lg:w-[240px]">
                    <SidebarLeft className="sticky top-20 w-full" />
                </aside>

                <main className="flex w-full flex-1 flex-col">
                    <div className="mb-8 border-b pb-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-4 rounded-xl">
                                <Hash className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">#{hashtag.tag}</h1>
                                <p className="text-muted-foreground font-medium">{hashtag._count.posts} publications</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {hashtag.posts.map((post) => {
                            const parsedMetadata = post.metadata ? JSON.parse(post.metadata) : undefined;
                            return (
                                <PostCard
                                    key={post.id}
                                    id={post.id}
                                    authorId={post.authorId}
                                    currentUser={currentUser ? {
                                        id: currentUser.id,
                                        name: currentUser.name || "User",
                                        avatar: currentUser.avatar || "/avatars/default.png",
                                        role: currentUser.role as "USER" | "ADMIN" | "PRO"
                                    } : undefined}
                                    author={{
                                        name: post.author.name || "Utilisateur",
                                        role: post.author.role,
                                        avatar: post.author.avatar || "/avatars/01.png"
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
                    </div>
                </main>

                <aside className="hidden w-[320px] flex-col lg:flex">
                    <SidebarRight />
                </aside>
            </div>
        </div>
    );
}
