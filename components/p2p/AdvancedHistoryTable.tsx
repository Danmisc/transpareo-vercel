"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowUpRight, ArrowUpDown, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AdvancedHistoryTableProps {
    portfolio: any[];
}

export function AdvancedHistoryTable({ portfolio }: AdvancedHistoryTableProps) {
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'date', direction: 'desc' });

    // --- Filtering & Sorting ---
    const sortedData = [...portfolio]
        .filter(item => statusFilter === "ALL" || item.status === statusFilter)
        .sort((a, b) => {
            if (!sortConfig) return 0;

            let aValue, bValue;
            switch (sortConfig.key) {
                case 'amount':
                    aValue = a.amount;
                    bValue = b.amount;
                    break;
                case 'apr':
                    aValue = a.loan.apr;
                    bValue = b.loan.apr;
                    break;
                case 'date':
                default:
                    // Assuming createdAt exists on the investment object, if not use loan date
                    aValue = new Date(a.createdAt || new Date()).getTime();
                    bValue = new Date(b.createdAt || new Date()).getTime();
                    break;
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleExport = () => {
        const headers = ["Projet", "Date", "Montant", "Taux", "Statut"];
        const rows = sortedData.map(item => [
            item.loan.title,
            format(new Date(item.createdAt), 'dd/MM/yyyy'),
            item.amount,
            item.loan.apr + '%',
            item.status
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "transpareo_portfolio_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (portfolio.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-xl font-bold">Historique des Transactions</h3>

                <div className="flex gap-2 w-full sm:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px] bg-white dark:bg-zinc-900">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tous les statuts</SelectItem>
                            <SelectItem value="ACTIVE">Actif</SelectItem>
                            <SelectItem value="COMPLETED">Terminé</SelectItem>
                            <SelectItem value="PENDING">En attente</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" onClick={handleExport} className="bg-white dark:bg-zinc-900">
                        <Download className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                </div>
            </div>

            <Card className="border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-zinc-50 dark:bg-zinc-950/50">
                        <TableRow>
                            <TableHead className="w-[300px]">Projet</TableHead>
                            <TableHead className="cursor-pointer hover:text-orange-600" onClick={() => handleSort('date')}>
                                Date <ArrowUpDown className="inline w-3 h-3 ml-1" />
                            </TableHead>
                            <TableHead className="cursor-pointer hover:text-orange-600" onClick={() => handleSort('amount')}>
                                Montant <ArrowUpDown className="inline w-3 h-3 ml-1" />
                            </TableHead>
                            <TableHead className="cursor-pointer hover:text-orange-600" onClick={() => handleSort('apr')}>
                                Rentabilité <ArrowUpDown className="inline w-3 h-3 ml-1" />
                            </TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedData.map((inv) => (
                            <TableRow key={inv.id} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span className="text-zinc-900 dark:text-zinc-200">{inv.loan.title}</span>
                                        <span className="text-xs text-zinc-500">{inv.loan.projectType === 'REAL_ESTATE' ? 'Immobilier' : 'Entreprise'}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-zinc-500">{format(new Date(inv.createdAt), "d MMM yyyy", { locale: fr })}</TableCell>
                                <TableCell className="font-mono font-bold">{inv.amount.toLocaleString()} €</TableCell>
                                <TableCell>
                                    <span className="px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                                        {inv.loan.apr}%
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={
                                        inv.status === 'ACTIVE' ? 'default' :
                                            inv.status === 'COMPLETED' ? 'secondary' : 'outline'
                                    } className="capitalize">
                                        {inv.status.toLowerCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link href={`/p2p/market/${inv.loan.id}`}>
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                            <ArrowUpRight size={16} />
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

