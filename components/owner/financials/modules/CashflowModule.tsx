"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine } from "recharts";
import { ArrowDown, ArrowUp, TrendingUp, DollarSign, Filter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CashflowModule({ data }: { data: any }) {
    const [filter, setFilter] = useState("ALL"); // ALL, INCOME, EXPENSE
    const [search, setSearch] = useState("");

    // Waterfall Data Preparation
    const waterfallData = [
        { name: "Revenus", value: data.kpi.income, fill: "#10b981", type: "income" },
        { name: "Charges", value: -data.kpi.expenses, fill: "#ef4444", type: "expense" },
        { name: "Crédit", value: -(data.loan.interestsPaid + data.loan.capitalAmortized), fill: "#f59e0b", type: "expense" },
        { name: "Cashflow", value: data.kpi.cashflow, fill: "#6366f1", type: "total" }
    ];

    // Filter Transactions
    const transactions = data.transactions?.filter((t: any) => {
        const matchesFilter = filter === 'ALL' || t.type === filter;
        const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    }) || [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full animate-in fade-in zoom-in-95 duration-300">
            {/* Left Col: Analysis & Charts */}
            <div className="lg:col-span-2 space-y-6">

                {/* 1. Advanced Waterfall Chart */}
                <Card className="border-none shadow-md bg-white">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Cascade de Trésorerie</span>
                            <Badge variant="outline" className="text-zinc-500 font-normal">Vue Annuelle</Badge>
                        </CardTitle>
                        <CardDescription>Flux de transformation du Loyer Brut en Cashflow Net</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={waterfallData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                                <Tooltip
                                    cursor={{ fill: '#f4f4f5' }}
                                    formatter={(value: number) => [`${value.toLocaleString()} €`, 'Montant']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                                    {waterfallData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                                <ReferenceLine y={0} stroke="#e4e4e7" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* 2. Transaction Explorer (The "Deep Dive") */}
                <Card className="border-zinc-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row justify-between gap-4 bg-zinc-50/50">
                        <div>
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Search size={16} className="text-zinc-400" />
                                Explorateur de Transactions
                            </CardTitle>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={filter === 'ALL' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter('ALL')}
                                className="h-7 text-xs"
                            >
                                Tout
                            </Button>
                            <Button
                                variant={filter === 'INCOME' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter('INCOME')}
                                className={filter === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-700 h-7 text-xs' : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50 h-7 text-xs'}
                            >
                                Entrées
                            </Button>
                            <Button
                                variant={filter === 'EXPENSE' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter('EXPENSE')}
                                className={filter === 'EXPENSE' ? 'bg-red-600 hover:bg-red-700 h-7 text-xs' : 'text-red-700 border-red-200 hover:bg-red-50 h-7 text-xs'}
                            >
                                Sorties
                            </Button>
                        </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Date</th>
                                    <th className="px-4 py-3 font-medium">Description</th>
                                    <th className="px-4 py-3 font-medium">Catégorie</th>
                                    <th className="px-4 py-3 font-medium text-right">Montant</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {transactions.length > 0 ? transactions.map((t: any) => (
                                    <tr key={t.id} className="hover:bg-zinc-50/80 transition-colors group cursor-pointer">
                                        <td className="px-4 py-3 text-zinc-500 font-mono text-xs">
                                            {new Date(t.date).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-zinc-700">
                                            {t.description}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant="secondary" className="text-[10px] font-normal bg-zinc-100 text-zinc-600  group-hover:bg-white border-zinc-200">
                                                {t.category}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono font-bold">
                                            <span className={t.type === 'INCOME' ? 'text-emerald-600' : 'text-zinc-900'}>
                                                {t.type === 'INCOME' ? '+' : '-'}{Math.abs(t.amount).toLocaleString()} €
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-zinc-400">Aucune transaction trouvée.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Right Col: KPIs & Insights */}
            <div className="space-y-4">
                <Card className="bg-emerald-600 text-white border-none shadow-lg shadow-emerald-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/20 rounded-lg text-white">
                                <TrendingUp size={20} />
                            </div>
                            <span className="text-emerald-100 font-bold uppercase text-xs tracking-wider">Rendement Cash</span>
                        </div>
                        <div className="text-4xl font-black text-white tracking-tight">
                            {((data.kpi.cashflow / 450000) * 100).toFixed(2)}%
                        </div>
                        <p className="text-xs text-emerald-100/80 mt-2">Cashflow / Valeur (Est. 450k€)</p>
                        <div className="mt-4 pt-4 border-t border-emerald-500/50 flex justify-between items-center text-xs">
                            <span className="text-emerald-200">Moyenne secteur</span>
                            <span className="font-bold">3.8%</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Analyse des Charges</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-zinc-500">Crédit Immo</span>
                                    <span className="font-bold">45%</span>
                                </div>
                                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-fuchsia-500 h-full w-[45%]"></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-zinc-500">Taxe Foncière</span>
                                    <span className="font-bold">12%</span>
                                </div>
                                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-orange-500 h-full w-[12%]"></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-zinc-500">Travaux & Entretien</span>
                                    <span className="font-bold">28%</span>
                                </div>
                                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-blue-500 h-full w-[28%]"></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200 text-xs text-slate-600 leading-relaxed">
                            💡 <strong>Conseil :</strong> Vos charges de travaux sont élevées cette année. Vérifiez que tout est bien déductible (LMNP).
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

