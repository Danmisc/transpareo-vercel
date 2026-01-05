"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function SocialButtons({ mode = "login", role }: { mode?: "login" | "register", role?: string }) {

    const handleSocialLogin = (provider: "google" | "linkedin") => {
        // 1. Set cookies to persist intent and role for the server-side callback
        document.cookie = `auth_mode=${mode}; path=/; max-age=300`; // 5 mins
        if (role) {
            document.cookie = `auth_role=${role}; path=/; max-age=300`;
        } else {
            // Clear role cookie if not registering with one (safety)
            document.cookie = `auth_role=; path=/; max-age=0`;
        }

        // 2. Trigger NextAuth Sign In
        signIn(provider, { callbackUrl: "/" });
    };

    return (
        <div className="grid grid-cols-2 gap-4">
            <Button
                variant="outline"
                type="button"
                className="h-12 rounded-xl border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-all"
                onClick={() => handleSocialLogin("google")}
            >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        className="text-blue-500" // Fallback
                    />
                    <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26c.01-.19.01-.38.01-.58z"
                    />
                    <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                </svg>
                Google
            </Button>

            <Button
                variant="outline"
                type="button"
                className="h-12 rounded-xl border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-all text-[#0077b5] hover:text-[#0077b5]"
                onClick={() => handleSocialLogin("linkedin")}
            >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                LinkedIn
            </Button>
        </div>
    );
}
