"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calculator, Shield, Coins } from "lucide-react";

export function TaxReportCenter() {
    const reports = [
        { year: 2024, available: false, amount: 1240.50 },
        { year: 2023, available: true, amount: 890.00 },
        { year: 2022, available: true, amount: 450.20 },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Fiscal Summary */}
                <Card className="border-none shadow-none bg-blue-50 dark:bg-blue-900/10">
                    <CardHeader>
                        <CardTitle className="text-blue-700 dark:text-blue-400 flex items-center gap-2 text-lg">
                            <Shield size={20} />
                            Fiscalité 2024 (Estimée)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-600 dark:text-zinc-400">Intérêts Bruts</span>
                            <span className="font-mono font-bold text-zinc-900 dark:text-white">1 240,50 €</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-600 dark:text-zinc-400">Flat Tax (30%)</span>
                            <span className="font-mono font-bold text-red-500">-372,15 €</span>
                        </div>
                        <div className="h-[1px] bg-blue-200 dark:bg-blue-800" />
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-blue-700 dark:text-blue-400">Net de Fiscalité</span>
                            <span className="font-mono font-bold text-blue-700 dark:text-blue-400 text-lg">868,35 €</span>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Simulator CTA */}
                <Card className="border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 flex flex-col justify-center items-center text-center p-6">
                    <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center mb-4">
                        <Calculator size={24} />
                    </div>
                    <h3 className="font-bold text-zinc-900 dark:text-white">Optimisez votre Fiscalité</h3>
                    <p className="text-sm text-zinc-500 mb-6 mt-2 max-w-[200px]">
                        Découvrez comment le PEA-PME peut réduire vos impôts sur les intérêts.
                    </p>
                    <Button variant="outline" className="w-full">
                        Lancer le Simulateur
                    </Button>
                </Card>
            </div>

            {/* 3. Documents List */}
            <Card className="border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="text-zinc-500" />
                        Documents Fiscaux (IFU)
                    </CardTitle>
                    <CardDescription>
                        Documents officiels pour votre déclaration (Case 2TT).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {reports.map((report) => (
                            <div key={report.year} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-100 dark:border-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-white dark:bg-zinc-800 rounded-lg flex items-center justify-center font-bold text-zinc-500 border border-zinc-200 dark:border-white/10">
                                        {report.year}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-zinc-900 dark:text-white">IFU {report.year}</div>
                                        <div className="text-xs text-zinc-500">
                                            {report.available ? "Disponible" : "Dispo Février " + (report.year + 1)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-mono text-xs text-zinc-400 hidden sm:block">
                                        Base: {report.amount.toFixed(2)}€
                                    </span>
                                    <Button variant={report.available ? 'default' : 'secondary'} size="sm" disabled={!report.available}>
                                        <Download size={14} className="mr-2" /> {report.available ? 'Télécharger' : 'Bientôt'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

