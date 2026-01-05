import { Header } from "@/components/layout/Header";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { PostCard } from "@/components/feed/PostCard";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { prisma } from "@/lib/prisma";
import { DEMO_USER_ID } from "@/lib/constants";
import { auth } from "@/lib/auth"; // Import auth
import { notFound } from "next/navigation";
import { Grid, List, Image, MapPin, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { MediaPreview } from "@/components/profile/MediaPreview";
import { MutualConnections } from "@/components/profile/MutualConnections";
import { Pin } from "lucide-react";
import { VideoFeedProvider } from "@/components/feed/VideoFeedProvider";

// Helper for interactions
// Using same helper as feed but locally scoped or imported if shared
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
        children: []
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await prisma.user.findUnique({
        where: { id },
        select: { name: true, bio: true }
    });

    if (!user) return { title: "Profil introuvable" };

    return {
        title: user.name || "Profil Utilisateur",
        description: user.bio || `Découvrez le profil de ${user.name} sur Transpareo.`
    };
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id: userId } = await params;
    const session = await auth();
    const currentUserId = session?.user?.id || DEMO_USER_ID;
    const currentUser = await prisma.user.findUnique({ where: { id: currentUserId } });

    const profileUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            _count: {
                select: {
                    posts: true,
                    followedBy: true,
                    following: true
                }
            },
            badges: {
                include: { badge: true }
            },
            pinnedPost: {
                include: {
                    author: { include: { badges: { include: { badge: true } } } },
                    comments: { include: { user: true } },
                    interactions: true
                }
            }
        }
    });

    if (!profileUser) return notFound();

    // Fetch Mutuals (Users I follow who follow this profile)
    let mutualConnections: any[] = [];
    if (currentUser && currentUser.id !== userId) {
        mutualConnections = await prisma.user.findMany({
            where: {
                followedBy: { some: { followerId: currentUser.id } },
                following: { some: { followingId: userId } }
            },
            take: 5,
            select: { id: true, name: true, avatar: true }
        });
    }

    const user: any = profileUser;

    // Fetch Posts
    const posts = await prisma.post.findMany({
        where: { authorId: userId },
        include: {
            author: {
                include: {
                    badges: {
                        take: 1,
                        orderBy: { awardedAt: 'desc' },
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
        },
        orderBy: { createdAt: "desc" }
    });

    // Fetch Relationship Status
    let relationshipStatus = null;
    if (currentUser) {
        // Dynamic import to avoid circular dep if any, or just import at top if clean
        const { getRelationshipStatus } = await import("@/lib/follow-actions");
        relationshipStatus = await getRelationshipStatus(currentUser.id, userId);
    }

    const userProfile = {
        id: profileUser.id,
        name: profileUser.name || "Utilisateur",
        email: profileUser.email,
        avatar: profileUser.avatar || "/avatars/default.svg",
        role: profileUser.role as "USER" | "ADMIN" | "PRO",
        bio: profileUser.bio || undefined,
        location: profileUser.location || undefined,
        website: profileUser.website || undefined,
        coverImage: profileUser.coverImage || undefined,
        joinedAt: new Date(profileUser.createdAt).getFullYear().toString(),
        stats: {
            followers: profileUser._count.followedBy,
            following: profileUser._count.following,
            posts: profileUser._count.posts
        },
        reputation: profileUser.reputation,
        badges: profileUser.badges,
        isFollowing: relationshipStatus?.isFollowing || false,
        relationship: relationshipStatus,
        links: (profileUser as any).links,
        lastActive: (profileUser as any).lastActive
    };

    const isCurrentUser = userId === currentUserId;

    return (
        <VideoFeedProvider>
            <div className="min-h-screen bg-background font-sans">
                <Header />

                <main className="container max-w-5xl mx-auto px-4 py-8">
                    <div className="mb-4">
                        <Link href="/" className={cn(buttonVariants({ variant: "ghost" }), "pl-0 hover:bg-transparent hover:underline")}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour à l'accueil
                        </Link>
                    </div>

                    <ProfileHeader
                        user={userProfile}
                        isCurrentUser={isCurrentUser}
                    />

                    <ProfileTabs>
                        <TabsContent value="posts" className="mt-6">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                {/* Left Sidebar: Info */}
                                <div className="hidden lg:block col-span-1 space-y-6">
                                    <ProfileInfo user={userProfile} isCurrentUser={isCurrentUser} />
                                    <MediaPreview mediaItems={posts.filter(p => p.image).map(p => ({ id: p.id, url: p.image!, type: "IMAGE" }))} />
                                    <MutualConnections connections={mutualConnections} />
                                </div>

                                {/* Main Feed */}
                                <div className="col-span-1 lg:col-span-3 space-y-6">
                                    {/* Mobile Info (Visible only on small screens) */}
                                    <div className="block lg:hidden mb-6">
                                        <ProfileInfo user={userProfile} isCurrentUser={isCurrentUser} />
                                        <div className="mt-4">
                                            <MediaPreview mediaItems={posts.filter(p => p.image).map(p => ({ id: p.id, url: p.image!, type: "IMAGE" }))} />
                                        </div>
                                        <div className="mt-4">
                                            <MutualConnections connections={mutualConnections} />
                                        </div>
                                    </div>

                                    {/* Pinned Post */}
                                    {user.pinnedPost && (
                                        <div className="border-b-4 border-primary/10 pb-6 mb-6">
                                            <div className="flex items-center gap-2 text-xs font-bold text-primary mb-2 uppercase tracking-wider">
                                                <Pin className="h-3 w-3 fill-current" /> Publication Épinglée
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
                                                metadata={user.pinnedPost.metadata ? JSON.parse(user.pinnedPost.metadata) : undefined}
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

                                    {posts.length > 0 ? (
                                        <div className="space-y-6">
                                            {posts.filter(p => p.id !== user.pinnedPost?.id).map((post) => { // Exclude pinned if regular feed
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
                                                        userInteraction={post.interactions.find((i: any) => i.userId === DEMO_USER_ID) || null}
                                                        metrics={{
                                                            likes: post.interactions.filter((i: any) => i.type === "REACTION" || i.type === "LIKE").length,
                                                            comments: post.comments.length,
                                                            shares: 0
                                                        }}
                                                    />
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                                            Aucune publication pour le moment.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="media" className="mt-6">
                            <div className="grid grid-cols-3 gap-1">
                                {/* Filter posts with media */}
                                {posts.filter(p => p.image).map(p => (
                                    <div key={p.id} className="aspect-square bg-muted relative group cursor-pointer overflow-hidden">
                                        <img src={p.image!} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    </div>
                                ))}
                                {posts.filter(p => p.image).length === 0 && (
                                    <div className="col-span-full py-12 text-center text-muted-foreground">
                                        Aucun média.
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </ProfileTabs>
                </main>
            </div>
        </VideoFeedProvider>
    );
}
