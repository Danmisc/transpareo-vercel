
import { Header } from "@/components/layout/Header";
import { SidebarLeft } from "@/components/layout/SidebarLeft";
import { SidebarRight } from "@/components/layout/SidebarRight";
import { getCommunity } from "@/lib/community-actions";
import { JoinButton } from "@/components/community/JoinButton";
import { PostCard } from "@/components/feed/PostCard";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Users, Lock, Globe, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const community = await prisma.community.findUnique({
        where: { slug },
        select: { name: true, description: true }
    });

    if (!community) return { title: "Communauté introuvable" };

    return {
        title: community.name,
        description: community.description || `Rejoignez la communauté ${community.name} sur Transpareo.`
    };
}

export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const session = await auth();
    const userId = session?.user?.id || DEMO_USER_ID;

    const community = await getCommunity(slug, userId);

    if (!community) {
        notFound();
    }

    const posts = await prisma.post.findMany({
        where: { communityId: community.id },
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
    });

    const isMember = !!community.membership;
    const isAdmin = community.membership?.role === "ADMIN";

    // We need current user data for PostCard
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });

    return (
        <div className="min-h-screen bg-background font-sans">
            <Header />
            <div className="container grid flex-1 gap-6 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr_320px] lg:gap-10 mt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <aside className="hidden w-[200px] flex-col md:flex lg:w-[240px]">
                    <SidebarLeft className="sticky top-20 w-full" />
                </aside>

                <main className="flex w-full flex-1 flex-col">
                    {/* Cover & Header */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow mb-6 overflow-hidden">
                        <div className="h-48 bg-gradient-to-r from-primary/20 to-secondary/20 w-full" />
                        <div className="p-6 relative">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold flex items-center gap-2">
                                        {community.name}
                                        {community.type === "PRIVATE" && <Lock className="h-5 w-5 text-muted-foreground" />}
                                    </h1>
                                    <p className="text-muted-foreground mt-2 max-w-2xl">{community.description}</p>
                                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Users className="h-4 w-4" /> {community._count.members} membres
                                        </span>
                                        <span className="flex items-center gap-1">
                                            {community.type === "PUBLIC" ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                            {community.type === "PUBLIC" ? "Public" : "Privé"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isAdmin && (
                                        <Button variant="outline" size="sm">
                                            <Shield className="h-4 w-4 mr-2" />
                                            Admin
                                        </Button>
                                    )}
                                    {userId && <JoinButton communityId={community.id} userId={userId} isMember={isMember} />}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feed */}
                    <div className="space-y-6">
                        {posts.length > 0 ? posts.map((post) => {
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
                                        avatar: post.author.avatar || "/avatars/01.png"
                                    }}
                                    published={new Date(post.createdAt).toLocaleDateString()}
                                    content={post.content}
                                    image={post.image || undefined}
                                    rankingScore={0}
                                    type={post.type}
                                    metadata={parsedMetadata}
                                    initialComments={serializeComments(post.comments)}
                                    userInteraction={post.interactions.find((i: any) => i.userId === userId) || null}
                                    metrics={{
                                        likes: post.interactions.filter((i: any) => i.type === "REACTION" || i.type === "LIKE").length,
                                        comments: post.comments.length,
                                        shares: 0
                                    }}
                                />
                            )
                        }) : (
                            <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20">
                                <p>Aucune publication pour le moment.</p>
                                {isMember && <p className="text-sm mt-2">Soyez le premier à publier !</p>}
                            </div>
                        )}
                    </div>
                </main>

                <aside className="hidden w-[320px] flex-col lg:flex">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">À propos</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-4">
                            <div>
                                <h4 className="font-semibold mb-1">Règles</h4>
                                <p className="text-muted-foreground">Soyez respectueux et courtois.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Créé le</h4>
                                <p className="text-muted-foreground">{new Date(community.createdAt).toLocaleDateString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    );
}
