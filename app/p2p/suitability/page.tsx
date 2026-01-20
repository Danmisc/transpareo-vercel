import { SuitabilityTestWrapper } from "./SuitabilityTestWrapper";
import { getSuitabilityProfile } from "@/lib/actions-compliance";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, RefreshCw, AlertCircle, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function SuitabilityPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const profile = await getSuitabilityProfile();

    // If already completed, show summary
    if (profile?.testCompletedAt) {
        const completedDate = new Date(profile.testCompletedAt);
        const expirationDate = new Date(completedDate);
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
        const isExpired = daysUntilExpiry <= 0;

        return (
            <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-950 py-12">
                <div className="container max-w-2xl mx-auto px-4">
                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <CardContent className="p-8">
                            <div className="text-center mb-6">
                                <div className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isExpired ? 'bg-red-100 dark:bg-red-900/30' :
                                        isExpiringSoon ? 'bg-amber-100 dark:bg-amber-900/30' :
                                            'bg-emerald-100 dark:bg-emerald-900/30'
                                    }`}>
                                    {isExpired ? (
                                        <AlertCircle className="text-red-600" size={32} />
                                    ) : isExpiringSoon ? (
                                        <RefreshCw className="text-amber-600" size={32} />
                                    ) : (
                                        <CheckCircle className="text-emerald-600" size={32} />
                                    )}
                                </div>
                                <h1 className="text-2xl font-bold mb-2">
                                    {isExpired ? "Profil expiré" : "Profil investisseur validé"}
                                </h1>
                                <p className="text-zinc-500">
                                    Complété le {completedDate.toLocaleDateString('fr-FR')}
                                </p>
                            </div>

                            {/* Expiration Warning */}
                            {(isExpired || isExpiringSoon) && (
                                <div className={`p-4 rounded-xl mb-6 ${isExpired
                                        ? 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800'
                                        : 'bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <Calendar size={20} className={isExpired ? 'text-red-600' : 'text-amber-600'} />
                                        <div>
                                            <p className={`font-semibold ${isExpired ? 'text-red-800 dark:text-red-200' : 'text-amber-800 dark:text-amber-200'}`}>
                                                {isExpired ? "Renouvellement requis" : `Expire dans ${daysUntilExpiry} jours`}
                                            </p>
                                            <p className={`text-sm ${isExpired ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                                Conformité ECSPR : renouvellement annuel obligatoire
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Profile Details */}
                            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 mb-6 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-zinc-500">Catégorie</span>
                                    <Badge className={profile.sophistication === "SOPHISTICATED"
                                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                    }>
                                        {profile.sophistication === "SOPHISTICATED"
                                            ? "Investisseur Averti"
                                            : "Investisseur Non-Averti"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-zinc-500">Validité</span>
                                    <span className={`text-sm font-medium ${isExpired ? 'text-red-600' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                        {isExpired ? "Expiré" : `Jusqu'au ${expirationDate.toLocaleDateString('fr-FR')}`}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                {(isExpired || isExpiringSoon) ? (
                                    <Link href="/p2p/suitability?renew=true">
                                        <Button className="bg-orange-600 hover:bg-orange-500">
                                            <RefreshCw size={16} className="mr-2" />
                                            Renouveler mon profil
                                        </Button>
                                    </Link>
                                ) : (
                                    <Link href="/p2p/market">
                                        <Button className="bg-orange-600 hover:bg-orange-500">
                                            Découvrir les projets
                                        </Button>
                                    </Link>
                                )}
                                <Link href="/p2p/dashboard">
                                    <Button variant="outline">
                                        Mon tableau de bord
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Show suitability test
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-950 py-12">
            <div className="container max-w-2xl mx-auto px-4">
                <SuitabilityTestWrapper />
            </div>
        </div>
    );
}

