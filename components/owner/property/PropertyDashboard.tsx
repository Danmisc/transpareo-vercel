"use client";

import { useState } from "react";
import {
    ArrowLeft,
    Building2,
    Users,
    Wrench,
    FileText,
    Coins,
    BarChart3,
    MoreVertical,
    Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

import { PropertyOverview } from "./PropertyOverview";
import { PropertyDocuments } from "./PropertyDocuments";
import { PropertyTenants } from "./PropertyTenants";
import { PropertyMaintenance } from "./PropertyMaintenance";
import { PropertyFinancials } from "./PropertyFinancials";
import { PropertySettingsDialog } from "./PropertySettingsDialog";

interface PropertyDashboardProps {
    data: any; // Type strictly later
}

export function PropertyDashboard({ data }: PropertyDashboardProps) {
    const [activeTab, setActiveTab] = useState("overview");

    const metrics = data.metrics;

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header / Cockpit */}
            <div className="relative bg-white border-b border-zinc-200 shadow-sm">

                {/* Top Nav */}
                <div className="px-6 py-4 flex items-center gap-4">
                    <Link href="/owner">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500">
                            <ArrowLeft size={18} />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                            {data.title}
                            {metrics.isOccupied ? (
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Occupé</Badge>
                            ) : (
                                <Badge variant="destructive" className="bg-red-50 text-red-600 hover:bg-red-50 border-red-100">Vacant</Badge>
                            )}
                        </h1>
                        <p className="text-zinc-500 text-sm flex items-center gap-1">
                            <Building2 size={12} /> {data.address} • {data.type} • {data.surface}m²
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <MoreVertical size={16} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => toast.success("Export comptable généré (CSV)")}>
                                    <FileText className="mr-2 h-4 w-4" /> Export Comptable
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toast.success("Rapport de gestion généré (PDF)")}>
                                    <BarChart3 className="mr-2 h-4 w-4" /> Rapport Mensuel
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" /> Archiver le bien
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <PropertySettingsDialog data={data} />
                    </div>
                </div>

                {/* KPIs Cards (Overlapping or Inline) */}
                <div className="px-6 pb-6 pt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 border-zinc-200/60 shadow-sm bg-gradient-to-br from-white to-zinc-50/50">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Rentabilité Brute</span>
                            <div className="p-1.5 bg-emerald-100 rounded-md text-emerald-600">
                                <BarChart3 size={16} />
                            </div>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold text-zinc-900">{metrics.grossYield}%</span>
                            <span className="text-xs text-zinc-500 mb-1">estimée</span>
                        </div>
                    </Card>

                    <Card className="p-4 border-zinc-200/60 shadow-sm bg-gradient-to-br from-white to-zinc-50/50">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Cashflow Mensuel</span>
                            <div className="p-1.5 bg-indigo-100 rounded-md text-indigo-600">
                                <Coins size={16} />
                            </div>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className={cn("text-2xl font-bold", metrics.cashflow >= 0 ? "text-emerald-600" : "text-red-600")}>
                                {metrics.cashflow > 0 ? "+" : ""}{metrics.cashflow} €
                            </span>
                            <span className="text-xs text-zinc-500 mb-1">
                                / mois (net approx.)
                            </span>
                        </div>
                    </Card>

                    <Card className="p-4 border-zinc-200/60 shadow-sm bg-gradient-to-br from-white to-zinc-50/50">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Loyer Actuel</span>
                            <div className="p-1.5 bg-amber-100 rounded-md text-amber-600">
                                <FileText size={16} />
                            </div>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold text-zinc-900">{metrics.monthlyRent} €</span>
                            <span className="text-xs text-zinc-500 mb-1">
                                {metrics.isOccupied ? "CC" : "(Potentiel)"}
                            </span>
                        </div>
                    </Card>
                </div>

                {/* Navigation Tabs */}
                <div className="px-6 bg-zinc-50/50 border-t border-zinc-100 mt-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="bg-transparent h-auto p-0 w-full justify-start rounded-none space-x-8">
                            <TabTrigger value="overview" icon={<BarChart3 size={16} />} label="Vue d'ensemble" />
                            <TabTrigger value="tenants" icon={<Users size={16} />} label="Locataires" badge={data.leases.filter((l: any) => l.status === 'ACTIVE').length} />
                            <TabTrigger value="maintenance" icon={<Wrench size={16} />} label="Maintenance" badge={data.tickets.filter((t: any) => t.status !== 'CLOSED').length} />
                            <TabTrigger value="documents" icon={<FileText size={16} />} label="Documents" />
                            <TabTrigger value="financials" icon={<Coins size={16} />} label="Finances" />
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-6">
                <Tabs value={activeTab} className="w-full">
                    <TabsContent value="overview" className="mt-0">
                        <PropertyOverview data={data} />
                    </TabsContent>
                    <TabsContent value="tenants" className="mt-0">
                        <PropertyTenants data={data} />
                    </TabsContent>
                    <TabsContent value="maintenance" className="mt-0">
                        <PropertyMaintenance data={data} />
                    </TabsContent>
                    <TabsContent value="documents" className="mt-0">
                        <PropertyDocuments data={data} />
                    </TabsContent>
                    <TabsContent value="financials" className="mt-0">
                        <PropertyFinancials data={data} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

function TabTrigger({ value, icon, label, badge }: { value: string, icon: any, label: string, badge?: number }) {
    return (
        <TabsTrigger
            value={value}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 text-zinc-500 px-0 py-3 data-[state=active]:bg-transparent transition-all hover:text-zinc-700 gap-2 font-medium"
        >
            {icon}
            {label}
            {badge ? (
                <span className="ml-1 rounded-full bg-zinc-200 text-zinc-900 px-2 py-0.5 text-[10px] font-bold">
                    {badge}
                </span>
            ) : null}
        </TabsTrigger>
    );
}


