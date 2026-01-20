"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react"; // Fallback icon
import { cn } from "@/lib/utils";


interface FeedLayoutProps {
    children: React.ReactNode;
    leftSidebar: React.ReactNode;
    rightSidebar: React.ReactNode;
}

export function FeedLayout({ children, leftSidebar, rightSidebar }: FeedLayoutProps) {
    // Only used for mobile toggle logic if needed, but primarily desktop structure here

    return (
        <div className="container max-w-[1400px] mx-auto min-h-screen">
            <div className="grid grid-cols-1 md:grid-cols-[275px_1fr] lg:grid-cols-[275px_1fr_350px] gap-0 md:gap-8 lg:gap-10">

                {/* Left Sidebar - Desktop Sticky */}
                <aside className="hidden md:block sticky top-[5.5rem] h-[calc(100vh-5.5rem)] overflow-hidden pl-2">
                    {leftSidebar}
                </aside>

                {/* Main Feed Content */}
                <main className="min-w-0 w-full max-w-2xl mx-auto border-x border-zinc-100/0 dark:border-zinc-800/0 md:px-0 pb-20">
                    {/* The feed children (CreatePost, Posts, etc) go here */}
                    {children}
                </main>

                {/* Right Sidebar - Desktop Sticky */}
                <aside className="hidden lg:block sticky top-[5.5rem] h-[calc(100vh-5.5rem)] overflow-hidden pr-2">
                    {rightSidebar}
                </aside>

            </div>


        </div>
    );
}

