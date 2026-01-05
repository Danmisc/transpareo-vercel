"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Calendar,
    Filter,
    X,
    ChevronDown,
    Search
} from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface TransactionFiltersProps {
    onFiltersChange: (filters: {
        search?: string;
        category?: string;
        type?: string;
        status?: string;
        dateFrom?: string;
        dateTo?: string;
        minAmount?: number;
        maxAmount?: number;
    }) => void;
}

const CATEGORIES = [
    { value: "INVESTMENT", label: "Investissement" },
    { value: "SALARY", label: "Salaire" },
    { value: "SUBSCRIPTION", label: "Abonnement" },
    { value: "TRANSFER", label: "Virement" },
    { value: "FEE", label: "Frais" },
    { value: "SHOPPING", label: "Achats" },
    { value: "UTILITIES", label: "Services" },
    { value: "OTHER", label: "Autre" },
];

const STATUSES = [
    { value: "COMPLETED", label: "Effectué" },
    { value: "PENDING", label: "En attente" },
    { value: "FAILED", label: "Échoué" },
];

const QUICK_DATES = [
    { label: "Aujourd'hui", days: 1 },
    { label: "7 jours", days: 7 },
    { label: "30 jours", days: 30 },
    { label: "90 jours", days: 90 },
    { label: "Cette année", days: 365 },
];

