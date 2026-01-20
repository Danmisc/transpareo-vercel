"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Info, Calculator, CheckCircle2, Building, Scale, Lock } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell } from "recharts";

export function FiscalModule({ data }: { data: any }) {
    const [regime, setRegime] = useState("LMNP");
    const [tmi, setTmi] = useState([30]); // Default TMI 30%

    const { kpi, fiscal, loan } = data;

    // --- REAL-TIME SIMULATION ENGINE ---
    // Recalculate taxes based on the TMI slider (Client-side interactivity)
    const TMI_RATIO = tmi[0] / 100;
    const CSG = 0.172;

    // 1. Micro-Foncier: 30% abatement, then taxed at TMI + CSG
    const simMicroTax = (kpi.income * 0.7) * (TMI_RATIO + CSG);

    // 2. LMNP Réel: Real expenses + Amortization, then taxed at TMI + CSG
    // Note: LMNP deficit cannot be deducted from global income (unlike Foncier Nu), only carried forward.
    // Simplifying for viz: Tax is on positive result.
    const lmnpBase = Math.max(0, kpi.income - fiscal.deductibleExpenses - fiscal.amortization - loan.interestsPaid);
    const simLmnpTax = lmnpBase * (TMI_RATIO + CSG);

    // 3. SCI IS: 15% up to 42500, 25% beyond. No TMI interaction for the company itself.
    // Dividends would be taxed at Flat Tax (30%) but we focus on IS tax here.
    const sciBase = Math.max(0, kpi.income - fiscal.deductibleExpenses - fiscal.amortization - loan.interestsPaid);
    const simSciTax = sciBase < 42500 ? sciBase * 0.15 : (42500 * 0.15) + ((sciBase - 42500) * 0.25);

    // Chart Data
    const comparisonData = [
        { name: "Micro", impot: simMicroTax, social: 0, fill: "#f59e0b" }, // Simplified coloring
        { name: "LMNP Réel", impot: simLmnpTax, social: 0, fill: "#10b981" },
        { name: "SCI IS", impot: simSciTax, social: 0, fill: "#6366f1" },
    ];

    const currentTax = regime === 'MICRO' ? simMicroTax : regime === 'LMNP' ? simLmnpTax : simSciTax;

    return (
        <div className="h-full space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* LEFT: SIMULATION CONTROLS (4 cols) */}
                <div className="md:col-span-4 space-y-6">
                    <Card className="bg-slate-900 text-white border-zinc-800 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Calculator className="text-indigo-400" size={20} />
                                Paramètres Fiscaux
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-xs">Ajustez pour voir l'impact immédiat.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* TMI Slider */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-slate-300">Votre TMI</span>
                                    <span className="font-bold text-indigo-400 bg-indigo-900/50 px-2 py-1 rounded">{tmi[0]}%</span>
                                </div>
                                <Slider
                                    value={tmi}
                                    onValueChange={setTmi}
                                    max={45}
                                    min={11}
                                    step={1} // Ideally steps of 11, 30, 41, 45 but sliding is fluid
                                    className="py-2"
                                />
                                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                                    <span>11%</span>
                                    <span>30%</span>
                                    <span>41%</span>
                                    <span>45%</span>
                                </div>
                                <p className="text-[10px] text-slate-400 italic">
                                    Impacte directement le Micro et le LMNP (IR). La SCI (IS) est immunisée contre votre TMI.
                                </p>
                            </div>

                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                <div className="flex items-start gap-3">
                                    <Scale className="text-emerald-400 shrink-0" size={18} />
                                    <div>
                                        <p className="text-xs font-bold text-white">LMNP = Gagnant</p>
                                        <p className="text-[11px] text-slate-400 mt-1">
                                            Avec une TMI de {tmi[0]}%, le LMNP vous économise <span className="text-emerald-400 font-bold">{(simMicroTax - simLmnpTax).toFixed(0)} €</span> par an par rapport au Micro-Foncier.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Explanation */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Comprendre l'Amortissement</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-zinc-500 leading-relaxed space-y-2">
                            <p>
                                En LMNP, vous pouvez déduire chaque année une partie de la valeur du bien (les murs, le toit, les meubles...).
                            </p>
                            <p>
                                C'est une <strong>charge "virtuelle"</strong> : vous ne payez rien, mais elle réduit vos impôts. C'est la magie comptable de l'immobilier.
                            </p>
                            <div className="mt-2 text-center bg-zinc-100 p-2 rounded text-zinc-800 font-mono">
                                Amortissement Annuel: -{fiscal.amortization.toLocaleString()} €
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT: INTERACTIVE DASHBOARD (8 cols) */}
                <div className="md:col-span-8 space-y-6">

                    {/* 1. Comparison Chart */}
                    <Card className="border-none shadow-md bg-white">
                        <CardHeader>
                            <CardTitle>Comparateur d'Impôt Annuel</CardTitle>
                            <CardDescription>Quel est le régime le moins coûteux pour ce bien ?</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={comparisonData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12, fontWeight: 500 }} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        formatter={(value: number) => [`${value.toFixed(0)} €`, 'Impôt Total']}
                                    />
                                    <Bar dataKey="impot" radius={[0, 4, 4, 0]} barSize={24}>
                                        {comparisonData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* 2. Detailed Tabs */}
                    <Tabs value={regime} onValueChange={setRegime} className="w-full">
                        <TabsList className="grid grid-cols-3 w-full mb-4">
                            <TabsTrigger value="MICRO">Micro-Foncier</TabsTrigger>
                            <TabsTrigger value="LMNP">LMNP Réel</TabsTrigger>
                            <TabsTrigger value="SCI">SCI à l'IS</TabsTrigger>
                        </TabsList>

                        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-zinc-900">
                                        {regime === 'MICRO' ? 'Régime Forfaitaire' : regime === 'LMNP' ? 'Régime Réel Simplifié' : 'Impôt sur les Sociétés'}
                                    </h3>
                                    <p className="text-xs text-zinc-500">
                                        {regime === 'MICRO' ? 'Simple, mais souvent coûteux. Abattement fixe de 30%.' :
                                            regime === 'LMNP' ? 'Le roi de la rentabilité. Déduction des charges réelles + amortissement.' :
                                                'Stratégie de capitalisation. Impôt payé par la société, pas par vous.'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-zinc-500 font-medium">Impôt Final Estimé</p>
                                    <p className={`text-2xl font-black tabular-nums ${currentTax > 4000 ? 'text-red-500' : 'text-emerald-600'}`}>
                                        {currentTax.toFixed(0)} €
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between p-3 bg-zinc-50 rounded-lg">
                                    <span className="text-sm font-medium text-zinc-600">Revenus Bruts</span>
                                    <span className="text-sm font-bold text-zinc-900">{kpi.income.toLocaleString()} €</span>
                                </div>

                                {regime !== 'MICRO' && (
                                    <>
                                        <div className="flex justify-between p-3 bg-red-50/50 rounded-lg border border-dotted border-red-200">
                                            <span className="text-sm font-medium text-red-700">Charges Déductibles (Copro, Taxe...)</span>
                                            <span className="text-sm font-bold text-red-700">-{fiscal.deductibleExpenses.toLocaleString()} €</span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-indigo-50/50 rounded-lg border border-dotted border-indigo-200">
                                            <span className="text-sm font-medium text-indigo-700">Amortissement (Immeuble)</span>
                                            <span className="text-sm font-bold text-indigo-700">-{fiscal.amortization.toLocaleString()} €</span>
                                        </div>
                                    </>
                                )}

                                {regime === 'MICRO' && (
                                    <div className="flex justify-between p-3 bg-emerald-50/50 rounded-lg border border-dotted border-emerald-200">
                                        <span className="text-sm font-medium text-emerald-700">Abattement Forfaitaire (30%)</span>
                                        <span className="text-sm font-bold text-emerald-700">-{(kpi.income * 0.3).toFixed(0)} €</span>
                                    </div>
                                )}

                                <div className="border-t border-zinc-200 my-4"></div>

                                <div className="flex justify-between px-3">
                                    <span className="text-sm font-bold text-zinc-900">Résultat Imposable</span>
                                    <span className="text-sm font-bold text-zinc-900">
                                        {regime === 'MICRO' ? (kpi.income * 0.7).toFixed(0) : (regime === 'LMNP' ? lmnpBase.toFixed(0) : sciBase.toFixed(0))} €
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

