import { generateTaxReport, getPortfolioPerformanceMetrics } from "@/lib/actions-portfolio";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    FileText,
    Download,
    Calendar,
    TrendingUp,
    PiggyBank,
    AlertTriangle,
    CheckCircle,
    Calculator,
    Euro,
    Info
} from "lucide-react";
import Link from "next/link";

export default async function TaxReportPage({
    searchParams
}: {
    searchParams: { year?: string }
}) {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const currentYear = new Date().getFullYear();
    const selectedYear = searchParams.year ? parseInt(searchParams.year) : currentYear - 1;

    const [report, metrics] = await Promise.all([
        generateTaxReport(selectedYear),
        getPortfolioPerformanceMetrics()
    ]);

    const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - 1 - i);

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-950">
            <div className="max-w-5xl mx-auto px-6 py-12">

                {/* Header */}
                <div className="mb-8">
                    <Badge className="mb-4 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                        <FileText size={14} className="mr-1" /> Fiscalité
                    </Badge>
                    <h1 className="text-3xl font-bold mb-2">Rapport Fiscal</h1>
                    <p className="text-zinc-500">
                        Récapitulatif de vos revenus de prêt participatif pour votre déclaration d'impôts.
                    </p>
                </div>

                {/* Year Selector */}
                <div className="flex items-center gap-4 mb-8">
                    <span className="text-sm text-zinc-500">Année fiscale:</span>
                    <div className="flex gap-2">
                        {availableYears.map(year => (
                            <Link key={year} href={`/p2p/tax-report?year=${year}`}>
                                <Button
                                    variant={year === selectedYear ? "default" : "outline"}
                                    size="sm"
                                    className={year === selectedYear ? "bg-indigo-600" : ""}
                                >
                                    {year}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>

                {!report || report.investmentCount === 0 ? (
                    <Card className="border-zinc-200 dark:border-zinc-800">
                        <CardContent className="py-16 text-center">
                            <Calendar className="mx-auto text-zinc-300 mb-4" size={48} />
                            <h3 className="font-bold text-lg mb-2">Aucune donnée pour {selectedYear}</h3>
                            <p className="text-zinc-500">
                                Vous n'avez pas reçu d'intérêts cette année-là.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-none">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 text-emerald-100 text-xs mb-1">
                                        <TrendingUp size={14} /> Intérêts Bruts
                                    </div>
                                    <p className="text-2xl font-bold">
                                        {report.totalInterestReceived.toLocaleString('fr-FR')} €
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-none">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 text-blue-100 text-xs mb-1">
                                        <PiggyBank size={14} /> Capital Remboursé
                                    </div>
                                    <p className="text-2xl font-bold">
                                        {report.totalPrincipalReceived.toLocaleString('fr-FR')} €
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white border-none">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 text-red-100 text-xs mb-1">
                                        <Calculator size={14} /> PFU (30%)
                                    </div>
                                    <p className="text-2xl font-bold">
                                        {report.totalTax.toLocaleString('fr-FR')} €
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-none">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 text-amber-100 text-xs mb-1">
                                        <Euro size={14} /> Net Après Impôts
                                    </div>
                                    <p className="text-2xl font-bold">
                                        {report.netAfterTax.toLocaleString('fr-FR')} €
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Tax Breakdown */}
                        <Card className="border-zinc-200 dark:border-zinc-800 mb-8">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calculator className="text-indigo-500" size={20} />
                                    Calcul du Prélèvement Forfaitaire Unique (PFU)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                                        <div>
                                            <p className="font-medium">Intérêts bruts perçus</p>
                                            <p className="text-sm text-zinc-500">Revenu de capitaux mobiliers</p>
                                        </div>
                                        <span className="text-xl font-bold">
                                            {report.totalInterestReceived.toLocaleString('fr-FR')} €
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800">
                                        <div>
                                            <p className="font-medium text-red-800 dark:text-red-200">
                                                Prélèvement Forfaitaire (12,8%)
                                            </p>
                                            <p className="text-sm text-red-600 dark:text-red-400">Impôt sur le revenu</p>
                                        </div>
                                        <span className="text-xl font-bold text-red-700">
                                            - {report.prelevement.toLocaleString('fr-FR')} €
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800">
                                        <div>
                                            <p className="font-medium text-red-800 dark:text-red-200">
                                                Prélèvements Sociaux (17,2%)
                                            </p>
                                            <p className="text-sm text-red-600 dark:text-red-400">CSG, CRDS, etc.</p>
                                        </div>
                                        <span className="text-xl font-bold text-red-700">
                                            - {report.csg.toLocaleString('fr-FR')} €
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border-2 border-emerald-200 dark:border-emerald-800">
                                        <div>
                                            <p className="font-semibold text-emerald-800 dark:text-emerald-200">
                                                Intérêts nets après impôts
                                            </p>
                                        </div>
                                        <span className="text-2xl font-bold text-emerald-600">
                                            {report.netAfterTax.toLocaleString('fr-FR')} €
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Investment Details */}
                        <Card className="border-zinc-200 dark:border-zinc-800 mb-8">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="text-blue-500" size={20} />
                                    Détail par Investissement
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-zinc-200 dark:border-zinc-800">
                                                <th className="text-left py-3 px-2 font-medium text-zinc-500">Projet</th>
                                                <th className="text-right py-3 px-2 font-medium text-zinc-500">Capital</th>
                                                <th className="text-right py-3 px-2 font-medium text-zinc-500">Intérêts</th>
                                                <th className="text-right py-3 px-2 font-medium text-zinc-500">Statut</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.investments.map((inv, i) => (
                                                <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800">
                                                    <td className="py-3 px-2">
                                                        <p className="font-medium">{inv.loanTitle}</p>
                                                        <p className="text-xs text-zinc-400">
                                                            {new Date(inv.startDate).toLocaleDateString('fr-FR')}
                                                        </p>
                                                    </td>
                                                    <td className="text-right py-3 px-2">
                                                        {inv.investedAmount.toLocaleString('fr-FR')} €
                                                    </td>
                                                    <td className="text-right py-3 px-2 text-emerald-600 font-medium">
                                                        +{inv.interestReceived.toLocaleString('fr-FR')} €
                                                    </td>
                                                    <td className="text-right py-3 px-2">
                                                        <Badge variant={inv.status === "COMPLETED" ? "default" : "outline"}>
                                                            {inv.status === "COMPLETED" ? "Terminé" : "En cours"}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-zinc-50 dark:bg-zinc-900 font-semibold">
                                                <td className="py-3 px-2">Total</td>
                                                <td className="text-right py-3 px-2">
                                                    {report.investments.reduce((s, i) => s + i.investedAmount, 0).toLocaleString('fr-FR')} €
                                                </td>
                                                <td className="text-right py-3 px-2 text-emerald-600">
                                                    +{report.totalInterestReceived.toLocaleString('fr-FR')} €
                                                </td>
                                                <td className="text-right py-3 px-2">
                                                    {report.investments.length} projets
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Disclaimer & Export */}
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-8">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                                <div>
                                    <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                                        Avertissement
                                    </h3>
                                    <p className="text-sm text-amber-700 dark:text-amber-300">
                                        Ce document est fourni à titre informatif. Les intérêts perçus doivent être déclarés
                                        dans la catégorie "Revenus de capitaux mobiliers" (case 2TR) de votre déclaration d'impôts.
                                        Nous vous recommandons de consulter un conseiller fiscal pour valider ces informations.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <Button variant="outline" disabled className="gap-2">
                                <Download size={16} /> Exporter PDF (bientôt)
                            </Button>
                            <Link href="/p2p/portfolio">
                                <Button className="bg-orange-600 hover:bg-orange-500 gap-2">
                                    Retour au Portfolio
                                </Button>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

