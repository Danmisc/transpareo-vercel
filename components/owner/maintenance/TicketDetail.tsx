"use client";

import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Send, User, MapPin, Calendar, Clock, Paperclip, Check, ChevronDown, Loader2 } from "lucide-react";
import { getTicketDetails, addTicketMessage, assignContractor, scheduleIntervention, getContractors, uploadTicketAttachment } from "@/lib/actions-maintenance";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface TicketDetailProps {
    ticketId: string | null;
    open: boolean;
    onClose: () => void;
}

export function TicketDetail({ ticketId, open, onClose }: TicketDetailProps) {
    const [ticket, setTicket] = useState<any>(null);
    const [contractors, setContractors] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // UI States
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [showAttachments, setShowAttachments] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open && ticketId) {
            loadTicket();
            loadContractors();
        } else {
            setTicket(null);
        }
    }, [open, ticketId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [ticket?.messages]);

    const loadTicket = async () => {
        setLoading(true);
        try {
            if (!ticketId) return;
            const data = await getTicketDetails(ticketId);
            setTicket(data);
        } catch (error) {
            toast.error("Impossible de charger le ticket");
        } finally {
            setLoading(false);
        }
    };

    const loadContractors = async () => {
        try {
            const data = await getContractors();
            setContractors(data);
        } catch (err) {
            console.error("Failed to load contractors");
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !ticketId) return;

        const tempMessage = {
            id: Math.random(),
            content: newMessage,
            senderName: "Moi",
            isMe: true,
            createdAt: new Date(),
        };

        setTicket((prev: any) => ({
            ...prev,
            messages: [...(prev.messages || []), tempMessage]
        }));
        setNewMessage("");

        try {
            await addTicketMessage(ticketId, tempMessage.content);
        } catch (error) {
            toast.error("Erreur d'envoi");
            // Optionally remove/mark error on message
        }
    };

    const handleAssign = async (contractor: any) => {
        if (!ticketId) return;
        try {
            // Optimistic
            setTicket((prev: any) => ({ ...prev, contractor: contractor }));
            setIsAssignOpen(false);

            await assignContractor(ticketId, contractor.id);
            toast.success(`Assigné à ${contractor.name}`);

            // Add system message
            await addTicketMessage(ticketId, `👷 J'ai assigné ce ticket à ${contractor.name}.`);

            // Reload to sync fully
            setTimeout(loadTicket, 500);
        } catch (err) {
            toast.error("Erreur d'assignation");
        }
    };

    const handleSchedule = async (date: Date | undefined) => {
        if (!ticketId || !date) return;
        try {
            setTicket((prev: any) => ({ ...prev, scheduledDate: date }));
            setIsCalendarOpen(false);

            await scheduleIntervention(ticketId, date);
            toast.success(`Intervention le ${format(date, "dd/MM")}`);

            // Add system message
            await addTicketMessage(ticketId, `📅 Intervention planifiée pour le ${format(date, "dd MMMM yyyy", { locale: fr })}.`);
            setTimeout(loadTicket, 500);
        } catch (err) {
            toast.error("Erreur planification");
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !ticketId) return;

        const file = e.target.files[0];
        setIsUploading(true);

        const formData = new FormData();
        formData.append("ticketId", ticketId);
        formData.append("file", file);

        try {
            await uploadTicketAttachment(formData);
            toast.success("Document ajouté");
            await loadTicket(); // Re-fetch to show new attachment
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'upload");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden bg-zinc-50">

                {/* HEADER */}
                <div className="p-4 bg-white border-b border-zinc-200 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-lg font-bold text-zinc-900 line-clamp-1">
                                {ticket?.title || "Chargement..."}
                            </h2>
                            {ticket && (
                                <Badge className={`
                                    ${ticket.status === 'OPEN' || ticket.status === "New" ? 'bg-rose-100 text-rose-700' :
                                        ticket.status === 'IN_PROGRESS' || ticket.status === "In Progress" ? 'bg-amber-100 text-amber-700' :
                                            'bg-emerald-100 text-emerald-700'} border-none shadow-none`
                                }>
                                    {ticket.status === 'OPEN' ? 'À Traiter' : ticket.status === 'IN_PROGRESS' ? 'En Cours' : 'Résolu'}
                                </Badge>
                            )}
                        </div>
                        <p className="text-zinc-500 text-xs flex items-center gap-2">
                            <span className="flex items-center gap-1"><MapPin size={12} /> {ticket?.property?.name || "..."}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> {ticket?.createdAt ? format(new Date(ticket.createdAt), "d MMM yyyy", { locale: fr }) : "..."}</span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-1 min-h-0">

                    {/* LEFT: META & INFO */}
                    <div className="w-1/3 border-r border-zinc-200 bg-white p-4 hidden md:block overflow-y-auto">
                        <div className="space-y-6">

                            {/* DESCRIPTION */}
                            <div>
                                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">Description</h4>
                                <div className="p-3 bg-zinc-50 rounded-lg text-sm text-zinc-600 leading-relaxed border border-zinc-100">
                                    {loading ? "Chargement..." : ticket?.description || "Aucune description."}
                                </div>
                            </div>

                            <Separator />

                            {/* ARTISAN ASSIGNÉ */}
                            <div>
                                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">Artisan</h4>
                                {ticket?.contractor ? (
                                    <div className="flex items-center gap-3 bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                                        <Avatar className="h-8 w-8 bg-indigo-100 text-indigo-600">
                                            <AvatarFallback>Pro</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-bold text-indigo-900">{ticket.contractor.name}</p>
                                            <p className="text-[10px] text-indigo-600">{ticket.contractor.jobType}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-zinc-400 italic">Aucun artisan assigné</p>
                                )}
                            </div>

                            {/* DATE INTERVENTION */}
                            {ticket?.scheduledDate && (
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2 mt-4">Intervention</h4>
                                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                                        <Calendar size={14} />
                                        <span className="text-sm font-medium">{format(new Date(ticket.scheduledDate), "EEEE d MMMM", { locale: fr })}</span>
                                    </div>
                                </div>
                            )}

                            <Separator />

                            {/* ACTIONS */}
                            <div>
                                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">Actions Rapides</h4>
                                <div className="grid grid-cols-1 gap-2">

                                    {/* ASSIGN POPUP */}
                                    <Popover open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm" className="w-full justify-start text-xs font-normal">
                                                <User size={14} className="mr-2 text-zinc-400" />
                                                {ticket?.contractor ? "Changer d'Artisan" : "Assigner Artisan"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-0 w-60" align="start">
                                            <Command>
                                                <CommandInput placeholder="Chercher artisan..." className="h-8 text-xs" />
                                                <CommandList>
                                                    <CommandEmpty>Aucun artisan trouvé.</CommandEmpty>
                                                    <CommandGroup>
                                                        {contractors.map((c) => (
                                                            <CommandItem
                                                                key={c.id}
                                                                onSelect={() => handleAssign(c)}
                                                                className="text-xs"
                                                            >
                                                                <Check className={cn("mr-2 h-3 w-3", ticket?.contractor?.id === c.id ? "opacity-100" : "opacity-0")} />
                                                                {c.name} ({c.jobType})
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>

                                    {/* CALENDAR POPUP */}
                                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm" className="w-full justify-start text-xs font-normal">
                                                <Calendar size={14} className="mr-2 text-zinc-400" /> Planifier Intervention
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <CalendarComponent
                                                mode="single"
                                                selected={ticket?.scheduledDate ? new Date(ticket.scheduledDate) : undefined}
                                                onSelect={handleSchedule}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>

                                    {/* ATTACHMENTS TOGGLE */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start text-xs font-normal"
                                        onClick={() => setShowAttachments(!showAttachments)}
                                    >
                                        <Paperclip size={14} className="mr-2 text-zinc-400" />
                                        {ticket?.attachments?.length || 0} Pièce(s) Jointe(s)
                                        <ChevronDown className={`ml-auto h-3 w-3 transition-transform ${showAttachments ? 'rotate-180' : ''}`} />
                                    </Button>

                                    {showAttachments && (
                                        <div className="bg-zinc-50 border border-zinc-200 rounded-md p-2 space-y-2 animate-in slide-in-from-top-2">
                                            {ticket?.attachments?.map((att: any) => (
                                                <a href={att.url} target="_blank" rel="noopener noreferrer" key={att.id} className="block text-xs text-indigo-600 hover:underline truncate">
                                                    📄 {att.name}
                                                </a>
                                            ))}
                                            {(!ticket?.attachments || ticket.attachments.length === 0) && (
                                                <p className="text-[10px] text-zinc-400 italic">Aucun document.</p>
                                            )}

                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                onChange={handleFileSelect}
                                            />

                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="w-full text-[10px] h-6"
                                                onClick={triggerFileInput}
                                                disabled={isUploading}
                                            >
                                                {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : "+ Ajouter un document"}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* RIGHT: CHAT */}
                    <div className="flex-1 flex flex-col bg-zinc-50/50">
                        {/* MESSAGES AREA */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {loading && <div className="text-center text-xs text-zinc-400 py-10">Chargement de la conversation...</div>}

                                {!loading && ticket?.messages?.length === 0 && (
                                    <div className="text-center text-xs text-zinc-400 py-10 italic">
                                        Aucun message. Commencez la discussion !
                                    </div>
                                )}

                                {ticket?.messages?.map((msg: any) => (
                                    <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${msg.isMe ? 'bg-zinc-900 text-white rounded-br-none' : 'bg-white text-zinc-700 border border-zinc-200 rounded-bl-none'
                                            }`}>
                                            <p>{msg.content}</p>
                                            <p className={`text-[10px] mt-1 ${msg.isMe ? 'text-zinc-400' : 'text-zinc-400'}`}>
                                                {format(new Date(msg.createdAt), "HH:mm")}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        {/* INPUT AREA */}
                        <div className="p-4 bg-white border-t border-zinc-200">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Écrivez un message..."
                                    className="flex-1 bg-zinc-50 border-zinc-200 focus-visible:ring-zinc-900"
                                />
                                <Button type="submit" size="icon" className="bg-zinc-900 text-white hover:bg-zinc-800">
                                    <Send size={16} />
                                </Button>
                            </form>
                        </div>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}
