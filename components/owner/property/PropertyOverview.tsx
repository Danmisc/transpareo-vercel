"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Wallet, AlertCircle, CheckCircle2, FileText, ArrowUpRight, Users } from "lucide-react";
import Link from "next/link";
import { CreateTicketDialog } from "./CreateTicketDialog";
import { AddDocumentDialog } from "./AddDocumentDialog";
import { RecordPaymentDialog } from "./RecordPaymentDialog";
import { SmartAlerts } from "./SmartAlerts";

export function PropertyOverview({ data }: { data: any }) {
    const activeLease = data.leases.find((l: any) => l.status === 'ACTIVE');
    const recentTickets = data.tickets.slice(0, 3);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Main Column */}
            <div className="md:col-span-2 space-y-6">

                {/* Activity Feed */}
                <Card className="p-6 border-zinc-200/60 shadow-sm">
                    <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                        <Calendar size={18} className="text-zinc-500" /> Activité Récente
                    </h3>
                    <div className="space-y-6 relative pl-2">
                        {/* Vertical Line */}
                        <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-zinc-100" />

                        {recentTickets.length > 0 ? recentTickets.map((ticket: any) => (
                            <div key={ticket.id} className="relative pl-6">
                                <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-orange-100 border-2 border-white ring-1 ring-orange-500/20" />
                                <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-medium text-zinc-900 text-sm">{ticket.title}</h4>
                                        <Badge variant="outline" className="text-[10px] bg-white">{ticket.status}</Badge>
                                    </div>
                                    <p className="text-zinc-500 text-xs mt-1 line-clamp-1">{ticket.description}</p>
                                    <span className="text-[10px] text-zinc-400 mt-2 block">
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div className="relative pl-6">
                                <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-zinc-100 border-2 border-white ring-1 ring-zinc-200" />
                                <p className="text-zinc-500 text-sm italic">Aucune activité récente.</p>
                            </div>
                        )}

                        {activeLease && (
                            <div className="relative pl-6">
                                <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-emerald-100 border-2 border-white ring-1 ring-emerald-500/20" />
                                <div className="bg-emerald-50/50 rounded-lg p-3 border border-emerald-100">
                                    <h4 className="font-medium text-emerald-900 text-sm">Entrée locataire</h4>
                                    <p className="text-emerald-700/80 text-xs mt-1">
                                        {activeLease.tenantName} a commencé son bail.
                                    </p>
                                    <span className="text-[10px] text-emerald-600/60 mt-2 block">
                                        {new Date(activeLease.startDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Financial Snapshot */}
                <Card className="p-6 border-zinc-200/60 shadow-sm bg-gradient-to-br from-white to-zinc-50/50">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                            <Wallet size={18} className="text-zinc-500" /> Snapshot Financier
                        </h3>
                        <Badge variant="outline" className="text-zinc-500 bg-white shadow-sm border-zinc-100">Ce mois-ci</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
                            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">Cashflow Net</p>
                            <div className="flex items-baseline gap-1">
                                <h4 className={`text-2xl font-black ${data.metrics?.cashflow >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                    {data.metrics?.cashflow > 0 ? "+" : ""}{data.metrics?.cashflow} €
                                </h4>
                                <span className="text-xs text-zinc-400">/mois</span>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
                            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">Rentabilité</p>
                            <div className="flex items-baseline gap-1">
                                <h4 className="text-2xl font-black text-indigo-600">
                                    {data.metrics?.grossYield}%
                                </h4>
                                <span className="text-xs text-zinc-400">brute</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-100/50 flex items-center justify-between">
                        <div className="text-xs text-zinc-400">
                            Basé sur les revenus et charges estimés.
                        </div>
                        <Link href={`/owner/properties/${data.id}?tab=financials`}>
                            <Button variant="ghost" size="sm" className="text-zinc-600 hover:text-zinc-900 hover:bg-white text-xs gap-1 group">
                                Voir le Hub Complet <ArrowUpRight size={12} className="text-zinc-400 group-hover:text-zinc-600" />
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">

                {/* Active Lease Card */}
                <Card className="p-5 border-zinc-200/60 shadow-sm">
                    <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                        <Users size={18} className="text-zinc-500" /> Locataire Actuel
                    </h3>
                    {activeLease ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold">
                                    {activeLease.tenantName.slice(0, 2)}
                                </div>
                                <div>
                                    <p className="font-medium text-zinc-900">{activeLease.tenantName}</p>
                                    <p className="text-xs text-zinc-500">{activeLease.tenantEmail}</p>
                                </div>
                            </div>
                            <div className="pt-3 border-t border-zinc-100 grid grid-cols-2 gap-2 text-center">
                                <div className="bg-zinc-50 p-2 rounded-md">
                                    <p className="text-[10px] text-zinc-400 uppercase">Prochain Loyer</p>
                                    <p className="font-bold text-zinc-700">05/01</p>
                                </div>
                                <div className="bg-zinc-50 p-2 rounded-md">
                                    <p className="text-[10px] text-zinc-400 uppercase">Solvabilité</p>
                                    <p className="font-bold text-emerald-600">A+</p>
                                </div>
                            </div>
                            <Button className="w-full text-xs" variant="outline">Voir le dossier</Button>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-zinc-500 text-sm mb-3">Aucun locataire actif</p>
                            <Button size="sm" className="w-full bg-zinc-900 text-white">Ajouter un locataire</Button>
                        </div>
                    )}
                </Card>

                {/* Quick Actions */}
                <Card className="p-5 border-zinc-200/60 shadow-sm">
                    <h3 className="font-bold text-zinc-900 mb-4">Actions Rapides</h3>
                    <div className="space-y-2">
                        <CreateTicketDialog
                            propertyId={data.id}
                            propertyName={data.title}
                            trigger={
                                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all text-sm group text-left">
                                    <span className="flex items-center gap-3 text-zinc-600 group-hover:text-zinc-900 font-medium">
                                        <AlertCircle size={14} /> Déclarer un incident
                                    </span>
                                    <ArrowUpRight size={14} className="text-zinc-300 group-hover:text-zinc-500" />
                                </button>
                            }
                        />

                        <AddDocumentDialog
                            propertyId={data.id}
                            trigger={
                                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all text-sm group text-left">
                                    <span className="flex items-center gap-3 text-zinc-600 group-hover:text-zinc-900 font-medium">
                                        <FileText size={14} /> Ajouter un document
                                    </span>
                                    <ArrowUpRight size={14} className="text-zinc-300 group-hover:text-zinc-500" />
                                </button>
                            }
                        />

                        {activeLease && (
                            <RecordPaymentDialog
                                leaseId={activeLease.id}
                                tenantName={activeLease.tenantName}
                                rentAmount={activeLease.rentAmount + activeLease.chargesAmount}
                                trigger={
                                    <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all text-sm group text-left">
                                        <span className="flex items-center gap-3 text-zinc-600 group-hover:text-zinc-900 font-medium">
                                            <CheckCircle2 size={14} /> Marquer loyer payé
                                        </span>
                                        <ArrowUpRight size={14} className="text-zinc-300 group-hover:text-zinc-500" />
                                    </button>
                                }
                            />
                        )}
                    </div>
                </Card>

                {/* Needs Attention / Smart Alerts */}
                <SmartAlerts data={data} />
            </div>
        </div>
    );
}

function QuickAction({ icon, label }: { icon: any, label: string }) {
    return (
        <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all text-sm group">
            <span className="flex items-center gap-3 text-zinc-600 group-hover:text-zinc-900 font-medium">
                {icon} {label}
            </span>
            <ArrowUpRight size={14} className="text-zinc-300 group-hover:text-zinc-500" />
        </button>
    )
}
