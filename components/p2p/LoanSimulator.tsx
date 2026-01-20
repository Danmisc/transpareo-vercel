"use client";

import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Info, Calculator, Banknote, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export function LoanSimulator() {
    const [mode, setMode] = useState<'borrow' | 'invest'>('borrow');

    const [amount, setAmount] = useState(200000);
    // ...
    // Update logic to handle 'Invest' mode visual changes (just simple title change for now to be fast)
    const [rate, setRate] = useState(2.5);
    const [duration, setDuration] = useState(20); // Years

    const [monthlyPayment, setMonthlyPayment] = useState(0);
    const [totalCost, setTotalCost] = useState(0);
    const [totalInterest, setTotalInterest] = useState(0);

    // Bank Comparison (Simulated higher rate/fees)
    const bankRate = 4.2;
    const [bankMonthly, setBankMonthly] = useState(0);
    const [bankSavings, setBankSavings] = useState(0);

    useEffect(() => {
        // P2P Calculation
        const r = rate / 100 / 12;
        const n = duration * 12;
        // M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1]
        // If rate is 0, simple division
        let m = 0;
        if (rate === 0) {
            m = amount / n;
        } else {
            m = amount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        }

        const total = m * n;
        setMonthlyPayment(Math.round(m));
        setTotalCost(Math.round(total));
        setTotalInterest(Math.round(total - amount));

        // Bank Calculation
        const rb = bankRate / 100 / 12;
        let mb = amount * (rb * Math.pow(1 + rb, n)) / (Math.pow(1 + rb, n) - 1);
        setBankMonthly(Math.round(mb));
        setBankSavings(Math.round((mb * n) - total));

    }, [amount, rate, duration]);

    const data = [
        { name: "Capital", value: amount, color: "#10b981" }, // Emerald
        { name: "Intérêts", value: totalInterest, color: "#f59e0b" }, // Amber
    ];

    return (
        <div className="grid lg:grid-cols-2 gap-8 items-start">

            {/* Controls */}
            <Card className="border-none shadow-xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm transition-all">
                <CardHeader>
                    {/* Tabs */}
                    <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg w-fit mb-4">
                        <button
                            onClick={() => setMode('borrow')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'borrow' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
                        >
                            Emprunter
                        </button>
                        <button
                            onClick={() => setMode('invest')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'invest' ? 'bg-emerald-500 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
                        >
                            Investir
                        </button>
                    </div>

                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Calculator className={mode === 'invest' ? "text-emerald-500" : "text-blue-600"} />
                        {mode === 'borrow' ? "Simulez votre Prêt" : "Calculez votre Rendement"}
                    </CardTitle>
                    <CardDescription>
                        {mode === 'borrow' ? "Ajustez les paramètres pour voir vos mensualités." : "Voyez combien vos intérêts composés peuvent rapporter."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">

                    {/* Amount */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <Label className="text-zinc-500 font-medium flex items-center gap-2">
                                <Banknote size={18} /> Montant emprunté
                            </Label>
                            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{amount.toLocaleString()} €</span>
                        </div>
                        <Slider
                            value={[amount]}
                            min={5000} max={1000000} step={1000}
                            onValueChange={(v) => setAmount(v[0])}
                            className="py-4"
                        />
                    </div>

                    {/* Duration */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <Label className="text-zinc-500 font-medium flex items-center gap-2">
                                <Calendar size={18} /> Durée
                            </Label>
                            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{duration} ans</span>
                        </div>
                        <Slider
                            value={[duration]}
                            min={1} max={30} step={1}
                            onValueChange={(v) => setDuration(v[0])}
                            className="py-4"
                        />
                    </div>

                    {/* Rate */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <Label className="text-zinc-500 font-medium">Taux d'intérêt (P2P)</Label>
                            <div className="text-right">
                                <span className="text-3xl font-bold text-emerald-600">{rate} %</span>
                                <p className="text-xs text-zinc-400">Moyenne plateforme: 2.1%</p>
                            </div>
                        </div>
                        <Slider
                            value={[rate]}
                            min={0} max={10} step={0.1}
                            onValueChange={(v) => setRate(v[0])}
                            className="py-4"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-6">

                {/* Main Result Card */}
                <Card className={mode === 'borrow' ? "bg-zinc-900 text-white border-zinc-800 shadow-2xl relative overflow-hidden" : "bg-emerald-900 text-white border-emerald-800 shadow-2xl relative overflow-hidden"}>
                    <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <CardHeader>
                        <CardTitle className="text-white/70 font-normal">
                            {mode === 'borrow' ? "Mensualité Estimée" : "Gain Total Estimé"}
                        </CardTitle>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-6xl font-bold text-white tracking-tighter">
                                {mode === 'borrow' ? monthlyPayment.toLocaleString() : `+${totalInterest.toLocaleString()}`}
                            </span>
                            <span className="text-2xl text-white/50">{mode === 'borrow' ? "€ / mois" : "€"}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10">
                        <div className="h-px w-full bg-white/10" />

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-white/50 mb-1">{mode === 'borrow' ? "Coût Total du Crédit" : "Capital Investi"}</p>
                                <p className="text-xl font-semibold text-white">
                                    {mode === 'borrow' ? totalInterest.toLocaleString() + " €" : amount.toLocaleString() + " €"}
                                </p>
                            </div>
                            <div>
                                <p className="text-white/50 mb-1">{mode === 'borrow' ? "Montant Total Remboursé" : "Montant Total Récupéré"}</p>
                                <p className="text-xl font-semibold text-white">
                                    {mode === 'borrow' ? totalCost.toLocaleString() + " €" : totalCost.toLocaleString() + " €"}
                                </p>
                            </div>
                        </div>

                        {mode === 'borrow' && (
                            <div className="bg-white/10 rounded-xl p-4 mt-4 backdrop-blur-md border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-zinc-300">Vs Banque Traditionnelle ({bankRate}%)</span>
                                    <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-bold">-{bankRate - rate}%</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-xs text-zinc-400">Mensualité Banque</p>
                                        <p className="text-lg text-zinc-300 line-through decoration-red-500/50">{bankMonthly.toLocaleString()} €</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-emerald-400 font-bold mb-1">ÉCONOMIE TOTALE</p>
                                        <p className="text-2xl font-bold text-emerald-400">+{bankSavings.toLocaleString()} €</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Chart (Simplified Visual) */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col justify-center items-center">
                        <div className="h-32 w-32 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        innerRadius={40}
                                        outerRadius={60}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                <span className="text-xs text-zinc-400">Ratio</span>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-2 text-xs">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Capital</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /> Intérêts</div>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/50 flex flex-col justify-center">
                        <Info className="text-blue-600 dark:text-blue-400 mb-2" />
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-1">Le saviez-vous ?</h4>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                            Le prêt entre particuliers est parfaitement légal en France tant qu'il est déclaré au-dessus de 5000€ (Formulaire n°2062).
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}

