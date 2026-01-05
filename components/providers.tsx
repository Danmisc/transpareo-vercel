"use client";

import { SessionProvider } from "next-auth/react";
import { CallProvider } from "@/components/calls/CallProvider";
import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <CallProvider>
                    {children}
                </CallProvider>
            </ThemeProvider>
        </SessionProvider>
    );
}
