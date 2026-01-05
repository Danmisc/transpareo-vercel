import Link from "next/link";
import { Search, Bell, MessageCircle, User, Home, Compass, Film, FileText, Crown, Key } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { DEMO_USER_ID } from "@/lib/constants";

import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "./UserDropdown";
import { GoLiveButton } from "@/components/feed/GoLiveButton";
import { StickyNav } from "./StickyNav";

export async function Header() {
    const session = await auth();
    const userId = session?.user?.id;

    return (
        <StickyNav>
            <div className="container flex h-14 items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* --- LOGO (Mobile & Desktop) --- */}
                <div className="flex items-center">
                    <Link className="flex items-center space-x-2 transition-transform hover:scale-105 active:scale-95" href="/">
                        <div className="bg-primary/10 p-1.5 rounded-lg">
                            <Home className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Transpareo</span>
                    </Link>

                    {/* --- DESKTOP NAV LINKS --- */}
                    <nav className="hidden md:flex items-center ml-8 space-x-1">
                        <Link href="/marketplace" className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                            Immobilier
                        </Link>
                        <Link href="/p2p" className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                            Prêts P2P
                        </Link>
                        {/* Reels moved to Left Sidebar */}
                        <div className="h-4 w-px bg-border mx-2" />
                        <Link href="/dossier" className="px-3 py-2 rounded-md text-sm font-medium text-orange-600 hover:bg-orange-50 transition-colors">
                            Locataire
                        </Link>
                        <Link href="/owner" className="px-3 py-2 rounded-md text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors">
                            Propriétaire
                        </Link>
                    </nav>
                </div>

                {/* --- SEARCH (Desktop Only - Mobile has it in bottom nav or separate page) --- */}
                <div className="hidden md:flex flex-1 max-w-md ml-8">
                    <GlobalSearch />
                </div>

                {/* --- ACTIONS --- */}
                <div className="flex items-center space-x-2">
                    {/* Mobile: Just Messages */}
                    <Link href="/messages" className="md:hidden">
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <MessageCircle className="h-5 w-5" />
                        </Button>
                    </Link>

                    {/* Desktop: Full Suite */}
                    <div className="hidden md:flex items-center space-x-2">
                        {userId ? (
                            <>
                                <Link href="/messages">
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                                        <MessageCircle className="h-5 w-5" />
                                    </Button>
                                </Link>
                                <NotificationCenter userId={userId} />
                                <div className="h-4 w-px bg-border mx-1" />
                                <UserDropdown
                                    user={{
                                        id: userId,
                                        name: session.user?.name,
                                        email: session.user?.email,
                                        image: session.user?.image
                                    }}
                                />
                                {/* GoLive moved to Right Sidebar */}
                            </>
                        ) : (
                            <Link href="/login">
                                <Button size="sm">Se connecter</Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </StickyNav>
    );
}
