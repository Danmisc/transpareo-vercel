"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ShieldCheck, TrendingDown, TrendingUp, Radar, BarChart3, AlertTriangle } from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RechartsRadar, Tooltip } from "recharts";

export function YieldShield({ data }: { data: any }) {
    // 1. Yield Shield Logic (Alerts)
    const alerts = [];
    const yieldGross = parseFloat(data.kpi.yieldGross);

    if (yieldGross < 4.5) {
        alerts.push({
            type: "WARNING",
            title: "Rentabilité sous pression",
            desc: "Votre rendement (4.2%) est inférieur à l'inflation perçue. Une vacance de 1 mois a été détectée.",
            icon: <AlertTriangle size={18} className="text-amber-500" />
        });
    } else {
        alerts.push({
            type: "SUCCESS",
            title: "Rentabilité Optimale",
            desc: "Votre rendement dépasse les attentes du marché (+1.2%).",
            icon: <ShieldCheck size={18} className="text-emerald-500" />
        });
    }

    if (data.fiscal.deductibleExpenses / data.kpi.income < 0.15) {
        alerts.push({
            type: "INFO",
            title: "Déductions Faibles",
            desc: "Vous ne déduisez que 15% de vos revenus. Avez-vous pensé aux frais kilométriques ?",
            icon: <AlertCircle size={18} className="text-blue-500" />
        });
    }


    // 2. Smart Benchmark Logic (Comparables)
    // Radar Data: You vs Market Average (Mocked for Demo based on sector)
    const benchmarkData = [
        { subject: 'Rendement', A: yieldGross, B: 5.2, fullMark: 10 },
        { subject: 'Occupa.', A: 95, B: 92, fullMark: 100 },
        { subject: 'Cashflow', A: (data.kpi.cashflow / data.kpi.income) * 100, B: 20, fullMark: 100 }, // Cashflow % Margin
        { subject: 'Charges', A: 30, B: 25, fullMark: 100 }, // Lower is better, need to invert for chart visual usually, or just map straight
        { subject: 'Prix m²', A: 100, B: 85, fullMark: 100 },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-500 delay-100">

            {/* ALERT CENTER (Yield Shield) */}
            <Card className="bg-white border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base text-zinc-800">
                        <ShieldCheck className="text-indigo-500" />
                        Yield Shield™
                        <Badge variant="outline" className="text-[10px] font-normal text-zinc-400">Security System</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {alerts.map((alert, i) => (
                        <div key={i} className="flex gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-100 items-start">
                            <div className="mt-0.5">{alert.icon}</div>
                            <div>
                                <h4 className="text-sm font-bold text-zinc-700">{alert.title}</h4>
                                <p className="text-xs text-zinc-500 leading-relaxed">{alert.desc}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* BENCHMARK RADAR */}
            <Card className="bg-white border-zinc-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Radar size={100} />
                </div>
                <CardHeader className="pb-0">
                    <CardTitle className="flex items-center gap-2 text-base text-zinc-800">
                        <BarChart3 className="text-fuchsia-500" />
                        Smart Benchmark
                    </CardTitle>
                    <CardDescription className="text-xs">Vous vs Le Marché (Quartier)</CardDescription>
                </CardHeader>
                <CardContent className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={benchmarkData}>
                            <PolarGrid stroke="#e4e4e7" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#71717a' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <RechartsRadar
                                name="Vous"
                                dataKey="A"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                fill="#8b5cf6"
                                fillOpacity={0.3}
                            />
                            <RechartsRadar
                                name="Marché"
                                dataKey="B"
                                stroke="#cbd5e1"
                                strokeWidth={2}
                                fill="#cbd5e1"
                                fillOpacity={0.1}
                            />
                            <Tooltip
                                labelStyle={{ color: '#000' }}
                                itemStyle={{ fontSize: 12 }}
                                formatter={(value: number) => value.toFixed(1)}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

        </div>
    );
}
