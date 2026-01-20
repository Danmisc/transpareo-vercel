import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { ArrowLeftRight, TrendingUp, Shield, Info, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getKYCState } from "@/lib/banking/kyc";

export default async function LimitsSettingsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const kycState = await getKYCState();
    const tier = kycState?.tier || 0;

    const limitsConfig = {
        0: { investment: 0, withdrawal: 0, annual: 0 },
        1: { investment: 1000, withdrawal: 500, annual: 5000 },
        2: { investment: 5000, withdrawal: 2000, annual: 50000 },
        3: { investment: 50000, withdrawal: 10000, annual: 500000 },
    };

    const limits = limitsConfig[tier as keyof typeof limitsConfig] || limitsConfig[0];

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/p2p/settings">
                        <ArrowLeft size={20} />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Limites & Plafonds</h1>
                    <p className="text-zinc-500 mt-1">Basées sur votre niveau KYC</p>
                </div>
            </div>

            {/* Current Tier */}
            <Card className="mb-6 border-indigo-200 dark:border-indigo-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-1">Votre niveau</p>
                            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Tier {tier}</h2>
                            <p className="text-sm text-zinc-500 mt-1">
                                {tier === 0 && "Complétez votre KYC pour débloquer"}
                                {tier === 1 && "Investisseur débutant"}
                                {tier === 2 && "Investisseur confirmé"}
                                {tier === 3 && "Investisseur premium"}
                            </p>
                        </div>
                        {tier < 3 && (
                            <Button asChild>
                                <Link href="/p2p/settings/kyc">
                                    <TrendingUp size={16} className="mr-2" />
                                    Augmenter
                                </Link>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <ArrowLeftRight size={18} className="text-emerald-600" />
                            Investissement par opération
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                            {limits.investment.toLocaleString('fr-FR')} €
                        </span>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Shield size={18} className="text-blue-600" />
                            Retrait par opération
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                            {limits.withdrawal.toLocaleString('fr-FR')} €
                        </span>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp size={18} className="text-purple-600" />
                            Plafond annuel
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                            {limits.annual.toLocaleString('fr-FR')} €
                        </span>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex gap-3">
                <Info size={18} className="flex-shrink-0 text-amber-600 mt-0.5" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                    Limites conformes au règlement européen ECSPR sur le financement participatif.
                </p>
            </div>
        </div>
    );
}

