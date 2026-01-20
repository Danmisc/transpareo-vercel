"use client";

import { Header } from "@/components/layout/Header";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PostCard } from "@/components/feed/PostCard";
import { DEMO_USER_ID } from "@/lib/constants";
import { useState } from "react";
import { ArrowLeft, Pin, Grid, Layers, UserCircle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { VideoFeedProvider } from "@/components/feed/VideoFeedProvider";
import { ProfileJourney } from "@/components/profile/ProfileJourney";
import { ProfileCertifications } from "@/components/profile/ProfileCertifications";
import { ProfileAttributes } from "@/components/profile/ProfileAttributes";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { EndorsementsSection } from "@/components/profile/EndorsementsSection";
import { MutualConnections } from "@/components/profile/MutualConnections";
import { ReputationRadar } from "@/components/profile/ReputationRadar";
import { VerificationStack } from "@/components/profile/VerificationStack";
import { SearchCriteriaCard } from "@/components/profile/SearchCriteriaCard";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { ProfileAbout } from "@/components/profile/ProfileAbout";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { ProfilePortfolio } from "@/components/profile/ProfilePortfolio";
import { ProfileActivity } from "@/components/profile/ProfileActivity"; // NEW
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Helper for interactions
function serializeComments(comments: any[]): any[] {
    if (!comments) return [];
    return comments.map(c => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt, // Assume simplified or handle date
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

interface ProfilePageLayoutProps {
    user: any;
    currentUser: any;
    userProfile: any;
    posts: any[];
    mutualConnections: any[];
    isCurrentUser: boolean;
    profileViewsCount: number;
    searchCriteria?: any;
    certifications?: any[];
    skills?: any[]; // NEW
}

export function ProfilePageLayout({
    user,
    currentUser,
    userProfile,
    posts,
    mutualConnections,
    isCurrentUser,
    profileViewsCount,
    searchCriteria,
    certifications = [],
    skills = [] // NEW
}: ProfilePageLayoutProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editInitialTab, setEditInitialTab] = useState<string>("identity");

    const handleEditProfile = (tab: string = "identity") => {
        setEditInitialTab(tab);
        setIsEditOpen(true);
    };

    return (
        <VideoFeedProvider>
            <div className="min-h-screen bg-[#F3F2EF] dark:bg-black font-sans box-border">
                <Header />

                <EditProfileDialog
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    user={userProfile}
                    experiences={user.experiences}
                    certifications={certifications}
                    skills={skills}
                    searchCriteria={searchCriteria}
                    initialTab={editInitialTab}
                />

                <main className="container max-w-7xl mx-auto px-4 pt-24 pb-6">
                    {/* Breadcrumb / Back */}
                    <div className="mb-4">
                        <Link href="/" className={cn(buttonVariants({ variant: "ghost" }), "pl-0 hover:bg-transparent hover:underline text-zinc-500")}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour au fil d'actualité
                        </Link>
                    </div>

                    {/* NEW: Full Width Profile Header */}
                    <div className="mb-6">
                        <ProfileHeader
                            user={userProfile}
                            isCurrentUser={isCurrentUser}
                            profileViewsCount={profileViewsCount}
                            pitchData={{
                                videoUrl: user.pitchVideoUrl,
                                thumbnailUrl: user.pitchVideoThumbnail,
                                duration: user.pitchDuration
                            }}
                            onEditProfile={handleEditProfile}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* LEFT COLUMN (Pro Profile) - Span 8 or 9 */}
                        <div className="col-span-1 lg:col-span-8 space-y-4">

                            <Tabs defaultValue="overview" className="w-full">
                                <div className="sticky top-[80px] z-30 bg-[#F3F2EF] dark:bg-black pb-4 -mx-4 px-4 md:mx-0 md:px-0">
                                    <TabsList className="w-full justify-start bg-white dark:bg-zinc-900 border border-border/40 p-1 rounded-xl h-auto shadow-sm overflow-x-auto">
                                        <TabsTrigger value="overview" className="flex-1 min-w-[100px] py-2.5 rounded-lg data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800 data-[state=active]:font-bold transition-all">
                                            <Grid className="w-4 h-4 mr-2" /> Vue d'ensemble
                                        </TabsTrigger>
                                        <TabsTrigger value="portfolio" className="flex-1 min-w-[100px] py-2.5 rounded-lg data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800 data-[state=active]:font-bold transition-all">
                                            <Layers className="w-4 h-4 mr-2" /> Portfolio
                                        </TabsTrigger>
                                        <TabsTrigger value="activity" className="flex-1 min-w-[100px] py-2.5 rounded-lg data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800 data-[state=active]:font-bold transition-all">
                                            <UserCircle className="w-4 h-4 mr-2" /> Activité
                                        </TabsTrigger>
                                        <TabsTrigger value="trust" className="flex-1 min-w-[100px] py-2.5 rounded-lg data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800 data-[state=active]:font-bold transition-all">
                                            <ShieldCheck className="w-4 h-4 mr-2" /> Confiance
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="overview" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">

                                    {/* 1. PRO OVERVIEW (The "Module à part") */}
                                    <ProfileAbout
                                        bio={user.bio}
                                        languages={user.languages}
                                    />

                                    {/* 4. EXPERIENCE (Journey) */}
                                    <ProfileJourney
                                        isOwner={isCurrentUser}
                                        experiences={user.experiences}
                                        onEdit={() => handleEditProfile("journey")}
                                    />

                                    {/* REAL ESTATE DNA */}
                                    <SearchCriteriaCard
                                        isOwner={isCurrentUser}
                                        role={user.role as any}
                                        searchCriteria={searchCriteria}
                                        onEdit={() => handleEditProfile("project")}
                                    />
                                </TabsContent>

                                <TabsContent value="portfolio" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <ProfilePortfolio
                                        items={user.portfolioItems}
                                        isOwner={isCurrentUser}
                                    />
                                    {/* 6. EDUCATION/TRUST (Certifications) */}
                                    <ProfileCertifications
                                        isOwner={isCurrentUser || user.role === 'PRO'}
                                        certifications={user.certifications}
                                        onEdit={() => handleEditProfile("licenses")}
                                    />

                                    {/* 7. SKILLS (Attributes) */}
                                    <ProfileAttributes
                                        isOwner={isCurrentUser || user.role === 'PRO'}
                                        skills={skills}
                                        onEdit={() => handleEditProfile("expertise")} // Reusing 'expertise' as the ID for skills/attributes
                                    />
                                </TabsContent>

                                <TabsContent value="activity" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    {/* 9. ACTIVITY (Posts) */}
                                    <ProfileActivity
                                        user={user}
                                        currentUser={currentUser}
                                        posts={posts}
                                    />
                                </TabsContent>

                                <TabsContent value="trust" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    {/* PHASe 1: TRUST & REPUTATION GRID */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ReputationRadar isOwner={isCurrentUser} />
                                        <VerificationStack isOwner={isCurrentUser} />
                                    </div>

                                    {/* 8. RECOMMENDATIONS */}
                                    {user.endorsementsReceived && user.endorsementsReceived.length > 0 && (
                                        <ProfileSection title="Recommandations">
                                            <EndorsementsSection
                                                endorsements={user.endorsementsReceived}
                                                isOwner={isCurrentUser}
                                                userId={user.id}
                                                userName={user.name || "cet utilisateur"}
                                            />
                                        </ProfileSection>
                                    )}
                                </TabsContent>

                            </Tabs>

                        </div>

                        {/* RIGHT COLUMN (Sidebar) - Span 4 or 3 */}
                        <div className="hidden lg:block col-span-4 space-y-4">
                            <div className="sticky top-24 space-y-4">

                                {/* Mutual Connections Context (Restored) */}
                                {mutualConnections.length > 0 && (
                                    <div className="bg-card rounded-xl border border-border/50 shadow-sm p-4">
                                        <h3 className="text-sm font-bold mb-3 text-zinc-900 dark:text-white">Vous connaissez...</h3>
                                        <MutualConnections connections={mutualConnections} />
                                    </div>
                                )}

                                <ProfileSidebar />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </VideoFeedProvider>
    );
}
