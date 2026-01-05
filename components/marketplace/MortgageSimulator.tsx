"use client";

import { useState, useEffect } from "react";
import { Calculator, Euro } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MortgageSimulatorProps {
    price: number;
}

export default function MortgageSimulator({ price }: MortgageSimulatorProps) {
    const [downPayment, setDownPayment] = useState(price * 0.2); // Default 20%
    const [duration, setDuration] = useState(25); // Default 25 years
    const [rate, setRate] = useState(3.5); // Default 3.5%

    const [monthlyPayment, setMonthlyPayment] = useState(0);

    useEffect(() => {
        const principal = price - downPayment;
        const monthlyRate = rate / 100 / 12;
        const numberOfPayments = duration * 12;

        if (principal <= 0) {
            setMonthlyPayment(0);
            return;
        }

        const payment =
            (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

        setMonthlyPayment(Math.round(payment));
    }, [price, downPayment, duration, rate]);

    return (
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-6 text-zinc-900 dark:text-zinc-100 font-bold text-lg">
                <Calculator className="text-emerald-500" />
                <h3>Simulateur de financement</h3>
            </div>

            <div className="space-y-6">
                {/* Total Price Display - Static for Context */}
                <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Prix du bien</span>
                    <span className="font-semibold">{price.toLocaleString()} €</span>
                </div>

                {/* Down Payment */}
                <div className="space-y-3">
                    <div className="flex justify-between text-sm font-medium">
                        <Label>Apport personnel</Label>
                        <span className="text-emerald-600">{downPayment.toLocaleString()} €</span>
                    </div>
                    <Slider
                        value={[downPayment]}
                        min={0}
                        max={price}
                        step={1000}
                        onValueChange={(val) => setDownPayment(val[0])}
                        className="py-2"
                    />
                </div>

                {/* Duration */}
                <div className="space-y-3">
                    <div className="flex justify-between text-sm font-medium">
                        <Label>Durée</Label>
                        <span>{duration} ans</span>
                    </div>
                    <Slider
                        value={[duration]}
                        min={7}
                        max={30}
                        step={1}
                        onValueChange={(val) => setDuration(val[0])}
                        className="py-2"
                    />
                </div>

                {/* Interest Rate */}
                <div className="space-y-3">
                    <div className="flex justify-between text-sm font-medium">
                        <Label>Taux d'intérêt</Label>
                        <span>{rate} %</span>
                    </div>
                    <Slider
                        value={[rate]}
                        min={1}
                        max={10}
                        step={0.1}
                        onValueChange={(val) => setRate(val[0])}
                        className="py-2"
                    />
                </div>

                {/* Result */}
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-4">
                    <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 flex items-center justify-between shadow-sm">
                        <span className="text-sm font-medium text-zinc-500">Mensualités estimées</span>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 block">
                                {monthlyPayment.toLocaleString()} €
                            </span>
                            <span className="text-[10px] text-zinc-400">Hors assurance</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
