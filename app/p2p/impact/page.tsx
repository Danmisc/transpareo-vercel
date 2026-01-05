import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { ImpactDashboard } from "@/components/p2p/ImpactDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, Award } from "lucide-react";

export default async function ImpactPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/auth/login");

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans transition-colors duration-500">
            {/* Header handled by layout */}

            <div className="container mx-auto px-4 pt-24 pb-20">
                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-4 uppercase tracking-wider">
                        <Award size={14} /> Investisseur Responsable
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white mb-4">
                        Votre Impact <span className="text-emerald-600">Réel</span>.
                    </h1>
                    <p className="text-xl text-zinc-500 max-w-2xl">
                        Au-delà du rendement financier, voici la trace positive que votre capital laisse sur l'économie réelle et l'environnement.
                    </p>
                </div>

                {/* Reusing the dashboard component as the main stats block */}
                <div className="mb-12">
                    <ImpactDashboard />
                </div>

                {/* New Section: Impact Certificate */}
                <div className="grid md:grid-cols-2 gap-8">
                    <Card className="bg-gradient-to-br from-zinc-900 to-black text-white border-none shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]" />
                        <CardContent className="p-8 relative z-10 flex flex-col justify-between h-full min-h-[300px]">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Certificat d'Impact 2024</h3>
                                <p className="text-zinc-400">
                                    Officialisez votre contribution à la transition énergétique. Un document vérifié par Transpareo, prêt à être partagé.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-black font-bold text-xl">
                                            T.
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">Certificat Vérifié</p>
                                            <p className="text-xs text-zinc-400">ID: IMP-2024-88392</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12">
                                        <Download size={18} className="mr-2" /> Télécharger PDF
                                    </Button>
                                    <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white h-12 w-12 p-0">
                                        <Share2 size={18} />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10">
                        <CardContent className="p-8 flex flex-col justify-center h-full text-center space-y-6">
                            <div className="mx-auto h-20 w-20 bg-zinc-100 dark:bg-white/5 rounded-full flex items-center justify-center text-zinc-400">
                                <Award size={40} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Objectifs 2025</h3>
                                <p className="text-zinc-500 mt-2">
                                    Vous êtes à <span className="text-emerald-600 font-bold">45%</span> de votre objectif annuel de neutralité carbone. Investissez dans 2 projets "Rénovation Globale" pour atteindre les 100%.
                                </p>
                            </div>
                            <Button variant="outline" className="mx-auto">
                                Voir les projets verts
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
