import { Header } from "@/components/layout/Header";
import { auth } from "@/lib/auth";
import { DEMO_USER_ID } from "@/lib/constants";
import { CommunitySidebarLeft } from "@/components/community/CommunitySidebarLeft";

export default async function CommunitiesLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    const userId = session?.user?.id || DEMO_USER_ID;

    const currentUserProfile = session?.user?.id ? {
        id: session.user.id,
        name: session.user.name || "Utilisateur",
        avatar: session.user.image || "/avatars/default.svg",
        handle: "user", // Fallback handle
        role: "USER"
    } : undefined;

    return (
        <div className="min-h-screen bg-background font-sans text-foreground pb-20 md:pb-0 md:pt-24">
            {/* Desktop Header matching Home */}
            <div className="hidden md:block">
                <Header user={session?.user} />
            </div>

            <div className="md:hidden sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800 px-4 h-14 flex items-center justify-between">
                <span className="font-bold text-xl text-indigo-600 tracking-tight">Communautés</span>
            </div>

            {/* Main Grid Structure - Exact Match to FeedLayout */}
            <div className="container max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-[275px_1fr] lg:grid-cols-[275px_1fr_350px] gap-0 md:gap-8 lg:gap-10">

                    {/* LEFT: Contextual Community Sidebar */}
                    <aside className="hidden md:block sticky top-[5.5rem] h-[calc(100vh-5.5rem)] overflow-hidden pl-2">
                        <CommunitySidebarLeft user={currentUserProfile} />
                    </aside>

                    {/* CENTER: Community Content (Spans 2 cols on Desktop if no right sidebar, or standard feed width) 
                        Wait, the user wanted layout of sidebar to be exact. The content area should probably align with feed.
                        In FeedLayout, main is 'max-w-2xl mx-auto'.
                        But Communities might need more width if it's a dashboard.
                        However, for "page de communauté" (posts), max-w-2xl is expected.
                        For "Discovery" (Grid), we might want full width.
                        Let's keep it flexible but constrained for readability.
                        If we have no right sidebar effectively, we can span the rest or center it.
                        The Grid structure above defines 3 columns. If we only have 2, we should probably change the grid or span.
                        Let's try a modified 2-col grid that keeps the Left Sidebar fixed and lets Content take the rest.
                    */}

                    {/* OVERRIDE: 2-Column Layout for Communities (No Right Sidebar effectively) */}
                    <main className="min-w-0 w-full col-span-1 lg:col-span-2 border-x border-zinc-100/0 dark:border-zinc-800/0 md:px-0">
                        {children}
                    </main>

                </div>
            </div>
        </div>
    );
}
