"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowUpRight, PlusCircle, Download, Settings, MoreHorizontal, Filter, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function InvestmentsList({ portfolio }: { portfolio: any[] }) {
    if (portfolio.length === 0) {
        return (
            <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-16 text-center border border-dashed border-zinc-200 dark:border-zinc-800">
                <p className="text-zinc-500 mb-6 font-medium">Aucune transaction trouvée.</p>
                <Link href="/p2p/market">
                    <Button>Découvrir les opportunités</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full">

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex items-center flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-300 text-zinc-600 bg-transparent hover:bg-zinc-50 text-xs font-medium rounded-md">
                        <PlusCircle size={14} className="mr-1.5" /> Date et heure
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-300 text-zinc-600 bg-transparent hover:bg-zinc-50 text-xs font-medium rounded-md">
                        <PlusCircle size={14} className="mr-1.5" /> Montant
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-300 text-zinc-600 bg-transparent hover:bg-zinc-50 text-xs font-medium rounded-md">
                        <PlusCircle size={14} className="mr-1.5" /> Statut
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-zinc-500 hover:text-zinc-900 text-xs font-medium">
                        <Filter size={14} className="mr-1.5" /> Plus de filtres
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-medium shadow-sm">
                        <Download size={14} className="mr-1.5" /> Exporter
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-medium shadow-sm">
                        <Settings size={14} className="mr-1.5" /> Colonnes
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="border-t border-zinc-200 dark:border-zinc-800">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-transparent">
                            <TableHead className="w-[40px] pl-4"><Checkbox /></TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-400 h-10">Projet</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-400 h-10">Montant</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-400 h-10">Rentabilité (APR)</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-400 h-10">Date</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-400 h-10">Statut</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {portfolio.map((inv) => (
                            <TableRow key={inv.id} className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                <TableCell className="pl-4 py-3"><Checkbox className="border-zinc-300" /></TableCell>

                                <TableCell className="py-3">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-zinc-900 dark:text-zinc-200 text-sm opacity-90">{inv.loan.title}</span>
                                        <span className="text-xs text-zinc-500">ID: {inv.id.substring(0, 8)}</span>
                                    </div>
                                </TableCell>

                                <TableCell className="py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-zinc-900 dark:text-zinc-200 text-sm">
                                            {inv.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                                        </span>
                                        <Badge variant="secondary" className="bg-zinc-100 text-zinc-500 border-zinc-200 font-normal text-[10px] h-5 px-1.5 uppercase">EUR</Badge>
                                    </div>
                                </TableCell>

                                <TableCell className="py-3">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-emerald-600">{inv.loan.apr}%</span>
                                        <span className="text-xs text-zinc-400">/ an</span>
                                    </div>
                                </TableCell>

                                <TableCell className="py-3 text-sm text-zinc-500 whitespace-nowrap">
                                    {format(new Date(inv.createdAt), 'd MMM yyyy', { locale: fr })}
                                </TableCell>

                                <TableCell className="py-3">
                                    {inv.status === 'ACTIVE' ?
                                        <Badge className="bg-emerald-100 text-emerald-700 border-transparent hover:bg-emerald-200 font-normal px-2 py-0.5 text-xs shadow-none">Actif</Badge> :
                                        inv.status === 'FINISHED' ?
                                            <Badge variant="outline" className="text-zinc-500 border-zinc-300 bg-zinc-50 font-normal px-2 py-0.5 text-xs">Terminé</Badge> :
                                            <Badge variant="outline" className="text-zinc-500 border-zinc-300 font-normal px-2 py-0.5 text-xs">{inv.status}</Badge>
                                    }
                                </TableCell>

                                <TableCell className="py-3 text-right">
                                    <Link href={`/p2p/market/${inv.loan.id}`}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                                            <ArrowUpRight size={16} />
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Footer Count */}
                <div className="py-4 px-4 text-xs font-medium text-zinc-500 border-t border-transparent">
                    {portfolio.length} investissements
                </div>
            </div>
        </div>
    );
}
