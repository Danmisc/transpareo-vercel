import { Header } from "@/components/layout/Header";
import { SidebarLeft } from "@/components/layout/SidebarLeft";
import { SidebarRight } from "@/components/layout/SidebarRight";
import { CreatePost } from "@/components/feed/CreatePost";
import { FeedList } from "@/components/feed/FeedList";
import { StoriesTray } from "@/components/feed/StoriesTray";
import { BackToTop } from "@/components/ui/back-to-top";
import { VideoFeedProvider } from "@/components/feed/VideoFeedProvider";
import { cn } from "@/lib/utils";

import { feedService } from "@/lib/services/feed.service";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { DEMO_USER_ID } from "@/lib/constants";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { FeedLayout } from "@/components/feed/FeedLayout";
import { getDailyBriefStats } from "@/lib/actions-sidebar";

export default async function Home(props: { searchParams: Promise<{ feed?: string }> }) {
    const searchParams = await props.searchParams;
    const session = await auth();
    const userId = session?.user?.id || DEMO_USER_ID;

    const feedType = searchParams.feed || "for-you"; // 'for-you' | 'following'

    // Fetch posts based on feed type
    let posts;
    if (feedType === "following") {
        posts = await feedService.getFollowingFeed(userId);
    } else {
        posts = await feedService.getForYouFeed(userId);
    }

    const currentUserProfile = session?.user?.id ? {
        id: session.user.id,
        name: session.user.name || "Utilisateur",
        avatar: session.user.image || "/avatars/default.png",
        role: "USER"
    } : { id: DEMO_USER_ID, name: "Sophie Dubreuil (Invité)", avatar: "/avatars/03.png" };

    const dailyBrief = await getDailyBriefStats(userId);

    const TABS = [
        { id: "for-you", label: "Pour vous" },
        { id: "following", label: "Abonnements" },
        { id: "communities", label: "Communautés" },
        { id: "trending", label: "Trending" }
    ];

    return (
        <div className="min-h-screen bg-background font-sans text-foreground pb-20 md:pb-0">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-orange-200/20 dark:bg-orange-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen opacity-70 animate-blob" />
                <div className="absolute top-1/4 right-1/4 w-[40rem] h-[40rem] bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen opacity-70 animate-blob animation-delay-2000" />
            </div>

            <div className="hidden md:block">
                <Header />
            </div>

            {/* Mobile Header */}
            <div className="md:hidden sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800 px-4 h-14 flex items-center justify-between">
                <span className="font-bold text-xl text-orange-600 tracking-tight">Transpareo</span>
                <Link href="/messages" className="p-2 text-zinc-600 hover:text-orange-500 rounded-full hover:bg-orange-50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
                </Link>
            </div>

            <div className="mt-6">
                <FeedLayout
                    leftSidebar={<SidebarLeft user={currentUserProfile} dailyBrief={dailyBrief} />}
                    rightSidebar={<SidebarRight />}
                >
                    {/* Feed Tabs */}
                    <div className="sticky top-[3.5rem] md:top-[4.5rem] z-40 px-4 md:px-0 flex justify-center py-2 bg-gradient-to-b from-zinc-50/95 via-zinc-50/80 to-transparent dark:from-black/95 dark:via-black/80 md:bg-none pointer-events-none">
                        <div className="glass dark:bg-zinc-800/50 rounded-full p-1 inline-flex gap-1 pointer-events-auto border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm">
                            {TABS.map((tab) => {
                                const isActive = feedType === tab.id || (tab.id === "for-you" && !searchParams.feed);
                                return (
                                    <Link
                                        key={tab.id}
                                        href={`/?feed=${tab.id}`}
                                        className={cn(
                                            "px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-300",
                                            isActive
                                                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-lg shadow-zinc-900/10 transform scale-105"
                                                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/50 dark:hover:bg-zinc-700/50"
                                        )}
                                    >
                                        {tab.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <VideoFeedProvider>
                        {session?.user && (
                            <div className="px-4 md:px-0 space-y-6">
                                <StoriesTray />
                                <CreatePost currentUser={currentUserProfile} />
                            </div>
                        )}

                        <FeedList
                            initialPosts={posts}
                            userId={userId}
                            currentUserProfile={currentUserProfile}
                            feedType={feedType}
                        />
                    </VideoFeedProvider>
                </FeedLayout>
            </div>

        </div>
    );
}
