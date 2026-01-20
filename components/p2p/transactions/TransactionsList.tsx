"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
    ArrowUpRight,
    ArrowDownLeft,
    PlusCircle,
    Download,
    Settings,
    MoreHorizontal,
    Filter,
    AlertTriangle,
    TrendingUp,
    Repeat,
    CreditCard,
    Wallet,
    Receipt,
    Building2,
    ShoppingCart,
    Zap,
    CheckCircle2,
    Clock,
    XCircle,
    Flag,
    Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ============================================================================
// CATEGORY CONFIGURATION
// ============================================================================

const CATEGORY_CONFIG: Record<string, { icon: any; label: string; color: string; bgColor: string }> = {
    INVESTMENT: { icon: TrendingUp, label: "Investissement", color: "text-indigo-600", bgColor: "bg-indigo-50" },
    SALARY: { icon: Building2, label: "Salaire", color: "text-emerald-600", bgColor: "bg-emerald-50" },
    SUBSCRIPTION: { icon: Repeat, label: "Abonnement", color: "text-purple-600", bgColor: "bg-purple-50" },
    TRANSFER: { icon: ArrowDownLeft, label: "Virement", color: "text-blue-600", bgColor: "bg-blue-50" },
    FEE: { icon: Receipt, label: "Frais", color: "text-red-600", bgColor: "bg-red-50" },
    INTEREST: { icon: TrendingUp, label: "Intérêts", color: "text-emerald-600", bgColor: "bg-emerald-50" },
    REFUND: { icon: ArrowDownLeft, label: "Remboursement", color: "text-green-600", bgColor: "bg-green-50" },
    SHOPPING: { icon: ShoppingCart, label: "Achats", color: "text-orange-600", bgColor: "bg-orange-50" },
    UTILITIES: { icon: Zap, label: "Services", color: "text-amber-600", bgColor: "bg-amber-50" },
    LOAN: { icon: CreditCard, label: "Prêt", color: "text-cyan-600", bgColor: "bg-cyan-50" },
    OTHER: { icon: Wallet, label: "Autre", color: "text-zinc-600", bgColor: "bg-zinc-50" },
};

const STATUS_CONFIG: Record<string, { icon: any; label: string; color: string; bgColor: string }> = {
    COMPLETED: { icon: CheckCircle2, label: "Effectué", color: "text-emerald-700", bgColor: "bg-emerald-100" },
    PENDING: { icon: Clock, label: "En attente", color: "text-amber-700", bgColor: "bg-amber-100" },
    PROCESSING: { icon: Clock, label: "Traitement", color: "text-blue-700", bgColor: "bg-blue-100" },
    FAILED: { icon: XCircle, label: "Échoué", color: "text-red-700", bgColor: "bg-red-100" },
    CANCELLED: { icon: XCircle, label: "Annulé", color: "text-zinc-700", bgColor: "bg-zinc-100" },
    REVERSED: { icon: ArrowDownLeft, label: "Inversé", color: "text-purple-700", bgColor: "bg-purple-100" },
};

// ============================================================================
// TYPES
// ============================================================================

interface Transaction {
    id: string;
    amount: number;
    type: string;
    category: string;
    status: string;
    reference?: string | null;
    externalId?: string | null;
    counterpartyName?: string | null;
    counterpartyLogo?: string | null;
    description?: string | null;
    flagged: boolean;
    flagReason?: string | null;
    isRecurring: boolean;
    createdAt: string | Date;
    linkedAccount?: {
        providerName: string;
        accountName: string;
        mask: string;
    } | null;
}

