"use client";

import { useState, useEffect } from "react";
import { getApplications, createApplication, updateApplicationStatus } from "@/lib/actions/dossier";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Building2, MapPin, Euro, Calendar, GripVertical, CheckCircle2, XCircle, Clock, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Application {
    id: string;
    status: string;
    externalLabel: string | null;
    notes: string | null;
    createdAt: Date;
    listing?: {
        title: string;
        address: string;
        price: number;
    }
}

const COLUMNS = [
    { id: "SENT", title: "Envoyé", icon: Send, color: "text-blue-500 bg-blue-50" },
    { id: "OPENED", title: "Consulté", icon: Clock, color: "text-amber-500 bg-amber-50" },
    { id: "REVIEWING", title: "En Étude", icon: CheckCircle2, color: "text-purple-500 bg-purple-50" },
    { id: "ACCEPTED", title: "Accepté", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50" },
    { id: "REJECTED", title: "Refusé", icon: XCircle, color: "text-red-500 bg-red-50" }
];

export function ApplicationKanban({ userId }: { userId: string }) {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newAppLabel, setNewAppLabel] = useState("");

    const fetchApps = async () => {
        const res = await getApplications(userId);
        if (res.success) {
            setApplications(res.data as any[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchApps();
    }, [userId]);

    const handleCreate = async () => {
        if (!newAppLabel) return;
        const res = await createApplication(userId, { externalLabel: newAppLabel });
        if (res.success) {
            toast.success("Candidature ajoutée !");
            setIsCreateOpen(false);
            setNewAppLabel("");
            fetchApps();
        }
    };

    const onDragEnd = async (result: any) => {
        if (!result.destination) return;

        const { source, destination, draggableId } = result;
        if (source.droppableId === destination.droppableId) return;

        // Optimistic Update
        const newApps = applications.map(app =>
            app.id === draggableId ? { ...app, status: destination.droppableId } : app
        );
        setApplications(newApps);

        // Server Update
        const res = await updateApplicationStatus(draggableId, destination.droppableId);
        if (!res.success) {
            toast.error("Échec de la mise à jour");
            fetchApps(); // Revert
        }
    };

    return (
        <div className="bg-zinc-50/50 rounded-2xl border border-zinc-200 overflow-hidden shadow-sm pt-6">
            <div className="px-6 mb-6 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-zinc-900 text-lg flex items-center gap-2">
                        <Building2 className="text-zinc-700" size={20} />
                        Mes Candidatures CRM
                    </h3>
                    <p className="text-sm text-zinc-500">Suivez l'état de vos dossiers envoyés en temps réel.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-zinc-900 hover:bg-zinc-800 text-white">
                            <Plus size={16} className="mr-2" />
                            Nouvelle Candidature
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ajouter une candidature externe</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <p className="text-sm text-zinc-500">Pour les annonces Transpareo, cela se fait automatiquement. Ajoutez ici vos candidatures sur d'autres sites (Leboncoin, SeLoger...).</p>
                            <Input
                                placeholder="Titre (ex: Appartement Rue de Rivoli)"
                                value={newAppLabel}
                                onChange={(e) => setNewAppLabel(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate}>Ajouter</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="overflow-x-auto pb-6 px-6">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex gap-4 min-w-[1000px]">
                        {COLUMNS.map(col => (
                            <Droppable key={col.id} droppableId={col.id}>
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="flex-1 min-w-[200px] bg-zinc-100/50 rounded-xl p-3 border border-zinc-200/50 flex flex-col gap-3"
                                    >
                                        <div className={`flex items-center gap-2 font-semibold text-xs uppercase tracking-wider px-1 ${col.color.split(' ')[0]}`}>
                                            <col.icon size={12} />
                                            {col.title}
                                            <span className="ml-auto bg-white px-1.5 py-0.5 rounded-md text-zinc-500 shadow-sm border border-zinc-100">
                                                {applications.filter(a => a.status === col.id).length}
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-2 min-h-[100px]">
                                            {applications
                                                .filter(a => a.status === col.id)
                                                .map((app, index) => (
                                                    <Draggable key={app.id} draggableId={app.id} index={index}>
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="bg-white p-3 rounded-lg shadow-sm border border-zinc-200 hover:shadow-md transition-shadow group cursor-grab active:cursor-grabbing"
                                                            >
                                                                <div className="text-sm font-semibold text-zinc-900 mb-1 line-clamp-2">
                                                                    {app.listing?.title || app.externalLabel || "Candidature sans titre"}
                                                                </div>
                                                                {app.listing && (
                                                                    <div className="space-y-1 mb-2">
                                                                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                                                                            <MapPin size={10} />
                                                                            <span className="truncate">{app.listing.address}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                                                                            <Euro size={10} />
                                                                            <span>{app.listing.price}/mois</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-50">
                                                                    <span className="text-[10px] text-zinc-400">
                                                                        {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true, locale: fr })}
                                                                    </span>
                                                                    <GripVertical size={14} className="text-zinc-300 opacity-0 group-hover:opacity-100" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                </DragDropContext>
            </div>
        </div>
    );
}
