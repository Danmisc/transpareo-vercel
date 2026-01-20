"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    FileText,
    Download,
    Eye,
    Plus,
    History,
    UploadCloud,
    MoreVertical,
    Trash2,
    FileImage,
    AlertCircle,
    Calendar as CalendarIcon,
    Shield
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useRef, useTransition } from "react";
import { toast } from "sonner";
import { uploadPropertyDocument, deletePropertyDocument } from "@/lib/actions-owner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function PropertyDocuments({ data }: { data: any }) {
    const [isDragging, setIsDragging] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filter Logic
    const [categoryFilter, setCategoryFilter] = useState("ALL");

    const documents = data.documents || [];

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            setSelectedFile(files[0]);
            setUploadDialogOpen(true);
        }
    };

    const handleDelete = (docId: string) => {
        if (!confirm("Voulez-vous vraiment supprimer ce document ?")) return;
        startTransition(async () => {
            const result = await deletePropertyDocument(docId);
            if (result.success) {
                toast.success("Document supprimé");
                router.refresh();
            } else {
                toast.error("Erreur lors de la suppression");
            }
        });
    };

    const filteredDocs = categoryFilter === "ALL"
        ? documents
        : documents.filter((d: any) => d.category === categoryFilter);

    // Calculate Storage (Mock)
    const usedStorage = documents.reduce((acc: number, doc: any) => acc + (doc.fileSize || 500000), 0);
    const totalStorage = 500 * 1024 * 1024; // 500MB
    const storagePercent = Math.min((usedStorage / totalStorage) * 100, 100);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                        <Shield className="text-indigo-600" size={20} />
                        Coffre-fort Numérique
                    </h2>
                    <p className="text-zinc-500 text-sm">Centralisez vos actes, diagnostics et factures en toute sécurité.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-medium text-zinc-500 mb-1">Stockage utilisé</p>
                        <div className="w-32 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${storagePercent}%` }} />
                        </div>
                    </div>
                    <Button onClick={() => fileInputRef.current?.click()} className="bg-zinc-900 text-white gap-2 shadow-lg shadow-zinc-200">
                        <Plus size={16} /> Ajouter
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                setSelectedFile(e.target.files[0]);
                                setUploadDialogOpen(true);
                                e.target.value = ""; // Reset to allow re-selection
                            }
                        }}
                    />
                </div>
            </div>

            {/* Drag Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center gap-4 text-center cursor-pointer group",
                    isDragging ? "border-indigo-500 bg-indigo-50/50" : "border-zinc-200 bg-zinc-50/30 hover:bg-zinc-50 hover:border-zinc-300"
                )}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className={cn(
                    "h-16 w-16 rounded-full flex items-center justify-center transition-all",
                    isDragging ? "bg-indigo-100 text-indigo-600" : "bg-white text-zinc-400 shadow-sm group-hover:scale-110 group-hover:text-zinc-600"
                )}>
                    <UploadCloud size={32} />
                </div>
                <div>
                    <h3 className="font-bold text-zinc-900">Glissez un document ici</h3>
                    <p className="text-sm text-zinc-500 mt-1">ou cliquez pour parcourir vos fichiers (PDF, JPG, PNG)</p>
                </div>
            </div>

            <Tabs value={categoryFilter} defaultValue="ALL" className="w-full" onValueChange={setCategoryFilter}>
                <TabsList className="bg-white border border-zinc-200 w-full justify-start h-auto p-1 gap-2 flex-wrap sm:flex-nowrap">
                    <TabsTrigger value="ALL" className="data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-900 hover:bg-zinc-50 text-zinc-600 transition-all rounded-md text-xs h-8">Tout voir</TabsTrigger>
                    <TabsTrigger value="ACTE" className="data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-900 hover:bg-zinc-50 text-zinc-600 transition-all rounded-md text-xs h-8">Actes de Propriété</TabsTrigger>
                    <TabsTrigger value="DIAG" className="data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-900 hover:bg-zinc-50 text-zinc-600 transition-all rounded-md text-xs h-8">Diagnostics</TabsTrigger>
                    <TabsTrigger value="CONTRACT" className="data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-900 hover:bg-zinc-50 text-zinc-600 transition-all rounded-md text-xs h-8">Contrats & Baux</TabsTrigger>
                    <TabsTrigger value="FACTURE" className="data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-900 hover:bg-zinc-50 text-zinc-600 transition-all rounded-md text-xs h-8">Factures</TabsTrigger>
                    <TabsTrigger value="OTHER" className="data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-900 hover:bg-zinc-50 text-zinc-600 transition-all rounded-md text-xs h-8">Autres</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDocs.length === 0 && (
                    <div className="col-span-full py-12 text-center text-zinc-400">
                        <FileText size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Aucun document dans cette catégorie.</p>
                    </div>
                )}
                {filteredDocs.map((doc: any) => (
                    <DocumentCard key={doc.id} doc={doc} onDelete={handleDelete} />
                ))}
            </div>

            <UploadDialog
                open={uploadDialogOpen}
                onOpenChange={(open: boolean) => {
                    setUploadDialogOpen(open);
                    if (!open) setSelectedFile(null); // Clear file on close
                }}
                file={selectedFile}
                propertyId={data.id}
            />
        </div>
    );
}

function DocumentCard({ doc, onDelete }: { doc: any, onDelete: (id: string) => void }) {
    const isImage = doc.type === 'IMAGE' || doc.mimeType?.startsWith('image');

    // Category Colors
    const getBadgeStyle = (cat: string) => {
        switch (cat) {
            case 'ACTE': return "bg-indigo-100 text-indigo-700 border-indigo-200";
            case 'DIAG': return "bg-amber-100 text-amber-700 border-amber-200";
            case 'CONTRACT': return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case 'FACTURE': return "bg-rose-100 text-rose-700 border-rose-200";
            default: return "bg-zinc-100 text-zinc-500 border-zinc-200";
        }
    };

    const getCategoryLabel = (cat: string) => {
        switch (cat) {
            case 'ACTE': return "Acte";
            case 'DIAG': return "Diagnostic";
            case 'CONTRACT': return "Contrat";
            case 'FACTURE': return "Facture";
            default: return "Autre";
        }
    };

    return (
        <Card className="group relative overflow-hidden transition-all hover:shadow-md border-zinc-200 bg-white flex flex-col h-[180px]">
            {/* Top Section */}
            <div className="p-4 flex-1">
                <div className="flex justify-between items-start mb-3">
                    <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", isImage ? "bg-purple-50 text-purple-600" : "bg-zinc-100 text-zinc-500")}>
                        {isImage ? <FileImage size={20} /> : <FileText size={20} />}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-6 w-6 -mr-2 text-zinc-400 hover:text-zinc-900">
                                <MoreVertical size={14} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.open(doc.url, '_blank')}>
                                <Eye className="mr-2 h-4 w-4" /> Ouvrir
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(doc.url, '_blank')}>
                                <Download className="mr-2 h-4 w-4" /> Télécharger
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => onDelete(doc.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <h4 className="font-bold text-zinc-900 text-sm line-clamp-2 leading-tight mb-2" title={doc.name}>
                    {doc.name}
                </h4>

                <Badge variant="outline" className={cn("text-[10px] h-5 border", getBadgeStyle(doc.category))}>
                    {getCategoryLabel(doc.category)}
                </Badge>
            </div>

            {/* Bottom Section */}
            <div className="px-4 py-3 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-between mt-auto">
                <span className="text-[10px] text-zinc-400">
                    {new Date(doc.createdAt).toLocaleDateString()}
                </span>
                {doc.expirationDate && (
                    (() => {
                        const expiry = new Date(doc.expirationDate);
                        const now = new Date();
                        const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        const isExpired = daysLeft < 0;
                        const isExpiringSoon = daysLeft < 30 && !isExpired;

                        return (
                            <div className={cn(
                                "flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                                isExpired ? "bg-red-50 text-red-600" :
                                    isExpiringSoon ? "bg-amber-50 text-amber-600" : "bg-zinc-50 text-zinc-500"
                            )}>
                                <AlertCircle size={10} />
                                {isExpired ? "Expiré : " : isExpiringSoon ? "Expire : " : "Valide : "}
                                {expiry.toLocaleDateString()}
                            </div>
                        );
                    })()
                )}
            </div>

            {/* Hover Overlay Actions */}
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </Card>
    );
}

