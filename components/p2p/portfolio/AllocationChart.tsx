"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AllocationChart({ portfolio }: { portfolio: any[] }) {
    // Mock Data Calculation
    // In real app, aggregate portfolio by type
    const data = [
        { name: "Immobilier", value: 65, color: "#f97316" }, // Orange-500
        { name: "Entreprise", value: 25, color: "#3b82f6" }, // Blue-500
        { name: "Eco-Transition", value: 10, color: "#10b981" }, // Emerald-500
    ];

    return (
        <Card className="h-[300px] border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col">
            <CardHeader className="py-4">
                <CardTitle className="text-base">Allocation d'Actifs</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

