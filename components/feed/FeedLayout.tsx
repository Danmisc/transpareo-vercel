"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, PanelRightClose, PanelRightOpen, SidebarClose, SidebarOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FeedLayoutProps {
    children: React.ReactNode;
    leftSidebar: React.ReactNode;
    rightSidebar: React.ReactNode;
}

export function FeedLayout({ children, leftSidebar, rightSidebar }: FeedLayoutProps) {
    const [showRightSidebar, setShowRightSidebar] = useState(true);

    return (
        <div className="container max-w-full xl:max-w-[1920px] mx-auto px-0 md:px-6">
            <div
                className={cn(
                    "grid gap-6 lg:gap-8 pt-0 md:pt-6 transition-all duration-500 ease-in-out",
                    "grid-cols-1 md:grid-cols-[300px_1fr]",
                    showRightSidebar
                        ? "lg:grid-cols-[300px_1fr_300px]"
                        : "lg:grid-cols-[300px_1fr_0px] lg:gap-0"
                )}
            >
                {/* Left Sidebar */}
                <aside className="hidden md:block sticky top-[5.5rem] h-[calc(100vh-5.5rem)] overflow-hidden pb-4">
                    {leftSidebar}
                </aside>

                {/* Main Feed */}
                <main className="flex flex-col gap-6 w-full max-w-2xl mx-auto md:max-w-none md:mx-0 relative">
                    {children}

                    {/* Expand Button (Mobile/Tablet usually behaves differently, this is for Desktop toggle) */}
                    {!showRightSidebar && (
                        <div className="hidden lg:block absolute -right-12 top-0 h-full z-10">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowRightSidebar(true)}
                                className="fixed top-24 right-4 h-10 w-10 rounded-full bg-white dark:bg-zinc-900 border shadow-md hover:scale-110 transition-transform z-50 text-zinc-500 hover:text-primary"
                                title="Afficher la sidebar"
                            >
                                <PanelRightOpen className="h-5 w-5" />
                            </Button>
                        </div>
                    )}
                </main>

                {/* Right Sidebar */}
                <aside
                    className={cn(
                        "hidden lg:block sticky top-[5.5rem] h-[calc(100vh-5.5rem)] transition-all duration-500",
                        showRightSidebar ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20 overflow-hidden w-0"
                    )}
                >
                    <div className="relative h-full">
                        {/* Collapse Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowRightSidebar(false)}
                            className="absolute -left-4 top-0 h-8 w-8 rounded-full bg-zinc-100/50 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 backdrop-blur-sm z-20 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50"
                            title="Masquer"
                        >
                            <PanelRightClose className="h-4 w-4" />
                        </Button>

                        <div className={cn("h-full overflow-y-auto pb-10 transition-opacity duration-300 delay-100", showRightSidebar ? "opacity-100" : "opacity-0")}>
                            {rightSidebar}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
