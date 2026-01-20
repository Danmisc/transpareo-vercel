"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ExpandableSearch } from "@/components/search/ExpandableSearch";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { UserDropdown } from "./UserDropdown";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { Home, Building2, Wallet, FileText, Key, MessageCircle, TrendingUp, ShieldCheck, Users, ChevronDown, ArrowRight, Compass, Bell, Share2, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper Component defined BEFORE usage
function MenuLink({ href, title, desc, icon, box, simple }: { href: string, title: string, desc?: string, icon?: React.ReactNode, box?: boolean, simple?: boolean }) {
    if (simple) {
        return (
            <Link href={href} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-orange-600 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                {title}
            </Link>
        )
    }
    return (
        <Link href={href} className={cn(
            "group flex items-start gap-3 rounded-lg transition-all",
            box ? "bg-zinc-50 dark:bg-zinc-900/50 p-3 hover:bg-orange-50 dark:hover:bg-orange-950/20 border border-transparent hover:border-orange-200 dark:hover:border-orange-800" : "p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        )}>
            {icon && (
                <div className={cn(
                    "shrink-0 rounded-md flex items-center justify-center transition-colors",
                    box ? "bg-white dark:bg-zinc-800 p-2 shadow-sm" : "p-1"
                )}>
                    {icon}
                </div>
            )}
            <div>
                <div className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-amber-600 transition-colors">{title}</div>
                {desc && <div className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">{desc}</div>}
            </div>
        </Link>
    );
}

interface HeaderProps {
    user?: any; // Kept for backwards compatibility but we'll use useSession
    transparent?: boolean;
}

export function Header({ user: userProp, transparent = false }: HeaderProps) {
    // Use session hook for reliable client-side session
    const { data: session, status } = useSession();
    const user = session?.user || userProp; // Fallback to prop if hook not ready

    const { isAtTop, scrollDirection } = useScrollDirection();
    const isHidden = scrollDirection === "down" && !isAtTop;
    const isTransparentState = transparent && isAtTop;

    // Hover state
    const [activeTab, setActiveTab] = React.useState<string | null>(null);

    const textColor = isTransparentState ? "text-white" : "text-zinc-900 dark:text-white";
    const navItemColor = isTransparentState ? "text-white/80 hover:text-white" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white";

    const navItems = [
        {
            id: "immobilier",
            label: "Immobilier",
            content: (
                <div className="flex w-[600px] gap-2 p-2">
                    <Link href="/marketplace" className="w-[220px] shrink-0 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-5 flex flex-col justify-between text-white shadow-lg group/card hover:shadow-orange-500/25 transition-all">
                        <div>
                            <div className="font-bold text-lg mb-2">Marketplace</div>
                            <p className="text-xs text-white/90 leading-relaxed mb-4">
                                Accédez à la plus grande base de données immobilière vérifiée.
                            </p>
                        </div>
                        <div className="flex items-center justify-between">
                            <Building2 className="text-white/80" size={32} />
                            <div className="bg-white/20 p-1.5 rounded-full group-hover/card:bg-white/30 transition-colors">
                                <ArrowRight size={14} />
                            </div>
                        </div>
                    </Link>
                    <div className="flex-1 grid grid-cols-1 gap-1 p-1">
                        <MenuLink href="/marketplace/create" title="Vendre mon bien" desc="Estimation IA & mise en relation expert." icon={<Home size={18} className="text-orange-500" />} />
                        <MenuLink href="/marketplace/map" title="Carte interactive" desc="Explorez les prix par quartier." icon={<Compass size={18} className="text-blue-500" />} />
                        <MenuLink href="/marketplace/alerts" title="Alertes en temps réel" desc="Ne ratez aucune opportunité." icon={<Bell size={18} className="text-amber-500" />} />
                    </div>
                </div>
            )
        },
        {
            id: "p2p",
            label: "Prêts P2P",
            content: (
                <div className="w-[500px] p-4">
                    <div className="grid grid-cols-2 gap-3">
                        <MenuLink box icon={<TrendingUp className="text-green-600" size={20} />} href="/p2p" title="Investir (10-12%)" desc="Crowdfunding immobilier dès 100€." />
                        <MenuLink box icon={<Wallet className="text-blue-600" size={20} />} href="/p2p/borrow" title="Je veux emprunter" desc="Financement rapide 24h." />
                    </div>
                    <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-3">
                        <MenuLink simple href="/p2p/statistics" title="Statistiques de performance" />
                        <MenuLink simple href="/p2p/impact" title="Impact & Responsabilité" />
                    </div>
                </div>
            )
        },
        {
            id: "gestion",
            label: "Gestion Locative",
            content: (
                <div className="flex w-[550px] gap-2 p-2">
                    <div className="flex-1 p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl space-y-1">
                        <div className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">Locataire</div>
                        <MenuLink href="/dossier" title="Mon Dossier Facile" desc="Créez votre dossier unique." icon={<FileText className="text-indigo-500" size={18} />} />
                        <MenuLink href="/dossier/share" title="Partager mon dossier" desc="Envoi sécurisé aux proprios." icon={<Share2 className="text-indigo-400" size={18} />} />
                    </div>
                    <div className="flex-1 p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl space-y-1">
                        <div className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">Propriétaire</div>
                        <MenuLink href="/owner" title="Tableau de bord" desc="Suivi des loyers & quittances." icon={<Key className="text-emerald-500" size={18} />} />
                        <MenuLink href="/owner/properties" title="Mes annonces" desc="Gérez vos biens en location." icon={<LayoutGrid className="text-emerald-400" size={18} />} />
                    </div>
                </div>
            )
        }
    ];

    const backgroundVariants = {
        top: {
            opacity: 0,
            width: "100%",
            maxWidth: "100%",
            height: "100%",
            top: 0,
            borderRadius: "0px",
            backgroundColor: "rgba(255, 255, 255, 0)",
            boxShadow: "0 0 0 rgba(0,0,0,0)",
            backdropFilter: "blur(0px)",
            transition: {
                opacity: { duration: 0.3 },
                default: { duration: 0.6, ease: "easeInOut" }
            }
        },
        scrolled: {
            opacity: 1,
            width: "1200px",
            maxWidth: "92%",
            height: "56px",
            top: 12,
            borderRadius: "99px",
            backgroundColor: "var(--header-bg-scrolled)", // Dynamic Theme (CSS Var)
            boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(16px)",
            transition: {
                duration: 0.6,
                type: "spring", stiffness: 60, damping: 20
            }
        }
    };

    return (
        <React.Fragment>
            <header className="fixed top-0 left-0 right-0 z-50 h-20 flex justify-center pointer-events-none">

                {/* 2. THE FLOATING ISLAND (Background Layer) */}
                <motion.div
                    className="absolute z-0 pointer-events-auto"
                    initial="top"
                    animate={isTransparentState ? "top" : "scrolled"}
                    variants={backgroundVariants}
                    style={{ left: "50%", x: "-50%" }}
                />

                {/* 3. CONTENT LAYER (Foreground) */}
                <motion.div
                    className="relative z-10 w-full max-w-[1200px] px-6 h-full flex items-center justify-between pointer-events-auto"
                    onMouseLeave={() => setActiveTab(null)}
                >
                    {/* LEFT: Logo & Nav */}
                    <div className="flex items-center gap-6 h-10">
                        <Link href="/" className="flex items-center gap-2 shrink-0">
                            <div className={cn(
                                "p-1.5 rounded-lg transition-all duration-300",
                                isTransparentState ? "bg-white/20 hover:bg-white/30" : "bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-500/20 shadow-lg"
                            )}>
                                <Home size={16} className="text-white" />
                            </div>
                            <span className={cn("font-bold text-lg tracking-tight", textColor)}>
                                Transpareo
                            </span>
                        </Link>

                        <div className={cn("h-4 w-px", isTransparentState ? "bg-white/30" : "bg-zinc-200 dark:bg-zinc-800")} />

                        <nav className="hidden md:flex items-center gap-1 h-full">
                            {navItems.map((item) => (
                                <div key={item.id} className="relative h-full flex items-center" onMouseEnter={() => setActiveTab(item.id)}>
                                    <button
                                        className={cn(
                                            "relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 z-10",
                                            navItemColor,
                                            activeTab === item.id ? (isTransparentState ? "text-black" : "text-black dark:text-white") : ""
                                        )}
                                    >
                                        {item.label}
                                        {activeTab === item.id && (
                                            <motion.div
                                                layoutId="nav-pill"
                                                className={cn(
                                                    "absolute inset-0 rounded-full -z-10",
                                                    isTransparentState ? "bg-white" : "bg-zinc-100 dark:bg-zinc-800"
                                                )}
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                    </button>

                                    {/* DROPDOWN - MOVED INSIDE RELATIVE CONTAINER */}
                                    <AnimatePresence>
                                        {activeTab === item.id && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.98, y: 10 }}
                                                transition={{ type: "spring", bounce: 0, duration: 0.25 }}
                                                className="absolute top-[calc(100%+12px)] left-0 bg-white dark:bg-zinc-950 rounded-2xl shadow-xl border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden origin-top-left z-50 min-w-max"
                                                style={{ left: -20 }} // Slight offset for visual alignment with text start
                                            >
                                                <div className="absolute -top-6 left-0 right-0 h-6 bg-transparent" />
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 10 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    {item.content}
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}

                            {/* Pricing Link with Gradient Effect */}
                            <Link
                                href="/pricing"
                                onMouseEnter={() => setActiveTab(null)}
                                className={cn(
                                    "relative px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200",
                                    "bg-gradient-to-r from-orange-500 to-amber-500 text-white",
                                    "hover:shadow-lg hover:shadow-orange-500/25 hover:scale-105"
                                )}
                            >
                                Tarifs
                            </Link>
                        </nav>
                    </div>

                    {/* RIGHT: Actions */}
                    <div className="flex items-center justify-end gap-3 h-10">
                        <ExpandableSearch />
                        {user ? (
                            <>
                                <Link href="/messages">
                                    <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full group hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                        <motion.div
                                            whileHover={{ y: -2, rotate: 5 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <MessageCircle className="h-5 w-5 text-zinc-600 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white transition-colors" />
                                        </motion.div>
                                    </Button>
                                </Link>
                                <NotificationCenter userId={user.id} />
                                <UserDropdown user={user} />
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm" className={cn("hidden sm:flex h-8", isTransparentState ? "text-white hover:bg-white/10 hover:text-white" : "")}>
                                        Connexion
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm" className="rounded-full font-bold bg-white text-black hover:bg-zinc-100 h-8 px-4 text-xs">
                                        S'inscrire
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.div>
            </header>
        </React.Fragment>
    );
}

