import { getCommunity } from "@/lib/community-actions";
import { PostCard } from "@/components/feed/PostCard";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DEMO_USER_ID } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import { CommunityTabs, CommunityTabContent } from "@/components/community/CommunityTabs";
import { CommunityInfoSidebar } from "@/components/community/CommunityInfoSidebar";
import { VideoFeedProvider } from "@/components/feed/VideoFeedProvider";
import { CommunityPinnedSection } from "@/components/community/CommunityPinnedSection";
import { CommunityFeedControls } from "@/components/community/CommunityFeedControls";
import { CreatePostEnhanced } from "@/components/feed/CreatePostEnhanced";
import { CommunityResourcesTab } from "@/components/community/CommunityResourcesTab";
import { CommunityAboutTab } from "@/components/community/CommunityAboutTab";
import { CommunityMembersTab } from "@/components/community/CommunityMembersTab";
import { CommunityEventsTab } from "@/components/community/CommunityEventsTab";
import { CommunityMediaTab } from "@/components/community/CommunityMediaTab";
import { CommunityAdminTab } from "@/components/community/CommunityAdminTab";



// Mock Resources Data
const resources = [
    {
        id: "res1",
        title: "Guide de démarrage 2026",
        description: "Tout ce que vous devez savoir pour bien débuter dans la communauté.",
        type: "PDF" as const,
        url: "#",
        category: "📌 Pour commencer",
        fileSize: "2.4 MB",
        downloads: 124,
        date: "Il y a 2 jours"
    },
    {
        id: "res2",
        title: "Template de Présentation",
        description: "Modèle PowerPoint officiel pour vos projets.",
        type: "ARCHIVE" as const,
        url: "#",
        category: "📂 Templates",
        fileSize: "15 MB",
        downloads: 45,
        date: "Il y a 1 semaine"
    },
    {
        id: "res3",
        title: "Replay Masterclass #1",
        description: "Enregistrement de la session live sur le Growth Hacking.",
        type: "VIDEO" as const,
        url: "#",
        category: "🎥 Replays",
        fileSize: "1.2 GB",
        downloads: 89,
        date: "Il y a 3 semaines"
    },
    {
        id: "res4",
        title: "Liste des outils recommandés",
        description: "Une liste curée des meilleurs outils SaaS du marché.",
        type: "LINK" as const,
        url: "#",
        category: "📌 Pour commencer",
        date: "Il y a 1 mois"
    }
];


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
        children: []
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

    // Fetch posts
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

    // Fetch members with roles
    const members = await prisma.communityMember.findMany({
        where: { communityId: community.id },
        include: { user: true },
        orderBy: { joinedAt: "desc" },
        take: 50
    });

    const isMember = !!community.membership;
    const isAdmin = community.membership?.role === "ADMIN";

    // Current user data
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });

    // Transform members for component
    const formattedMembers = members.map(m => ({
        id: m.user.id,
        name: m.user.name || "Utilisateur",
        avatar: m.user.avatar,
        role: m.role as "ADMIN" | "MODERATOR" | "MEMBER",
        joinedAt: m.joinedAt,
        isOnline: false
    }));

    // Get admins/mods for Sidebar
    const admins = formattedMembers
        .filter(m => m.role === "ADMIN" || m.role === "MODERATOR")
        .map(m => ({ ...m, role: m.role as "ADMIN" | "MODERATOR" }));

    // Mock Data for New Tabs (since DB isn't ready)
    const upcomingEvents = [
        { id: 1, title: "Session Q&A Live", description: "Discussion mensuelle avec les modérateurs.", date: "2024-02-15", time: "18:00", location: "Discord", attendees: 42, day: "15", month: "FÉV" }
    ];

    const mediaPreview = [
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=300&fit=crop",
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=300&h=300&fit=crop",
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=300&fit=crop"
    ];

    const galleryMedia = [
        { type: "IMAGE", src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80" },
        { type: "IMAGE", src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80" },
        { type: "VIDEO", src: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80" },
        { type: "IMAGE", src: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80" },
    ];

    // Stats
    const stats = {
        members: community._count.members,
        posts: posts.length,
        activeToday: Math.floor(community._count.members * 0.1),
        growth: 12
    };

    const rules = [
        { id: "1", title: "Soyez respectueux", description: "Traitez tous les membres avec respect et courtoisie." },
        { id: "2", title: "Restez dans le sujet", description: "Les publications doivent être pertinentes pour la communauté." },
        { id: "3", title: "Pas de spam", description: "Évitez les publications répétitives ou promotionnelles." }
    ];

    // Mock Pinned Posts
    const pinnedPosts = [
        {
            id: "pin1",
            title: "Bienvenue dans la communauté !",
            content: `Ravi de vous accueillir ici. N'hésitez pas à vous présenter dans l'onglet "Discussions" et à lire la charte de modération.`,
            author: {
                name: "Admin",
                avatar: undefined,
                role: "ADMIN" as "ADMIN" | "MODERATOR"
            },
            date: "Il y a 2 jours"
        }
    ];

    // Mock Leaderboard Data
    const leaderboard = [
        { id: "u1", name: "Alice Martin", avatar: "/avatars/01.png", points: 1540, rank: 1, trend: "up" as const },
        { id: "u2", name: "Thomas Dubreuil", avatar: "/avatars/02.png", points: 1200, rank: 2, trend: "stable" as const },
        { id: "u3", name: "Sophie Leroy", avatar: undefined, points: 980, rank: 3, trend: "down" as const },
    ];

    // Mock Admin Data
    const joinRequests = [
        { id: "jr1", user: { name: "Lucas Bernard", email: "lucas@test.com" }, date: "Aujourd'hui, 09:30", message: "Bonjour, je suis très intéressé par vos travaux sur le sujet." },
        { id: "jr2", user: { name: "Emma Petit", email: "emma@test.com" }, date: "Hier, 18:45" }
    ];

    const reports = [
        {
            id: "r1",
            type: "COMMENT" as const,
            reason: "Contenu inapproprié",
            contentPreview: "C'est vraiment n'importe quoi, vous êtes tous des...",
            reporter: "Alice Martin",
            status: "PENDING" as const,
            date: "Il y a 2 heures"
        }
    ];

    return (
        <div className="h-full overflow-y-auto scrollbar-hide bg-zinc-50/50 dark:bg-zinc-950 font-sans relative">


            {/* Ambient Background & Parallax Hint */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent dark:from-indigo-900/20 pointer-events-none -z-10" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] space-y-6">

                {/* Back Button */}
                <div className="mb-4">
                    <Button variant="ghost" size="sm" asChild className="gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 pl-0 hover:bg-transparent -ml-2">
                        <Link href="/communities/joined">
                            <ChevronLeft size={16} />
                            Retour aux communautés
                        </Link>
                    </Button>
                </div>

                {/* 1. Header takes full width */}
                <CommunityHeader
                    community={{ ...community, type: community.type as "PUBLIC" | "PRIVATE" }}
                    isMember={isMember}
                    isAdmin={isAdmin}
                    userId={userId}
                />

                {/* 2. Main Content Grid: Left (Tabs/Feed) + Right (Info Sidebar) */}
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* LEFT: Main Content Area */}
                    <main className="flex-1 min-w-0 w-full space-y-6">
                        <CommunityTabs defaultTab="feed" isAdmin={isAdmin} className="sticky top-0 z-30 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md pt-2 -mt-2 pb-2">

                            {/* FEED TAB */}
                            <CommunityTabContent value="feed">
                                <VideoFeedProvider>
                                    <div className="space-y-6">

                                        {/* Pinned Section */}
                                        <CommunityPinnedSection pinnedPosts={pinnedPosts} />

                                        {/* Feed Controls */}
                                        <CommunityFeedControls />

                                        {isMember ? (
                                            <div className="mb-8">
                                                <CreatePostEnhanced
                                                    currentUser={currentUser ? {
                                                        id: currentUser.id,
                                                        name: currentUser.name || "User",
                                                        avatar: currentUser.avatar || "/avatars/default.svg",
                                                        role: currentUser.role as "USER" | "ADMIN" | "PRO"
                                                    } : undefined}
                                                    communityId={community.id}
                                                />
                                            </div>
                                        ) : (
                                            <div className="mb-6 p-8 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-center shadow-xl">
                                                <h3 className="text-2xl font-bold mb-2">Rejoignez la conversation !</h3>
                                                <p className="text-white/80 mb-6 max-w-md mx-auto">
                                                    Devenez membre pour publier, commenter et participer aux événements exclusifs de {community.name}.
                                                </p>
                                                {/* Join Button functionality handled in Header, this is just CTA */}
                                            </div>
                                        )}

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
                                            <div className="text-center py-24 text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white/50 dark:bg-zinc-900/50">
                                                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Le calme avant la tempête</p>
                                                <p className="text-sm mt-2">Soyez le premier à lancer une discussion !</p>
                                            </div>
                                        )}
                                    </div>
                                </VideoFeedProvider>
                            </CommunityTabContent>

                            {/* RESOURCES TAB (NEW) */}
                            <CommunityTabContent value="resources">
                                <CommunityResourcesTab resources={resources} isAdmin={isAdmin} />
                            </CommunityTabContent>

                            {/* ABOUT TAB */}
                            <CommunityTabContent value="about">
                                <CommunityAboutTab
                                    community={{ ...community, type: community.type as "PUBLIC" | "PRIVATE" }}
                                    stats={stats}
                                    admins={admins}
                                    rules={rules}
                                    isAdmin={isAdmin}
                                    isMember={isMember}
                                />
                            </CommunityTabContent>

                            {/* MEMBERS TAB */}
                            <CommunityTabContent value="members">
                                <CommunityMembersTab
                                    members={formattedMembers}
                                    currentUserId={userId}
                                    isAdmin={isAdmin}
                                    totalCount={community._count.members}
                                />
                            </CommunityTabContent>

                            {/* EVENTS TAB (NEW) */}
                            <CommunityTabContent value="events">
                                <CommunityEventsTab events={upcomingEvents} />
                            </CommunityTabContent>

                            {/* MEDIA TAB (NEW) */}
                            <CommunityTabContent value="media">
                                <CommunityMediaTab media={galleryMedia} />
                            </CommunityTabContent>

                            {/* ADMIN TAB (NEW) - Only for admins */}
                            {isAdmin && (
                                <CommunityTabContent value="admin">
                                    <CommunityAdminTab joinRequests={joinRequests} reports={reports} />
                                </CommunityTabContent>
                            )}

                        </CommunityTabs>
                    </main>

                    {/* RIGHT: Context Sidebar (Sticky) */}
                    <div className="hidden lg:block sticky top-24 self-start">
                        <CommunityInfoSidebar
                            community={community}
                            admins={admins.slice(0, 3)}
                            mediaPreview={mediaPreview}
                            upcomingEvents={upcomingEvents}
                            leaderboard={leaderboard}
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}
