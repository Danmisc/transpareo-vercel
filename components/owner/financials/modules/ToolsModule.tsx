"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, FileText, TrendingUp, Zap, Scale, Check, AlertCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function ToolsModule({ data }: { data: any }) {

    // --- STATE ---

    // 1. Rent Indexer
    const [currentRent, setCurrentRent] = useState(850);
    const [oldIndex, setOldIndex] = useState(139.73); // Q1 2023
    const [newIndex, setNewIndex] = useState(143.46); // Q1 2024
    const revisedRent = (currentRent * (newIndex / oldIndex));
    const increase = revisedRent - currentRent;

    // 2. Capital Gains
    const [purchasePrice, setPurchasePrice] = useState(250000);
    const [yearsOwned, setYearsOwned] = useState(8);
    const [sellingPrice, setSellingPrice] = useState(320000);

    // Simple Abattement Logic (Rough approx for demo)
    const calculateTax = () => {
        const gain = sellingPrice - purchasePrice;
        // Abattement progessif (IR) - Mock logic
        let abatRate = 0;
        if (yearsOwned > 5) abatRate = (yearsOwned - 5) * 0.06;
        if (yearsOwned > 21) abatRate = 1; // Cap at 22-30

        const taxableBase = gain * (1 - Math.min(abatRate, 1));
        const tax = taxableBase * 0.19; // 19% fixed
        const social = taxableBase * 0.172; // 17.2% CSG/CRDS
        return { gain, tax: tax + social, net: gain - (tax + social) };
    };
    const cgt = calculateTax();

    // 3. DPE Simulator
    const [dpeScore, setDpeScore] = useState(280); // Class F approx
    const getDpeClass = (score: number) => {
        if (score < 70) return { label: 'A', color: 'bg-emerald-500' };
        if (score < 110) return { label: 'B', color: 'bg-emerald-400' };
        if (score < 180) return { label: 'C', color: 'bg-lime-400' };
        if (score < 250) return { label: 'D', color: 'bg-yellow-400' };
        if (score < 330) return { label: 'E', color: 'bg-orange-400' };
        if (score < 420) return { label: 'F', color: 'bg-orange-600' };
        return { label: 'G', color: 'bg-red-600' };
    };
    const currentClass = getDpeClass(dpeScore);
    const projectedClass = getDpeClass(dpeScore - 90); // Simulating Insulation

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full animate-in fade-in zoom-in-95 duration-300">

            {/* LEFT: MENU / NAVIGATION (Optional, simplified as Tabs for now) */}
            <div className="lg:col-span-12">
                <Tabs defaultValue="indexation" className="w-full">
                    <TabsList className="w-full justify-start h-12 bg-white/50 backdrop-blur-sm p-1 border border-zinc-200/50 mb-6 rounded-xl">
                        <TabsTrigger value="indexation" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 gap-2">
                            <TrendingUp size={16} className="text-emerald-600" />
                            Révision Loyer
                        </TabsTrigger>
                        <TabsTrigger value="capital" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 gap-2">
                            <Scale size={16} className="text-indigo-600" />
                            Plus-Value
                        </TabsTrigger>
                        <TabsTrigger value="dpe" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 gap-2">
                            <Zap size={16} className="text-amber-600" />
                            Audit DPE
                        </TabsTrigger>
                        <TabsTrigger value="legal" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 gap-2">
                            <FileText size={16} className="text-slate-600" />
                            Documents
                        </TabsTrigger>
                    </TabsList>

                    {/* 1. RENT INDEXATION */}
                    <TabsContent value="indexation" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="bg-white border-zinc-100 shadow-md">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Calculator className="text-emerald-500" size={20} />
                                        Calculateur IRL
                                    </CardTitle>
                                    <CardDescription>Indice de Référence des Loyers (INSEE)</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-zinc-500">Loyer Actuel (HC)</label>
                                            <div className="relative">
                                                <Input type="number" value={currentRent} onChange={(e) => setCurrentRent(parseFloat(e.target.value))} className="pl-8 font-mono" />
                                                <span className="absolute left-3 top-2.5 text-zinc-400">€</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-zinc-500">Trimestre</label>
                                            <div className="h-10 flex items-center px-3 bg-zinc-50 border border-zinc-200 rounded-md text-sm text-zinc-600">
                                                Q1 2024
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-emerald-600 font-medium">Nouveau Loyer Autorisé</p>
                                            <p className="text-2xl font-black text-emerald-700">{revisedRent.toFixed(2)} €</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-emerald-600 font-medium">Augmentation</p>
                                            <p className="text-lg font-bold text-emerald-600">+{increase.toFixed(2)} €</p>
                                        </div>
                                    </div>

                                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                                        <FileText className="mr-2 h-4 w-4" />
                                        Générer Avis d'Augmentation (PDF)
                                    </Button>
                                </CardContent>
                            </Card>

                            <div className="space-y-4">
                                <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none shadow-lg">
                                    <CardContent className="p-6">
                                        <h3 className="font-bold text-lg mb-2">Pourquoi réviser ?</h3>
                                        <p className="text-emerald-50 text-sm leading-relaxed mb-4">
                                            Sur 10 ans, ne pas réviser le loyer représente une perte de pouvoir d'achat estimée à <strong>~12%</strong>.
                                            C'est un droit légal à exercer chaque année à la date anniversaire.
                                        </p>
                                        <div className="flex gap-2">
                                            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none">Légal</Badge>
                                            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none">Inflation</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* 2. CAPITAL GAINS */}
                    <TabsContent value="capital" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="bg-white border-zinc-100 shadow-md">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Scale className="text-indigo-500" size={20} />
                                        Simulateur Plus-Value
                                    </CardTitle>
                                    <CardDescription>Estimation nette après impôt (LMNP/Privé)</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500">Prix Achat + Frais</span>
                                            <span className="font-mono">{purchasePrice.toLocaleString()} €</span>
                                        </div>
                                        <Slider value={[purchasePrice]} max={500000} step={1000} onValueChange={(v) => setPurchasePrice(v[0])} />

                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500">Prix Revente Est.</span>
                                            <span className="font-mono">{sellingPrice.toLocaleString()} €</span>
                                        </div>
                                        <Slider value={[sellingPrice]} max={600000} step={1000} onValueChange={(v) => setSellingPrice(v[0])} />

                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500">Durée Détention</span>
                                            <span className="font-mono">{yearsOwned} ans</span>
                                        </div>
                                        <Slider value={[yearsOwned]} max={30} step={1} onValueChange={(v) => setYearsOwned(v[0])} />
                                    </div>

                                    <div className="pt-4 border-t border-zinc-100 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Masse Plus-Value</span>
                                            <span className="font-bold">{cgt.gain.toLocaleString()} €</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-red-500">
                                            <span>Impôt Latent (Est.)</span>
                                            <span className="font-bold">-{cgt.tax.toFixed(0)} €</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-black text-indigo-700 bg-indigo-50 p-2 rounded-lg">
                                            <span>Net Vendeur</span>
                                            <span>{cgt.net.toLocaleString()} €</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white border-zinc-100">
                                <CardHeader>
                                    <CardTitle className="text-sm text-zinc-600">Impact de la Détention</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <p className="text-xs text-zinc-500">
                                            L'exonération progresse avec le temps.
                                            À <strong className="text-zinc-900">{yearsOwned} ans</strong>, vous bénéficiez d'un abattement partiel.
                                        </p>
                                        <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                                            <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${Math.min((yearsOwned / 30) * 100, 100)}%` }}></div>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-zinc-400">
                                            <span>0 ans</span>
                                            <span>Exo Totale (30 ans)</span>
                                        </div>

                                        <div className="mt-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                            <h4 className="text-sm font-bold text-indigo-800 mb-1">Conseil de l'IA</h4>
                                            <p className="text-xs text-indigo-600">
                                                Attendre encore <strong>{Math.max(22 - yearsOwned, 0)} ans</strong> vous permettrait d'exonérer totalement l'impôt sur le revenu (hors prélèvements sociaux).
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* 3. DPE SIMULATOR */}
                    <TabsContent value="dpe" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="bg-white border-zinc-100 shadow-md">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Zap className="text-amber-500" size={20} />
                                        Simulateur Rénovation
                                    </CardTitle>
                                    <CardDescription>Impact des travaux sur la classe Énergétique</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-center py-6 gap-8">
                                        {/* Current Score */}
                                        <div className="text-center">
                                            <p className="text-xs text-zinc-500 mb-2">Actuel</p>
                                            <div className={`w-16 h-16 ${currentClass.color} rounded-xl flex items-center justify-center text-3xl font-black text-white shadow-lg`}>
                                                {currentClass.label}
                                            </div>
                                            <p className="text-xs font-mono text-zinc-400 mt-1">{dpeScore} kWh</p>
                                        </div>

                                        <ArrowRight className="text-zinc-300" />

                                        {/* Projected Score */}
                                        <div className="text-center">
                                            <p className="text-xs text-zinc-500 mb-2">Projeté</p>
                                            <div className={`w-16 h-16 ${projectedClass.color} rounded-xl flex items-center justify-center text-3xl font-black text-white shadow-lg ring-4 ring-amber-100 scale-110`}>
                                                {projectedClass.label}
                                            </div>
                                            <p className="text-xs font-mono text-zinc-400 mt-1">{dpeScore - 90} kWh</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100 cursor-pointer hover:bg-zinc-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded bg-zinc-200 flex items-center justify-center"><Check size={14} className="text-zinc-500" /></div>
                                                <span className="text-sm font-medium text-zinc-700">Isolation Murs (Intérieur)</span>
                                            </div>
                                            <span className="text-xs font-bold text-amber-600">+45 pts</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100 cursor-pointer hover:bg-zinc-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded bg-zinc-200 flex items-center justify-center"><Check size={14} className="text-zinc-500" /></div>
                                                <span className="text-sm font-medium text-zinc-700">Changement Fenêtres (Double V.)</span>
                                            </div>
                                            <span className="text-xs font-bold text-amber-600">+15 pts</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100 cursor-pointer hover:bg-zinc-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded bg-zinc-200 flex items-center justify-center"><Check size={14} className="text-zinc-500" /></div>
                                                <span className="text-sm font-medium text-zinc-700">VMC Hygroréglable</span>
                                            </div>
                                            <span className="text-xs font-bold text-amber-600">+30 pts</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ROI Card */}
                            <Card className="bg-amber-50 border-amber-100">
                                <CardContent className="p-6">
                                    <h3 className="font-bold text-amber-900 text-lg mb-4">Valeur Verte 🌿</h3>
                                    <p className="text-sm text-amber-800 mb-6">
                                        Passer de la classe F à D augmente la valeur vénale de votre bien d'environ <strong>5 à 11%</strong> selon la région.
                                    </p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-amber-800/70">Coût Travaux Est.</span>
                                            <span className="font-bold text-amber-900">12 000 €</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-amber-800/70">Plus-Value Latente</span>
                                            <span className="font-bold text-emerald-600">+25 000 €</span>
                                        </div>
                                        <div className="h-px bg-amber-200 my-2"></div>
                                        <div className="flex justify-between text-sm font-bold">
                                            <span className="text-amber-900">ROI Immédiat</span>
                                            <span className="text-emerald-600">208 %</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* 4. DOCUMENTS (Quick Access) */}
                    <TabsContent value="legal" className="mt-0">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {['Quittance de Loyer', 'Avis Échéance', 'Régularisation Charges', 'Attestation de Loyer', 'Relance Impayé (Simple)', 'Mise en Demeure (AR)'].map((doc, i) => (
                                <Card key={i} className="hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group">
                                    <CardContent className="p-4 flex flex-col items-center justify-center text-center h-32 gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                                            <FileText className="text-indigo-600" size={20} />
                                        </div>
                                        <span className="text-xs font-medium text-zinc-700 group-hover:text-indigo-700">{doc}</span>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                </Tabs>
            </div>

        </div>
    );
}
