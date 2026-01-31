import { auth } from "@/lib/auth";
import { getCommunityDetailsForManagement } from "@/lib/community-management-actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    ShieldAlert,
    Settings,
    BarChart3,
    ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "./nav-link";
import { DashboardHeader } from "./dashboard-header";

interface ManageLayoutProps {
    children: React.ReactNode;
    params: Promise<{
        slug: string;
    }>;
}

export default async function ManageLayout({ children, params }: ManageLayoutProps) {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const { slug } = await params;
    const { success, data: community } = await getCommunityDetailsForManagement(slug, session.user.id);

    if (!success || !community) {
        // If not found or access denied
        redirect(`/communities/${slug}`); // Or 404
    }

    const navigation: { name: string; href: string; iconName: "overview" | "members" | "moderation" | "analytics" | "settings" }[] = [
        { name: "Vue d'ensemble", href: `/communities/${slug}/manage`, iconName: "overview" },
        { name: "Membres", href: `/communities/${slug}/manage/members`, iconName: "members" },
        { name: "Rôles", href: `/communities/${slug}/manage/roles`, iconName: "settings" },
        { name: "Modération", href: `/communities/${slug}/manage/moderation`, iconName: "moderation" },
        { name: "Statistiques", href: `/communities/${slug}/manage/analytics`, iconName: "analytics" },
        { name: "Paramètres", href: `/communities/${slug}/manage/settings`, iconName: "settings" },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex bg-slate-50 dark:bg-black overflow-hidden">
            {/* TEXT SIDEBAR - Restored */}
            <aside className="w-64 border-r bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 flex flex-col flex-shrink-0">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                    <Link
                        href={`/communities/${slug}`}
                        className="flex items-center text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour à la Communauté
                    </Link>
                    <h2 className="font-semibold text-lg text-zinc-900 dark:text-white truncate">
                        {community.name}
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Tableau de Bord</p>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navigation.map((item) => (
                        <NavLink key={item.name} item={item} />
                    ))}
                </nav>

                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-xs">
                            {session.user.name?.[0] || "U"}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                                {session.user.name}
                            </p>
                            <p className="text-xs text-zinc-500 truncate">Modérateur</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-black">
                {/* Enhanced Top Navbar */}
                <DashboardHeader communityName={community.name} communitySlug={slug} />

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-8 max-w-6xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
