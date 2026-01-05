"use client";

import { useState } from "react";
import {
    LayoutGrid,
    ArrowLeft,
    TrendingUp,
    Wallet,
    Target,
    Building,
    MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

// Modules
import { CashflowModule } from "./modules/CashflowModule";
import { FiscalModule } from "./modules/FiscalModule";
import { DebtModule } from "./modules/DebtModule";
import { ToolsModule } from "./modules/ToolsModule";
import { YieldShield } from "./smart/YieldShield";
// import { AssetModule } from "./modules/AssetModule"; // Not yet implemented

interface FinancialCockpitProps {
    data: any; // The full dataset from getFinancialStats
}

export function FinancialCockpit({ data }: FinancialCockpitProps) {
    const [activeModule, setActiveModule] = useState<string | null>(null);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    // --- RENDERERS ---

    // 1. The Deep Dive View (Full Screen Module)
    if (activeModule) {
        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveModule(null)}
                        className="text-zinc-500 hover:text-zinc-900"
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        Retour au Cockpit
                    </Button>
                    <h2 className="text-xl font-bold text-zinc-900">
                        {activeModule === 'CASHFLOW' && 'Trésorerie & Flux'}
                        {activeModule === 'FISCAL' && 'Laboratoire Fiscal'}
                        {activeModule === 'DEBT' && 'Structure de la Dette'}
                        {activeModule === 'TOOLS' && 'Boîte à Outils & Utilitaires'}
                    </h2>
                </div>

                {activeModule === 'CASHFLOW' && <CashflowModule data={data} />}
                {activeModule === 'FISCAL' && <FiscalModule data={data} />}
                {activeModule === 'DEBT' && <DebtModule data={data} />}
                {activeModule === 'TOOLS' && <ToolsModule data={data} />}
            </div>
        );
    }

    // 2. The Cockpit View (Bento Grid)
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col gap-4"
        >
            {/* INNOVATION LAYER: YIELD SHIELD */}
            <motion.div variants={itemVariants}>
                <YieldShield data={data} />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-4 h-auto md:h-[450px]">
                {/* LARGE BLOCK: CASHFLOW (Top Left - 2x1) */}
                <motion.div
                    variants={itemVariants}
                    className="md:col-span-2 md:row-span-1 bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                    onClick={() => setActiveModule('CASHFLOW')}
                >
                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="secondary" className="rounded-full w-7 h-7">
                            <ArrowLeft className="rotate-180" size={12} />
                        </Button>
                    </div>

                    <div className="flex justify-between items-start mb-3">
                        <div className="bg-emerald-50 p-2.5 rounded-xl">
                            <Wallet className="text-emerald-600" size={20} />
                        </div>
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Trésorerie
                        </span>
                    </div>

                    <div>
                        <h3 className="text-zinc-500 font-medium text-xs">Cashflow Net (Poche)</h3>
                        <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-3xl font-black text-zinc-900 tracking-tight">
                                {data.kpi.cashflow.toLocaleString()} €
                            </span>
                            <span className="text-emerald-500 text-[10px] font-bold flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">
                                <TrendingUp size={10} className="mr-1" /> Satisfaisant
                            </span>
                        </div>
                        <p className="text-zinc-400 text-[11px] mt-3 line-clamp-1">
                            Surplus mensuel de <strong>{(data.kpi.cashflow / 12).toFixed(0)}€/mois</strong> après toutes charges.
                        </p>
                    </div>
                </motion.div>

                {/* TALL BLOCK: FISCAL (Right - 1x2) */}
                <motion.div
                    variants={itemVariants}
                    className="md:col-span-1 md:row-span-2 bg-slate-900 p-5 rounded-2xl shadow-lg text-white cursor-pointer group relative overflow-hidden"
                    onClick={() => setActiveModule('FISCAL')}
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="secondary" className="rounded-full w-7 h-7 bg-white/10 text-white hover:bg-white/20 border-none">
                            <ArrowLeft className="rotate-180" size={12} />
                        </Button>
                    </div>

                    <div className="flex flex-col h-full justify-between">
                        <div>
                            <div className="bg-white/10 w-fit p-2.5 rounded-xl mb-4 backdrop-blur-sm">
                                <Target className="text-indigo-300" size={20} />
                            </div>
                            <h3 className="text-indigo-200 font-medium text-[10px] uppercase tracking-wider mb-0.5">Fiscalité</h3>
                            <p className="text-xl font-bold text-white mb-4">Optimisation</p>

                            <div className="space-y-3">
                                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                    <span className="text-[10px] text-slate-400 block mb-0.5">Résultat Compta.</span>
                                    <span className="text-lg font-mono font-bold">
                                        {(data.kpi.income - data.fiscal.deductibleExpenses - data.fiscal.amortization - data.loan.interestsPaid).toLocaleString()} €
                                    </span>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                    <span className="text-[10px] text-slate-400 block mb-0.5">Amortissement (LMNP)</span>
                                    <span className="text-lg font-mono font-bold text-emerald-400">
                                        -{data.fiscal.amortization.toLocaleString()} €
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="flex items-center gap-2 text-[10px] text-indigo-300">
                                <LayoutGrid size={12} />
                                <span>Simulateur complet inclus</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* SMALL BLOCK: DEBT (Bottom Left - 1x1) */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative"
                    onClick={() => setActiveModule('DEBT')}
                >
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="rounded-full w-7 h-7">
                            <ArrowLeft className="rotate-180" size={12} />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="bg-orange-50 p-2 rounded-lg">
                            <Building className="text-orange-600" size={18} />
                        </div>
                        <span className="font-bold text-zinc-700 text-xs">Financement</span>
                    </div>
                    <div>
                        <p className="text-[10px] text-zinc-400">Capital Amorti</p>
                        <p className="text-lg font-black text-zinc-900 mt-0.5">{data.loan.capitalAmortized.toLocaleString()} €</p>
                        <div className="w-full bg-zinc-100 h-1 rounded-full mt-2 overflow-hidden">
                            <div className="bg-orange-500 h-full w-[45%]"></div>
                        </div>
                    </div>
                </motion.div>

                {/* SMALL BLOCK: ACTIONS (Bottom Middle - 1x1) */}
                <motion.div
                    variants={itemVariants}
                    className="bg-zinc-50 p-5 rounded-2xl border border-dashed border-zinc-300 hover:border-zinc-400 hover:bg-zinc-100 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1"
                    onClick={() => setActiveModule('TOOLS')}
                >
                    <div className="bg-white p-2.5 rounded-full shadow-sm mb-1">
                        <MoreHorizontal className="text-zinc-400" size={18} />
                    </div>
                    <p className="font-bold text-zinc-600 text-xs">Plus d'outils</p>
                    <p className="text-[9px] text-zinc-400">Baux, Assurance, DPE...</p>
                </motion.div>
            </div>
        </motion.div>
    );
}
