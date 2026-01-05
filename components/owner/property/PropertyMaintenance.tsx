"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List as ListIcon, Search, Filter } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { CreateTicketDialog } from "./CreateTicketDialog";
import { MaintenanceStats } from "./maintenance/MaintenanceStats";
import { MaintenanceBoard } from "./maintenance/MaintenanceBoard";
import { MaintenanceList } from "./maintenance/MaintenanceList";
import { TicketDetailSheet } from "./maintenance/TicketDetailSheet";
import { Separator } from "@/components/ui/separator";

export function PropertyMaintenance({ data }: { data: any }) {
    const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
    const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const tickets = data.tickets || [];

    // Filter logic
    const filteredTickets = tickets.filter((t: any) =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleTicketClick = (ticket: any) => {
        setSelectedTicket(ticket);
        setDetailOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Hub Maintenance</h2>
                    <p className="text-zinc-500 text-sm">Pilotez les interventions, suivez les coûts et communiquez avec les artisans.</p>
                </div>
                <CreateTicketDialog propertyId={data.id} propertyName={data.address} />
            </div>

            {/* KPI Stats */}
            <MaintenanceStats tickets={tickets} />

            <Separator className="my-6" />

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-lg">
                    <Button
                        variant={viewMode === 'board' ? 'white' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('board')}
                        className={`h-8 gap-2 text-xs ${viewMode === 'board' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}
                    >
                        <LayoutGrid size={14} /> Tableau
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'white' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className={`h-8 gap-2 text-xs ${viewMode === 'list' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}
                    >
                        <ListIcon size={14} /> Liste
                    </Button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Rechercher un ticket..."
                            className="pl-9 h-9 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="sm" className="h-9 gap-2 text-zinc-600">
                        <Filter size={14} /> Filtres
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="min-h-[500px]">
                {viewMode === 'board' ? (
                    <MaintenanceBoard tickets={filteredTickets} onTicketClick={handleTicketClick} />
                ) : (
                    <MaintenanceList tickets={filteredTickets} onTicketClick={handleTicketClick} />
                )}
            </div>

            {/* Detail Sheet */}
            <TicketDetailSheet
                ticket={selectedTicket}
                open={detailOpen}
                onOpenChange={setDetailOpen}
            />
        </div>
    );
}
