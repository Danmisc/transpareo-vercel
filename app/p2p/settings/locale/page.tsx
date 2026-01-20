"use client";

import { useState } from "react";
import { Globe, ArrowLeft, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

const currencies = [
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'USD', symbol: '$', name: 'Dollar américain' },
    { code: 'GBP', symbol: '£', name: 'Livre sterling' },
    { code: 'CHF', symbol: 'Fr', name: 'Franc suisse' },
];

export default function LocaleSettingsPage() {
    const [selectedLang, setSelectedLang] = useState('fr');
    const [selectedCurrency, setSelectedCurrency] = useState('EUR');

    return (
        <div className="max-w-xl mx-auto py-8 px-4">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/p2p/settings">
                        <ArrowLeft size={20} />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Langue & Région</h1>
                    <p className="text-zinc-500 mt-1">Personnalisez votre expérience</p>
                </div>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe size={18} className="text-indigo-600" />
                            Langue
                        </CardTitle>
                        <CardDescription>Choisissez la langue de l&apos;interface</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => setSelectedLang(lang.code)}
                                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${selectedLang === lang.code
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                                        }`}
                                >
                                    <span className="text-xl">{lang.flag}</span>
                                    <span className="font-medium text-zinc-900 dark:text-white">{lang.name}</span>
                                    {selectedLang === lang.code && (
                                        <Check size={16} className="ml-auto text-indigo-600" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Devise</CardTitle>
                        <CardDescription>Devise d&apos;affichage des montants</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                            {currencies.map((currency) => (
                                <button
                                    key={currency.code}
                                    onClick={() => setSelectedCurrency(currency.code)}
                                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${selectedCurrency === currency.code
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                                        }`}
                                >
                                    <span className="text-lg font-bold text-zinc-600">{currency.symbol}</span>
                                    <div className="text-left">
                                        <p className="font-medium text-zinc-900 dark:text-white">{currency.code}</p>
                                        <p className="text-xs text-zinc-500">{currency.name}</p>
                                    </div>
                                    {selectedCurrency === currency.code && (
                                        <Check size={16} className="ml-auto text-indigo-600" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Button className="w-full">Enregistrer les préférences</Button>
            </div>
        </div>
    );
}

