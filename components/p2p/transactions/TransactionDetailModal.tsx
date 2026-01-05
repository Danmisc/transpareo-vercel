"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    Copy,
    Download,
    Flag,
    MessageSquare,
    Repeat,
    TrendingUp,
    Building2,
    ShoppingCart,
    Zap,
    Receipt,
    Wallet,
    CreditCard,
    ExternalLink,
    Calendar,
    Hash
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Category config (same as TransactionsList)
const CATEGORY_CONFIG: Record<string, { icon: any; label: string; color: string; bgColor: string }> = {
    INVESTMENT: { icon: TrendingUp, label: "Investissement", color: "text-indigo-600", bgColor: "bg-indigo-50" },
    SALARY: { icon: Building2, label: "Salaire", color: "text-emerald-600", bgColor: "bg-emerald-50" },
    SUBSCRIPTION: { icon: Repeat, label: "Abonnement", color: "text-purple-600", bgColor: "bg-purple-50" },
    TRANSFER: { icon: Wallet, label: "Virement", color: "text-blue-600", bgColor: "bg-blue-50" },
    FEE: { icon: Receipt, label: "Frais", color: "text-red-600", bgColor: "bg-red-50" },
    INTEREST: { icon: TrendingUp, label: "Intérêts", color: "text-emerald-600", bgColor: "bg-emerald-50" },
    SHOPPING: { icon: ShoppingCart, label: "Achats", color: "text-orange-600", bgColor: "bg-orange-50" },
    UTILITIES: { icon: Zap, label: "Services", color: "text-amber-600", bgColor: "bg-amber-50" },
    LOAN: { icon: CreditCard, label: "Prêt", color: "text-cyan-600", bgColor: "bg-cyan-50" },
    OTHER: { icon: Wallet, label: "Autre", color: "text-zinc-600", bgColor: "bg-zinc-50" },
};

const STATUS_CONFIG: Record<string, { icon: any; label: string; color: string; bgColor: string }> = {
    COMPLETED: { icon: CheckCircle2, label: "Effectué", color: "text-emerald-700", bgColor: "bg-emerald-100" },
    PENDING: { icon: Clock, label: "En attente", color: "text-amber-700", bgColor: "bg-amber-100" },
    PROCESSING: { icon: Clock, label: "Traitement", color: "text-blue-700", bgColor: "bg-blue-100" },
    FAILED: { icon: AlertTriangle, label: "Échoué", color: "text-red-700", bgColor: "bg-red-100" },
};

