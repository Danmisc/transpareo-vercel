"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
    MapPin,
    TrendingUp,
    Clock,
    ArrowRight,
    ShieldCheck,
    Search,
    SlidersHorizontal,
    Filter
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface DealMarketplaceProps {
    loans: any[];
}

export function DealMarketplace({ loans }: DealMarketplaceProps) {
    // --- Filters State ---
    const [search, setSearch] = useState("");
    const [riskFilter, setRiskFilter] = useState("ALL");
    const [minYield, setMinYield] = useState([0]);
    const [sortBy, setSortBy] = useState("newest");

    // --- Derived State (Filtering & Sorting) ---
    const filteredLoans = useMemo(() => {
        let result = [...loans];

        // 1. Search
        if (search) {
            const lower = search.toLowerCase();
            result = result.filter(l =>
                l.title.toLowerCase().includes(lower) ||
                l.location.toLowerCase().includes(lower)
            );
        }

        // 2. Risk
        if (riskFilter !== "ALL") {
            result = result.filter(l => l.riskGrade === riskFilter);
        }

        // 3. Min Yield
        if (minYield[0] > 0) {
            result = result.filter(l => l.apr >= minYield[0]);
        }

        // 4. Sort
        switch (sortBy) {
            case "yield_desc":
                result.sort((a, b) => b.apr - a.apr);
                break;
            case "yield_asc":
                result.sort((a, b) => a.apr - b.apr);
                break;
            case "duration_asc":
                result.sort((a, b) => a.duration - b.duration);
                break;
            case "funded_desc":
                result.sort((a, b) => (b.funded / b.amount) - (a.funded / a.amount));
                break;
            case "newest":
            default:
                result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
        }

        return result;
    }, [loans, search, riskFilter, minYield, sortBy]);

    // --- Stats ---
    const stats = useMemo(() => {
        const totalVolume = filteredLoans.reduce((sum, l) => sum + l.amount, 0);
        const avgYield = filteredLoans.length > 0
            ? filteredLoans.reduce((sum, l) => sum + l.apr, 0) / filteredLoans.length
            : 0;
        return { totalVolume, avgYield };
    }, [filteredLoans]);

    return (
        <div className="space-y-8">

            {/* --- TOP BAR: Stats & Quick Filters --- */}
            <div className="grid lg:grid-cols-4 gap-4 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm">
                <div className="lg:col-span-1 flex items-center justify-center lg:justify-start gap-4 p-2">
                    <div className="text-center lg:text-left">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Volume Dispo.</p>
                        <p className="text-xl font-bold text-zinc-900 dark:text-white">{stats.totalVolume.toLocaleString()} €</p>
                    </div>
                    <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 mx-2" />
                    <div className="text-center lg:text-left">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Rendement Moy.</p>
                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.avgYield.toFixed(1)}%</p>
                    </div>
                </div>

                <div className="lg:col-span-3 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <Input
                            placeholder="Rechercher un projet, une ville..."
                            className="pl-9 bg-zinc-50 dark:bg-black/20 border-zinc-200 dark:border-white/10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[140px] bg-zinc-50 dark:bg-black/20">
                                <SelectValue placeholder="Trier par" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Plus récents</SelectItem>
                                <SelectItem value="yield_desc">Rendement haut</SelectItem>
                                <SelectItem value="duration_asc">Durée courte</SelectItem>
                                <SelectItem value="funded_desc">Financement %</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={riskFilter} onValueChange={setRiskFilter}>
                            <SelectTrigger className="w-[110px] bg-zinc-50 dark:bg-black/20">
                                <SelectValue placeholder="Risque" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tous</SelectItem>
                                <SelectItem value="A">Grade A</SelectItem>
                                <SelectItem value="B">Grade B</SelectItem>
                                <SelectItem value="C">Grade C</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Advanced Filter: Min Yield Slider */}
                <div className="lg:col-span-4 border-t border-zinc-100 dark:border-white/5 pt-4 px-2 flex items-center gap-4">
                    <span className="text-xs font-bold text-zinc-500 flex items-center gap-2">
                        <SlidersHorizontal size={14} /> Min. Rendement: {minYield}%
                    </span>
                    <Slider
                        defaultValue={[0]}
                        max={15}
                        step={0.5}
                        className="w-48"
                        onValueChange={setMinYield}
                    />
                </div>
            </div>

            {/* --- RESULTS GRID --- */}
            {filteredLoans.length === 0 ? (
                <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-white/5 border-dashed">
                    <Search className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Aucun résultat</h3>
                    <p className="text-zinc-500 mb-6">Essayez de modifier vos filtres.</p>
                    <Button variant="outline" onClick={() => { setSearch(""); setRiskFilter("ALL"); setMinYield([0]); }}>
                        Réinitialiser
                    </Button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredLoans.map((loan, i) => {
                            const percentFunded = (loan.funded / loan.amount) * 100;
                            return (
                                <motion.div
                                    key={loan.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <div className="group h-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col">

                                        {/* Header Image Area */}
                                        <div className="h-32 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 relative">
                                            {/* Badges */}
                                            <div className="absolute top-4 left-4 flex gap-2">
                                                <Badge className="bg-white/90 dark:bg-black/50 backdrop-blur-md text-black dark:text-white shadow-sm hover:bg-white">
                                                    {loan.projectType === 'REAL_ESTATE' ? 'Immobilier' : 'Entreprise'}
                                                </Badge>
                                                {loan.apr > 8 && (
                                                    <Badge className="bg-orange-500 text-white border-none animate-pulse">🔥 Hot</Badge>
                                                )}
                                            </div>

                                            <div className="absolute top-4 right-4">
                                                <div className={`
                                                    h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white dark:border-zinc-800
                                                    ${loan.riskGrade === 'A' ? 'bg-emerald-500 text-white' :
                                                        loan.riskGrade === 'B' ? 'bg-yellow-500 text-white' :
                                                            'bg-red-500 text-white'}
                                                `}>
                                                    {loan.riskGrade}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 flex-1 flex flex-col">
                                            {/* Borrower Info & Title */}
                                            <div className="flex justify-between items-start mb-4 relative">
                                                <div>
                                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white line-clamp-1 group-hover:text-orange-600 transition-colors">
                                                        {loan.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                                                        <MapPin size={12} /> {loan.location || "France"}
                                                    </div>
                                                </div>
                                                <Avatar className="w-12 h-12 border-4 border-white dark:border-zinc-900 shadow-sm -mt-12">
                                                    <AvatarImage src={loan.borrower.avatar} />
                                                    <AvatarFallback className="bg-zinc-100 text-zinc-700 font-bold">
                                                        {loan.borrower.name?.[0] || "?"}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>

                                            {/* Key Metrics */}
                                            <div className="grid grid-cols-2 gap-3 mb-6">
                                                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                                                    <p className="text-[10px] uppercase font-bold text-emerald-600/70 dark:text-emerald-400 flex items-center gap-1">
                                                        <TrendingUp size={10} /> Rentabilité
                                                    </p>
                                                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{loan.apr}%</p>
                                                </div>
                                                <div className="bg-zinc-50 dark:bg-white/5 p-3 rounded-xl border border-zinc-100 dark:border-white/5">
                                                    <p className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
                                                        <Clock size={10} /> Durée
                                                    </p>
                                                    <p className="text-xl font-black text-zinc-700 dark:text-zinc-200">{loan.duration}<span className="text-sm font-normal text-zinc-400 ml-1">mois</span></p>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="space-y-2 mb-6">
                                                <div className="flex justify-between text-xs font-medium">
                                                    <span className="text-zinc-500">{Math.round(percentFunded)}% financé</span>
                                                    <span className="text-zinc-900 dark:text-white">
                                                        {loan.amount.toLocaleString()} €
                                                    </span>
                                                </div>
                                                <Progress value={percentFunded} className="h-1.5 bg-zinc-100 dark:bg-zinc-800" indicatorClassName="bg-gradient-to-r from-orange-500 to-amber-500" />
                                            </div>

                                            {/* Action Button */}
                                            <div className="mt-auto">
                                                <Link href={`/p2p/market/${loan.id}`} className="w-full block">
                                                    <Button className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-orange-600 dark:hover:bg-orange-500 hover:text-white border border-transparent hover:border-orange-500/20 shadow-sm hover:shadow-orange-500/20 transition-all group-hover:translate-y-0">
                                                        Investir <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
