"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, AlertCircle, Clock, CheckCircle2, Plus, Trash2, ArrowUp, ArrowDown, Eye } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface Ticket {
    id: string;
    title: string;
    property: string;
    status: string; // 'New', 'In Progress', 'Done'
    priority: string; // 'High', 'Medium', 'Low'
    tenant: string;
    type: string;
}

interface TicketBoardProps {
    tickets: Ticket[];
    onTicketMove: (id: string, newStatus: string) => void;
    onDelete: (id: string) => void;
    onPriorityChange: (id: string, priority: string) => void;
    onAddClick: () => void;
    onViewDetail: (id: string) => void;
}

export function TicketBoard({ tickets, onTicketMove, onDelete, onPriorityChange, onAddClick, onViewDetail }: TicketBoardProps) {

    const columns = [
        { id: 'New', title: 'À Traiter', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
        { id: 'In Progress', title: 'En Cours', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
        { id: 'Done', title: 'Résolu', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    ];

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        // Call parent handler
        onTicketMove(draggableId, destination.droppableId);
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-x-auto pb-4">
                {columns.map((col) => {
                    const colTickets = tickets.filter(t => t.status === col.id);
                    const Icon = col.icon;

                    return (
                        <div key={col.id} className="flex flex-col h-full min-w-[300px]">
                            {/* COLUMN HEADER */}
                            <div className="flex items-center justify-between mb-4 px-1">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-md ${col.bg}`}>
                                        <Icon size={14} className={col.color} />
                                    </div>
                                    <h3 className="font-bold text-sm text-zinc-700">{col.title}</h3>
                                    <Badge variant="secondary" className="text-[10px] bg-zinc-100 text-zinc-500 px-1.5 h-5 min-w-[20px] justify-center">
                                        {colTickets.length}
                                    </Badge>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-zinc-400 hover:text-zinc-900"
                                    onClick={onAddClick}
                                >
                                    <Plus size={14} />
                                </Button>
                            </div>

                            {/* DROPPABLE AREA */}
                            <Droppable droppableId={col.id}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`flex-1 rounded-2xl border p-3 space-y-3 transition-colors ${snapshot.isDraggingOver ? 'bg-zinc-100 border-zinc-300' : 'bg-zinc-50/50 border-zinc-100/50'}`}
                                    >
                                        {colTickets.map((ticket, index) => (
                                            <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{ ...provided.draggableProps.style }}
                                                    >
                                                        <TicketCard
                                                            ticket={ticket}
                                                            onDelete={onDelete}
                                                            onPriorityChange={onPriorityChange}
                                                            onViewDetail={onViewDetail}
                                                        />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                        {colTickets.length === 0 && !snapshot.isDraggingOver && (
                                            <div className="h-32 flex flex-col items-center justify-center text-zinc-300 text-xs italic border-2 border-dashed border-zinc-100 rounded-xl">
                                                Aucun ticket
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </div>
        </DragDropContext>
    );
}

function TicketCard({ ticket, onDelete, onPriorityChange, onViewDetail }: {
    ticket: Ticket,
    onDelete: (id: string) => void,
    onPriorityChange: (id: string, p: string) => void,
    onViewDetail: (id: string) => void
}) {
    return (
        <div className="group bg-white p-3 rounded-xl border border-zinc-100 shadow-sm hover:shadow-md hover:border-zinc-200 transition-all">
            <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className={`text-[9px] px-1.5 py-0 border-none ${ticket.priority === 'High' ? 'bg-rose-100 text-rose-700' :
                    ticket.priority === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                    {ticket.type}
                </Badge>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="text-zinc-300 hover:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                            <MoreHorizontal size={14} />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onPriorityChange(ticket.id, 'HIGH')} className="text-xs">
                            <ArrowUp size={12} className="mr-2 text-rose-500" /> Priorité Haute
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onPriorityChange(ticket.id, 'LOW')} className="text-xs">
                            <ArrowDown size={12} className="mr-2 text-blue-500" /> Priorité Basse
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDelete(ticket.id)} className="text-xs text-rose-600 focus:text-rose-600">
                            <Trash2 size={12} className="mr-2" /> Supprimer
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <h4 className="font-bold text-sm text-zinc-800 mb-1 leading-tight">{ticket.title}</h4>
            <p className="text-[11px] text-zinc-400 mb-3 flex items-center gap-1">
                {ticket.property}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-50 mb-2">
                <div className="flex items-center gap-1.5">
                    <Avatar className="h-5 w-5 border border-white shadow-sm">
                        <AvatarFallback className="text-[9px] bg-indigo-100 text-indigo-700">
                            {ticket.tenant.substring(0, 2)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-[10px] text-zinc-500 font-medium">{ticket.tenant}</span>
                </div>
                <div className="text-[9px] text-zinc-300 font-mono">
                    #ID{ticket.id.slice(-4).toUpperCase()}
                </div>
            </div>

            <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs h-7 bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 text-zinc-600"
                onClick={() => onViewDetail(ticket.id)}
            >
                <Eye size={12} className="mr-2" /> Voir le ticket
            </Button>
        </div>
    );
}