interface TransactionsListProps {
    transactions: Transaction[];
    onExport?: () => void;
    onFlagTransaction?: (id: string) => void;
    showFilters?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function TransactionsList({
    transactions,
    onExport,
    onFlagTransaction,
    showFilters = true
}: TransactionsListProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === transactions.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(transactions.map(t => t.id)));
        }
    };

    if (transactions.length === 0) {
        return (
            <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-16 text-center border border-dashed border-zinc-200 dark:border-zinc-800">
                <Wallet className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
                <p className="text-zinc-500 mb-6 font-medium text-lg">Aucune transaction</p>
                <p className="text-zinc-400 text-sm mb-6">Connectez un compte bancaire pour synchroniser vos transactions.</p>
                <Link href="/p2p/gains">
                    <Button>Connecter un compte</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full">

            {/* Filter Bar */}
            {showFilters && (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex items-center flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-300 text-zinc-600 bg-transparent hover:bg-zinc-50 text-xs font-medium rounded-md">
                            <PlusCircle size={14} className="mr-1.5" /> Date
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-300 text-zinc-600 bg-transparent hover:bg-zinc-50 text-xs font-medium rounded-md">
                            <PlusCircle size={14} className="mr-1.5" /> Catégorie
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-300 text-zinc-600 bg-transparent hover:bg-zinc-50 text-xs font-medium rounded-md">
                            <PlusCircle size={14} className="mr-1.5" /> Montant
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-300 text-zinc-600 bg-transparent hover:bg-zinc-50 text-xs font-medium rounded-md">
                            <PlusCircle size={14} className="mr-1.5" /> Statut
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 text-zinc-500 hover:text-zinc-900 text-xs font-medium">
                            <Filter size={14} className="mr-1.5" /> Plus
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedIds.size > 0 && (
                            <span className="text-xs text-zinc-500 mr-2">{selectedIds.size} sélectionné(s)</span>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-medium shadow-sm"
                            onClick={onExport}
                        >
                            <Download size={14} className="mr-1.5" /> Exporter
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-medium shadow-sm">
                            <Settings size={14} className="mr-1.5" /> Colonnes
                        </Button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="border rounded-lg border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50">
                            <TableHead className="w-[40px] pl-4">
                                <Checkbox
                                    checked={selectedIds.size === transactions.length && transactions.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 h-10">Description</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 h-10">Catégorie</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 h-10 text-right">Montant</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 h-10">Compte</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 h-10">Date</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 h-10">Statut</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((tx) => {
                            const catConfig = CATEGORY_CONFIG[tx.category] || CATEGORY_CONFIG.OTHER;
                            const statusConfig = STATUS_CONFIG[tx.status] || STATUS_CONFIG.PENDING;
                            const CategoryIcon = catConfig.icon;
                            const StatusIcon = statusConfig.icon;
                            const isPositive = tx.amount > 0;

                            return (
                                <TableRow
                                    key={tx.id}
                                    className={`border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors group ${tx.flagged ? 'bg-red-50/30' : ''}`}
                                >
                                    <TableCell className="pl-4 py-3">
                                        <Checkbox
                                            checked={selectedIds.has(tx.id)}
                                            onCheckedChange={() => toggleSelect(tx.id)}
                                            className="border-zinc-300"
                                        />
                                    </TableCell>

                                    {/* Description (with counterparty) */}
                                    <TableCell className="py-3">
                                        <div className="flex items-center gap-3">
                                            {tx.counterpartyLogo ? (
                                                <img
                                                    src={tx.counterpartyLogo}
                                                    alt=""
                                                    className="w-8 h-8 rounded-full object-cover border border-zinc-100"
                                                />
                                            ) : (
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${catConfig.bgColor}`}>
                                                    <CategoryIcon size={14} className={catConfig.color} />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]">
                                                        {tx.counterpartyName || tx.description || "Transaction"}
                                                    </p>
                                                    {tx.flagged && (
                                                        <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
                                                    )}
                                                    {tx.isRecurring && (
                                                        <Repeat size={12} className="text-purple-500 flex-shrink-0" />
                                                    )}
                                                </div>
                                                {tx.reference && (
                                                    <p className="text-xs text-zinc-400 font-mono truncate">{tx.reference}</p>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Category */}
                                    <TableCell className="py-3">
                                        <Badge
                                            variant="secondary"
                                            className={`${catConfig.bgColor} ${catConfig.color} border-0 font-medium text-xs gap-1`}
                                        >
                                            <CategoryIcon size={12} />
                                            {catConfig.label}
                                        </Badge>
                                    </TableCell>

                                    {/* Amount */}
                                    <TableCell className="py-3 text-right">
                                        <span className={`font-semibold tabular-nums ${isPositive ? 'text-emerald-600' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                            {isPositive ? '+' : ''}{tx.amount.toLocaleString('fr-FR', {
                                                style: 'currency',
                                                currency: 'EUR'
                                            })}
                                        </span>
                                    </TableCell>

                                    {/* Account */}
                                    <TableCell className="py-3">
                                        {tx.linkedAccount ? (
                                            <div className="text-xs">
                                                <p className="text-zinc-700 dark:text-zinc-300 font-medium">{tx.linkedAccount.providerName}</p>
                                                <p className="text-zinc-400">••{tx.linkedAccount.mask}</p>
                                            </div>
                                        ) : (
                                            <span className="text-zinc-400 text-xs">Portefeuille</span>
                                        )}
                                    </TableCell>

                                    {/* Date */}
                                    <TableCell className="py-3">
                                        <span className="text-sm text-zinc-500 whitespace-nowrap">
                                            {format(new Date(tx.createdAt), 'd MMM yyyy', { locale: fr })}
                                        </span>
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell className="py-3">
                                        <Badge
                                            variant="secondary"
                                            className={`${statusConfig.bgColor} ${statusConfig.color} border-0 font-normal text-xs gap-1`}
                                        >
                                            <StatusIcon size={12} />
                                            {statusConfig.label}
                                        </Badge>
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell className="py-3 text-right pr-4">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-zinc-400 hover:text-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <MoreHorizontal size={16} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem className="gap-2">
                                                    <Eye size={14} /> Voir les détails
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="gap-2"
                                                    onClick={() => onFlagTransaction?.(tx.id)}
                                                >
                                                    <Flag size={14} /> Signaler
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2">
                                                    <Download size={14} /> Télécharger
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>

                {/* Footer */}
                <div className="py-3 px-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500">
                        {transactions.length} transaction{transactions.length > 1 ? 's' : ''}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-7 text-xs" disabled>Précédent</Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs">Suivant</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

