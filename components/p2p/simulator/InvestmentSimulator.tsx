"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, PiggyBank, ArrowRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InvestmentSimulator() {
    const [amount, setAmount] = useState(5000);
    const [duration, setDuration] = useState(24); // Months

    // Rates
    const P2P_RATE = 0.10; // 10%
    const BANK_RATE = 0.03; // 3%

    // Calculations
    const calculateReturns = (principal: number, months: number, rate: number) => {
        return principal * Math.pow(1 + rate / 12, months);
    };

    const p2pTotal = calculateReturns(amount, duration, P2P_RATE);
    const bankTotal = calculateReturns(amount, duration, BANK_RATE);

    const p2pGain = p2pTotal - amount;
    const bankGain = bankTotal - amount;
    const difference = p2pGain - bankGain;

    // Formatting
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

    return (
        <section className="py-16 relative overflow-hidden">
            {/* Background Decor - De-zoomed (smaller blobs) */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-[-1]">
                <div className="absolute top-[30%] right-[0%] w-[300px] h-[300px] bg-orange-500/5 rounded-full blur-3xl opacity-60" />
                <div className="absolute bottom-[20%] left-[0%] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl opacity-60" />
            </div>

            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Compact Header */}
                    <div className="text-center mb-10">
                        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-zinc-900 dark:text-white">
                            Simulez vos <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">Gains Potentiels</span>
                        </h2>
                        <p className="text-sm md:text-base text-zinc-500 max-w-xl mx-auto">
                            Comparez instantanément la performance du financement participatif face à l'épargne traditionnelle.
                        </p>
                    </div>

                    {/* Compact Glass Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xl"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {/* Left: Input Controls */}
                            <div className="p-8 md:p-10 space-y-8 border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-800">
                                {/* Amount Input */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm text-zinc-400">
                                                <Wallet size={18} />
                                            </div>
                                            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Apport initial</label>
                                        </div>
                                        <span className="text-lg font-bold text-zinc-900 dark:text-white">
                                            {formatCurrency(amount)}
                                        </span>
                                    </div>
                                    <Slider
                                        value={[amount]}
                                        onValueChange={(vals) => setAmount(vals[0])}
                                        min={100}
                                        max={50000}
                                        step={100}
                                        className="py-2"
                                    />
                                </div>

                                {/* Duration Input */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm text-zinc-400">
                                                <TrendingUp size={18} />
                                            </div>
                                            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Durée</label>
                                        </div>
                                        <span className="text-lg font-bold text-zinc-900 dark:text-white">
                                            {duration} mois
                                        </span>
                                    </div>
                                    <Slider
                                        value={[duration]}
                                        onValueChange={(vals) => setDuration(vals[0])}
                                        min={6}
                                        max={60}
                                        step={6}
                                        className="py-2"
                                    />
                                </div>
                            </div>

                            {/* Right: Results Visualization */}
                            <div className="p-8 md:p-10 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col justify-center gap-8">
                                {/* Comparison Bars */}
                                <div className="space-y-5">
                                    {/* Transpareo */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-semibold text-zinc-700 dark:text-zinc-200">Transpareo</span>
                                            <span className="font-bold text-orange-600">+{formatCurrency(p2pGain)}</span>
                                        </div>
                                        <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                                                initial={{ width: 0 }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 0.8 }}
                                            />
                                        </div>
                                    </div>

                                    {/* Bank */}
                                    <div className="opacity-60">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-medium text-zinc-500">Livret A (3%)</span>
                                            <span className="font-semibold text-zinc-500">+{formatCurrency(bankGain)}</span>
                                        </div>
                                        <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-zinc-400 dark:bg-zinc-600"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(bankGain / p2pGain) * 100}%` }}
                                                transition={{ duration: 0.8 }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Summary Box */}
                                <div className="bg-white dark:bg-black rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium mb-1">Gain supplémentaire</p>
                                            <div className="text-3xl font-bold text-zinc-900 dark:text-white">
                                                +{formatCurrency(difference)}
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                            <TrendingUp size={20} />
                                        </div>
                                    </div>

                                    <Button className="w-full mt-4 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200" size="sm">
                                        Commencer <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <p className="text-center text-[10px] text-zinc-400 mt-6 max-w-2xl mx-auto leading-relaxed opacity-60">
                        *Simulation à titre indicatif. Les performances passées ne préjugent pas des performances futures. Investir comporte des risques.
                    </p>
                </div>
            </div>
        </section>
    );
}

