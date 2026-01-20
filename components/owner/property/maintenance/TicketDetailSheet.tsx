"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Clock,
    Send,
    Paperclip,
    CheckCircle2,
    Wrench,
    Image as ImageIcon,
    FileText,
    Trash2,
    Calendar,
    Phone,
    Mail,
    AlertTriangle,
    UserPlus,
    Edit2,
    ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useTransition, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { addTicketMessage, updateTicketStatus, assignTicketProvider, uploadTicketAttachment } from "@/lib/actions-owner";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface TicketDetailSheetProps {
    ticket: any | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TicketDetailSheet({ ticket, open, onOpenChange }: TicketDetailSheetProps) {
    const [newMessage, setNewMessage] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [editProviderOpen, setEditProviderOpen] = useState(false);

    // Robust Local State (Replaces useOptimistic)
    const [messages, setMessages] = useState<any[]>([]);
    const [optimisticStatus, setOptimisticStatus] = useState<string>("");

    // Sync from Server Props (but protect against overwriting unsaved optimistics if we were filtering)
    // Actually, simple overwrite is best, because ID deduplication handles the merge visually if needed.
    // We just need to make sure we don't lose the "optimistic" one before the server one arrives.
    // Strategy: always use PROPS as source of truth, but overlay optimistic ones.

    // Better Strategy for "Disappearing Messages":
    // Maintain a local list initialized from props.
    // When sending, append to local list.
    // When props update, merge them? Or just replace?
    // Replacing causes flickering if the new props don't have the message yet.
    // BUT router.refresh() should bring the new message.

    const [files, setFiles] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Let's implement this: 
    // State = Props Messages + Pending Messages

    useEffect(() => {
        if (ticket) {
            setMessages(ticket.messages || []);
            setFiles(ticket.attachments || []);
            setOptimisticStatus(ticket.status || "OPEN");
        }
    }, [ticket]);

    // Scroll to bottom
    useEffect(() => {
        if (open && scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [open, messages]);

    if (!ticket) return null;

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const content = newMessage;
        const tempId = `temp-${Date.now()}`;
        const tempMessage = {
            id: tempId,
            content: content,
            senderName: "Moi",
            isMe: true,
            createdAt: new Date().toISOString()
        };

        // 1. Update Local State Immediately
        setNewMessage("");
        setMessages(prev => [...prev, tempMessage]);

        // 2. Call Server Action
        startTransition(async () => {
            const result = await addTicketMessage({ ticketId: ticket.id, content });

            if (result.success) {
                // 3. Refresh to get real data
                router.refresh();
                // We rely on the useEffect above to update 'messages' when the new prop arrives.
                // The temp message stays until the prop update replaces the whole list.
            } else {
                toast.error("Erreur d'envoi");
                // Remove temp message on failure
                setMessages(prev => prev.filter(m => m.id !== tempId));
                setNewMessage(content);
            }
        });
    };

    const handleStatusChange = (newStatus: string) => {
        setOptimisticStatus(newStatus); // Immediate update
        startTransition(async () => {
            const result = await updateTicketStatus(ticket.id, newStatus);
            if (result.success) {
                toast.success(`Statut mis à jour : ${newStatus}`);
                router.refresh();
            } else {
                toast.error("Erreur de mise à jour");
                setOptimisticStatus(ticket.status); // Revert
            }
        });
    };
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const tempId = `temp-${Date.now()}`;
        const tempFile = {
            id: tempId,
            name: file.name,
            url: "#",
            type: file.type.startsWith("image/") ? "IMAGE" : "DOCUMENT",
            createdAt: new Date().toISOString()
        };

        // Optimistic UI
        setFiles(prev => [tempFile, ...prev]);

        startTransition(async () => {
            const formData = new FormData();
            formData.append("ticketId", ticket.id);
            formData.append("file", file);

            const result = await uploadTicketAttachment(formData);
            if (result.success) {
                toast.success("Fichier ajouté");
                router.refresh();
            } else {
                toast.error("Erreur d'upload");
                setFiles(prev => prev.filter(f => f.id !== tempId));
            }
        });
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileSelect}
            />
            <SheetContent className="sm:max-w-xl w-full flex flex-col p-0 gap-0 bg-white shadow-2xl border-l border-zinc-200">

                {/* Header */}
                <div className="p-6 border-b border-zinc-200 bg-zinc-50/80 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-2">
                            {optimisticStatus !== 'RESOLVED' && (
                                <Button
                                    size="xs"
                                    variant="outline"
                                    className="h-6 text-[10px] gap-1 text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                                    onClick={() => handleStatusChange('RESOLVED')}
                                    disabled={isPending}
                                >
                                    <CheckCircle2 size={10} /> Résoudre
                                </Button>
                            )}
                            <Badge variant={optimisticStatus === 'RESOLVED' ? 'default' : 'secondary'} className="bg-zinc-900 text-white">
                                {optimisticStatus}
                            </Badge>
                        </div>
                        <span className="text-xs text-zinc-400 font-mono">REF-{ticket.id.slice(0, 8)}</span>
                    </div>
                    <SheetTitle className="text-xl font-bold mb-2 text-zinc-900">{ticket.title}</SheetTitle>
                    <SheetDescription className="text-sm text-zinc-500 line-clamp-2">
                        {ticket.description}
                    </SheetDescription>
                </div>

                {/* Main Content */}
                <Tabs defaultValue="discussion" className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-6 pt-4 border-b border-zinc-100 bg-white z-10">
                        <TabsList className="bg-zinc-100 w-full justify-start h-auto p-1 grid grid-cols-4 mb-0">
                            <TabsTrigger value="discussion" className="text-xs">Journal</TabsTrigger>
                            <TabsTrigger value="info" className="text-xs">Infos & Action</TabsTrigger>
                            <TabsTrigger value="timeline" className="text-xs">Historique</TabsTrigger>
                            <TabsTrigger value="files" className="text-xs">Fichiers</TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="flex-1 bg-white relative">
                        <div className="p-6 min-h-full">

                            <TabsContent value="timeline" className="mt-0 space-y-8 animate-in slide-in-from-left-4 duration-300">
                                {ticket.timeline?.length === 0 ? (
                                    <p className="text-center text-zinc-400 text-sm py-10">Aucun événement récent.</p>
                                ) : (
                                    ticket.timeline?.map((event: any) => (
                                        <TimelineItem
                                            key={event.id}
                                            icon={<Clock size={16} className="text-white" />}
                                            color="bg-zinc-400"
                                            date={new Date(event.createdAt).toLocaleString()}
                                            title={event.title}
                                            description={event.description}
                                        />
                                    ))
                                )}
                                <TimelineItem
                                    icon={<Clock size={16} className="text-white" />}
                                    color="bg-zinc-300"
                                    date={new Date(ticket.createdAt).toLocaleDateString()}
                                    title="Ticket Créé"
                                    description="Ouverture du ticket."
                                />
                            </TabsContent>

                            <TabsContent value="discussion" className="mt-0 flex flex-col gap-4 pb-4">
                                <div className="text-center p-4 bg-zinc-50 rounded-lg border border-zinc-100 mb-4">
                                    <p className="text-xs text-zinc-500">
                                        ℹ️ Ce journal est partagé avec le locataire. Vous pouvez aussi l'utiliser pour noter vos appels avec l'artisan.
                                    </p>
                                </div>
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-40 text-zinc-400 opacity-50">
                                        <Send size={24} className="mb-2" />
                                        <span className="text-xs">Démarrez le journal...</span>
                                    </div>
                                ) : (
                                    messages.map((msg: any) => (
                                        <ChatMessage
                                            key={msg.id}
                                            sender={msg.senderName}
                                            time={new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            content={msg.content}
                                            isMe={msg.isMe}
                                        />
                                    ))
                                )}
                                <div ref={scrollRef} />
                            </TabsContent>

                            <TabsContent value="files" className="mt-0 animate-in fade-in duration-300">
                                <div className="grid grid-cols-2 gap-4">
                                    {files.map((file: any) => (
                                        <div key={file.id} className="aspect-square bg-zinc-100 rounded-lg border border-zinc-200 flex flex-col items-center justify-center relative group cursor-pointer overflow-hidden hover:bg-zinc-50 transition-colors" onClick={() => window.open(file.url, '_blank')}>
                                            {file.type === 'IMAGE' ? (
                                                <ImageIcon className="text-zinc-600 mb-2" size={32} />
                                            ) : (
                                                <FileText className="text-zinc-400 mb-2" size={32} />
                                            )}
                                            <span className="text-xs text-zinc-600 font-medium px-2 text-center truncate w-full">{file.name}</span>
                                        </div>
                                    ))}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square bg-zinc-50 rounded-lg border border-dashed border-zinc-300 flex flex-col items-center justify-center text-zinc-400 cursor-pointer hover:bg-zinc-100 hover:border-zinc-400 transition-colors"
                                    >
                                        <Paperclip size={24} className="mb-2" />
                                        <span className="text-xs">Ajouter un fichier</span>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="info" className="mt-0 space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <section>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-xs font-bold uppercase text-zinc-400">Intervenant</h4>
                                        <Button size="xs" variant="ghost" onClick={() => setEditProviderOpen(true)}>
                                            <Edit2 size={12} className="mr-1" /> Modifier
                                        </Button>
                                    </div>

                                    {ticket.provider ? (
                                        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
                                            <div className="flex items-start gap-4 mb-4">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
                                                        {ticket.provider.slice(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <h5 className="font-bold text-zinc-900">{ticket.provider}</h5>
                                                    <p className="text-xs text-zinc-500 mb-1">{ticket.proContact || "Pas de contact enregistré"}</p>

                                                    <div className="flex gap-2 mt-3">
                                                        <Button size="xs" variant="outline" className="bg-white gap-2 flex-1" asChild>
                                                            <a href={`tel:${ticket.proContact}`}>
                                                                <Phone size={12} /> Appeler
                                                            </a>
                                                        </Button>
                                                        <Button size="xs" variant="outline" className="bg-white gap-2 flex-1" asChild>
                                                            <a href={`mailto:${ticket.proContact}`}>
                                                                <Mail size={12} /> Email
                                                            </a>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-[10px] text-zinc-400 flex items-center gap-1 bg-white p-2 rounded border border-zinc-100">
                                                <ExternalLink size={10} />
                                                Cet artisan ne gère pas ses tickets sur Transpareo. Contactez-le directement.
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg flex flex-col items-center justify-center text-center gap-2">
                                            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-1">
                                                <AlertTriangle size={16} />
                                            </div>
                                            <p className="text-sm font-medium text-orange-900">Aucun artisan assigné</p>
                                            <p className="text-xs text-orange-700 mb-2">Assignez un professionnel pour suivre l'intervention.</p>
                                            <Button size="sm" variant="outline" className="bg-white text-orange-700 border-orange-200 hover:bg-orange-50" onClick={() => setEditProviderOpen(true)}>
                                                <UserPlus size={14} className="mr-2" /> Assigner
                                            </Button>
                                        </div>
                                    )}
                                </section>
                                <Separator />
                                <section>
                                    <h4 className="text-xs font-bold uppercase text-zinc-400 mb-3">Coûts et Facturation</h4>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-zinc-600">Estimation</span>
                                        <span className="font-bold font-mono">{ticket.cost ? `${ticket.cost} €` : "Non défini"}</span>
                                    </div>
                                </section>
                            </TabsContent>
                        </div>
                    </ScrollArea>

                    {/* Footer Input for Chat */}
                    <div className="p-4 bg-zinc-50 border-t border-zinc-200">
                        <div className="flex gap-2">
                            <Button size="icon" variant="ghost" className="text-zinc-500 hover:bg-zinc-200" onClick={() => fileInputRef.current?.click()}>
                                <Paperclip size={18} />
                            </Button>
                            <Input
                                placeholder="Ajouter une note ou un message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="bg-white border-zinc-200 focus-visible:ring-zinc-400"
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                disabled={isPending}
                            />
                            <Button size="icon" className="bg-zinc-900 hover:bg-zinc-800 transition-colors" onClick={handleSendMessage} disabled={isPending}>
                                <Send size={16} />
                            </Button>
                        </div>
                    </div>
                </Tabs>
            </SheetContent>

            <EditProviderDialog
                ticket={ticket}
                open={editProviderOpen}
                onOpenChange={setEditProviderOpen}
            />
        </Sheet>
    );
}

function EditProviderDialog({ ticket, open, onOpenChange }: any) {
    const [name, setName] = useState(ticket?.provider || "");
    const [contact, setContact] = useState(ticket?.proContact || "");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        startTransition(async () => {
            const result = await assignTicketProvider({
                ticketId: ticket.id,
                providerName: name,
                providerContact: contact
            });
            if (result.success) {
                toast.success("Prestataire assigné");
                router.refresh();
                onOpenChange(false);
            } else {
                toast.error("Erreur lors de l'assignation");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assigner un Artisan</DialogTitle>
                    <DialogDescription>
                        Renseignez les coordonnées de l'intervenant pour ce ticket.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Nom de l'entreprise ou Artisan</Label>
                        <Input
                            placeholder="Ex: Plomberie Bros."
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Contact (Téléphone ou Email)</Label>
                        <Input
                            placeholder="Ex: 06 12 34 56 78"
                            value={contact}
                            onChange={e => setContact(e.target.value)}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
                        <Button type="submit" className="bg-zinc-900" disabled={isPending}>
                            {isPending ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function TimelineItem({ icon, color, date, title, description, children }: any) {
    return (
        <div className="flex gap-4 relative pb-8 last:pb-0">
            <div className="absolute left-[19px] top-8 bottom-0 w-[2px] bg-zinc-100 last:hidden" />

            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm z-10 border-2 border-white ${color}`}>
                {icon}
            </div>
            <div className="pt-1 flex-1">
                <div className="flex justify-between items-start">
                    <h5 className="font-bold text-zinc-900 text-sm">{title}</h5>
                    <span className="text-[10px] text-zinc-400">{date}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{description}</p>
                {children}
            </div>
        </div>
    )
}

function ChatMessage({ sender, time, content, isMe }: any) {
    return (
        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm shadow-sm ${isMe ? 'bg-zinc-900 text-white rounded-br-none' : 'bg-white border border-zinc-100 text-zinc-800 rounded-bl-none'}`}>
                {content}
            </div>
            <span className="text-[10px] text-zinc-400 mt-1 px-2">
                {isMe ? 'Moi' : sender} • {time}
            </span>
        </div>
    )
}

