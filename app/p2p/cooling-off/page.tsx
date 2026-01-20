import { getRecentInvestmentsWithCoolingOff, cancelInvestmentCoolingOff } from "@/lib/actions-compliance";
import { COMPLIANCE_LIMITS } from "@/lib/compliance-constants";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import { CancelInvestmentButton } from "./CancelButton";

export default async function CoolingOffPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const investments = await getRecentInvestmentsWithCoolingOff();

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-950">
            <div className="max-w-4xl mx-auto px-6 py-12">

                {/* Header */}
                <div className="mb-8">
                    <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        <RefreshCw size={14} className="mr-1" /> Droit de rétractation
                    </Badge>
                    <h1 className="text-3xl font-bold mb-2">Période de Rétractation</h1>
                    <p className="text-zinc-500">
                        Conformément à l'article 22 du règlement EU ECSPR, vous disposez de {COMPLIANCE_LIMITS.COOLING_OFF_DAYS} jours
                        après chaque investissement pour vous rétracter sans frais ni justification.
                    </p>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-200 dark:border-blue-800 mb-8">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                        <Clock size={20} /> Comment ça marche ?
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                        <li className="flex items-start gap-2">
                            <span className="font-bold text-blue-600">1.</span>
                            <span>Après chaque investissement, vous avez {COMPLIANCE_LIMITS.COOLING_OFF_DAYS} jours pour annuler.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold text-blue-600">2.</span>
                            <span>L'annulation est gratuite et sans justification.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold text-blue-600">3.</span>
                            <span>Le montant est immédiatement recrédité sur votre compte gains.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold text-blue-600">4.</span>
                            <span>La rétractation n'est possible que si le projet est encore en phase de financement.</span>
                        </li>
                    </ul>
                </div>

                {/* Investments List */}
                <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <RefreshCw className="text-blue-500" size={20} />
                            Investissements récents
                        </CardTitle>
                        <p className="text-sm text-zinc-500">
                            Investissements des {COMPLIANCE_LIMITS.COOLING_OFF_DAYS} derniers jours
                        </p>
                    </CardHeader>
                    <CardContent>
                        {investments.length === 0 ? (
                            <div className="text-center py-12">
                                <CheckCircle className="mx-auto text-zinc-300 mb-4" size={48} />
                                <p className="text-zinc-500">Aucun investissement récent à afficher</p>
                                <p className="text-sm text-zinc-400">
                                    Seuls les investissements des {COMPLIANCE_LIMITS.COOLING_OFF_DAYS} derniers jours apparaissent ici.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {investments.map((inv) => {
                                    const now = new Date();
                                    const remainingMs = inv.coolingOffEnds.getTime() - now.getTime();
                                    const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
                                    const isExpired = remainingMs <= 0;

                                    return (
                                        <div
                                            key={inv.id}
                                            className={`p-4 rounded-xl border ${isExpired
                                                ? "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                                                : "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold">{inv.loan.title}</h4>
                                                    <p className="text-sm text-zinc-500">
                                                        {inv.amount.toLocaleString('fr-FR')} € • {new Date(inv.createdAt).toLocaleDateString('fr-FR')}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    {isExpired ? (
                                                        <Badge variant="secondary">
                                                            Période expirée
                                                        </Badge>
                                                    ) : inv.canCancel ? (
                                                        <div className="flex flex-col items-end gap-2">
                                                            <Badge className="bg-blue-100 text-blue-700">
                                                                <Clock size={12} className="mr-1" />
                                                                {remainingDays} jour{remainingDays > 1 ? 's' : ''} restant{remainingDays > 1 ? 's' : ''}
                                                            </Badge>
                                                            <CancelInvestmentButton investmentId={inv.id} />
                                                        </div>
                                                    ) : (
                                                        <Badge variant="outline" className="text-amber-600">
                                                            <AlertTriangle size={12} className="mr-1" />
                                                            Projet démarré
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

