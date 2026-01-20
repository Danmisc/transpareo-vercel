"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    BarChart3,
    Wallet,
    Users,
    Leaf,
    FileText,
    PiggyBank,
    Settings,
    ChevronDown,
    Search,
    TrendingUp,
    Shield,
    ClipboardCheck,
    RefreshCw,
    Receipt,
    Calendar,
    Scale,
    Briefcase,
    ArrowLeft
} from "lucide-react";
import { clsx } from "clsx";

export function P2PSidebar() {
    const pathname = usePathname();
    const [isConformiteOpen, setIsConformiteOpen] = useState(false);

    // Core Navigation - Essential P2P functions
    const coreNavigation = [
        { name: "Tableau de bord", href: "/p2p/dashboard", icon: Home },
        { name: "Catalogue", href: "/p2p/market", icon: Search },
    ];

    // Finances - Money management
    const financesNavigation = [
        { name: "Mes Gains", href: "/p2p/gains", icon: PiggyBank },
        { name: "Portfolio", href: "/p2p/portfolio", icon: BarChart3 },
        { name: "Échéances", href: "/p2p/maturities", icon: Calendar },
        { name: "Emprunter", href: "/p2p/borrow", icon: Wallet },
    ];

    // Community & Extras
    const extrasNavigation = [
        { name: "Communauté", href: "/p2p/community", icon: Users },
        { name: "Impact RSE", href: "/p2p/impact", icon: Leaf },
        { name: "Documents", href: "/p2p/documents", icon: FileText },
    ];

    // Legal & Compliance (Dropdown)
    const conformiteItems = [
        { name: "Statistiques", href: "/p2p/statistics", icon: TrendingUp },
        { name: "Test d'adéquation", href: "/p2p/suitability", icon: ClipboardCheck },
        { name: "Rétractation", href: "/p2p/cooling-off", icon: RefreshCw },
        { name: "Risques", href: "/p2p/legal/risks", icon: Shield },
        { name: "Frais", href: "/p2p/legal/fees", icon: Receipt },
    ];

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");
    const isConformiteActive = conformiteItems.some(item => isActive(item.href));

    // Auto-open if any conformite page is active
    const shouldShowConformite = isConformiteOpen || isConformiteActive;

    // Render a nav section
    const renderNavSection = (items: typeof coreNavigation, title?: string) => (
        <div>
            {title && (
                <h3 className="px-2 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    {title}
                </h3>
            )}
            <div className="space-y-0.5">
                {items.map((item) => (
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
    );

    return (
        <aside className="hidden lg:flex flex-col w-[260px] shrink-0 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800">
            {/* Custom scrollbar styles */}
            <style jsx>{`
                .sidebar-scroll::-webkit-scrollbar {
                    width: 4px;
                }
                .sidebar-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .sidebar-scroll::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 2px;
                }
                .sidebar-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 0, 0, 0.2);
                }
                :global(.dark) .sidebar-scroll::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                }
                :global(.dark) .sidebar-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>

            <div className="flex flex-col h-full overflow-y-auto sidebar-scroll px-4 py-4">
                {/* Brand/Logo Area with Back Button */}
                <div className="mb-6 px-2">
                    <div className="flex items-center gap-2">
                        <Link
                            href="/p2p"
                            className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                            title="Retour à l'accueil"
                        >
                            <ArrowLeft size={16} className="text-zinc-600 dark:text-zinc-400" />
                        </Link>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Briefcase size={18} className="text-white" />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-zinc-900 dark:text-white">Transpareo P2P</span>
                            <p className="text-[10px] text-zinc-400">Investissement participatif</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-5 flex-1">
                    {/* Core Navigation */}
                    {renderNavSection(coreNavigation)}

                    {/* Finances Section */}
                    {renderNavSection(financesNavigation, "Finances")}

                    {/* Community & Extras */}
                    {renderNavSection(extrasNavigation, "Communauté")}

                    {/* Conformité - Collapsible */}
                    <div>
                        <button
                            onClick={() => setIsConformiteOpen(!shouldShowConformite)}
                            className={clsx(
                                "w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider rounded-md transition-colors",
                                isConformiteActive
                                    ? "text-indigo-600 dark:text-indigo-400"
                                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <Scale size={12} />
                                Conformité
                            </div>
                            <ChevronDown
                                size={14}
                                className={clsx(
                                    "transition-transform duration-200",
                                    shouldShowConformite ? "rotate-0" : "-rotate-90"
                                )}
                            />
                        </button>

                        {/* Animated dropdown with scroll */}
                        <div className={clsx(
                            "transition-all duration-200 ease-in-out",
                            shouldShowConformite ? "max-h-[200px] opacity-100 mt-1 overflow-y-auto" : "max-h-0 opacity-0 overflow-hidden"
                        )}
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: 'rgba(0,0,0,0.1) transparent'
                            }}
                        >
                            <div className="space-y-0.5 pl-2 border-l-2 border-zinc-100 dark:border-zinc-800 ml-2">
                                {conformiteItems.map((item) => (
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
                                        <item.icon size={14} className="text-zinc-400 group-hover:text-zinc-500" />
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Config */}
                <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <Link
                        href="/p2p/settings"
                        className={clsx(
                            "flex items-center gap-3 px-2 py-1.5 text-sm font-medium rounded-md transition-colors",
                            isActive("/p2p/settings")
                                ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                        )}
                    >
                        <Settings size={16} className={isActive("/p2p/settings") ? "text-indigo-600 dark:text-indigo-400" : ""} />
                        Paramètres
                    </Link>
                </div>
            </div>
        </aside>
    );
}