export function TransactionFilters({ onFiltersChange }: TransactionFiltersProps) {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [selectedDateRange, setSelectedDateRange] = useState<number | null>(null);
    const [minAmount, setMinAmount] = useState<string>("");
    const [maxAmount, setMaxAmount] = useState<string>("");
    const [showOnlyIncome, setShowOnlyIncome] = useState(false);
    const [showOnlyExpense, setShowOnlyExpense] = useState(false);

    const activeFiltersCount = [
        selectedCategory,
        selectedStatus,
        selectedDateRange,
        minAmount,
        maxAmount,
        showOnlyIncome || showOnlyExpense
    ].filter(Boolean).length;

    const handleSearchChange = (value: string) => {
        setSearch(value);
        applyFilters({ search: value });
    };

    const handleCategoryChange = (category: string | null) => {
        setSelectedCategory(category);
        applyFilters({ category: category || undefined });
    };

    const handleStatusChange = (status: string | null) => {
        setSelectedStatus(status);
        applyFilters({ status: status || undefined });
    };

    const handleDateRangeChange = (days: number | null) => {
        setSelectedDateRange(days);
        if (days) {
            const from = new Date();
            from.setDate(from.getDate() - days);
            applyFilters({ dateFrom: from.toISOString() });
        } else {
            applyFilters({ dateFrom: undefined });
        }
    };

    const applyFilters = (overrides: any = {}) => {
        const from = selectedDateRange
            ? new Date(Date.now() - selectedDateRange * 24 * 60 * 60 * 1000).toISOString()
            : undefined;

        onFiltersChange({
            search: search || undefined,
            category: selectedCategory || undefined,
            status: selectedStatus || undefined,
            dateFrom: from,
            minAmount: minAmount ? parseFloat(minAmount) : undefined,
            maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
            ...overrides
        });
    };

    const clearAllFilters = () => {
        setSearch("");
        setSelectedCategory(null);
        setSelectedStatus(null);
        setSelectedDateRange(null);
        setMinAmount("");
        setMaxAmount("");
        setShowOnlyIncome(false);
        setShowOnlyExpense(false);
        onFiltersChange({});
    };

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <Input
                        placeholder="Rechercher une transaction..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-9 h-9"
                    />
                </div>

                {activeFiltersCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-zinc-500 hover:text-zinc-900 h-9"
                    >
                        <X size={14} className="mr-1" />
                        Effacer ({activeFiltersCount})
                    </Button>
                )}
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
                {/* Date Filter */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={`h-8 border-dashed ${selectedDateRange ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-zinc-300'}`}
                        >
                            <Calendar size={14} className="mr-1.5" />
                            {selectedDateRange
                                ? QUICK_DATES.find(d => d.days === selectedDateRange)?.label
                                : "Date"}
                            <ChevronDown size={12} className="ml-1" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2" align="start">
                        <div className="space-y-1">
                            {QUICK_DATES.map((range) => (
                                <button
                                    key={range.days}
                                    onClick={() => handleDateRangeChange(
                                        selectedDateRange === range.days ? null : range.days
                                    )}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedDateRange === range.days
                                            ? 'bg-indigo-100 text-indigo-700'
                                            : 'hover:bg-zinc-100'
                                        }`}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Category Filter */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={`h-8 border-dashed ${selectedCategory ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-zinc-300'}`}
                        >
                            <Filter size={14} className="mr-1.5" />
                            {selectedCategory
                                ? CATEGORIES.find(c => c.value === selectedCategory)?.label
                                : "Catégorie"}
                            <ChevronDown size={12} className="ml-1" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2" align="start">
                        <div className="space-y-1">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => handleCategoryChange(
                                        selectedCategory === cat.value ? null : cat.value
                                    )}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedCategory === cat.value
                                            ? 'bg-indigo-100 text-indigo-700'
                                            : 'hover:bg-zinc-100'
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Status Filter */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={`h-8 border-dashed ${selectedStatus ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-zinc-300'}`}
                        >
                            {selectedStatus
                                ? STATUSES.find(s => s.value === selectedStatus)?.label
                                : "Statut"}
                            <ChevronDown size={12} className="ml-1" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-2" align="start">
                        <div className="space-y-1">
                            {STATUSES.map((status) => (
                                <button
                                    key={status.value}
                                    onClick={() => handleStatusChange(
                                        selectedStatus === status.value ? null : status.value
                                    )}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedStatus === status.value
                                            ? 'bg-indigo-100 text-indigo-700'
                                            : 'hover:bg-zinc-100'
                                        }`}
                                >
                                    {status.label}
                                </button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Amount Range */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={`h-8 border-dashed ${(minAmount || maxAmount) ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-zinc-300'}`}
                        >
                            {(minAmount || maxAmount)
                                ? `${minAmount || '0'}€ - ${maxAmount || '∞'}€`
                                : "Montant"}
                            <ChevronDown size={12} className="ml-1" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-4" align="start">
                        <div className="space-y-3">
                            <div>
                                <Label className="text-xs">Montant minimum</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={minAmount}
                                    onChange={(e) => setMinAmount(e.target.value)}
                                    className="h-8 mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Montant maximum</Label>
                                <Input
                                    type="number"
                                    placeholder="∞"
                                    value={maxAmount}
                                    onChange={(e) => setMaxAmount(e.target.value)}
                                    className="h-8 mt-1"
                                />
                            </div>
                            <Button
                                size="sm"
                                className="w-full"
                                onClick={() => applyFilters()}
                            >
                                Appliquer
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Quick Toggle: Income Only / Expense Only */}
                <div className="flex items-center gap-4 ml-auto">
                    <div className="flex items-center gap-2">
                        <Switch
                            id="income-only"
                            checked={showOnlyIncome}
                            onCheckedChange={(checked) => {
                                setShowOnlyIncome(checked);
                                if (checked) setShowOnlyExpense(false);
                            }}
                        />
                        <Label htmlFor="income-only" className="text-sm text-zinc-600 cursor-pointer">
                            Revenus
                        </Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch
                            id="expense-only"
                            checked={showOnlyExpense}
                            onCheckedChange={(checked) => {
                                setShowOnlyExpense(checked);
                                if (checked) setShowOnlyIncome(false);
                            }}
                        />
                        <Label htmlFor="expense-only" className="text-sm text-zinc-600 cursor-pointer">
                            Dépenses
                        </Label>
                    </div>
                </div>
            </div>

            {/* Active Filter Tags */}
            {(selectedCategory || selectedStatus || selectedDateRange) && (
                <div className="flex flex-wrap gap-2">
                    {selectedCategory && (
                        <Badge
                            variant="secondary"
                            className="gap-1 cursor-pointer hover:bg-zinc-200"
                            onClick={() => handleCategoryChange(null)}
                        >
                            {CATEGORIES.find(c => c.value === selectedCategory)?.label}
                            <X size={12} />
                        </Badge>
                    )}
                    {selectedStatus && (
                        <Badge
                            variant="secondary"
                            className="gap-1 cursor-pointer hover:bg-zinc-200"
                            onClick={() => handleStatusChange(null)}
                        >
                            {STATUSES.find(s => s.value === selectedStatus)?.label}
                            <X size={12} />
                        </Badge>
                    )}
                    {selectedDateRange && (
                        <Badge
                            variant="secondary"
                            className="gap-1 cursor-pointer hover:bg-zinc-200"
                            onClick={() => handleDateRangeChange(null)}
                        >
                            {QUICK_DATES.find(d => d.days === selectedDateRange)?.label}
                            <X size={12} />
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
}
