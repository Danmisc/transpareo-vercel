"use client";

import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface JoinedCommunitiesFilterProps {
    search: string;
    onSearchChange: (value: string) => void;
    sortBy: string;
    onSortChange: (value: string) => void;
}

export function JoinedCommunitiesFilter({ search, onSearchChange, sortBy, onSortChange }: JoinedCommunitiesFilterProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <Input
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Rechercher dans mes communautés..."
                    className="pl-10 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500"
                />
            </div>

            <div className="flex gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                            <ArrowUpDown size={16} />
                            <span className="hidden md:inline">Trier par:</span>
                            <span className="font-semibold">
                                {sortBy === "recent" ? "Activité récente" : sortBy === "name" ? "Nom (A-Z)" : "Membres"}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onSortChange("recent")}>Activité récente</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSortChange("name")}>Nom (A-Z)</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSortChange("members")}>Membres</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
