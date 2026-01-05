"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, ShieldCheck, TrendingUp } from "lucide-react";
import { investInLoan } from "@/lib/actions-p2p-loans";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface InvestWidgetProps {
    loan: any;
    maxInvest: number; // User wallet balance
}

export function InvestWidget({ loan, maxInvest }: InvestWidgetProps) {
    const [amount, setAmount] = useState(100);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleInvest = async () => {
        if (amount > maxInvest) {
            toast.error("Fonds insuffisants. Veuillez recharger votre wallet.");
            return;
        }

        setLoading(true);
        try {
            await investInLoan(loan.id, amount);
            toast.success(`Investissement de ${amount}€ confirmé !`);
            router.refresh();
        } catch (e) {
            toast.error("Erreur, vérifiez votre solde.");
        } finally {
            setLoading(false);
        }
    };

    const remaining = loan.amount - loan.funded;
    const effectiveMax = Math.min(maxInvest, remaining);

    return (
        <Card className="border-orange-200 dark:border-orange-900/30 bg-white dark:bg-zinc-900 shadow-2xl sticky top-24">
            <div className="h-2 bg-gradient-to-r from-orange-500 to-amber-500" />
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Investir</span>
                    <span className="text-sm font-normal text-zinc-500">Disponible: {maxInvest} €</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="flex justify-between">
                        <Label>Montant à investir</Label>
                        <span className="text-2xl font-bold font-mono text-orange-600">{amount} €</span>
                    </div>
                    <Slider
                        value={[amount]}
                        min={10}
                        max={effectiveMax} // Cap at wallet balance or loan remaining
                        step={10}
                        onValueChange={(v) => setAmount(v[0])}
                        disabled={effectiveMax <= 0}
                    />
                    <div className="flex justify-between text-xs text-zinc-500">
                        <span>10 €</span>
                        <span>{effectiveMax} €</span>
                    </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-zinc-500">Intérêts estimés</span>
                        <span className="font-bold text-emerald-600">+{Math.round(amount * (loan.apr / 100))} € /an</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-500">Durée</span>
                        <span className="font-bold">{loan.duration} mois</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    onClick={handleInvest}
                    disabled={loading || effectiveMax <= 0}
                    className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold"
                >
                    {loading ? <Loader2 className="animate-spin" /> : "Confirmer l'investissement"}
                </Button>
            </CardFooter>
        </Card>
    );
}
