"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, ExternalLink } from "lucide-react";
import { ConnectBankReal } from "./ConnectBankReal";

interface LinkedAccount {
    id: string;
    providerName: string;
    accountName: string;
    mask: string;
    balance: number;
    lastSync: Date;
}

export function ExternalAccountsList({ accounts }: { accounts: LinkedAccount[] }) {

    // Helper for logo (mock)
    const getLogoColor = (name: string) => {
        if (name.includes("Revolut")) return "bg-black text-white";
        if (name.includes("Bourso")) return "bg-pink-600 text-white";
        if (name.includes("BNP")) return "bg-emerald-700 text-white";
        return "bg-zinc-800 text-white";
    };

    const getLogoLetter = (name: string) => name[0];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Comptes Externes</h2>
            </div>

            {accounts.length === 0 ? (
                <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <CardContent className="flex flex-col items-start p-6">
                        <p className="font-semibold text-zinc-900 dark:text-white text-sm">Aucun compte connecté</p>
                        <p className="text-xs text-zinc-500 mt-1 mb-4">
                            Connectez vos autres banques pour voir tout votre argent au même endroit.
                        </p>
                        <ConnectBankReal />
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {accounts.map(acc => (
                        <div key={acc.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 flex items-center justify-between hover:border-zinc-300 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs ${getLogoColor(acc.providerName)}`}>
                                    {getLogoLetter(acc.providerName)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">{acc.providerName}</h3>
                                    <p className="text-[11px] text-zinc-500">{acc.accountName} •••• {acc.mask}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-zinc-900 dark:text-white">
                                    {acc.balance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                </p>
                                <div className="text-[10px] text-zinc-400 flex items-center justify-end gap-1">
                                    <RefreshCw size={10} /> Sync
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="pt-2">
                        <ConnectBankReal />
                    </div>
                </div>
            )}
        </div>
    );
}
