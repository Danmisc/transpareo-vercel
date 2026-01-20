"use client";

import { useState } from "react";
import { Banknote, ArrowLeft, Info, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const taxResidences = [
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'BE', name: 'Belgique', flag: '🇧🇪' },
    { code: 'CH', name: 'Suisse', flag: '🇨🇭' },
    { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
    { code: 'OTHER', name: 'Autre pays', flag: '🌍' },
];

export default function TaxSettingsPage() {
    const [residence, setResidence] = useState('FR');
    const [nif, setNif] = useState('');

    return (
        <div className="max-w-xl mx-auto py-8 px-4">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/p2p/settings">
                        <ArrowLeft size={20} />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Fiscalité</h1>
                    <p className="text-zinc-500 mt-1">Configuration pour les rapports fiscaux</p>
                </div>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Banknote size={18} className="text-indigo-600" />
                            Résidence fiscale
                        </CardTitle>
                        <CardDescription>
                            Pays où vous payez vos impôts
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {taxResidences.map((country) => (
                                <button
                                    key={country.code}
                                    onClick={() => setResidence(country.code)}
                                    className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${residence === country.code
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                                        }`}
                                >
                                    <span>{country.flag}</span>
                                    <span className="text-sm font-medium text-zinc-900 dark:text-white">{country.name}</span>
                                    {residence === country.code && (
                                        <Check size={14} className="ml-auto text-indigo-600" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Numéro fiscal</CardTitle>
                        <CardDescription>
                            Numéro d&apos;identification fiscale (NIF/TIN)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder={residence === 'FR' ? 'Ex: 1234567890123' : 'Votre numéro fiscal'}
                            value={nif}
                            onChange={(e) => setNif(e.target.value)}
                        />
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                            <Info size={16} className="flex-shrink-0 text-amber-600 mt-0.5" />
                            <p className="text-sm text-amber-700 dark:text-amber-400">
                                Ce numéro est requis pour générer votre IFU (Imprimé Fiscal Unique)
                                et déclarer vos revenus de crowdfunding.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Documents fiscaux</CardTitle>
                        <CardDescription>
                            Téléchargez vos rapports annuels
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                                <div>
                                    <p className="font-medium text-zinc-900 dark:text-white">IFU 2025</p>
                                    <p className="text-xs text-zinc-500">Disponible en février 2026</p>
                                </div>
                                <Button variant="outline" size="sm" disabled>À venir</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Button className="w-full">Enregistrer</Button>
            </div>
        </div>
    );
}

