"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusSquare, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

export function MobileNav() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const userImage = session?.user?.image;

    const isActive = (path: string) => pathname === path;

    // Hide on Reels for full immersion
    if (pathname.startsWith("/reels")) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none md:hidden pt-4">
            {/* Nav Container with Rounded Top */}
            <div className="pointer-events-auto bg-white dark:bg-black border-t border-zinc-100 dark:border-zinc-800 rounded-t-[24px] shadow-[0_-4px_20px_rgba(0,0,0,0.04)] dark:shadow-none pb-safe">
                <div className="flex items-center justify-around h-[56px] px-2">

                    {/* Home */}
                    <Link href="/" className="p-3">
                        <Home
                            size={26}
                            strokeWidth={isActive("/") ? 2.5 : 2}
                            className={cn("transition-transform active:scale-95", isActive("/") ? "text-orange-600 dark:text-orange-500 fill-orange-600/20 dark:fill-orange-500/20" : "text-zinc-500 dark:text-zinc-500")}
                        />
                    </Link>

                    {/* Explore */}
                    <Link href="/search" className="p-3">
                        <Search
                            size={26}
                            strokeWidth={isActive("/search") ? 3 : 2}
                            className={cn("transition-transform active:scale-95", isActive("/search") ? "text-orange-600 dark:text-orange-500" : "text-zinc-500 dark:text-zinc-500")}
                        />
                    </Link>

                    {/* Create (Central) */}
                    <Link href="/create" className="p-3">
                        <PlusSquare
                            size={26}
                            strokeWidth={2}
                            className="text-zinc-900 dark:text-zinc-100 transition-transform active:scale-95 hover:text-orange-600 dark:hover:text-orange-500"
                        />
                    </Link>

                    {/* Invest */}
                    <Link href="/p2p" className="p-3">
                        <PieChart
                            size={26}
                            strokeWidth={isActive("/p2p") ? 2.5 : 2}
                            className={cn("transition-transform active:scale-95", isActive("/p2p") ? "text-orange-600 dark:text-orange-500 fill-orange-600/20 dark:fill-orange-500/20" : "text-zinc-500 dark:text-zinc-500")}
                        />
                    </Link>

                    {/* Profile */}
                    <Link href="/profile" className="p-3">
                        <div className={cn(
                            "rounded-full p-[1px] transition-all",
                            isActive("/profile") ? "border-2 border-orange-600 dark:border-orange-500" : "border border-transparent"
                        )}>
                            <Avatar className="w-6 h-6">
                                <AvatarImage src={userImage || "/avatars/default.svg"} />
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                        </div>
                    </Link>

                </div>
            </div>
        </div>
    );
}

