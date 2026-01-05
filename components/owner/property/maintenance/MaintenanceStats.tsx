"use client";

import { Card } from "@/components/ui/card";
import { Wrench, AlertCircle, Euro, CheckCircle2 } from "lucide-react";

export function MaintenanceStats({ tickets }: { tickets: any[] }) {
    const openTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
    const urgentTickets = tickets.filter(t => t.priority === 'HIGH' || t.priority === 'URGENT').length;
    // Mock cost calculation based on tickets (in real app, sum up invoices)
    const estimatedCost = tickets.reduce((acc, t) => acc + (t.cost || 0), 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                        <Wrench size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-zinc-500 font-medium">Tickets En Cours</p>
                        <h3 className="text-2xl font-bold text-zinc-900">{openTickets}</h3>
                    </div>
                </div>
            </Card>

            <Card className="p-4 border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-50 rounded-lg text-red-600">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-zinc-500 font-medium">Urgences</p>
                        <h3 className="text-2xl font-bold text-zinc-900">{urgentTickets}</h3>
                    </div>
                </div>
            </Card>

            <Card className="p-4 border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                        <Euro size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-zinc-500 font-medium">Dépenses (Mois)</p>
                        <h3 className="text-2xl font-bold text-zinc-900">{estimatedCost}€</h3>
                    </div>
                </div>
            </Card>
        </div>
    );
}
