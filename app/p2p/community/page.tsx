import { Suspense } from "react";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { getSocialDashboardData } from "@/lib/actions-p2p-social";
import { CommunityDashboard } from "@/components/p2p/social/CommunityDashboard";
import { Users, Heart, Share2, Award, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function CommunityPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const data = await getSocialDashboardData();

    if (!data) return null;

    return (
        <div className="min-h-screen bg-zinc-50/[0.3] dark:bg-black font-sans pb-12 relative">
            {/* Ambient Background - Indigo/Purple Theme */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">

                {/* Compact Header */}
                <div className="mb-6">
                    <Badge className="mb-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-none px-2.5 py-0.5 text-xs">
                        <Users size={12} className="mr-1.5" /> Social Hub
                    </Badge>
                    <h1 className="text-2xl font-black text-zinc-900 dark:text-white mb-1">
                        Centre Communautaire
                    </h1>
                    <p className="text-xs text-zinc-500 max-w-lg">
                        Développez votre réseau, parrainez des amis et améliorez votre score de confiance.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Community Pulsar / Global Stats Bar Compact */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 border-none text-white shadow-lg overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-[20px]" />
                            <CardContent className="p-4 flex items-center gap-3 relative z-10">
                                <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shrink-0">
                                    <Users size={16} />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-wider mb-0.5 truncate">Mon Réseau</p>
                                    <p className="text-xl font-black">{data.referrals.length + data.sentVouches.length}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="h-8 w-8 bg-pink-50 dark:bg-pink-900/10 text-pink-600 rounded-full flex items-center justify-center shrink-0 border border-pink-100 dark:border-pink-900/20">
                                    <Heart size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Confiance</p>
                                    <p className="text-xl font-bold text-zinc-900 dark:text-white">{data.trustScore} <span className="text-xs font-medium text-zinc-400">pts</span></p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="h-8 w-8 bg-blue-50 dark:bg-blue-900/10 text-blue-600 rounded-full flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/20">
                                    <Share2 size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Parrainages</p>
                                    <p className="text-xl font-bold text-zinc-900 dark:text-white">{data.referrals.length}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="h-8 w-8 bg-amber-50 dark:bg-amber-900/10 text-amber-600 rounded-full flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/20">
                                    <Award size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Rang</p>
                                    <p className="text-xl font-bold text-zinc-900 dark:text-white truncate">{(data.reputation ?? 0) > 0 ? "Initié" : "Nouveau"}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <CommunityDashboard data={data} />
                </div>
            </div>
        </div>
    );
}

