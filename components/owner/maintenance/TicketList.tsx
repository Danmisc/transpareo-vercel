"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    MoreHorizontal,
    ArrowUpDown,
    Trash2,
    AlertCircle,
    Clock,
    CheckCircle2,
    Eye
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface TicketListProps {
    tickets: any[];
    onDelete: (id: string) => void;
    onViewDetail: (id: string) => void;
    onStatusChange: (id: string, status: string) => void;
}

export function TicketList({ tickets, onDelete, onViewDetail, onStatusChange }: TicketListProps) {
    if (tickets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400 p-10">
                <p>Aucun ticket pour le moment.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                        <TableHead className="w-[300px]">Titre & Description</TableHead>
                        <TableHead>Bien / Locataire</TableHead>
                        <TableHead>Priorité</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tickets.map((ticket) => (
                        <TableRow key={ticket.id} className="cursor-pointer hover:bg-zinc-50" onClick={() => onViewDetail(ticket.id)}>
                            <TableCell className="font-medium">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-semibold text-zinc-900">{ticket.title}</span>
                                    <span className="text-xs text-zinc-500 line-clamp-1">{ticket.category}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-zinc-700">
                                        {ticket.property?.name || ticket.property?.address || (typeof ticket.property === 'string' ? ticket.property : "Bien inconnu")}
                                    </span>
                                    <span className="text-xs text-zinc-400">
                                        {ticket.tenant?.name || (typeof ticket.tenant === 'string' ? ticket.tenant : "Locataire")}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={cn(
                                    "border-none shadow-none font-medium text-xs",
                                    ticket.priority === 'HIGH' ? "bg-rose-50 text-rose-700" : "bg-zinc-100 text-zinc-600"
                                )}>
                                    {ticket.priority === 'HIGH' ? 'Urgent' : 'Normal'}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className={cn(
                                                "h-7 text-xs font-medium border",
                                                ticket.status === 'OPEN' ? "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100" :
                                                    ticket.status === 'IN_PROGRESS' ? "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100" :
                                                        "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                                            )}>
                                                {ticket.status === 'OPEN' && 'À Traiter'}
                                                {ticket.status === 'IN_PROGRESS' && 'En Cours'}
                                                {ticket.status === 'RESOLVED' && 'Résolu'}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start">
                                            <DropdownMenuItem onClick={() => onStatusChange(ticket.id, 'New')}>
                                                À Traiter
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onStatusChange(ticket.id, 'In Progress')}>
                                                En Cours
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onStatusChange(ticket.id, 'Done')}>
                                                Résolu
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </TableCell>
                            <TableCell className="text-xs text-zinc-500">
                                {ticket.createdAt ? format(new Date(ticket.createdAt), "d MMM yyyy", { locale: fr }) : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-600" onClick={() => onViewDetail(ticket.id)}>
                                        <Eye size={16} />
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-600">
                                                <MoreHorizontal size={16} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem className="text-rose-600 focus:text-rose-600" onClick={() => onDelete(ticket.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
