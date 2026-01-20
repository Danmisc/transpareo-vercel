"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarDays, ArrowDownLeft, ArrowUpRight, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CashflowCalendarProps {
    mode?: 'widget' | 'full';
}

export function CashflowCalendar({ mode = 'widget' }: CashflowCalendarProps) {
    // Mock Data for "Full View" (Payday Calendar)
    const FULL_PAYOUTS = [
        {
            month: "Février 2026",
            total: 124.50,
            items: [
                { date: "05 Fév", project: "Rénovation Lyon", amount: 24.50, type: "INT" },
                { date: "15 Fév", project: "Commerce Bio", amount: 100.00, type: "PRIN" },
            ]
        },
        {
            month: "Mars 2026",
            total: 345.10,
            items: [
                { date: "01 Mar", project: "Immeuble Lille", amount: 300.00, type: "PRIN+INT" },
                { date: "10 Mar", project: "Rénovation Lyon", amount: 45.10, type: "INT" },
            ]
        },
        {
            month: "Avril 2026",
            total: 89.20,
            items: [
                { date: "05 Avr", project: "Rénovation Lyon", amount: 89.20, type: "INT" },
            ]
        },
    ];

    // Mock Widgets
    const upcomingPayments = [
        { id: 1, date: "Demain", amount: 124.50, project: "Rénovation Lyon 3e", type: "INTEREST" },
        { id: 2, date: "15 Jan", amount: 45.00, project: "Commerce Bio", type: "CAPITAL" },
        { id: 3, date: "01 Fév", amount: 230.10, project: "Immeuble Lille", type: "TOTAL" },
    ];

    return (
        <Card className={`h-full border-none shadow-none ${mode === 'full' ? 'bg-transparent' : 'bg-transparent'}`}>
            <CardHeader className="p-0 mb-8">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        {mode === 'full' ? 'Calendrier des Gains 📅' : 'Flux Financier'}
                    </CardTitle>
                    {mode === 'widget' && (
                        <Button variant="ghost" size="icon" className="rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                            <Calendar size={18} />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-0 relative">

                {mode === 'widget' ? (
                    <>
                        {/* WIDGET MODE (Stream) */}
                        <div className="absolute left-[19px] top-2 bottom-4 w-[2px] bg-zinc-100 dark:bg-zinc-800" />
                        <div className="space-y-8">
                            {upcomingPayments.map((payment, i) => (
                                <div key={payment.id} className="relative flex items-center gap-6 group">
                                    <div className="relative z-10 h-10 w-10 flex-shrink-0 rounded-xl bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform group-hover:border-orange-500 dark:group-hover:border-orange-500">
                                        <div className="h-3 w-3 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                                    </div>
                                    <div className="flex-1 bg-white dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-100 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">{payment.date}</span>
                                            <span className="font-mono font-bold text-zinc-900 dark:text-white">+{payment.amount.toFixed(2)}€</span>
                                        </div>
                                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">{payment.project}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button className="w-full mt-6 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-orange-600 dark:hover:bg-orange-500 hover:text-white font-bold h-12 rounded-xl transition-colors">
                            Voir tout l'échéancier
                        </Button>
                    </>
                ) : (
                    <div className="space-y-6">
                        {/* FULL MODE (Grouped List) */}
                        {FULL_PAYOUTS.map((monthGroup, idx) => (
                            <div key={idx} className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-3xl overflow-hidden">
                                <div className="bg-zinc-50 dark:bg-white/5 px-6 py-4 flex justify-between items-center border-b border-zinc-100 dark:border-white/5">
                                    <h3 className="font-bold text-zinc-900 dark:text-white">{monthGroup.month}</h3>
                                    <span className="font-mono font-bold text-emerald-500">+{monthGroup.total.toFixed(2)}€</span>
                                </div>
                                <div className="divide-y divide-zinc-100 dark:divide-white/5">
                                    {monthGroup.items.map((item, i) => (
                                        <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center text-xs font-bold">
                                                    {item.date.split(' ')[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-zinc-900 dark:text-white text-sm">{item.project}</p>
                                                    <p className="text-xs text-zinc-500">{item.type === 'INT' ? 'Intérêts' : 'Remboursement'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono font-bold text-zinc-900 dark:text-white text-sm">+{item.amount.toFixed(2)}€</span>
                                                <ChevronRight size={16} className="text-zinc-300" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

