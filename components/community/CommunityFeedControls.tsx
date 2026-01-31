"use client";

import React from "react";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface CommunityFeedControlsProps {
    onSearch?: (query: string) => void;
    onSortChange?: (sort: string) => void;
    onFilterChange?: (filter: string) => void;
    className?: string;
}

export function CommunityFeedControls({
    onSearch,
    onSortChange,
    onFilterChange,
    className
}: CommunityFeedControlsProps) {
    return (
        <div className={cn("flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800", className)}>

            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                    placeholder="Rechercher dans la communauté..."
                    className="pl-9 h-10 border-0 bg-zinc-100/50 dark:bg-zinc-800/50 focus-visible:ring-0 focus-visible:bg-white dark:focus-visible:bg-zinc-800 transition-all rounded-xl"
                    onChange={(e) => onSearch?.(e.target.value)}
                />
            </div>

            {/* Filters & Sort */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-full sm:w-auto">
                    {["Tout", "Discussions", "Questions"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => onFilterChange?.(tab)}
                            className="flex-1 sm:flex-none px-4 py-1.5 text-xs font-medium rounded-lg hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm transition-all text-zinc-600 dark:text-zinc-400"
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            <ArrowUpDown className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Trier par</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onSortChange?.("recent")}>
                            Plus récents
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSortChange?.("popular")}>
                            Les plus populaires
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSortChange?.("trending")}>
                            Tendances
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