interface Transaction {
    id: string;
    amount: number;
    type: string;
    category: string;
    status: string;
    reference?: string | null;
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

interface TransactionDetailModalProps {
    transaction: Transaction | null;
    open: boolean;
    onClose: () => void;
    onFlag?: (id: string, reason: string, notes: string) => void;
}

export function TransactionDetailModal({
    transaction,
    open,
    onClose,
    onFlag
}: TransactionDetailModalProps) {
    const [showFlagForm, setShowFlagForm] = useState(false);
    const [flagReason, setFlagReason] = useState("");
    const [flagNotes, setFlagNotes] = useState("");

    if (!transaction) return null;

    const catConfig = CATEGORY_CONFIG[transaction.category] || CATEGORY_CONFIG.OTHER;
    const statusConfig = STATUS_CONFIG[transaction.status] || STATUS_CONFIG.PENDING;
    const CategoryIcon = catConfig.icon;
    const StatusIcon = statusConfig.icon;
    const isPositive = transaction.amount > 0;

    const handleFlag = () => {
        if (onFlag && flagReason) {
            onFlag(transaction.id, flagReason, flagNotes);
            setShowFlagForm(false);
            setFlagReason("");
            setFlagNotes("");
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
                {/* Header with amount */}
                <div className={`p-6 ${isPositive ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gradient-to-br from-zinc-700 to-zinc-800'} text-white`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm opacity-80 mb-1">
                                {isPositive ? 'Entrée' : 'Sortie'}
                            </p>
                            <p className="text-3xl font-bold tracking-tight">
                                {isPositive ? '+' : ''}{transaction.amount.toLocaleString('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR'
                                })}
                            </p>
                        </div>
                        <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}>
                            <StatusIcon size={12} className="mr-1" />
                            {statusConfig.label}
                        </Badge>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                        {transaction.counterpartyLogo ? (
                            <img
                                src={transaction.counterpartyLogo}
                                alt=""
                                className="w-10 h-10 rounded-full border-2 border-white/20"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <CategoryIcon size={20} />
                            </div>
                        )}
                        <div>
                            <p className="font-semibold">
                                {transaction.counterpartyName || transaction.description || "Transaction"}
                            </p>
                            <p className="text-sm opacity-70">
                                {format(new Date(transaction.createdAt), 'd MMMM yyyy à HH:mm', { locale: fr })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4">
                    {/* Category & Type */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Badge className={`${catConfig.bgColor} ${catConfig.color} border-0`}>
                                <CategoryIcon size={12} className="mr-1" />
                                {catConfig.label}
                            </Badge>
                            {transaction.isRecurring && (
                                <Badge variant="outline" className="text-purple-600 border-purple-200">
                                    <Repeat size={12} className="mr-1" />
                                    Récurrent
                                </Badge>
                            )}
                            {transaction.flagged && (
                                <Badge variant="destructive" className="gap-1">
                                    <AlertTriangle size={12} />
                                    Signalée
                                </Badge>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-zinc-500 mb-1 flex items-center gap-1">
                                <Hash size={12} /> Référence
                            </p>
                            <div className="flex items-center gap-2">
                                <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded font-mono">
                                    {transaction.reference || transaction.id.slice(0, 12)}
                                </code>
                                <button
                                    onClick={() => copyToClipboard(transaction.reference || transaction.id)}
                                    className="text-zinc-400 hover:text-zinc-600"
                                >
                                    <Copy size={12} />
                                </button>
                            </div>
                        </div>

                        <div>
                            <p className="text-zinc-500 mb-1 flex items-center gap-1">
                                <Calendar size={12} /> Date
                            </p>
                            <p className="font-medium">
                                {format(new Date(transaction.createdAt), 'd MMM yyyy', { locale: fr })}
                            </p>
                        </div>

                        <div>
                            <p className="text-zinc-500 mb-1">Type</p>
                            <p className="font-medium capitalize">{transaction.type.toLowerCase()}</p>
                        </div>

                        <div>
                            <p className="text-zinc-500 mb-1">Compte</p>
                            <p className="font-medium">
                                {transaction.linkedAccount
                                    ? `${transaction.linkedAccount.providerName} ••${transaction.linkedAccount.mask}`
                                    : 'Portefeuille Transpareo'
                                }
                            </p>
                        </div>
                    </div>

                    {/* Flag Reason if flagged */}
                    {transaction.flagged && transaction.flagReason && (
                        <>
                            <Separator />
                            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                                <p className="text-sm font-medium text-red-700 dark:text-red-400 flex items-center gap-2">
                                    <AlertTriangle size={14} />
                                    Raison du signalement
                                </p>
                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                    {transaction.flagReason}
                                </p>
                            </div>
                        </>
                    )}

                    {/* Flag Form */}
                    {showFlagForm && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <Label>Raison du signalement</Label>
                                <select
                                    className="w-full border rounded-md p-2 text-sm"
                                    value={flagReason}
                                    onChange={(e) => setFlagReason(e.target.value)}
                                >
                                    <option value="">Sélectionner une raison...</option>
                                    <option value="FRAUDULENT">Transaction frauduleuse</option>
                                    <option value="DUPLICATE">Doublon</option>
                                    <option value="UNAUTHORIZED">Non autorisée</option>
                                    <option value="INCORRECT_AMOUNT">Montant incorrect</option>
                                    <option value="OTHER">Autre</option>
                                </select>

                                <Label>Notes (optionnel)</Label>
                                <Textarea
                                    placeholder="Décrivez le problème..."
                                    value={flagNotes}
                                    onChange={(e) => setFlagNotes(e.target.value)}
                                    rows={3}
                                />

                                <div className="flex gap-2">
                                    <Button
                                        variant="destructive"
                                        onClick={handleFlag}
                                        disabled={!flagReason}
                                        className="flex-1"
                                    >
                                        Signaler
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowFlagForm(false)}
                                    >
                                        Annuler
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="border-t p-4 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {!transaction.flagged && !showFlagForm && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowFlagForm(true)}
                                className="text-zinc-600 hover:text-red-600"
                            >
                                <Flag size={14} className="mr-1" />
                                Signaler
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-zinc-600">
                            <Download size={14} className="mr-1" />
                            Télécharger
                        </Button>
                    </div>
                    <Button variant="outline" onClick={onClose}>
                        Fermer
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
