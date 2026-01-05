import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { getAutoInvestSettings } from "@/lib/actions-p2p-invest";
import { AutoInvestConfig } from "@/components/p2p/AutoInvestConfig";
import { Bot, Zap, Shield, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function AutoInvestPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/auth/login");

    const settings = await getAutoInvestSettings();

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans transition-colors duration-500">
            <Header />
            <div className="container mx-auto px-4 pt-32 pb-20">
                <div className="max-w-5xl mx-auto space-y-12">

                    {/* Hero Section */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm mb-4">
                            <Bot size={16} /> Transpareo Robot v2.0
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white">
                            Investissez en <span className="text-blue-600">Auto-Pilote</span>.
                        </h1>
                        <p className="text-xl text-zinc-500 max-w-2xl mx-auto">
                            Définissez vos critères, validez votre budget, et laissez nos algorithmes saisir les meilleures opportunités pour vous en milisecondes.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Configuration Panel */}
                        <div className="lg:col-span-2">
                            <AutoInvestConfig initialSettings={settings} />
                        </div>

                        {/* Aside / Benefits */}
                        <div className="space-y-6">
                            <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-xl">
                                <CardContent className="p-6">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <Zap className="text-yellow-300" /> Vitesse d'exécution
                                    </h3>
                                    <p className="text-blue-100 text-sm leading-relaxed">
                                        Les meilleurs projets partent en quelques secondes. Le robot place vos fonds instantanément à l'ouverture de la collecte, vous garantissant une place sur les deals "Gold".
                                    </p>
                                </CardContent>
                            </Card>

                            <div className="space-y-4">
                                <div className="flex gap-4 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10">
                                    <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                                        <Shield size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-zinc-900 dark:text-white text-sm">Diversification Forcée</h4>
                                        <p className="text-xs text-zinc-500 mt-1">
                                            Le robot respecte strictement vos limites par projet, assurant une diversification saine sans effort.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10">
                                    <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg flex items-center justify-center shrink-0">
                                        <TrendingUp size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-zinc-900 dark:text-white text-sm">Réinvestissement (Compound)</h4>
                                        <p className="text-xs text-zinc-500 mt-1">
                                            Vos remboursements mensuels sont immédiatement réinvestis, maximisant l'effet des intérêts composés.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