function UploadDialog({ open, onOpenChange, file, propertyId }: any) {
    const [category, setCategory] = useState("OTHER");
    const [expiration, setExpiration] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleUpload = () => {
        if (!file) return;

        startTransition(async () => {
            const formData = new FormData();
            formData.append("propertyId", propertyId);
            formData.append("file", file);
            formData.append("category", category);
            if (expiration) formData.append("expirationDate", expiration);

            const result = await uploadPropertyDocument(formData);
            if (result.success) {
                toast.success("Document ajouté au coffre-fort");
                router.refresh();
                onOpenChange(false);
            } else {
                toast.error(result.error || "Échec de l'envoi");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Ajouter un document</DialogTitle>
                    <DialogDescription>
                        Fichier : {file?.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Catégorie</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ACTE">Acte de Propriété</SelectItem>
                                <SelectItem value="DIAG">Diagnostic (DPE, etc.)</SelectItem>
                                <SelectItem value="CONTRACT">Contrat / Bail</SelectItem>
                                <SelectItem value="FACTURE">Facture / Devis</SelectItem>
                                <SelectItem value="INSURANCE">Assurance</SelectItem>
                                <SelectItem value="OTHER">Autre</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {(category === "DIAG" || category === "INSURANCE" || category === "CONTRACT") && (
                        <div className="space-y-2 animate-in slide-in-from-top-2">
                            <Label>Date d'expiration (Opionnel)</Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                                <Input
                                    type="date"
                                    className="pl-9"
                                    value={expiration}
                                    onChange={e => setExpiration(e.target.value)}
                                />
                            </div>
                            <p className="text-[10px] text-zinc-500">Nous vous enverrons une alerte avant l'échéance.</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
                    <Button onClick={handleUpload} className="bg-zinc-900" disabled={isPending}>
                        {isPending ? "Envoi en cours..." : "Enregistrer dans le coffre"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

