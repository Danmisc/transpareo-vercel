"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { ShieldCheck, TrendingUp, Lock, Award, Info } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link"; // NEW

interface ReputationRadarProps {
    isOwner: boolean;
}

export function ReputationRadar({ isOwner }: ReputationRadarProps) {
    // Mock data - normally computed from reviews/history
    const data = [
        { subject: 'Sérieux', A: 95, fullMark: 100 },
        { subject: 'Fiabilité', A: 98, fullMark: 100 },
        { subject: 'Réactivité', A: 88, fullMark: 100 },
        { subject: 'Relations', A: 92, fullMark: 100 },
        { subject: 'Documents', A: 100, fullMark: 100 },
    ];

    const score = 96;
    const level = "Expert Vérifié";

    // Circular progress calculation
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl h-full overflow-hidden relative group">
            {/* Gradient Background Effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10 transition-all duration-700 group-hover:bg-blue-500/10" />

            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-blue-500" />
                            Indice de Confiance
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Analyse de fiabilité Transpareo
                        </CardDescription>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                        {level}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">

                {/* Score & Gauge Section */}
                <div className="flex items-center justify-center py-4 relative">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        {/* SVG Gauge */}
                        <svg className="transform -rotate-90 w-full h-full">
                            <circle
                                className="text-zinc-100 dark:text-zinc-800"
                                strokeWidth="8"
                                stroke="currentColor"
                                fill="transparent"
                                r={radius}
                                cx="50%"
                                cy="50%"
                            />
                            <circle
                                className="text-blue-500 transition-all duration-1000 ease-out"
                                strokeWidth="8"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r={radius}
                                cx="50%"
                                cy="50%"
                            />
                        </svg>

                        {/* Inner Score */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tighter">
                                {score}
                            </span>
                            <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest mt-1">
                                / 100
                            </span>
                        </div>
                    </div>

                    {/* Mini Stats Floating */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:block"
                    >
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                                <TrendingUp className="w-3 h-3 text-green-500" />
                                <span>Top 5%</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                                <Award className="w-3 h-3 text-amber-500" />
                                <span>3 Ans</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Radar Chart (Smaller & Integrated) */}
                <div className="h-[140px] w-full -mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                            <PolarGrid stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeDasharray="3 3" />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: "#9ca3af", fontSize: 9, fontWeight: 600 }}
                            />
                            <Radar
                                name="User"
                                dataKey="A"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fill="#3b82f6"
                                fillOpacity={0.2}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* Footer / CTA */}
                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 flex items-start gap-3">
                    <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Un score élevé augmente la visibilité de vos annonces et renforce la confiance des propriétaires.
                        </p>
                        {isOwner && (
                            <Link href="/p2p/settings/kyc" className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 mt-2 hover:underline inline-block">
                                Voir comment améliorer mon score
                            </Link>
                        )}
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
