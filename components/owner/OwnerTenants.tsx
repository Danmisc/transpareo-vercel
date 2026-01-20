"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Search,
    Filter,
    MoreVertical,
    Mail,
    FileText,
    AlertTriangle,
    CheckCircle,
    UserCheck,
    Users,
    Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { InviteTenantDialog } from "./InviteTenantDialog";

interface OwnerTenantsProps {
    properties: any[];
}

export function OwnerTenants({ properties = [] }: OwnerTenantsProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, LATE, ON_TIME

    // 1. Extract Tenants from Properties active leases
    const allTenants = properties.flatMap(property => {
        return property.leases
            .filter((lease: any) => !lease.endDate || new Date(lease.endDate) > new Date())
            .map((lease: any) => {
                // Determine Payment Status
                const lastPayment = lease.payments?.[0];
                const isLate = !lastPayment || new Date(lastPayment.date).getMonth() < new Date().getMonth();
                // Simple logic: if last payment is not this month = Late. 
                // Better logic would check due date vs payment date.

                return {
                    id: lease.tenant?.id || "invite-pending-" + lease.id,
                    isPending: !lease.tenant,
                    name: lease.tenant?.name || lease.tenantName || "Invitation envoyée",
                    email: lease.tenant?.email || "En attente",
                    avatar: lease.tenant?.avatar,
                    propertyId: property.id,
                    propertyTitle: property.title,
                    rentAmount: lease.rentAmount,
                    leaseStart: new Date(lease.startDate).toLocaleDateString(),
                    leaseEnd: lease.endDate ? new Date(lease.endDate).toLocaleDateString() : "Indéterminée",
                    status: isLate ? "LATE" : "UP_TO_DATE",
                    lastPaymentDate: lastPayment ? new Date(lastPayment.date).toLocaleDateString() : "Aucun"
                };
            });
    });

    // 2. Filter
    const filteredTenants = allTenants.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "ALL" || t.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // 3. KPIs
    const totalTenants = allTenants.length;
    const occupiedProperties = properties.filter(p => p.leases.some((l: any) => !l.endDate || new Date(l.endDate) > new Date())).length;
    const occupancyRate = properties.length > 0 ? Math.round((occupiedProperties / properties.length) * 100) : 0;
    const paymentRate = totalTenants > 0
        ? Math.round((allTenants.filter(t => t.status === "UP_TO_DATE").length / totalTenants) * 100)
        : 100;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 flex items-center gap-4 bg-white border-zinc-100 shadow-sm">
                    <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-sm text-zinc-500 font-medium">Locataires Actifs</p>
                        <p className="text-2xl font-bold text-zinc-900">{totalTenants}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 bg-white border-zinc-100 shadow-sm">
                    <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <CheckCircle size={20} />
                    </div>
                    <div>
                        <p className="text-sm text-zinc-500 font-medium">Taux de Paiement</p>
                        <p className="text-2xl font-bold text-zinc-900">{paymentRate}%</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 bg-white border-zinc-100 shadow-sm">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <UserCheck size={20} />
                    </div>
                    <div>
                        <p className="text-sm text-zinc-500 font-medium">Taux d'Occupation</p>
                        <p className="text-2xl font-bold text-zinc-900">{occupancyRate}%</p>
                    </div>
                </Card>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900">Gestion Locative</h2>
                    <p className="text-zinc-500 text-xs">{filteredTenants.length} dossier{filteredTenants.length > 1 ? "s" : ""}</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                        <Input
                            placeholder="Rechercher..."
                            className="pl-9 bg-zinc-50 border-zinc-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" onClick={() => setFilterStatus(filterStatus === "ALL" ? "LATE" : "ALL")}>
                        <Filter size={18} className={filterStatus !== "ALL" ? "text-indigo-600" : ""} />
                    </Button>
                    {/* Add Invite Global or per property? usually per property */}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-zinc-50/50">
                        <TableRow>
                            <TableHead className="w-[300px]">Locataire</TableHead>
                            <TableHead>Bien loué</TableHead>
                            <TableHead>Loyer & Contrat</TableHead>
                            <TableHead>Paiement</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTenants.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-zinc-500">
                                    Aucun locataire trouvé.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTenants.map((tenant, idx) => (
                                <TableRow key={idx} className="hover:bg-zinc-50/30 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={tenant.avatar} />
                                                <AvatarFallback>{tenant.name.slice(0, 2)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-bold text-zinc-900">{tenant.name}</p>
                                                <p className="text-xs text-zinc-500">{tenant.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm font-medium text-zinc-700">{tenant.propertyTitle}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-zinc-900">{tenant.rentAmount}€ <span className="text-zinc-400 font-normal">/ mois</span></p>
                                            <p className="text-xs text-zinc-500">Fin: {tenant.leaseEnd}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {tenant.isPending ? (
                                            <Badge variant="outline" className="text-zinc-500 border-zinc-200 bg-zinc-50">Invitation envoyée</Badge>
                                        ) : tenant.status === "UP_TO_DATE" ? (
                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none shadow-none">
                                                <CheckCircle size={10} className="mr-1" /> À jour
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none shadow-none">
                                                <AlertTriangle size={10} className="mr-1" /> Retard
                                            </Badge>
                                        )}
                                        {tenant.status === "UP_TO_DATE" && !tenant.isPending && (
                                            <p className="text-[10px] text-zinc-400 mt-1">Dernier: {tenant.lastPaymentDate}</p>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-zinc-900">
                                                <Mail size={16} />
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-zinc-900">
                                                        <MoreVertical size={16} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <Link href={`/owner/properties/${tenant.propertyId}?tab=tenants`}>
                                                        <DropdownMenuItem className="cursor-pointer">Voir le bail</DropdownMenuItem>
                                                    </Link>
                                                    <DropdownMenuItem>Générer quittance</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600">Fin de bail</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

