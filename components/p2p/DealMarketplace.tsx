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
    Filter,
    Building2,
    Calendar,
    Users
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
    const [projectTypeFilter, setProjectTypeFilter] = useState("ALL");
    const [minYield, setMinYield] = useState([0]);
    const [sortBy, setSortBy] = useState("newest");
    const [showFilters, setShowFilters] = useState(false);

    // Project types
    const PROJECT_TYPES = [
        { value: "ALL", label: "Tous les projets" },
        { value: "REAL_ESTATE", label: "Immobilier" },
        { value: "RENOVATION", label: "Rénovation" },
        { value: "BUSINESS", label: "Commerce" },
        { value: "GREEN_ENERGY", label: "Énergie Verte" }
    ];

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

        // 3. Project Type
        if (projectTypeFilter !== "ALL") {
            result = result.filter(l => l.projectType === projectTypeFilter);
        }

        // 4. Min Yield
        if (minYield[0] > 0) {
            result = result.filter(l => l.apr >= minYield[0]);
        }

        // 5. Sort
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
            case "investors_desc":
                result.sort((a, b) => (b.investorCount || 0) - (a.investorCount || 0));
                break;
            case "newest":
            default:
                result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
        }

        return result;
    }, [loans, search, riskFilter, projectTypeFilter, minYield, sortBy]);

    // Helpers for card styling
    const getRiskColor = (grade: string) => {
        switch (grade) {
            case "A": return "bg-emerald-500 text-white shadow-emerald-500/30";
            case "B": return "bg-amber-500 text-white shadow-amber-500/30";
            case "C": return "bg-orange-500 text-white shadow-orange-500/30";
            case "D": return "bg-red-500 text-white shadow-red-500/30";
            default: return "bg-zinc-500 text-white";
        }
    };

    const getTypeLabel = (type: string) => {
        const t = PROJECT_TYPES.find(pt => pt.value === type);
        return t ? t.label : type;
    };

    return (
        <div className="space-y-8">

            {/* --- Filter Bar --- */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-4">

                    {/* Search */}
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <Input
                            placeholder="Rechercher un projet, une ville..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-11 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-xl"
                        />
                    </div>

                    {/* Quick Filters */}
                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        <Select value={projectTypeFilter} onValueChange={setProjectTypeFilter}>
                            <SelectTrigger className="w-[180px] h-11 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700">
                                <SelectValue placeholder="Type de projet" />
                            </SelectTrigger>
                            <SelectContent>
                                {PROJECT_TYPES.map(type => (
                                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[180px] h-11 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700">
                                <SelectValue placeholder="Trier par" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Plus récents</SelectItem>
                                <SelectItem value="yield_desc">Rendement le plus haut</SelectItem>
                                <SelectItem value="duration_asc">Durée la plus courte</SelectItem>
                                <SelectItem value="funded_desc">Le plus financé</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            size="icon"
                            className={`h-11 w-11 rounded-xl shrink-0 ${showFilters ? 'bg-orange-50 border-orange-200 text-orange-600' : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <SlidersHorizontal size={18} />
                        </Button>
                    </div>
                </div>

                {/* Advanced Filters (Collapsible) */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-6 mt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">
                                        Rendement minimal: {minYield[0]}%
                                    </label>
                                    <Slider
                                        defaultValue={[0]}
                                        max={15}
                                        step={0.5}
                                        value={minYield}
                                        onValueChange={setMinYield}
                                        className="py-4"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                        Niveau de Risque Max
                                    </label>
                                    <div className="flex gap-2">
                                        {["A", "B", "C", "D"].map((grade) => (
                                            <Button
                                                key={grade}
                                                variant={riskFilter === grade ? "default" : "outline"}
                                                onClick={() => setRiskFilter(riskFilter === grade ? "ALL" : grade)}
                                                className={`flex-1 rounded-lg ${riskFilter === grade ? getRiskColor(grade) : ""}`}
                                            >
                                                Grade {grade}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- Results Grid --- */}
            {filteredLoans.length === 0 ? (
                <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="text-zinc-400" size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Aucun projet trouvé</h3>
                    <p className="text-zinc-500 max-w-sm mx-auto">
                        Essayez de modifier vos filtres ou revenez plus tard pour de nouvelles opportunités.
                    </p>
                    <Button
                        variant="link"
                        onClick={() => {
                            setSearch("");
                            setRiskFilter("ALL");
                            setProjectTypeFilter("ALL");
                            setMinYield([0]);
                        }}
                        className="mt-4 text-orange-600"
                    >
                        Réinitialiser les filtres
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredLoans.map((loan) => {
                        const percentFunded = (loan.funded / loan.amount) * 100;
                        const isFullyFunded = percentFunded >= 100;

                        return (
                            <Link href={`/p2p/market/${loan.id}`} key={loan.id} className="group">
                                <Card className="h-full flex flex-col overflow-hidden bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:shadow-2xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-500 rounded-2xl relative">

                                    {/* Image / Gradient Header */}
                                    <div className="h-56 relative overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                        {/* Fallback pattern if no image */}
                                        <div className={`absolute inset-0 bg-gradient-to-br transition-transform duration-700 group-hover:scale-105 ${loan.projectType === "REAL_ESTATE" ? "from-slate-800 to-slate-900" :
                                                loan.projectType === "GREEN_ENERGY" ? "from-emerald-800 to-emerald-900" :
                                                    "from-zinc-800 to-zinc-900"
                                            }`} >
                                            {/* Decorative pattern could go here */}
                                            <div className="absolute inset-0 opacity-20"
                                                style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}
                                            />
                                        </div>

                                        {/* Overlay Info */}
                                        <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                                            <div className="flex justify-between items-end">
                                                <Badge className={`font-bold border-none ${getRiskColor(loan.riskGrade)}`}>
                                                    Grade {loan.riskGrade}
                                                </Badge>
                                                <div className="flex items-center gap-1 text-white/90 text-sm font-medium bg-black/30 backdrop-blur-md px-2 py-1 rounded-md">
                                                    <MapPin size={12} /> {loan.location}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        {isFullyFunded && (
                                            <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                                <ShieldCheck size={12} /> Financé
                                            </div>
                                        )}
                                    </div>

                                    <CardContent className="flex-1 p-6">
                                        <div className="mb-4">
                                            <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mb-1 tracking-wide uppercase">
                                                {getTypeLabel(loan.projectType)}
                                            </p>
                                            <h3 className="font-bold text-xl text-zinc-900 dark:text-white line-clamp-1 group-hover:text-orange-600 transition-colors">
                                                {loan.title}
                                            </h3>
                                            <p className="text-sm text-zinc-500 mt-2 line-clamp-2">
                                                {loan.description || "Une opportunité d'investissement unique avec des rendements attractifs et une sécurité renforcée."}
                                            </p>
                                        </div>

                                        {/* Metrics Grid */}
                                        <div className="grid grid-cols-3 gap-2 mt-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                            <div className="text-center">
                                                <p className="text-xs text-zinc-500 uppercase font-bold">Rendement</p>
                                                <p className="text-lg font-black text-emerald-600">{loan.apr}%</p>
                                            </div>
                                            <div className="text-center border-l border-zinc-200 dark:border-zinc-700">
                                                <p className="text-xs text-zinc-500 uppercase font-bold">Durée</p>
                                                <p className="text-lg font-bold text-zinc-900 dark:text-white">{loan.duration} mois</p>
                                            </div>
                                            <div className="text-center border-l border-zinc-200 dark:border-zinc-700">
                                                <p className="text-xs text-zinc-500 uppercase font-bold">Objectif</p>
                                                <p className="text-lg font-bold text-zinc-900 dark:text-white">{(loan.amount / 1000).toFixed(0)}k€</p>
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="p-6 pt-0 block">
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-bold text-zinc-900 dark:text-white">{percentFunded.toFixed(0)}% financé</span>
                                                <span className="text-zinc-500">{loan.investorCount || 12} investisseurs</span>
                                            </div>
                                            <Progress value={percentFunded} className="h-2.5 bg-zinc-100 dark:bg-zinc-800" indicatorClassName="bg-gradient-to-r from-orange-500 to-amber-500" />

                                            <Button className={`w-full mt-4 rounded-xl group-hover:translate-y-0 transition-all ${isFullyFunded ? 'bg-zinc-100 text-zinc-400' : 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-orange-600 dark:hover:bg-zinc-200'}`} disabled={isFullyFunded}>
                                                {isFullyFunded ? "Financement terminé" : "Voir le projet"}
                                                {!isFullyFunded && <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />}
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

