"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Eye, EyeOff, ShieldCheck, CreditCard, Wifi } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VirtualBankCardProps {
    iban: string;
    bic: string;
    holder: string;
    balance: number;
}

export function VirtualBankCard({ iban, bic, holder, balance }: VirtualBankCardProps) {
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copié !`);
    };

    return (
        <div className="relative group perspective-1000 w-full min-h-[260px]">
            {/* The Card */}
            <div className={cn(
                "relative w-full rounded-[32px] overflow-hidden transition-all duration-500 transform-style-3d shadow-2xl",
                "bg-gradient-to-br from-zinc-900 via-neutral-900 to-black border border-white/10"
            )}>
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 animate-pulse-slow pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

                {/* Noise Texture Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

                <CardContent className="relative z-10 p-8 h-full flex flex-col justify-between">
                    {/* Top Row */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-8 rounded bg-gradient-to-r from-yellow-200 to-yellow-500 flex opacity-90 shadow-lg" /> {/* Chip */}
                            <Wifi className="text-white/30 rotate-90" size={24} />
                        </div>
                        <div className="text-right">
                            <h3 className="text-white/90 font-bold text-lg tracking-widest uppercase">Transpareo</h3>
                            <p className="text-white/40 text-[10px] tracking-[0.2em] font-light">INFINITE DEBIT</p>
                        </div>
                    </div>

                    {/* Middle Row (Balance & Numbers) */}
                    <div className="space-y-6 mt-4">
                        <div className="space-y-1">
                            <p className="text-amber-500/80 text-xs font-medium tracking-wider uppercase">Solde Actuel</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-white tracking-tight">
                                    {isDetailsVisible ? balance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '••••,•• €'}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsDetailsVisible(!isDetailsVisible)}
                                    className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10 rounded-full"
                                >
                                    {isDetailsVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {/* IBAN Row */}
                            <div className="bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/5 flex justify-between items-center group/iban hover:bg-white/5 transition-colors cursor-pointer"
                                onClick={() => copyToClipboard(iban, "IBAN")}>
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">IBAN (FR)</p>
                                    <p className="font-mono text-white/90 tracking-wider text-sm sm:text-base">
                                        {isDetailsVisible ? iban : iban.replace(/.(?=.{4})/g, '•')}
                                    </p>
                                </div>
                                <Copy size={14} className="text-white/30 group-hover/iban:text-amber-400 transition-colors" />
                            </div>

                            {/* BIC Row */}
                            {isDetailsVisible && (
                                <div className="flex gap-3">
                                    <div className="bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/5 flex-1 flex justify-between items-center group/bic hover:bg-white/5 transition-colors cursor-pointer"
                                        onClick={() => copyToClipboard(bic, "BIC")}>
                                        <div>
                                            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">BIC</p>
                                            <p className="font-mono text-white/90 text-sm">{bic}</p>
                                        </div>
                                        <Copy size={14} className="text-white/30 group-hover/bic:text-amber-400 transition-colors" />
                                    </div>
                                    <div className="bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/5 flex-1">
                                        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Titulaire</p>
                                        <p className="font-medium text-white/90 text-sm truncate">{holder}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="flex justify-between items-end mt-4">
                        <div className="flex items-center gap-2 text-emerald-400/80 text-xs font-medium bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                            <ShieldCheck size={12} />
                            <span>Vérifié</span>
                        </div>
                        {/* Fake Mastercard Logo */}
                        <div className="flex -space-x-3 opacity-80">
                            <div className="w-10 h-10 rounded-full bg-red-500/80 mix-blend-screen" />
                            <div className="w-10 h-10 rounded-full bg-orange-500/80 mix-blend-screen" />
                        </div>
                    </div>
                </CardContent>
            </div>
        </div>
    );
}
