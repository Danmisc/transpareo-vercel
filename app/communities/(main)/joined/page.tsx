import { getUserCommunities } from "@/lib/community-actions";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { JoinedCommunityCard } from "@/components/community/JoinedCommunityCard";
import { JoinedCommunitiesFilter } from "@/components/community/JoinedCommunitiesFilter";
import { JoinedDashboardClient } from "./JoinedDashboardClient";
import { Globe, Lock, Shield, LayoutDashboard, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function JoinedCommunitiesPage() {
    const session = await auth();
    const user = session?.user;

    // Fetch real user communities
    const { data: communities } = await getUserCommunities(user?.id || "");

    const myCommunities = communities || [];

    const stats = {
        totalJoined: myCommunities.length,
        adminOf: myCommunities.filter(c => c.role === "ADMIN").length,
        moderatorOf: myCommunities.filter(c => c.role === "MODERATOR").length
    };

    return (
        <div className="min-h-full pb-20">
            {/* Dashboard Header */}
            <div className="bg-white dark:bg-zinc-950/50 border-b border-zinc-100 dark:border-zinc-800 pb-8 pt-6 px-4 md:px-8 mb-8">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
                                Tableau de bord
                            </h1>
                            <p className="text-zinc-500 font-medium">
                                Bienvenue, {user?.name || "Utilisateur"}. Voici votre QG communautaire.
                            </p>
                        </div>
                        <Link href="/communities">
                            <Button className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800">
                                <Globe className="mr-2 h-4 w-4" />
                                Explorer
                            </Button>
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800/50">
                            <div className="text-sm text-zinc-500 font-medium mb-1">Communautés</div>
                            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{stats.totalJoined}</div>
                        </div>
                        <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/20">
                            <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-1">Gérées (Admin)</div>
                            <div className="text-2xl font-black text-indigo-700 dark:text-indigo-400">{stats.adminOf}</div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/10 rounded-2xl p-4 border border-purple-100 dark:border-purple-900/20">
                            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">Modérées</div>
                            <div className="text-2xl font-black text-purple-700 dark:text-purple-400">{stats.moderatorOf}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Content - Client Component for Filtering */}
            <div className="max-w-5xl mx-auto px-4 md:px-8">
                <JoinedDashboardClient communities={myCommunities} />
            </div>
        </div>
    );
}

