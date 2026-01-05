import { Header } from "@/components/layout/Header";
import { SidebarLeft } from "@/components/layout/SidebarLeft";
import { SidebarRight } from "@/components/layout/SidebarRight";
import { BackToTop } from "@/components/ui/back-to-top";

export default function BookmarksLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background font-sans anti-aliased">
            <Header />
            <div className="container grid flex-1 gap-6 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr_320px] lg:gap-10 mt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <aside className="hidden w-[200px] flex-col md:flex lg:w-[240px]">
                    <SidebarLeft className="sticky top-20 w-full" />
                </aside>
                <main className="flex w-full flex-1 flex-col">
                    {children}
                </main>
                <aside className="hidden w-[320px] flex-col lg:flex">
                    <SidebarRight />
                </aside>
            </div>
            <BackToTop />
        </div>
    );
}
