import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { SidebarLeft } from "@/components/layout/SidebarLeft";
import { SidebarRight } from "@/components/layout/SidebarRight";
import { NotificationFeed } from "@/components/notifications/NotificationFeed";

export default async function NotificationsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    return (
        <div className="min-h-screen bg-zinc-50/50 font-sans text-zinc-900 pb-20 md:pb-0">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-orange-200/20 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob" />
                <div className="absolute top-1/4 right-1/4 w-[40rem] h-[40rem] bg-blue-200/20 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-2000" />
            </div>

            <div className="hidden md:block">
                <Header />
            </div>

            {/* Mobile Header (Simplified for this page) */}
            <div className="md:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-4 h-14 flex items-center justify-between">
                <span className="font-bold text-xl text-orange-600 tracking-tight">Transpareo</span>
            </div>

            <div className="container max-w-full xl:max-w-[1800px] mx-auto px-0 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr_400px] gap-6 lg:gap-12 pt-0 md:pt-6">

                    {/* Left Sidebar - Desktop Only */}
                    <aside className="hidden md:block sticky top-[5.5rem] h-[calc(100vh-6rem)] overflow-y-auto scrollbar-none pb-10">
                        <SidebarLeft />
                    </aside>

                    {/* Main Feed Content */}
                    <main className="flex flex-col gap-6 w-full max-w-3xl mx-auto md:max-w-none md:mx-0 px-4 md:px-0">
                        <NotificationFeed userId={session.user.id} />
                    </main>

                    {/* Right Sidebar - Desktop Only */}
                    <aside className="hidden lg:block sticky top-[5.5rem] h-[calc(100vh-6rem)] overflow-y-auto scrollbar-none pb-10">
                        <SidebarRight />
                    </aside>
                </div>
            </div>

        </div>
    );
}
