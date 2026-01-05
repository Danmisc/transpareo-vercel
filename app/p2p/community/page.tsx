import { Suspense } from "react";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { getSocialDashboardData } from "@/lib/actions-p2p-social";
import { CommunityDashboard } from "@/components/p2p/social/CommunityDashboard";
import { Users, Heart, Share2, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function CommunityPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/auth/login");

    const data = await getSocialDashboardData();

    if (!data) return null;

    return (
        <div className="font-sans">
            <div className="space-y-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Centre Communautaire</h1>
                    <p className="text-zinc-500">Échangez, parrainez et bâtissez votre réputation d'investisseur.</p>
                </div>

                {/* Community Pulsar / Global Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 border-none text-white shadow-lg">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Users size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-indigo-100 font-medium">Mon Réseau</p>
                                <p className="text-xl font-bold">{data.referrals.length + data.sentVouches.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-10 w-10 bg-pink-100 dark:bg-pink-900/30 text-pink-600 rounded-full flex items-center justify-center">
                                <Heart size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 font-medium">Confiance</p>
                                <p className="text-xl font-bold text-zinc-900 dark:text-white">{data.trustScore} pts</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center">
                                <Share2 size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 font-medium">Parrainages</p>
                                <p className="text-xl font-bold text-zinc-900 dark:text-white">{data.referrals.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-10 w-10 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center">
                                <Award size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 font-medium">Rang</p>
                                <p className="text-xl font-bold text-zinc-900 dark:text-white">{data.reputation > 0 ? "Initié" : "Nouveau"}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content reusing the Dashboard Component but essentially just wrapping it for now.
                    Ideally we would deconstruct CommunityDashboard to make it fit a full page better, 
                    but CommunityDashboard already has a responsive grid layout that works well.
                */}
                <CommunityDashboard data={data} />
            </div>
        </div>
    );
}
