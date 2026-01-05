"use client";

import { useState, useEffect } from "react";
import { TicketBoard } from "./TicketBoard";
import { TicketList } from "./TicketList";
import { DiagnosticWizard } from "./modules/DiagnosticWizard";
import { ContractorDirectory } from "./modules/ContractorDirectory";
import { AssetHealth } from "./modules/AssetHealth";
import { TicketDetail } from "./TicketDetail";
import { Button } from "@/components/ui/button";
import { Plus, LayoutTemplate, List, HardHat, Activity, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
    getMaintenanceTickets,
    createMaintenanceTicket,
    seedDemoMaintenanceData,
    getContractors,
    getOwnerAssets,
    updateTicketStatus,
    deleteMaintenanceTicket,
    updateTicketPriority
} from "@/lib/actions-maintenance";
import { cn } from "@/lib/utils";

export function MaintenanceCockpit() {
    const [view, setView] = useState<'BOARD' | 'LIST' | 'DIRECTORY' | 'PREDICTIVE'>('BOARD');
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Detail View State
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

    // Real Data State
    const [tickets, setTickets] = useState<any[]>([]);
    const [assets, setAssets] = useState<any[]>([]);
    const [contractors, setContractors] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        // Don't set loading true on refresh to avoid flickering if already loaded
        if (tickets.length === 0) setIsLoading(true);
        try {
            // Seed data if first time (for demo feel)
            await seedDemoMaintenanceData();

            const [fetchedTickets, fetchedAssets, fetchedContractors] = await Promise.all([
                getMaintenanceTickets(),
                getOwnerAssets(),
                getContractors()
            ]);

            setTickets(fetchedTickets || []);
            setAssets(fetchedAssets || []);
            setContractors(fetchedContractors || []);
        } catch (error) {
            console.error("Failed to load maintenance data", error);
            toast.error("Erreur de chargement des données.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewTicket = async (ticketData: any) => {
        try {
            const tempId = Math.random().toString();
            // Optimistic UI
            const newTicket = {
                id: tempId,
                title: ticketData.subCategory || "Nouvel Incident",
                property: { name: "Mon Bien" },
                status: "OPEN",
                priority: ticketData.urgency === 'HIGH' ? 'HIGH' : 'MEDIUM',
                category: ticketData.category,
                tenant: { name: "Moi" }
            };
            setTickets(prev => [newTicket, ...prev]);

            await createMaintenanceTicket({
                title: ticketData.subCategory || "Incident",
                description: ticketData.description || "",
                category: ticketData.category,
                subCategory: ticketData.subCategory,
                priority: "MEDIUM",
                urgency: ticketData.urgency
            });

            toast.success("Ticket créé !");
            loadData(); // Sync ID
        } catch (err) {
            toast.error("Erreur création ticket");
        }
    };

    const handleTicketMove = async (ticketId: string, newStatus: string) => {
        // Optimistic Update
        const oldTickets = [...tickets];
        setTickets(prev => prev.map(t =>
            t.id === ticketId ? { ...t, status: newStatus === 'New' ? 'OPEN' : newStatus === 'In Progress' ? 'IN_PROGRESS' : 'RESOLVED' } : t
        ));

        try {
            const dbStatus = newStatus === 'New' ? 'OPEN' : newStatus === 'In Progress' ? 'IN_PROGRESS' : 'RESOLVED';
            await updateTicketStatus(ticketId, dbStatus);
            toast.success("Statut mis à jour");
        } catch (err) {
            setTickets(oldTickets); // Revert
            toast.error("Erreur lors du déplacement");
        }
    };

    const handleDeleteTicket = async (ticketId: string) => {
        const oldTickets = [...tickets];
        setTickets(prev => prev.filter(t => t.id !== ticketId));

        try {
            await deleteMaintenanceTicket(ticketId);
            toast.success("Ticket supprimé");
        } catch (err) {
            setTickets(oldTickets);
            toast.error("Impossible de supprimer");
        }
    };

    const handleUpdatePriority = async (ticketId: string, priority: string) => {
        setTickets(prev => prev.map(t =>
            t.id === ticketId ? { ...t, priority: priority } : t
        ));
        await updateTicketPriority(ticketId, priority);
    }


    if (isLoading && tickets.length === 0) {
        return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>;
    }

    return (
        <div className={cn("space-y-6 flex flex-col", view === 'BOARD' ? "h-full" : "min-h-full")}>
            {/* HEADER & ACTIONS */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900">
                        {view === 'DIRECTORY' && 'Annuaire Artisans'}
                        {view === 'PREDICTIVE' && 'Maintenance Prédictive'}
                        {(view === 'BOARD' || view === 'LIST') && 'Tour de Contrôle'}
                    </h2>
                    <p className="text-zinc-500 text-xs">
                        {view === 'DIRECTORY' && `Gérez vos ${contractors.length} artisans favoris.`}
                        {view === 'PREDICTIVE' && `Suivi de ${assets.length} équipements.`}
                        {(view === 'BOARD' || view === 'LIST') && `${tickets.length} tickets en cours.`}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-zinc-100 p-1 rounded-lg border border-zinc-200">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 rounded-md ${view === 'BOARD' ? 'bg-white shadow-sm ring-1 ring-black/5' : 'text-zinc-500 hover:text-zinc-900'}`}
                            onClick={() => setView('BOARD')}
                            title="Tableau de bord"
                        >
                            <LayoutTemplate size={14} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 rounded-md ${view === 'LIST' ? 'bg-white shadow-sm ring-1 ring-black/5' : 'text-zinc-500 hover:text-zinc-900'}`}
                            onClick={() => setView('LIST')}
                            title="Liste simple"
                        >
                            <List size={14} />
                        </Button>
                        <div className="w-px h-4 bg-zinc-300 mx-1 self-center" />
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 rounded-md ${view === 'DIRECTORY' ? 'bg-white shadow-sm ring-1 ring-black/5 text-indigo-600' : 'text-zinc-500 hover:text-zinc-900'}`}
                            onClick={() => setView('DIRECTORY')}
                            title="Annuaire Artisans"
                        >
                            <HardHat size={14} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 rounded-md ${view === 'PREDICTIVE' ? 'bg-white shadow-sm ring-1 ring-black/5 text-emerald-600' : 'text-zinc-500 hover:text-zinc-900'}`}
                            onClick={() => setView('PREDICTIVE')}
                            title="Maintenance Prédictive"
                        >
                            <Activity size={14} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className={cn("flex-1", view === 'BOARD' ? "min-h-0" : "")}>
                {view === 'BOARD' && (
                    <TicketBoard
                        tickets={tickets.map(t => ({
                            id: t.id,
                            title: t.title,
                            property: t.property?.name || "Bien inconnu",
                            status: t.status === 'OPEN' ? 'New' : t.status === 'IN_PROGRESS' ? 'In Progress' : 'Done',
                            priority: t.priority === 'HIGH' ? 'High' : 'Medium',
                            tenant: t.tenant?.name || "Locataire",
                            type: t.category || "Autre"
                        }))}
                        onTicketMove={handleTicketMove}
                        onDelete={handleDeleteTicket}
                        onPriorityChange={handleUpdatePriority}
                        onAddClick={() => setIsWizardOpen(true)}
                        onViewDetail={(id) => setSelectedTicketId(id)}
                    />
                )}

                {view === 'LIST' && (
                    <TicketList
                        tickets={tickets}
                        onDelete={handleDeleteTicket}
                        onViewDetail={(id) => setSelectedTicketId(id)}
                        onStatusChange={handleTicketMove}
                    />
                )}

                {view === 'DIRECTORY' && <ContractorDirectory />}
                {view === 'PREDICTIVE' && <AssetHealth />}
            </div>

            {/* MODALS */}
            <DiagnosticWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                onSubmit={handleNewTicket}
            />

            <TicketDetail
                open={!!selectedTicketId}
                ticketId={selectedTicketId}
                onClose={() => setSelectedTicketId(null)}
            />
        </div>
    );
}
