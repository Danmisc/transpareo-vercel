"use client";

import { useState } from "react";
import {
    MoreHorizontal,
    MapPin,
    AlertCircle,
    ArrowRight,
    Search,
    LayoutGrid,
    List as ListIcon,
    Filter,
    TrendingUp,
    Wallet,
    Building2,
    ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreatePropertyDialog } from "./CreatePropertyDialog";
import { InviteTenantDialog } from "./InviteTenantDialog";
import { cn } from "@/lib/utils";
import { PropertySettingsDialog } from "./property/PropertySettingsDialog";

interface OwnerPropertiesProps {
    initialProperties: any[];
}

export function OwnerProperties({ initialProperties }: OwnerPropertiesProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, OCCUPIED, VACANT
    const [filterCity, setFilterCity] = useState("ALL");

    // Extract unique cities for filter
    const cities = Array.from(new Set(initialProperties.map(p => p.address.split(',').pop()?.trim() || "Autre")));

    // Filter Logic
    const filteredProperties = initialProperties.filter(property => {
        const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            property.address.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "ALL" ||
            (filterStatus === "OCCUPIED" && property.metrics?.status === "OCCUPIED") ||
            (filterStatus === "VACANT" && property.metrics?.status === "VACANT");
        const matchesCity = filterCity === "ALL" || (property.address.includes(filterCity));

        return matchesSearch && matchesStatus && matchesCity;
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-bold text-zinc-900">Portefeuille</h2>
                    <p className="text-zinc-500 text-xs">
                        {filteredProperties.length} bien{filteredProperties.length > 1 ? 's' : ''} affiché{filteredProperties.length > 1 ? 's' : ''}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                        <Input
                            placeholder="Rechercher..."
                            className="pl-9 bg-zinc-50 border-zinc-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filters */}
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[140px] bg-zinc-50 border-zinc-200">
                            <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tous statuts</SelectItem>
                            <SelectItem value="OCCUPIED">Loués</SelectItem>
                            <SelectItem value="VACANT">Vacants</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* View Toggle */}
                    <div className="flex items-center bg-zinc-100 p-1 rounded-lg border border-zinc-200">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8 rounded-md", viewMode === 'grid' && "bg-white shadow-sm text-zinc-900")}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid size={16} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8 rounded-md", viewMode === 'list' && "bg-white shadow-sm text-zinc-900")}
                            onClick={() => setViewMode('list')}
                        >
                            <ListIcon size={16} />
                        </Button>
                    </div>

                    <CreatePropertyDialog
                        trigger={
                            <Button className="bg-zinc-900 text-white gap-2">
                                <Building2 size={16} /> Ajouter
                            </Button>
                        }
                    />
                </div>
            </div>

            {/* List View */}
            {filteredProperties.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-zinc-200">
                    <p className="text-zinc-500 mb-4">Aucun bien ne correspond à vos critères.</p>
                    <Button variant="outline" onClick={() => { setSearchTerm(""); setFilterStatus("ALL"); }}>
                        Réinitialiser les filtres
                    </Button>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProperties.map((property) => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Bien</th>
                                <th className="px-6 py-4 font-medium">Statut</th>
                                <th className="px-6 py-4 font-medium">Locataire</th>
                                <th className="px-6 py-4 font-medium">Finances</th>
                                <th className="px-6 py-4 font-medium">Rentabilité</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filteredProperties.map((property) => (
                                <tr key={property.id} className="hover:bg-zinc-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-zinc-100 overflow-hidden">
                                                <img src={property.imageUrl} className="h-full w-full object-cover" />
                                            </div>
                                            <div>
                                                <Link href={`/owner/properties/${property.id}`} className="font-bold text-zinc-900 hover:underline">
                                                    {property.title}
                                                </Link>
                                                <p className="text-xs text-zinc-500">{property.address}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {property.metrics?.status === "OCCUPIED" ? (
                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none shadow-none">Occupé</Badge>
                                        ) : (
                                            <Badge variant="destructive" className="bg-red-50 text-red-600 hover:bg-red-50 border-red-100 shadow-none">Vacant</Badge>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {property.leases?.[0] ? (
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={property.leases[0].tenant?.avatar} />
                                                    <AvatarFallback>{property.leases[0].tenantName.slice(0, 2)}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-zinc-700">{property.leases[0].tenantName}</span>
                                            </div>
                                        ) : <span className="text-zinc-400 italic">Aucun</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-zinc-900">{property.metrics?.monthlyRent} €</span>
                                            <span className={`text-xs ${Number(property.metrics?.cashflow) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                                CF: {Number(property.metrics?.cashflow) > 0 ? "+" : ""}{property.metrics?.cashflow}€
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100">
                                            {property.metrics?.grossYield}% Bruta
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <PropertySettingsDialog
                                                data={property}
                                                trigger={
                                                    <Button variant="ghost" size="sm">Gérer</Button>
                                                }
                                            />
                                            <Link href={`/owner/properties/${property.id}`}>
                                                <Button size="sm" variant="outline"><ArrowRight size={14} /></Button>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function PropertyCard({ property }: { property: any }) {
    const activeLease = property.leases?.[0];
    const status = property.metrics?.status || "VACANT";
    const health = 95; // Mock for now

    return (
        <div className="group bg-white rounded-3xl border border-zinc-100 shadow-sm hover:shadow-xl hover:border-zinc-200 transition-all duration-300 overflow-hidden flex flex-col">
            {/* Image Header */}
            <div className="relative h-48 w-full overflow-hidden">
                <Link href={`/owner/properties/${property.id}`} className="block h-full w-full">
                    <img
                        src={property.imageUrl || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"}
                        alt={property.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-black/50 to-transparent" />

                    <div className="absolute top-4 left-4 flex gap-2">
                        {status === "OCCUPIED" ? (
                            <Badge className="bg-emerald-500/90 backdrop-blur-md border-none text-white px-3 py-1 shadow-lg">Occupé</Badge>
                        ) : (
                            <Badge className="bg-white/90 backdrop-blur-md border-white/20 text-red-600 px-3 py-1 shadow-lg">Vacant</Badge>
                        )}
                        <Badge className="bg-black/50 backdrop-blur-md border-none text-white px-3 py-1">
                            {property.fiscalMode || "LMNP"}
                        </Badge>
                    </div>
                </Link>

                <div className="absolute top-4 right-4">
                    <PropertySettingsDialog
                        data={property}
                        trigger={
                            <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full h-8 w-8">
                                <MoreHorizontal size={18} />
                            </Button>
                        }
                    />
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4">
                    <Link href={`/owner/properties/${property.id}`} className="block hover:underline decoration-zinc-300 underline-offset-4">
                        <h3 className="font-bold text-lg text-zinc-900 line-clamp-1">{property.title}</h3>
                    </Link>
                    <p className="text-zinc-500 text-sm flex items-center gap-1 mt-1">
                        <MapPin size={14} className="text-zinc-400" /> {property.address}
                    </p>
                </div>

                {/* Financial KPIs Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3 bg-zinc-50/80 rounded-2xl border border-zinc-100 group-hover:bg-indigo-50/50 group-hover:border-indigo-100 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                            <Wallet size={12} className="text-zinc-400" />
                            <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Cashflow</p>
                        </div>
                        <p className={`text-lg font-black ${Number(property.metrics?.cashflow) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {Number(property.metrics?.cashflow) > 0 ? "+" : ""}{property.metrics?.cashflow}€
                        </p>
                    </div>
                    <div className="p-3 bg-zinc-50/80 rounded-2xl border border-zinc-100 group-hover:bg-indigo-50/50 group-hover:border-indigo-100 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp size={12} className="text-zinc-400" />
                            <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Renta</p>
                        </div>
                        <p className="text-lg font-black text-indigo-600">{property.metrics?.grossYield}%</p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-auto pt-4 border-t border-zinc-50 flex items-center justify-between">
                    {activeLease ? (
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 border border-white shadow-sm">
                                <AvatarImage src={activeLease.tenant?.avatar} />
                                <AvatarFallback>{activeLease.tenantName?.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium text-zinc-600">
                                {activeLease.tenantName.split(' ')[0]}
                            </span>
                        </div>
                    ) : (
                        <InviteTenantDialog
                            propertyId={property.id}
                            propertyName={property.title}
                            trigger={
                                <Button size="sm" variant="link" className="text-zinc-900 h-auto p-0 text-xs font-bold flex items-center gap-1">
                                    <AlertCircle size={12} className="text-red-500" /> Gestion Locataire
                                </Button>
                            }
                        />
                    )}

                    <Link href={`/owner/properties/${property.id}`}>
                        <Button size="sm" variant="ghost" className="text-xs hover:bg-zinc-100 rounded-full h-8 px-3 gap-1 group/btn">
                            Détails <ArrowUpRight size={12} className="text-zinc-400 group-hover/btn:text-zinc-600" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
