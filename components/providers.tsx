"use client";

import { SessionProvider } from "next-auth/react";
import { CallProvider } from "@/components/calls/CallProvider";
import { ThemeProvider } from "@/components/theme-provider";

import { Session } from "next-auth";

import { VideoProvider } from "@/components/video/VideoProvider";

export function Providers({ children, session }: { children: React.ReactNode, session?: Session | null }) {
    return (
        <SessionProvider session={session}>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <VideoProvider>
                    <CallProvider>
                        {children}
                    </CallProvider>
                </VideoProvider>
            </ThemeProvider>
        </SessionProvider>
    );
}

