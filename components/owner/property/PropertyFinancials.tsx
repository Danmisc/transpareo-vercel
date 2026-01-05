"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, TrendingUp, TrendingDown, Wallet, Calendar, FileText, ArrowUpRight, ArrowDownRight, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { addExpense, recordPayment, deleteExpense } from "@/lib/actions-owner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CashflowChart, ExpensesPieChart } from "./FinanceCharts";

export function PropertyFinancials({ data }: { data: any }) {
    const [filter, setFilter] = useState("YEAR"); // MONTH, YEAR
    const [historyOpen, setHistoryOpen] = useState(false);
    const router = useRouter();

    // --- Prepare Data ---
    const expenses = data.expenses || [];
    const activeLease = data.leases.find((l: any) => l.status === 'ACTIVE');
    const payments = activeLease?.payments || [];

    // Merge into single timeline
    const allTransactions = [
        ...payments.map((p: any) => ({ ...p, isExpense: false, category: 'Loyer', label: 'Loyer', amount: p.amount })),
        ...expenses.map((e: any) => ({ ...e, isExpense: true, label: e.category, amount: e.amount }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate Totals (Global)
    const totalIncome = payments.reduce((acc: number, p: any) => acc + p.amount, 0);
    const totalExpenses = expenses.reduce((acc: number, e: any) => acc + e.amount, 0);
    const cashflow = totalIncome - totalExpenses;

    // --- Aggregation for Collections ---
    // Group by Month (Format: "MMM yyyy")
    const groupedData = allTransactions.reduce((acc: any, t: any) => {
        const date = new Date(t.date);
        const key = filter === 'YEAR'
            ? format(date, 'MMM', { locale: fr })
            : format(date, 'dd MMM', { locale: fr }); // If Month filter, show days? Simplified to Year view for now.

        // Better logic: Always show last 12 months if YEAR, or daily if MONTH
        // Let's stick to Monthly aggregation for the "YEAR" view
        const monthKey = format(date, 'MMM', { locale: fr });

        if (!acc[monthKey]) acc[monthKey] = { name: monthKey, Revenus: 0, Dépenses: 0 };

        if (t.isExpense) {
            acc[monthKey].Dépenses += t.amount;
        } else {
            acc[monthKey].Revenus += t.amount;
        }
        return acc;
    }, {});

    // Ensure chronological order for chart? 
    // Quick fix: Map months manually or sort by date. 
    // For MVP, letting recharts handle the order of keys encountered might be shaky.
    // Let's rely on the pre-sorted list but grouped.
    // Actually, "groupedData" object keys order is insertion order in JS usually.
    // Let's make it an array.
    const chartData = Object.values(groupedData).reverse() as any[];

    // Expense Breakdown
    const expenseCategories = expenses.reduce((acc: any, e: any) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
    }, {});
    const pieData = Object.keys(expenseCategories).map(k => ({ name: k, value: expenseCategories[k] }));
    if (pieData.length === 0) pieData.push({ name: 'Aucune', value: 1 });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                        <Wallet className="text-zinc-900" size={20} />
                        Pilotage Financier
                    </h2>
                    <p className="text-zinc-500 text-sm">Suivez vos flux de trésorerie et optimisez votre rentabilité.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-zinc-100 p-1 rounded-lg flex text-xs font-medium">
                        <button className={cn("px-3 py-1 rounded-md transition-all", filter === 'MONTH' ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-900")} onClick={() => setFilter('MONTH')}>Mois</button>
                        <button className={cn("px-3 py-1 rounded-md transition-all", filter === 'YEAR' ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-900")} onClick={() => setFilter('YEAR')}>Année</button>
                    </div>
                    <AddTransactionDialog propertyId={data.id} activeLeaseId={activeLease?.id} />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-5 border-zinc-200 shadow-sm bg-gradient-to-br from-white to-emerald-50/20">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                            <ArrowUpRight size={20} />
                        </div>
                        <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-100">+12% vs N-1</Badge>
                    </div>
                    <p className="text-sm text-zinc-500 font-medium">Revenus Totaux</p>
                    <h3 className="text-2xl font-bold text-zinc-900 mt-1">{totalIncome.toLocaleString()} €</h3>
                </Card>

                <Card className="p-5 border-zinc-200 shadow-sm bg-gradient-to-br from-white to-rose-50/20">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                            <ArrowDownRight size={20} />
                        </div>
                        <Badge variant="outline" className="text-rose-600 bg-rose-50 border-rose-100">-5% vs N-1</Badge>
                    </div>
                    <p className="text-sm text-zinc-500 font-medium">Dépenses Totales</p>
                    <h3 className="text-2xl font-bold text-zinc-900 mt-1">{totalExpenses.toLocaleString()} €</h3>
                </Card>

                <Card className="p-5 border-zinc-200 shadow-sm bg-gradient-to-br from-white to-indigo-50/20">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                            <Wallet size={20} />
                        </div>
                        <Badge variant="outline" className="text-indigo-600 bg-indigo-50 border-indigo-100">Net</Badge>
                    </div>
                    <p className="text-sm text-zinc-500 font-medium">Cashflow Net</p>
                    <h3 className={cn("text-2xl font-bold mt-1", cashflow >= 0 ? "text-emerald-600" : "text-red-600")}>
                        {cashflow > 0 ? "+" : ""}{cashflow.toLocaleString()} €
                    </h3>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-6 border-zinc-200 shadow-sm">
                    <h3 className="text-sm font-bold text-zinc-900 mb-6 flex items-center gap-2">
                        <TrendingUp size={16} className="text-zinc-500" />
                        Évolution des Flux
                    </h3>
                    <div className="min-h-[300px]">
                        {chartData.length > 0 ? <CashflowChart data={chartData} /> : <div className="h-full flex items-center justify-center text-zinc-400">Pas assez de données</div>}
                    </div>
                </Card>
                <Card className="p-6 border-zinc-200 shadow-sm">
                    <h3 className="text-sm font-bold text-zinc-900 mb-6 flex items-center gap-2">
                        <FileText size={16} className="text-zinc-500" />
                        Répartition des Charges
                    </h3>
                    <ExpensesPieChart data={pieData} />
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="border-zinc-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                    <h3 className="font-bold text-zinc-900 text-sm">Dernières Transactions</h3>
                    <Button variant="ghost" size="sm" className="text-zinc-500 text-xs" onClick={() => setHistoryOpen(true)}>Tout voir</Button>
                </div>
                <div className="divide-y divide-zinc-100">
                    {allTransactions.slice(0, 5).map((t: any, i) => (
                        <div key={i} className="px-6 py-3 flex items-center justify-between hover:bg-zinc-50 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className={cn("h-10 w-10 shrink-0 rounded-full flex items-center justify-center bg-opacity-10", t.isExpense ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600")}>
                                    {t.isExpense ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-zinc-900">{t.description || t.label}</p>
                                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                                        <Calendar size={10} /> {format(new Date(t.date), 'dd MMM yyyy', { locale: fr })}
                                        {t.isExpense && <span className="text-zinc-400">• {t.category}</span>}
                                        {t.frequency && t.frequency !== 'ONCE' && <Badge variant="outline" className="text-[10px] h-4 px-1 ml-1 border-zinc-200 text-zinc-500">Récurrent</Badge>}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right flex items-center gap-4">
                                <span className={cn("font-bold text-sm", t.isExpense ? "text-zinc-900" : "text-emerald-600")}>
                                    {t.isExpense ? "-" : "+"}{t.amount} €
                                </span>
                                {t.isExpense && (
                                    <DeleteExpenseButton id={t.id} />
                                )}
                            </div>
                        </div>
                    ))}
                    {allTransactions.length === 0 && (
                        <div className="p-8 text-center text-zinc-400 text-sm">Aucune transaction enregistrée.</div>
                    )}
                </div>
            </Card>

            <TransactionHistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} transactions={allTransactions} />
        </div>
    );
}

function TransactionHistoryDialog({ open, onOpenChange, transactions }: { open: boolean, onOpenChange: any, transactions: any[] }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Historique des Transactions</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="divide-y divide-zinc-100">
                        {transactions.map((t: any, i) => (
                            <div key={i} className="py-3 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={cn("h-8 w-8 shrink-0 rounded-full flex items-center justify-center bg-opacity-10", t.isExpense ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600")}>
                                        {t.isExpense ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-zinc-900">{t.description || t.label}</p>
                                        <p className="text-xs text-zinc-500">
                                            {format(new Date(t.date), 'dd MMM yyyy', { locale: fr })} • {t.category}
                                        </p>
                                    </div>
                                </div>
                                <span className={cn("font-bold text-sm", t.isExpense ? "text-zinc-900" : "text-emerald-600")}>
                                    {t.isExpense ? "-" : "+"}{t.amount} €
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function DeleteExpenseButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = () => {
        if (!confirm("Supprimer cette dépense ?")) return;
        startTransition(async () => {
            await deleteExpense(id);
            toast.success("Dépense supprimée");
            router.refresh();
        });
    };

    return (
        <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isPending} className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-zinc-400 hover:text-red-600">
            <Trash2 size={14} />
        </Button>
    )
}

function AddTransactionDialog({ propertyId, activeLeaseId }: { propertyId: string, activeLeaseId?: string }) {
    const [open, setOpen] = useState(false);
    const [type, setType] = useState('EXPENSE'); // INCOME, EXPENSE
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('MAINTENANCE');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [frequency, setFrequency] = useState('ONCE');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = () => {
        if (!amount || !date) return;

        startTransition(async () => {
            let result;
            if (type === 'INCOME') {
                if (!activeLeaseId) {
                    toast.error("Aucun bail actif pour ajouter un loyer");
                    return;
                }
                result = await recordPayment({
                    leaseId: activeLeaseId,
                    amount: parseFloat(amount),
                    type: 'RENT',
                    date: new Date(date),
                    frequency
                });
            } else {
                result = await addExpense({
                    propertyId,
                    amount: parseFloat(amount),
                    date: new Date(date),
                    category,
                    description,
                    isDeductible: true,
                    frequency // New Field
                });
            }

            if (result.success) {
                toast.success("Transaction ajoutée");
                setOpen(false);
                router.refresh();
                // Reset form
                setAmount('');
                setDescription('');
            } else {
                toast.error(result.error || "Erreur");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Button onClick={() => setOpen(true)} className="bg-zinc-900 text-white gap-2 shadow-lg hover:bg-zinc-800">
                <Plus size={16} /> Ajouter
            </Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nouvelle Transaction</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Tabs value={type} onValueChange={setType} defaultValue="EXPENSE" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="INCOME">Revenu (Loyer)</TabsTrigger>
                            <TabsTrigger value="EXPENSE">Dépense</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Montant (€)</Label>
                            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                    </div>

                    {type === 'EXPENSE' && (
                        <div className="space-y-2">
                            <Label>Catégorie</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TAX">Taxe Foncière / Impôts</SelectItem>
                                    <SelectItem value="MAINTENANCE">Entretien / Travaux</SelectItem>
                                    <SelectItem value="INSURANCE">Assurance PNO</SelectItem>
                                    <SelectItem value="LOAN">Emprunt / Intérêts</SelectItem>
                                    <SelectItem value="COPRO">Charges de Copropriété</SelectItem>
                                    <SelectItem value="OTHER">Autre</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Récurrence</Label>
                        <Select value={frequency} onValueChange={setFrequency}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ONCE">Une fois</SelectItem>
                                <SelectItem value="MONTHLY">Mensuel</SelectItem>
                                <SelectItem value="YEARLY">Annuel</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Description (Optionnel)</Label>
                        <Input value={description} onChange={e => setDescription(e.target.value)} placeholder={type === 'INCOME' ? "Loyer Février" : "Facture Plombier..."} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                    <Button onClick={handleSubmit} disabled={isPending} className="bg-zinc-900 text-white">
                        {isPending ? "Enregistrement..." : "Valider"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
