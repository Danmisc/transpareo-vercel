import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { getImpactStats, getImpactHistory, getImpactCertificate } from "@/lib/actions-impact";
import { ImpactDashboard } from "@/components/p2p/ImpactDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, Award, ExternalLink, Leaf } from "lucide-react";
import Link from "next/link";

export default async function ImpactPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    // Fetch real data
    const [stats, history, certificate] = await Promise.all([
        getImpactStats(),
        getImpactHistory(12),
        getImpactCertificate()
    ]);

    if (!stats) return null;

    // Calculate progress toward carbon neutrality goal
    const neutralityGoal = 5; // 5 tons CO2 = carbon neutral for average person
    const progressPercent = Math.min((stats.co2Saved / neutralityGoal) * 100, 100);
    const remainingProjects = Math.ceil((neutralityGoal - stats.co2Saved) / 0.5); // ~0.5t per project avg

    return (
        <div className="min-h-screen bg-zinc-50/[0.3] dark:bg-black font-sans pb-12 relative">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-6xl mx-auto px-6 py-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-4 uppercase tracking-wider">
                        <Leaf size={14} /> Impact Réel Calculé
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white mb-2">
                        Votre Impact <span className="text-emerald-600">Environnemental</span>
                    </h1>
                    <p className="text-zinc-500 max-w-2xl">
                        Au-delà du rendement financier, voici la trace positive que votre capital laisse sur l'économie réelle et l'environnement.
                    </p>
                </div>

                {/* Impact Dashboard with real data */}
                <div className="mb-8">
                    <ImpactDashboard stats={stats} history={history} />
                </div>

                {/* Certificate & Goals Section */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Impact Certificate */}
                    <Card className="bg-gradient-to-br from-zinc-900 to-black text-white border-none shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]" />
                        <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full min-h-[280px]">
                            <div>
                                <h3 className="text-xl font-bold mb-2">Certificat d'Impact {certificate?.year}</h3>
                                <p className="text-zinc-400 text-sm">
                                    Officialisez votre contribution à la transition énergétique.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-black font-bold text-xl">
                                            T.
                                        </div>
                                        <div>
                                            <p className="font-bold">{certificate?.userName}</p>
                                            <p className="text-xs text-zinc-400">ID: {certificate?.certificateId}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11"
                                        disabled={stats.projectCount === 0}
                                    >
                                        <Download size={16} className="mr-2" />
                                        {stats.projectCount > 0 ? "Télécharger PDF" : "Investissez d'abord"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="border-white/20 hover:bg-white/10 text-white h-11 w-11 p-0"
                                        disabled={stats.projectCount === 0}
                                    >
                                        <Share2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Carbon Neutrality Goal */}
                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <CardContent className="p-6 flex flex-col justify-center h-full text-center space-y-5">
                            <div className="mx-auto h-16 w-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                                <Award size={32} className="text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
                                    Objectif Neutralité Carbone
                                </h3>
                                <p className="text-zinc-500 text-sm">
                                    Vous êtes à <span className="text-emerald-600 font-bold">{Math.round(progressPercent)}%</span> de votre objectif annuel.
                                </p>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full">
                                <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                <p className="text-xs text-zinc-400 mt-2">
                                    {stats.co2Saved.toFixed(1)}t / {neutralityGoal}t CO2 compensé
                                </p>
                            </div>

                            {progressPercent < 100 && (
                                <p className="text-sm text-zinc-500">
                                    Investissez dans <span className="font-bold text-emerald-600">{remainingProjects} projets verts</span> pour atteindre 100%.
                                </p>
                            )}

                            <Link href="/p2p/market">
                                <Button variant="outline" className="mx-auto">
                                    <ExternalLink size={14} className="mr-2" />
                                    Voir les projets verts
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

