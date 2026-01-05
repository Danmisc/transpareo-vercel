
import { Header } from "@/components/layout/Header";
import { P2PSidebar } from "@/components/p2p/layout/P2PSidebar";

export default function P2PLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen bg-zinc-50 dark:bg-black font-sans flex flex-col overflow-hidden">
            {/* Header is fixed height, not fixed position, so it pushes content down naturally in flex-col */}
            <div className="flex-none z-50">
                <Header />
            </div>

            <div className="flex-1 flex overflow-hidden">
                <P2PSidebar />

                <main className="flex-1 overflow-y-auto relative scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    );
}
