import { Header } from "@/components/layout/Header";
import { SidebarLeft } from "@/components/layout/SidebarLeft";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { auth } from "@/lib/auth";

export const metadata = {
    title: "Reels | Transpareo",
    description: "Explorez des vidéos courtes immobilières",
};

export default async function ReelsLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    const userId = session?.user?.id;

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-black">
            {/* Desktop Header - Hidden on Mobile */}
            <div className="hidden md:block">
                <Header />
            </div>

            <div className="flex flex-1 w-full overflow-hidden relative">
                {/* Desktop Sidebar - Hidden on Mobile */}
                <aside className="hidden md:flex w-[240px] flex-col border-r border-white/10 bg-background/95">
                    <SidebarLeft className="p-4" />
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 w-full relative">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Nav - Visible only on Mobile */}
            <div className="md:hidden">
                <MobileBottomNav userId={userId} />
            </div>
        </div>
    );
}
