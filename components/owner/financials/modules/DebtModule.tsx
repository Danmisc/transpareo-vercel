"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { TrendingDown, Percent, CalendarClock, ShieldCheck, Banknote } from "lucide-react";

export function DebtModule({ data }: { data: any }) {
    // Mock Debt Data (since schema is limited)
    const [rate, setRate] = useState([4.0]); // Current Rate
    const [extraPayment, setExtraPayment] = useState([0]); // Monthly extra payment

    // Simulation Engine
    const loanAmount = 315000; // Mock Principal
    const durationMonths = 240; // 20 years
    const currentMonth = 24; // 2 years in

    // Generate Amortization Schedule
    const calculateAmortization = (interestRate: number, extra: number) => {
        const monthlyRate = interestRate / 100 / 12;
        let balance = loanAmount;
        const schedule = [];
        const payment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -durationMonths)); // Standard PMT

        for (let i = 1; i <= durationMonths; i++) {
            const interest = balance * monthlyRate;
            let principal = payment - interest + extra;

            if (balance - principal < 0) {
                principal = balance;
                balance = 0;
            } else {
                balance -= principal;
            }

            // Only keep points every 12 months for readable chart or if balance hits 0
            if (i % 12 === 0 || balance === 0) {
                schedule.push({
                    month: i,
                    year: Math.ceil(i / 12),
                    balance: Math.round(balance),
                    interest: Math.round(interest),
                    principal: Math.round(principal),
                    totalPaid: Math.round(payment + extra)
                });
            }
            if (balance === 0) break;
        }
        return schedule;
    };

    const initialSchedule = calculateAmortization(4.0, 0); // Original Scenario
    const simSchedule = calculateAmortization(rate[0], extraPayment[0]); // Simulated Scenario

    // Calculate Gains
    const totalInterestInitial = initialSchedule.reduce((acc, curr) => acc + curr.interest * 12, 0); // Approx
    const totalInterestSim = simSchedule.reduce((acc, curr) => acc + curr.interest * 12, 0); // Approx (Rough for visualization)
    // Detailed calculation would require summing every month, relying on sampled data for "Wow" effect

    // Better Gain Calculation:
    // We can't sum the sampled schedule.
    // Let's just use the end year diff as a proxy for speed or standard PMT calc difference.
    // Simplifying for UI:
    const monthlyPaymentInitial = (loanAmount * (4.0 / 100 / 12)) / (1 - Math.pow(1 + 4.0 / 100 / 12, -durationMonths));
    const monthlyPaymentSim = (loanAmount * (rate[0] / 100 / 12)) / (1 - Math.pow(1 + rate[0] / 100 / 12, -durationMonths));

    const monthlyGain = monthlyPaymentInitial - monthlyPaymentSim;


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full animate-in fade-in zoom-in-95 duration-300">

            {/* LEFT: SIMULATOR */}
            <div className="space-y-6">
                <Card className="bg-slate-900 text-white border-zinc-800 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Banknote className="text-amber-400" size={20} />
                            Renégocier mon Prêt ?
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-xs">Simulez un rachat ou un remboursement anticipé.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Rate Slider */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-slate-300">Nouveau Taux</span>
                                <Badge variant="outline" className="text-amber-400 border-amber-900/50 bg-amber-950/30 font-mono">
                                    {rate[0]}%
                                </Badge>
                            </div>
                            <Slider
                                value={rate}
                                onValueChange={setRate}
                                max={6}
                                min={1}
                                step={0.1}
                                className="py-2"
                            />
                            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                                <span>1%</span>
                                <span>Actuel: 4%</span>
                                <span>6%</span>
                            </div>
                        </div>

                        {/* Extra Payment Slider */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-slate-300">Remboursement Suppl.</span>
                                <Badge variant="outline" className="text-emerald-400 border-emerald-900/50 bg-emerald-950/30 font-mono">
                                    +{extraPayment[0]} € / mois
                                </Badge>
                            </div>
                            <Slider
                                value={extraPayment}
                                onValueChange={setExtraPayment}
                                max={1000}
                                min={0}
                                step={50}
                                className="py-2"
                            />
                            <p className="text-[10px] text-slate-400 italic">
                                Ajouter {extraPayment[0]}€ chaque mois réduit drastiquement la durée.
                            </p>
                        </div>

                        {/* Results Box */}
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Nouvelle Mensualité</span>
                                <span className="text-white font-bold font-mono">{(monthlyPaymentSim + extraPayment[0]).toFixed(0)} €</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Gain / Mois</span>
                                <span className={`${monthlyGain > 0 ? 'text-emerald-400' : 'text-red-400'} font-bold font-mono`}>
                                    {monthlyGain > 0 ? '-' : '+'}{Math.abs(monthlyGain).toFixed(0)} €
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-700">
                                <span className="text-slate-400">Durée restante</span>
                                <span className="text-indigo-300 font-bold font-mono">
                                    {(simSchedule[simSchedule.length - 1].year - (currentMonth / 12)).toFixed(1)} ans
                                </span>
                            </div>
                        </div>

                    </CardContent>
                </Card>

                {/* INFO CARD */}
                <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                    <CardContent className="p-4 flex gap-4 items-start">
                        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 shrink-0">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-indigo-900">Assurance Emprunter</h4>
                            <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                                Vous payez actuellement 0.35% d'assurance (environ <strong>65€/mois</strong>).
                                <br />
                                <span className="underline cursor-pointer hover:text-indigo-900 font-medium">Comparer les offres (-50% possible)</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* RIGHT: CHART & DEBT STRUCTURE */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="border-none shadow-md bg-white h-[400px]">
                    <CardHeader>
                        <CardTitle>Courbe d'Amortissement</CardTitle>
                        <CardDescription>Capital Restant Dû: Simulation vs Actuel</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={simSchedule} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="year" tick={{ fontSize: 12 }} label={{ value: 'Années', position: 'insideBottomRight', offset: -5 }} />
                                <YAxis tickFormatter={(val) => `${val / 1000}k`} tick={{ fontSize: 12 }} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                <Tooltip formatter={(val: number) => [`${val.toLocaleString()} €`, 'Capital Restant']} />
                                <Area type="monotone" dataKey="balance" stroke="#6366f1" fillOpacity={1} fill="url(#colorBalance)" strokeWidth={3} name="Simulation" />
                                {/* Could add a second line for comparison if needed, but simple is clean */}
                                <ReferenceLine x={2} stroke="red" label="Auj." strokeDasharray="3 3" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Card className="bg-zinc-50 border-zinc-100">
                        <CardContent className="p-4 text-center">
                            <p className="text-xs text-zinc-500 uppercase font-medium">Dette Restante</p>
                            <p className="text-xl font-black text-zinc-900 mt-1">315k €</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-50 border-zinc-100">
                        <CardContent className="p-4 text-center">
                            <p className="text-xs text-zinc-500 uppercase font-medium">Taux Moyen</p>
                            <p className="text-xl font-black text-zinc-900 mt-1">4.0 %</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-50 border-zinc-100">
                        <CardContent className="p-4 text-center">
                            <p className="text-xs text-zinc-500 uppercase font-medium">Fin du Prêt</p>
                            <p className="text-xl font-black text-zinc-900 mt-1">2044</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-50 border-zinc-100">
                        <CardContent className="p-4 text-center">
                            <p className="text-xs text-zinc-500 uppercase font-medium">Ratio Endett.</p>
                            <p className="text-xl font-black text-zinc-900 mt-1">31 %</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

        </div>
    );
}

