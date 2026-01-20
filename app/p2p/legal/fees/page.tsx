import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Receipt,
    TrendingUp,
    TrendingDown,
    CreditCard,
    PiggyBank,
    ArrowRightLeft,
    CheckCircle,
    Info
} from "lucide-react";
import Link from "next/link";

export default function FeesPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-950">
            <div className="max-w-4xl mx-auto px-6 py-12">

                {/* Header */}
                <div className="mb-12 text-center">
                    <Badge className="mb-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        <Receipt size={14} className="mr-1" /> Transparence des Frais
                    </Badge>
                    <h1 className="text-4xl font-bold mb-4">Grille Tarifaire</h1>
                    <p className="text-zinc-500 max-w-2xl mx-auto">
                        Conformément à la réglementation, nous vous informons de manière claire et exhaustive
                        sur l'ensemble des frais liés à nos services.
                    </p>
                </div>

                {/* Investor Fees */}
                <Card className="border-emerald-200 dark:border-emerald-800 mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <TrendingUp className="text-emerald-600" size={20} />
                            </div>
                            Investisseur
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="text-emerald-600" size={20} />
                                    <div>
                                        <p className="font-medium">Inscription & Investissement</p>
                                        <p className="text-sm text-zinc-500">Ouverture de compte et investissements</p>
                                    </div>
                                </div>
                                <span className="text-2xl font-bold text-emerald-600">GRATUIT</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <CreditCard size={20} className="text-zinc-400" />
                                    <div>
                                        <p className="font-medium">Investissement par carte</p>
                                        <p className="text-sm text-zinc-500">Visa, Mastercard via Stripe Checkout</p>
                                    </div>
                                </div>
                                <span className="text-xl font-bold text-emerald-600">0 €</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <PiggyBank size={20} className="text-zinc-400" />
                                    <div>
                                        <p className="font-medium">Retrait des gains</p>
                                        <p className="text-sm text-zinc-500">Virement vers votre compte bancaire</p>
                                    </div>
                                </div>
                                <span className="text-xl font-bold text-emerald-600">0 €</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <ArrowRightLeft size={20} className="text-zinc-400" />
                                    <div>
                                        <p className="font-medium">Réinvestissement des gains</p>
                                        <p className="text-sm text-zinc-500">Depuis votre solde disponible</p>
                                    </div>
                                </div>
                                <span className="text-xl font-bold text-emerald-600">0 €</span>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                            <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
                                <Info size={16} className="mt-0.5 shrink-0" />
                                <span>
                                    <strong>Aucune commission sur les intérêts perçus.</strong>
                                    Les taux affichés sur les projets correspondent au rendement brut que vous percevrez.
                                </span>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Borrower Fees */}
                <Card className="border-orange-200 dark:border-orange-800 mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <TrendingDown className="text-orange-600" size={20} />
                            </div>
                            Emprunteur
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                                <div>
                                    <p className="font-medium">Étude de dossier</p>
                                    <p className="text-sm text-zinc-500">Analyse de votre demande de financement</p>
                                </div>
                                <span className="text-xl font-bold text-emerald-600">GRATUIT</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                                <div>
                                    <p className="font-medium">Frais de dossier</p>
                                    <p className="text-sm text-zinc-500">Prélevés uniquement en cas de succès du financement</p>
                                </div>
                                <span className="text-xl font-bold">3% à 5%</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                                <div>
                                    <p className="font-medium">Frais de gestion annuels</p>
                                    <p className="text-sm text-zinc-500">Sur le capital restant dû</p>
                                </div>
                                <span className="text-xl font-bold">1%</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                                <div>
                                    <p className="font-medium">Remboursement anticipé</p>
                                    <p className="text-sm text-zinc-500">Pénalité sur le capital remboursé par anticipation</p>
                                </div>
                                <span className="text-xl font-bold">2%</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800">
                                <div>
                                    <p className="font-medium text-amber-800 dark:text-amber-200">Pénalités de retard</p>
                                    <p className="text-sm text-amber-600 dark:text-amber-400">Par jour de retard sur une échéance</p>
                                </div>
                                <span className="text-xl font-bold text-amber-700">0.1%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Secondary Market */}
                <Card className="border-zinc-200 dark:border-zinc-800 mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <ArrowRightLeft className="text-purple-600" size={20} />
                            </div>
                            Marché Secondaire
                            <Badge variant="outline">À venir</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                                <div>
                                    <p className="font-medium">Mise en vente d'une créance</p>
                                    <p className="text-sm text-zinc-500">Publication sur le marché secondaire</p>
                                </div>
                                <span className="text-xl font-bold text-emerald-600">0 €</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                                <div>
                                    <p className="font-medium">Commission sur vente</p>
                                    <p className="text-sm text-zinc-500">Prélevée sur le montant de la transaction</p>
                                </div>
                                <span className="text-xl font-bold">1%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notes */}
                <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-6 mb-8">
                    <h3 className="font-semibold mb-4">Notes importantes</h3>
                    <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <li>• Les frais de dossier emprunteur varient selon le profil de risque et le montant demandé.</li>
                        <li>• Les frais de carte bancaire sont facturés par notre prestataire de paiement.</li>
                        <li>• Les virements SEPA sont traités sous 1-3 jours ouvrés.</li>
                        <li>• Cette grille tarifaire est susceptible d'évoluer. Vous serez informé de tout changement.</li>
                    </ul>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <Link href="/p2p/legal/risks">
                        <Button variant="outline" className="mr-4">
                            Notice des risques
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

