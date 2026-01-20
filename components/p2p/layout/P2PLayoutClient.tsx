"use client";

import { usePathname } from "next/navigation";
import { P2PSidebar } from "@/components/p2p/layout/P2PSidebar";
import { P2PFooter } from "@/components/p2p/layout/P2PFooter";
import { Header } from "@/components/layout/Header";

export function P2PLayoutClient({
    children,
    user
}: {
    children: React.ReactNode;
    user?: any;
}) {
    const pathname = usePathname();
    const isLandingPage = pathname === "/p2p";

    // Landing page: full width, no sidebar, Transparent Header, No Padding
    if (isLandingPage) {
        return (
            <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans">
                <Header user={user} transparent={true} />
                {children}
            </div>
        );
    }

    // App pages: with sidebar and footer, Solid Header, With Padding
    return (
        <div className="h-screen flex flex-col bg-zinc-50 dark:bg-black font-sans overflow-hidden pt-20">
            <Header user={user} transparent={false} />
            <div className="flex-1 flex min-h-0">
                <P2PSidebar />
                <main className="flex-1 overflow-y-auto">
                    {children}
                    <P2PFooter />
                </main>
            </div>
        </div>
    );
}

