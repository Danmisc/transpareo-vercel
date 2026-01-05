"use client";

import { Card } from "@/components/ui/card";
import { Copy, Check, Building2, Globe, QrCode } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RIBProps {
    holder: string;
    iban: string;
    bic: string;
    bankName?: string;
    address?: string;
}

export function RIBComponent({ holder, iban, bic, bankName = "Transpareo Bank", address = "12 Rue de la Bourse, 75002 Paris" }: RIBProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("IBAN copié !");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="p-6 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Building2 size={120} />
            </div>

            <div className="relative z-10 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-2 py-1 inline-block rounded-md mb-2">
                            R.I.B.
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{bankName}</h3>
                        <p className="text-xs text-zinc-500 max-w-[200px]">{address}</p>
                    </div>
                    <div className="bg-zinc-100 dark:bg-zinc-900 p-2 rounded-lg">
                        <QrCode className="w-8 h-8 text-zinc-900 dark:text-white" />
                    </div>
                </div>

                <div className="border-t border-dashed border-zinc-200 dark:border-zinc-800" />

                {/* Account Details */}
                <div className="grid gap-6">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Titulaire du compte</label>
                        <p className="font-medium text-zinc-900 dark:text-white font-mono min-h-[24px]">{holder}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1 relative group/iban cursor-pointer" onClick={() => handleCopy(iban)}>
                            <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-2">
                                IBAN
                                <span className="opacity-0 group-hover/iban:opacity-100 transition-opacity text-xs bg-zinc-100 dark:bg-zinc-800 px-1 rounded text-zinc-500">
                                    Cliquer pour copier
                                </span>
                            </label>
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-lg text-zinc-900 dark:text-white font-mono tracking-wide">{iban}</p>
                                <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-zinc-400" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Code BIC / SWIFT</label>
                            <p className="font-bold text-lg text-zinc-900 dark:text-white font-mono">{bic}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg flex items-center gap-3">
                    <Globe size={16} className="text-zinc-400" />
                    <p className="text-xs text-zinc-500">
                        Compte domicilié en <span className="font-semibold text-zinc-900 dark:text-white">France</span> (FR). Utilisable pour tous vos prélèvements et versements SEPA.
                    </p>
                </div>
            </div>
        </Card>
    );
}
