"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function ProjectedReturnsChart() {
    // Generate mock projection data (Compound Interest)
    const data = Array.from({ length: 11 }, (_, i) => {
        const year = 2024 + i;
        const initial = 10000;
        const p2pRate = 1.08; // 8%
        const sp500Rate = 1.07; // 7%
        const livretARate = 1.03; // 3%

        return {
            year: year.toString(),
            p2p: Math.round(initial * Math.pow(p2pRate, i)),
            sp500: Math.round(initial * Math.pow(sp500Rate, i)),
            livretA: Math.round(initial * Math.pow(livretARate, i)),
        };
    });

    return (
        <Card className="h-[300px] border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col">
            <CardHeader className="py-4">
                <CardTitle className="text-base font-bold text-zinc-900 dark:text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">⏳ Time Machine</span>
                    <span className="text-xs font-normal text-zinc-500 bg-zinc-100 dark:bg-white/5 px-2 py-1 rounded-full">Projections sur 10 ans</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 pl-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorP2P" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorLivret" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#71717a" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#71717a" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.2} />
                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff' }}
                            labelStyle={{ color: '#a1a1aa' }}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" />

                        {/* P2P Funds */}
                        <Area type="monotone" dataKey="p2p" name="Transpareo (8%)" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorP2P)" />

                        {/* S&P 500 Comparison - Removed for clarity/contrast based on previous edit context, or I can add it back if the user wanted it. The previous edit had issues. Let's stick to P2P vs Livret A for simplicity and cleaner visuals as requested? Actually the roadmap said S&P 500. I'll add it back but clean. */}
                        <Area type="monotone" dataKey="sp500" name="S&P 500 (7%)" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" fill="none" />

                        {/* Livret A Comparison */}
                        <Area type="monotone" dataKey="livretA" name="Livret A (3%)" stroke="#71717a" strokeWidth={2} fill="url(#colorLivret)" strokeDasharray="5 5" />

                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
