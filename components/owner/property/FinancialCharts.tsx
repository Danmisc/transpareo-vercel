"use client";

import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

const mockData = [
    { name: 'Jan', revenus: 1200, charges: 350 },
    { name: 'Fév', revenus: 1200, charges: 150 },
    { name: 'Mar', revenus: 1200, charges: 50 },
    { name: 'Avr', revenus: 1200, charges: 150 },
    { name: 'Mai', revenus: 1200, charges: 150 },
    { name: 'Juin', revenus: 1200, charges: 150 },
    { name: 'Juil', revenus: 1200, charges: 450 }, // Taxe foncière mock
    { name: 'Août', revenus: 1200, charges: 150 },
    { name: 'Sep', revenus: 1200, charges: 150 },
    { name: 'Oct', revenus: 1200, charges: 150 },
    { name: 'Nov', revenus: 1200, charges: 150 },
    { name: 'Déc', revenus: 1200, charges: 150 },
];

export function FinancialCharts() {
    return (
        <Card className="p-6 border-zinc-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-zinc-900">Flux de Trésorerie (Cashflow)</h3>
                    <p className="text-zinc-500 text-sm">Entrées vs Sorties sur 12 mois</p>
                </div>
                <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-zinc-600">Revenus</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <span className="text-zinc-600">Dépenses</span>
                    </div>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={mockData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        barSize={12}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#a1a1aa', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#a1a1aa', fontSize: 12 }}
                            tickFormatter={(value) => `${value}€`}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            cursor={{ fill: '#f4f4f5' }}
                        />
                        <Bar dataKey="revenus" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="charges" fill="#f87171" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-zinc-100/50">
                <div className="text-center">
                    <p className="text-xs text-zinc-400 mb-1">Total Revenus (An)</p>
                    <p className="text-lg font-bold text-emerald-600 flex items-center justify-center gap-1">
                        +14.4k€ <ArrowUpRight size={14} />
                    </p>
                </div>
                <div className="text-center border-l border-zinc-100">
                    <p className="text-xs text-zinc-400 mb-1">Total Charges (An)</p>
                    <p className="text-lg font-bold text-red-500 flex items-center justify-center gap-1">
                        -2.3k€ <ArrowDownRight size={14} />
                    </p>
                </div>
                <div className="text-center border-l border-zinc-100">
                    <p className="text-xs text-zinc-400 mb-1">Résultat Net</p>
                    <p className="text-lg font-bold text-zinc-900">
                        +12.1k€
                    </p>
                </div>
            </div>
        </Card>
    );
}
