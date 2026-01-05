"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, Calendar, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MaintenanceBoardProps {
    tickets: any[];
    onTicketClick: (ticket: any) => void;
}

const COLUMNS = [
    { id: 'OPEN', label: 'À Faire', color: 'bg-zinc-100' },
    { id: 'IN_PROGRESS', label: 'En Cours', color: 'bg-blue-50' },
    { id: 'RESOLVED', label: 'Terminé', color: 'bg-emerald-50' }
];

export function MaintenanceBoard({ tickets, onTicketClick }: MaintenanceBoardProps) {

    const getColumnTickets = (status: string) => tickets.filter(t => t.status === status);

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'URGENT': return <Badge variant="destructive" className="text-[10px] h-5">URGENT</Badge>;
            case 'HIGH': return <Badge className="text-[10px] h-5 bg-orange-500 hover:bg-orange-600">HAUTE</Badge>;
            default: return null;
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px] overflow-hidden">
            {COLUMNS.map(col => (
                <div key={col.id} className="flex flex-col h-full bg-zinc-50/50 rounded-xl border border-zinc-200/50">
                    {/* Column Header */}
                    <div className={`p-4 border-b border-zinc-200 flex justify-between items-center ${col.color} rounded-t-xl`}>
                        <h4 className="font-bold text-zinc-700 text-sm">{col.label}</h4>
                        <Badge variant="secondary" className="bg-white text-zinc-500 shadow-sm border border-zinc-100">
                            {getColumnTickets(col.id).length}
                        </Badge>
                    </div>

                    {/* Tickets Area */}
                    <div className="p-3 flex-1 overflow-y-auto space-y-3">
                        {getColumnTickets(col.id).length === 0 ? (
                            <div className="h-24 border-2 border-dashed border-zinc-200 rounded-lg flex items-center justify-center text-zinc-400 text-xs italic">
                                Aucun ticket
                            </div>
                        ) : (
                            getColumnTickets(col.id).map(ticket => (
                                <Card
                                    key={ticket.id}
                                    onClick={() => onTicketClick(ticket)}
                                    className="p-4 cursor-pointer hover:shadow-lg hover:border-blue-200 transition-all group bg-white border-zinc-200 shadow-sm relative overflow-hidden"
                                >
                                    {/* Priority Indicator Line */}
                                    {ticket.priority === 'URGENT' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}

                                    <div className="flex justify-between items-start mb-2 pl-2">
                                        <div className="flex gap-2 items-center">
                                            {getPriorityBadge(ticket.priority)}
                                            <span className="text-[10px] text-zinc-400 font-mono">#{ticket.id.slice(0, 4)}</span>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-6 w-6 -mr-2 -mt-2 opacity-0 group-hover:opacity-100">
                                            <MoreHorizontal size={14} />
                                        </Button>
                                    </div>

                                    <h5 className="font-bold text-zinc-800 text-sm mb-1 pl-2 leading-tight">{ticket.title}</h5>
                                    <p className="text-xs text-zinc-500 line-clamp-2 pl-2 mb-4">{ticket.description}</p>

                                    <div className="flex items-center justify-between pl-2 pt-2 border-t border-zinc-50">
                                        <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                                            <Calendar size={12} />
                                            {new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </div>
                                        {ticket.provider && (
                                            <div className="flex items-center gap-1">
                                                <Avatar className="h-5 w-5">
                                                    <AvatarFallback className="text-[8px] bg-indigo-100 text-indigo-700">PL</AvatarFallback>
                                                </Avatar>
                                                <span className="text-[10px] text-zinc-600 font-medium">Plombier inc.</span>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
