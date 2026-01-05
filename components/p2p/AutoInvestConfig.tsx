"use client";

import { useState, useEffect } from "react";
import { saveAutoInvestSettings } from "@/lib/actions-p2p-invest";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Zap, ShieldAlert, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface AutoInvestProps {
    initialSettings?: any;
}

export function AutoInvestConfig({ initialSettings }: AutoInvestProps) {
    const [isEnabled, setIsEnabled] = useState(initialSettings?.isEnabled || false);
    const [minInterest, setMinInterest] = useState(initialSettings?.minInterest || 5);
    const [maxDuration, setMaxDuration] = useState(initialSettings?.maxDuration || 24);
    const [amount, setAmount] = useState(initialSettings?.amountPerLoan || 50);
    const [risks, setRisks] = useState<string[]>(initialSettings?.riskTolerance || ["A", "B", "C"]);
    const [loading, setLoading] = useState(false);

    const toggleRisk = (exclude: string) => {
        setRisks(prev => prev.includes(exclude)
            ? prev.filter(r => r !== exclude)
            : [...prev, exclude]
        );
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await saveAutoInvestSettings({
                isEnabled,
                minInterest,
                maxDuration,
                amountPerLoan: amount,
                riskTolerance: risks
            });
            toast.success("Configuration Auto-Invest sauvegardée !");
        } catch (e) {
            toast.error("Erreur lors de la sauvegarde.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-orange-200 dark:border-orange-900/30 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600">
                            <Zap size={16} fill="currentColor" />
                        </div>
                        <div>
                            <CardTitle>Auto-Invest</CardTitle>
                            <p className="text-sm text-zinc-500">Ne ratez aucune opportunité</p>
                        </div>
                    </div>
                    <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className={`space-y-6 transition-opacity duration-300 ${isEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>

                    {/* Amount */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <Label>Montant par projet</Label>
                            <span className="font-bold font-mono">{amount} €</span>
                        </div>
                        <Slider
                            value={[amount]}
                            onValueChange={(val) => setAmount(val[0])}
                            min={20} max={500} step={10}
                            className="py-2.5"
                        />
                    </div>

                    {/* Interest */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <Label>Taux d'intérêt minimum</Label>
                            <span className="font-bold text-green-600">{minInterest}%</span>
                        </div>
                        <Slider
                            value={[minInterest]}
                            onValueChange={(val) => setMinInterest(val[0])}
                            min={2} max={12} step={0.5}
                        />
                    </div>

                    {/* Duration */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <Label>Durée maximum</Label>
                            <span className="font-bold text-zinc-600">{maxDuration} mois</span>
                        </div>
                        <Slider
                            value={[maxDuration]}
                            onValueChange={(val) => setMaxDuration(val[0])}
                            min={6} max={48} step={6}
                        />
                    </div>

                    {/* Risk Tolerance */}
                    <div className="space-y-3">
                        <Label>Niveaux de risque acceptés</Label>
                        <div className="flex gap-2">
                            {["A", "B", "C", "D"].map(grade => (
                                <button
                                    key={grade}
                                    onClick={() => toggleRisk(grade)}
                                    className={`
                                        flex-1 py-2 text-sm font-bold rounded-lg border transition-all
                                        ${risks.includes(grade)
                                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-black border-transparent shadow-sm'
                                            : 'bg-transparent text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'}
                                    `}
                                >
                                    {grade}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
            </CardContent>

            <CardFooter className="bg-zinc-50 dark:bg-white/5 justify-between py-3">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <ShieldAlert size={14} />
                    <span>Capital non garanti</span>
                </div>
                <Button onClick={handleSave} disabled={loading} size="sm" className="bg-orange-600 hover:bg-orange-700">
                    {loading ? "Sauvegarde..." : "Enregistrer"}
                </Button>
            </CardFooter>
        </Card>
    );
}
