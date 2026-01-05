"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, ArrowUpRight, ArrowDownLeft, History, ShieldCheck, Lock } from "lucide-react";
import { depositMockFunds } from "@/lib/actions-p2p-wallet";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface WalletProps {
    wallet: any;
    kyc: any;
}

export function WalletDashboard({ wallet, kyc }: WalletProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDeposit = async () => {
        setIsLoading(true);
        try {
            await depositMockFunds(1000); // Mock 1000€ deposit
            toast.success("Dépôt de 1 000 € effectué !");
        } catch (e) {
            toast.error("Erreur lors du dépôt");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="col-span-full lg:col-span-2 relative overflow-hidden h-[340px] rounded-[40px] border-none shadow-2xl group transition-all hover:scale-[1.01] duration-500">
            {/* 1. LAYER: Base Background (Deep Warm Black / White) */}
            <div className="absolute inset-0 bg-[#0f0a05] dark:bg-black" />

            {/* 2. LAYER: Animated Mesh Gradient (Solar Flare) */}
            <div className={`absolute top-[-50%] left-[-20%] w-[150%] h-[150%] bg-[conic-gradient(at_center,_var(--tw-gradient-stops))] from-orange-600 via-amber-600 to-yellow-600 opacity-40 blur-[100px] animate-slow-spin`} />
            <div className="absolute bottom-[-50%] right-[-20%] w-[800px] h-[800px] bg-orange-600/20 rounded-full blur-[120px]" />

            {/* 3. LAYER: Glass Texture Overlay */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px]" />

            {/* 4. CONTENT */}
            <div className="relative z-10 h-full p-8 md:p-10 flex flex-col justify-between">

                {/* Header: Title + Status Pill */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-white/60 font-medium text-sm uppercase tracking-[0.2em]">Total Balance</h2>
                        <div className="flex items-center gap-3">
                            <h1 className="text-white text-6xl md:text-7xl font-bold tracking-tight">
                                {Math.floor(wallet.balance).toLocaleString('fr-FR')}
                                <span className="text-white/40 text-4xl">.{(wallet.balance % 1).toFixed(2).split('.')[1]}</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full text-xs font-bold backdrop-blur-md border border-amber-500/30">
                                <ArrowUpRight size={12} /> +2,4%
                            </span>
                        </div>
                    </div>

                    {kyc?.status === 'VERIFIED' ? (
                        <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-400 shadow-xl">
                            <ShieldCheck size={18} />
                        </div>
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-red-400 shadow-xl">
                            <Lock size={18} />
                        </div>
                    )}
                </div>

                {/* Actions: Glass Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <Button
                        onClick={handleDeposit}
                        disabled={isLoading}
                        className="bg-white text-black hover:bg-zinc-200 h-14 rounded-2xl text-lg font-bold border-none shadow-lg shadow-white/5 transition-transform hover:-translate-y-1"
                    >
                        <Plus size={20} className="mr-2" /> Dépôt
                    </Button>
                    <Button
                        variant="outline"
                        className="bg-black/20 backdrop-blur-xl border-white/10 text-white hover:bg-white/10 h-14 rounded-2xl text-lg font-bold transition-transform hover:-translate-y-1"
                    >
                        <ArrowUpRight size={20} className="mr-2" /> Virement
                    </Button>
                </div>
            </div>
        </Card>
    );
}
