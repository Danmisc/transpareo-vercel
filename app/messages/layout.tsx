"use client";

import { ConversationList } from "@/components/messages/ConversationList";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const pathname = usePathname();
    const isRoot = pathname === "/messages";

    // Mobile Logic: If on root (/messages), show List. If on conversation (/messages/id), show Chat (children).
    // Desktop Logic: Show both side-by-side.

    const showList = isDesktop || isRoot;
    const showChat = isDesktop || !isRoot;

    return (
        <div className="flex h-[calc(100vh-4rem)] md:h-screen w-full bg-white overflow-hidden relative">
            {/* Sidebar / Conversation List */}
            <div
                className={cn(
                    "flex-shrink-0 transition-all duration-300 ease-in-out border-r border-zinc-200 bg-white z-20",
                    showList ? "w-full md:w-[380px] opacity-100 translate-x-0" : "w-0 opacity-0 -translate-x-full absolute md:static"
                )}
            >
                <ConversationList params={{}} />
            </div>

            {/* Main Chat Area */}
            <div
                className={cn(
                    "flex-1 flex flex-col transition-all duration-300 bg-zinc-50/50 relative",
                    showChat ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full absolute md:static md:translate-x-0 md:opacity-100"
                )}
            >
                {/* Desktop Ambient Background - Light Mode */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-100/40 via-white to-white pointer-events-none -z-10" />
                {children}
            </div>
        </div>
    );
}

