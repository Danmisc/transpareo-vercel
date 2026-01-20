"use client";

import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowRight, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function SmartSimulator() {
    const [mode, setMode] = useState<'invest' | 'borrow'>('invest');
    const [amount, setAmount] = useState(5000);
    const [duration, setDuration] = useState(24);
    const [rate, setRate] = useState(5.5);
    const [isExpanded, setIsExpanded] = useState(false);

    // Derived State
    const [monthly, setMonthly] = useState(0);
    const [totalReturn, setTotalReturn] = useState(0);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        // Calculation Logic
        const r = rate / 100 / 12;
        const n = duration;

        let m = 0;
        let total = 0;

        if (rate === 0) {
            m = amount / n;
            total = amount;
        } else {
            m = amount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            total = m * n;
        }

        setMonthly(m);
        setTotalReturn(total - amount);

        // Generate Chart Data (Growth Curve)
        const data = [];
        for (let i = 0; i <= n; i += (n / 10)) {
            const val = mode === 'invest'
                ? amount * Math.pow(1 + (rate / 100 / 12), i)
                : total - (m * i);

            data.push({ name: `M${Math.round(i)}`, value: Math.round(val) });
        }
        setChartData(data);

    }, [amount, duration, rate, mode]);

    return (
        <div className="w-full max-w-5xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-colors duration-500"
            >
                {/* Header Switch */}
                <div className="flex border-b border-zinc-200 dark:border-white/5 relative">
                    {/* Animated Background Indicator */}
                    <div className="absolute inset-0 flex p-1 pointer-events-none">
                        <motion.div
                            layoutId="active-tab"
                            className={`w-1/2 h-full rounded-t-2xl ${mode === 'invest' ? 'bg-orange-50 dark:bg-orange-500/10' : 'translate-x-full bg-blue-50 dark:bg-blue-500/10'}`}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    </div>

                    <button
                        onClick={() => setMode('invest')}
                        className={`relative z-10 flex-1 py-6 text-lg font-bold transition-colors duration-300 ${mode === 'invest' ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                        Je veux Investir
                    </button>
                    <div className="w-px bg-zinc-200 dark:bg-white/5" />
                    <button
                        onClick={() => setMode('borrow')}
                        className={`relative z-10 flex-1 py-6 text-lg font-bold transition-colors duration-300 ${mode === 'borrow' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                        Je veux Emprunter
                    </button>
                </div>

                <div className="p-8 lg:p-12 grid lg:grid-cols-2 gap-12">
                    {/* Left: Inputs */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-10"
                    >
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <label className="text-zinc-600 dark:text-zinc-400 font-medium">Montant {mode === 'invest' ? 'placé' : 'souhaité'}</label>
                                <motion.div
                                    key={`amt-${amount}`} // Trigger animation on change
                                    initial={{ scale: 1.2 }}
                                    animate={{ scale: 1 }}
                                    className="text-3xl font-mono text-zinc-900 dark:text-white font-bold"
                                >
                                    {amount.toLocaleString()} €
                                </motion.div>
                            </div>
                            <Slider
                                value={[amount]}
                                min={mode === 'invest' ? 100 : 5000}
                                max={mode === 'invest' ? 50000 : 1000000}
                                step={100}
                                onValueChange={(v) => setAmount(v[0])}
                                className="cursor-pointer"
                            />
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <label className="text-zinc-600 dark:text-zinc-400 font-medium">Durée ({duration} mois)</label>
                                <div className="text-3xl font-mono text-zinc-900 dark:text-white font-bold">{(duration / 12).toFixed(1)} ans</div>
                            </div>
                            <Slider
                                value={[duration]}
                                min={12}
                                max={120}
                                step={6}
                                onValueChange={(v) => setDuration(v[0])}
                                className="cursor-pointer"
                            />
                        </div>

                        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 flex justify-between items-center transition-colors">
                            <span className="text-zinc-500 dark:text-zinc-400">Taux Annuel (APR)</span>
                            <span className={`text-xl font-bold ${mode === 'invest' ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'}`}>{rate}%</span>
                        </div>
                    </motion.div>

                    {/* Right: Results & Chart */}
                    <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-tr blur-3xl -z-10 opacity-50 dark:opacity-30 ${mode === 'invest' ? 'from-orange-500/20 to-amber-500/20' : 'from-blue-500/20 to-sky-500/20'}`} />

                        <div className="text-center mb-8">
                            <p className="text-zinc-500 dark:text-zinc-400 mb-2">{mode === 'invest' ? 'Gain Total Estimé' : 'Mensualité Estimée'}</p>
                            <div className="text-6xl font-black text-zinc-900 dark:text-white tracking-tighter">
                                {mode === 'invest'
                                    ? `+${Math.round(totalReturn).toLocaleString()} €`
                                    : `${Math.round(monthly).toLocaleString()} €`
                                }
                            </div>
                            {mode === 'invest' && <p className="text-orange-600 dark:text-orange-400 font-medium mt-2 flex justify-center items-center gap-2"><TrendingUp size={16} /> +{((totalReturn / amount) * 100).toFixed(1)}% de performance</p>}
                        </div>

                        <div className="h-[200px] w-full mt-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={mode === 'invest' ? "#f97316" : "#3b82f6"} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={mode === 'invest' ? "#f97316" : "#3b82f6"} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke={mode === 'invest' ? "#f97316" : "#3b82f6"}
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <Button
                            onClick={() => window.location.href = mode === 'invest' ? '/p2p/dashboard' : '/p2p/borrow'}
                            className={`w-full h-14 mt-8 text-lg font-bold rounded-xl shadow-lg transition-all ${mode === 'invest' ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/20 text-white' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 text-white'}`}
                        >
                            {mode === 'invest' ? 'Commencer à Investir' : 'Lancer ma demande'} <ArrowRight className="ml-2" />
                        </Button>
                    </div>
                </div>

                {/* Footer / Expandable */}
                <div
                    className="bg-zinc-50 dark:bg-black/20 border-t border-zinc-200 dark:border-white/5 p-4 flex justify-center cursor-pointer hover:bg-zinc-100 dark:hover:bg-black/30 transition-colors"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <span className="text-zinc-500 text-sm font-medium flex items-center gap-2">
                        {isExpanded ? "Masquer les détails" : "Voir les détails du calcul"}
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="bg-zinc-100 dark:bg-black/40 overflow-hidden"
                        >
                            <div className="p-8 grid grid-cols-3 gap-8 text-sm border-t border-zinc-200 dark:border-white/5">
                                <div>
                                    <p className="text-zinc-500 mb-1">Intérêts Totaux</p>
                                    <p className="text-zinc-900 dark:text-white text-lg font-mono">{(monthly * duration - amount).toFixed(2)} €</p>
                                </div>
                                <div>
                                    <p className="text-zinc-500 mb-1">TAEG (Fixe)</p>
                                    <p className="text-zinc-900 dark:text-white text-lg font-mono">{rate} %</p>
                                </div>
                                <div>
                                    <p className="text-zinc-500 mb-1">Assurance Emprunteur</p>
                                    <p className="text-zinc-900 dark:text-white text-lg font-mono">Inclus</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </motion.div>
        </div>
    );
}

