import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import { DEMO_USER_ID } from "@/lib/constants";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { getProfileViewsCount, logProfileView } from "@/lib/actions-profile";
import { ProfilePageLayout } from "@/components/profile/ProfilePageLayout";


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
    console.log("[ProfilePage] Requested ID:", userId);

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
            },
            portfolioItems: {
                orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
                take: 10
            },
            storyHighlights: {
                orderBy: { order: 'asc' },
                take: 20
            },
            endorsementsReceived: {
                include: {
                    giver: {
                        select: { id: true, name: true, avatar: true, role: true, headline: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 10
            },
            experiences: {
                orderBy: { startDate: 'desc' }
            },
            certifications: {
                orderBy: { issueDate: 'desc' }
            },
            skills: { orderBy: { endorsementsCount: 'desc' } }, // NEW
            searchCriteria: true,
        }
    });

    if (!profileUser) return notFound();

    const user: any = profileUser;

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
        orderBy: { createdAt: "desc" },
        take: 5 // Limit to recent activity
    });

    // Fetch Relationship Status
    let relationshipStatus = null;
    if (currentUser) {
        const { getRelationshipStatus } = await import("@/lib/follow-actions");
        relationshipStatus = await getRelationshipStatus(currentUser.id, userId);
    }

    const userProfile = {
        id: user.id,
        name: user.name || "Utilisateur",
        email: user.email,
        avatar: user.avatar || "/avatars/default.svg",
        role: user.role as "USER" | "ADMIN" | "PRO",
        bio: user.bio || undefined,
        location: user.location || undefined,
        website: user.website || undefined,
        coverImage: user.coverImage || undefined,
        joinedAt: new Date(user.createdAt).getFullYear().toString(),
        stats: {
            followers: user._count.followedBy,
            following: user._count.following,
            posts: user._count.posts
        },
        reputation: user.reputation,
        badges: user.badges,
        isFollowing: relationshipStatus?.isFollowing || false,
        relationship: relationshipStatus,
        links: user.links,
        lastActive: user.lastActive,

        // Extended Real Estate Fields
        headline: user.headline,
        pronouns: user.pronouns,
        currentStatus: user.currentStatus,
        company: user.company,
        companyWebsite: user.companyWebsite,
        siren: user.siren,
        experienceYears: user.experienceYears,
        dealsCount: user.dealsCount,
        assetsUnderManagement: user.assetsUnderManagement,
        specialities: user.specialities,
        languages: user.languages,
        calendlyUrl: user.calendlyUrl,
        whatsapp: user.whatsapp,
        avatarDecoration: user.avatarDecoration,
        experiences: user.experiences,
        certifications: user.certifications,
        skills: user.skills,
        searchCriteria: user.searchCriteria,
    };

    const isCurrentUser = userId === currentUserId;

    let profileViewsCount = 0;
    if (isCurrentUser) {
        profileViewsCount = await getProfileViewsCount(userId, 7);
    } else if (currentUser) {
        logProfileView(currentUser.id, userId);
    }

    return (
        <ProfilePageLayout
            user={user}
            currentUser={currentUser}
            userProfile={userProfile}
            posts={posts}
            mutualConnections={mutualConnections}
            isCurrentUser={isCurrentUser}
            profileViewsCount={profileViewsCount}
            searchCriteria={user.searchCriteria}
            certifications={user.certifications}
            skills={user.skills}
        />
    );
}
