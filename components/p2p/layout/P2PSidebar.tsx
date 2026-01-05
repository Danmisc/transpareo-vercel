"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
    Home,
    BarChart3,
    Wallet,
    Users,
    Leaf,
    FileText,
    PiggyBank,
    Settings,
    ChevronRight,
    Search
} from "lucide-react";
import { clsx } from "clsx";

export function P2PSidebar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const navigation = [
        { name: "Accueil", href: "/p2p/dashboard", icon: Home },
        { name: "Soldes", href: "/p2p/wallet", icon: Wallet },
        { name: "Transactions", href: "/p2p/portfolio", icon: BarChart3 },
        { name: "Emprunter", href: "/p2p/borrow", icon: PiggyBank },
        { name: "Catalogue", href: "/p2p/market", icon: Search },
    ];

    const social = [
        { name: "Communauté", href: "/p2p/community", icon: Users },
        { name: "Impact RSE", href: "/p2p/impact", icon: Leaf },
        { name: "Documents", href: "/p2p/documents", icon: FileText },
    ];

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

    return (
        <aside className="hidden lg:flex flex-col w-[260px] h-[calc(100vh-80px)] sticky top-20 pl-6 pr-4 py-6">

            {/* Environment Switcher Mock */}
            <div className="mb-8 px-2">
                <button className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors">
                    <div className="w-5 h-5 rounded-md bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold pb-px">E</div>
                    <span>Environnement Perso</span>
                    <ChevronRight size={14} className="ml-auto opacity-50" />
                </button>
            </div>

            <div className="space-y-8 flex-1">
                {/* Main Nav */}
                <div>
                    <div className="space-y-0.5">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={clsx(
                                    "group flex items-center gap-3 px-2 py-1.5 text-sm font-medium rounded-md transition-colors",
                                    isActive(item.href)
                                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                                )}
                            >
                                <item.icon size={16} className={clsx(
                                    isActive(item.href) ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 group-hover:text-zinc-500"
                                )} />
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Secondary Nav */}
                <div>
                    <h3 className="px-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Raccourcis</h3>
                    <div className="space-y-0.5">
                        {social.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={clsx(
                                    "group flex items-center gap-3 px-2 py-1.5 text-sm font-medium rounded-md transition-colors",
                                    isActive(item.href)
                                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                                )}
                            >
                                <item.icon size={16} className="text-zinc-400 group-hover:text-zinc-500" />
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Config */}
            <div className="mt-auto px-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <Link href="/p2p/settings" className="flex items-center gap-3 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                    <Settings size={16} />
                    Paramètres
                </Link>
            </div>
        </aside>
    );
}
