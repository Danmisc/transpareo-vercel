"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, AlertTriangle, CheckCircle } from "lucide-react";

interface MaintenanceListProps {
    tickets: any[];
    onTicketClick: (ticket: any) => void;
}

export function MaintenanceList({ tickets, onTicketClick }: MaintenanceListProps) {

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-zinc-100 text-zinc-700 border-zinc-200';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'RESOLVED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
        }
    };

    return (
        <div className="rounded-md border border-zinc-200 overflow-hidden bg-white">
            <Table>
                <TableHeader>
                    <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50">
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Titre</TableHead>
                        <TableHead>Priorité</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tickets.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                                Aucun ticket trouvé.
                            </TableCell>
                        </TableRow>
                    ) : (
                        tickets.map((ticket) => (
                            <TableRow key={ticket.id} className="cursor-pointer hover:bg-zinc-50" onClick={() => onTicketClick(ticket)}>
                                <TableCell className="font-mono text-xs text-zinc-500">#{ticket.id.slice(0, 6)}</TableCell>
                                <TableCell className="font-medium">{ticket.title}</TableCell>
                                <TableCell>
                                    {ticket.priority === 'URGENT' ? (
                                        <Badge variant="destructive" className="h-5 text-[10px]">URGENT</Badge>
                                    ) : ticket.priority === 'HIGH' ? (
                                        <Badge className="bg-orange-500 hover:bg-orange-600 h-5 text-[10px]">HAUTE</Badge>
                                    ) : (
                                        <span className="text-zinc-500 text-xs flex items-center gap-1">
                                            <CheckCircle size={12} /> Normale
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`border ${getStatusColor(ticket.status)}`}>
                                        {ticket.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-zinc-500 text-xs">
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="icon" variant="ghost" className="h-8 w-8">
                                        <MoreHorizontal size={14} />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

