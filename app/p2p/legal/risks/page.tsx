import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    AlertTriangle,
    ShieldX,
    TrendingDown,
    Clock,
    Building2,
    Scale,
    Info,
    ChevronRight
} from "lucide-react";
import Link from "next/link";

export default function RiskDisclosurePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-950">
            <div className="max-w-4xl mx-auto px-6 py-12">

                {/* Header */}
                <div className="mb-12 text-center">
                    <Badge className="mb-4 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        <AlertTriangle size={14} className="mr-1" /> Document Obligatoire
                    </Badge>
                    <h1 className="text-4xl font-bold mb-4">Notice des Risques</h1>
                    <p className="text-zinc-500 max-w-2xl mx-auto mb-4">
                        Conformément à l'article 19 du règlement UE 2020/1503 (ECSPR), nous vous informons des risques
                        liés à l'investissement en prêt participatif.
                    </p>
                    <p className="text-xs text-zinc-400">
                        Version 1.2 • Mise à jour : Janvier 2026
                    </p>
                </div>

                {/* Critical Warning */}
                <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-300 dark:border-red-800 rounded-2xl p-8 mb-12">
                    <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                            <ShieldX className="text-red-600" size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-3">
                                ⚠️ Avertissement Important
                            </h2>
                            <p className="text-red-700 dark:text-red-300 text-lg leading-relaxed">
                                Le prêt participatif présente un <strong>risque de perte partielle ou totale du capital investi</strong>.
                                N'investissez que des sommes dont vous pouvez vous permettre de perdre l'intégralité.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Risk Categories */}
                <div className="space-y-8 mb-12">

                    {/* Risk 1: Capital Loss */}
                    <Card className="border-zinc-200 dark:border-zinc-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                    <TrendingDown className="text-red-600" size={20} />
                                </div>
                                Risque de Perte en Capital
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Le porteur de projet (emprunteur) peut ne pas être en mesure de rembourser tout ou partie
                                des sommes dues. En cas de défaillance de l'emprunteur :
                            </p>
                            <ul className="space-y-2 text-zinc-700 dark:text-zinc-300">
                                <li className="flex items-start gap-2">
                                    <ChevronRight size={16} className="mt-1 text-red-500 shrink-0" />
                                    <span>Vous pouvez perdre l'intégralité du capital investi</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <ChevronRight size={16} className="mt-1 text-red-500 shrink-0" />
                                    <span>Les intérêts promis peuvent ne jamais être versés</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <ChevronRight size={16} className="mt-1 text-red-500 shrink-0" />
                                    <span>Le recouvrement des fonds peut être long et incertain</span>
                                </li>
                            </ul>
                            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    <strong>Taux de défaut historique de la plateforme :</strong> Consultez notre
                                    <Link href="/p2p/statistics" className="underline ml-1">page statistiques</Link>
                                    pour les données actuelles.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Risk 2: Liquidity */}
                    <Card className="border-zinc-200 dark:border-zinc-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                    <Clock className="text-amber-600" size={20} />
                                </div>
                                Risque de Liquidité
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Les fonds investis sont immobilisés pendant toute la durée du prêt.
                            </p>
                            <ul className="space-y-2 text-zinc-700 dark:text-zinc-300">
                                <li className="flex items-start gap-2">
                                    <ChevronRight size={16} className="mt-1 text-amber-500 shrink-0" />
                                    <span>Vous ne pouvez pas retirer votre investissement avant l'échéance</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <ChevronRight size={16} className="mt-1 text-amber-500 shrink-0" />
                                    <span>Il n'existe pas de marché secondaire garanti pour revendre vos créances</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <ChevronRight size={16} className="mt-1 text-amber-500 shrink-0" />
                                    <span>En cas de besoin urgent de liquidités, vous ne pourrez pas récupérer vos fonds</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Risk 3: Project Risk */}
                    <Card className="border-zinc-200 dark:border-zinc-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <Building2 className="text-blue-600" size={20} />
                                </div>
                                Risque lié au Projet
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Chaque projet de financement comporte des risques spécifiques :
                            </p>
                            <ul className="space-y-2 text-zinc-700 dark:text-zinc-300">
                                <li className="flex items-start gap-2">
                                    <ChevronRight size={16} className="mt-1 text-blue-500 shrink-0" />
                                    <span>Risques liés à l'activité de l'emprunteur (conjoncture, concurrence)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <ChevronRight size={16} className="mt-1 text-blue-500 shrink-0" />
                                    <span>Risques liés au secteur d'activité (immobilier, commerce, énergie)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <ChevronRight size={16} className="mt-1 text-blue-500 shrink-0" />
                                    <span>Risques opérationnels et de gestion du projet</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Risk 4: Platform Risk */}
                    <Card className="border-zinc-200 dark:border-zinc-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                    <Scale className="text-purple-600" size={20} />
                                </div>
                                Risque lié à la Plateforme
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-zinc-600 dark:text-zinc-400">
                                La plateforme elle-même peut être confrontée à des difficultés :
                            </p>
                            <ul className="space-y-2 text-zinc-700 dark:text-zinc-300">
                                <li className="flex items-start gap-2">
                                    <ChevronRight size={16} className="mt-1 text-purple-500 shrink-0" />
                                    <span>En cas de défaillance de la plateforme, le suivi des prêts peut être compromis</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <ChevronRight size={16} className="mt-1 text-purple-500 shrink-0" />
                                    <span>Les fonds sont ségrégués conformément à la réglementation ECSPR</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <ChevronRight size={16} className="mt-1 text-purple-500 shrink-0" />
                                    <span>Un plan de continuité d'activité est en place</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* No Guarantee Notice */}
                <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-8 mb-12">
                    <div className="flex items-start gap-4">
                        <Info className="text-zinc-500 shrink-0" size={24} />
                        <div>
                            <h3 className="font-bold text-lg mb-2">Absence de Garantie</h3>
                            <p className="text-zinc-600 dark:text-zinc-400">
                                <strong>Les investissements en prêt participatif ne bénéficient d'aucune garantie de l'État
                                    ni du Fonds de Garantie des Dépôts et de Résolution (FGDR).</strong> Contrairement aux dépôts
                                bancaires, votre capital n'est pas protégé en cas de défaillance.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10 mb-12">
                    <CardHeader>
                        <CardTitle className="text-emerald-800 dark:text-emerald-200">
                            ✅ Recommandations pour investir de manière avisée
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 text-emerald-700 dark:text-emerald-300">
                            <li className="flex items-start gap-2">
                                <span className="font-bold">1.</span>
                                <span><strong>Diversifiez :</strong> Répartissez vos investissements sur plusieurs projets et types</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold">2.</span>
                                <span><strong>Limitez :</strong> N'investissez pas plus de 10% de votre patrimoine en crowdfunding</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold">3.</span>
                                <span><strong>Comprenez :</strong> Lisez attentivement les documents de chaque projet</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold">4.</span>
                                <span><strong>Horizon :</strong> N'investissez que des fonds dont vous n'aurez pas besoin avant l'échéance</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                {/* CTA */}
                <div className="text-center">
                    <Link href="/p2p/statistics">
                        <Button variant="outline" className="mr-4">
                            Voir les statistiques
                        </Button>
                    </Link>
                    <Link href="/p2p/market">
                        <Button className="bg-orange-600 hover:bg-orange-500">
                            Voir les projets
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

