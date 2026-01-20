"use client";

import { useState, useEffect } from "react";
import {
    FileText,
    Download,
    Share2,
    MoreVertical,
    Folder,
    Search,
    Upload,
    Shield,
    Lock,
    Bot,
    Filter,
    CheckCircle2,
    Eye,
    Trash2,
    Link,
    FileCheck,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { getDocuments, uploadDocumentAES, generateSecureShareLink, deleteDocumentSecure, Document } from "@/lib/actions-documents";
import { toast } from "sonner";

export function OwnerDocuments() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    // Upload State
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploadStep, setUploadStep] = useState<'IDLE' | 'UPLOADING' | 'ANALYZING' | 'ENCRYPTING' | 'DONE'>('IDLE');
    const [uploadProgress, setUploadProgress] = useState(0);

    // Interaction State
    const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [decryptionStatus, setDecryptionStatus] = useState<'LOCKED' | 'DECRYPTING' | 'UNLOCKED'>('LOCKED');

    // Audit Log State
    const [isLogOpen, setIsLogOpen] = useState(false);

    // --- INITIAL LOAD ---
    useEffect(() => {
        loadDocs();
    }, []);

    // Reset decryption when opening a new preview
    useEffect(() => {
        if (previewDoc) setDecryptionStatus('LOCKED');
    }, [previewDoc]);

    const loadDocs = async () => {
        setIsLoading(true);
        const docs = await getDocuments();
        setDocuments(docs);
        setIsLoading(false);
    };

    // --- ACTIONS ---
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];

        // Simulate Flow
        setUploadStep('UPLOADING');
        setUploadProgress(20);
        await new Promise(r => setTimeout(r, 800));

        setUploadStep('ANALYZING');
        setUploadProgress(50);
        const formData = new FormData();
        formData.append("file", file);
        const newDoc = await uploadDocumentAES(formData);

        setUploadStep('ENCRYPTING');
        setUploadProgress(85);
        await new Promise(r => setTimeout(r, 800));

        setDocuments(prev => [newDoc, ...prev]);
        setUploadProgress(100);
        setUploadStep('DONE');

        setTimeout(() => {
            setIsUploadOpen(false);
            setUploadStep('IDLE');
            setUploadProgress(0);
        }, 1500);
    };

    const handleShare = async (doc: Document) => {
        const link = await generateSecureShareLink(doc.id);
        setShareUrl(link);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Confirmez-vous la suppression sécurisée ? Cette action est irréversible.")) {
            await deleteDocumentSecure(id);
            setDocuments(prev => prev.filter(d => d.id !== id));
        }
    };

    const handleDecrypt = async () => {
        setDecryptionStatus('DECRYPTING');
        await new Promise(r => setTimeout(r, 1500)); // Simulate AES decryption
        setDecryptionStatus('UNLOCKED');
        toast.success("Document déchiffré avec succès");
    };

    // --- FILTERING ---
    const filteredDocs = documents.filter(doc => {
        const matchesType = filterType === "ALL" ||
            (filterType === "CONTRACT" && doc.type === 'CONTRACT') ||
            (filterType === "INVOICE" && doc.type === 'INVOICE') ||
            (filterType === "TAX" && doc.type === 'TAX') ||
            (filterType === "OTHER" && (doc.type === 'INSURANCE' || doc.type === 'DIAGNOSTIC' || doc.type === 'OTHER'));

        const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesType && matchesSearch;
    });

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col gap-6 animate-in fade-in duration-500">

            {/* HEADER & SECURITY BADGE */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold text-zinc-900">Coffre-fort Numérique</h2>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-[10px]">
                            <Lock size={10} /> Chiffrement AES-256 Actif
                        </Badge>
                    </div>
                    <p className="text-zinc-500 text-sm">Stockage sécurisé et analyse IA de vos documents légaux.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                        <Input
                            placeholder="Rechercher (nom, tag, montant)..."
                            className="pl-10 bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm" onClick={() => setIsUploadOpen(true)}>
                        <Upload size={16} /> Ajouter
                    </Button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 min-h-0">

                {/* SIDEBAR FILTERS */}
                <div className="hidden md:flex flex-col gap-2">
                    <Card className="border-zinc-200 shadow-sm">
                        <CardContent className="p-3 space-y-1">
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-2 mb-2 mt-1">Catégories</h3>
                            {[
                                { id: "ALL", label: "Tous les documents", icon: Folder },
                                { id: "CONTRACT", label: "Contrats & Baux", icon: FileCheck },
                                { id: "INVOICE", label: "Factures & Travaux", icon: FileText },
                                { id: "TAX", label: "Fiscalité", icon: FileText },
                                { id: "OTHER", label: "Diagnostics & Autres", icon: FileText },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setFilterType(item.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === item.id
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}
                                >
                                    <item.icon size={16} className={filterType === item.id ? "text-indigo-600" : "text-zinc-400"} />
                                    {item.label}
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-200 shadow-sm bg-gradient-to-br from-emerald-900 to-emerald-800 text-white">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield size={18} className="text-emerald-300" />
                                <span className="font-bold text-sm">Audit de Sécurité</span>
                            </div>
                            <p className="text-xs text-emerald-100/80 mb-3">
                                Dernier accès détecté il y a 2h par <span className="text-white font-medium">Vous</span>.
                                Aucune anomalie.
                            </p>
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full text-xs h-7 bg-transparent border-emerald-400/30 text-emerald-100 hover:bg-emerald-800 hover:text-white"
                                onClick={() => setIsLogOpen(true)}
                            >
                                Voir les logs
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* DOCUMENT GRID */}
                <div className="col-span-1 md:col-span-3">
                    {/* DROPZONE BANNER */}
                    <div
                        onClick={() => setIsUploadOpen(true)}
                        className="mb-4 border-2 border-dashed border-zinc-200 rounded-xl p-8 flex flex-col items-center justify-center text-zinc-400 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group"
                    >
                        <div className="h-10 w-10 bg-zinc-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-indigo-300 group-hover:text-indigo-600">
                            <Bot size={24} />
                        </div>
                        <p className="text-sm font-medium text-zinc-600">Déposez un fichier pour analyse IA instantanée</p>
                        <p className="text-xs text-zinc-400 mt-1">Extraction automatique des dates et montants • Chiffrement immédiat</p>
                    </div>

                    <ScrollArea className="h-[calc(100vh-16rem)]">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-40">
                                <Loader2 className="animate-spin text-indigo-600" />
                            </div>
                        ) : filteredDocs.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="h-12 w-12 text-zinc-200 mx-auto mb-3" />
                                <h3 className="text-zinc-900 font-medium">Aucun document trouvé</h3>
                                <p className="text-zinc-500 text-sm">Essayez de modifier vos filtres ou ajoutez un document.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                                {filteredDocs.map((doc) => (
                                    <div key={doc.id} className="group relative bg-white border border-zinc-200 rounded-xl p-4 hover:shadow-md transition-all hover:border-indigo-200">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                {doc.type === 'CONTRACT' ? <FileCheck size={20} /> :
                                                    doc.type === 'INVOICE' ? <FileText size={20} /> :
                                                        <Folder size={20} />}
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900">
                                                        <MoreVertical size={16} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setPreviewDoc(doc)}>
                                                        <Eye className="mr-2 h-4 w-4" /> Aperçu
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleShare(doc)}>
                                                        <Share2 className="mr-2 h-4 w-4" /> Partager (Sécurisé)
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(doc.id)}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <h4 className="font-semibold text-zinc-900 text-sm line-clamp-1 mb-1">{doc.name}</h4>
                                        <p className="text-xs text-zinc-500 mb-3">{doc.property}</p>

                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {doc.amount && (
                                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-none text-[10px] h-5">
                                                    {doc.amount}€
                                                </Badge>
                                            )}
                                            {doc.tags.map(tag => (
                                                <Badge key={tag} variant="outline" className="text-[10px] h-5 text-zinc-500 font-normal">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-zinc-50">
                                            <span className="text-[10px] text-zinc-400">{new Date(doc.date).toLocaleDateString()}</span>
                                            {doc.isEncrypted && (
                                                <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                                                    <Lock size={10} /> Sécurisé
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </div>

            {/* UPLOAD DIALOG */}
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Ajout Sécurisé</DialogTitle>
                        <DialogDescription>
                            Vos documents sont chiffrés de bout en bout avant d'être stockés.
                        </DialogDescription>
                    </DialogHeader>

                    {uploadStep === 'IDLE' ? (
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <label htmlFor="file" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Sélectionner un fichier
                            </label>
                            <Input id="file" type="file" onChange={handleFileUpload} />
                            <p className="text-[10px] text-zinc-500 mt-1">
                                PDF, JPG, PNG acceptés. Max 10Mo.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center justify-between text-sm font-medium">
                                <span className={uploadStep === 'DONE' ? "text-emerald-600" : "text-zinc-700"}>
                                    {uploadStep === 'UPLOADING' && "Envoi en cours..."}
                                    {uploadStep === 'ANALYZING' && (
                                        <span className="flex items-center gap-2">
                                            <Bot size={16} className="text-indigo-600 animate-pulse" />
                                            Analyse IA...
                                        </span>
                                    )}
                                    {uploadStep === 'ENCRYPTING' && (
                                        <span className="flex items-center gap-2">
                                            <Lock size={16} className="text-emerald-600" />
                                            Chiffrement AES...
                                        </span>
                                    )}
                                    {uploadStep === 'DONE' && (
                                        <span className="flex items-center gap-2">
                                            <CheckCircle2 size={16} />
                                            Terminé
                                        </span>
                                    )}
                                </span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} className="h-2" />
                            <div className="flex gap-1 justify-center mt-2">
                                <div className={`h-1.5 w-1.5 rounded-full transition-colors ${['UPLOADING', 'ANALYZING', 'ENCRYPTING', 'DONE'].includes(uploadStep) ? 'bg-indigo-600' : 'bg-zinc-200'}`} />
                                <div className={`h-1.5 w-1.5 rounded-full transition-colors ${['ANALYZING', 'ENCRYPTING', 'DONE'].includes(uploadStep) ? 'bg-indigo-600' : 'bg-zinc-200'}`} />
                                <div className={`h-1.5 w-1.5 rounded-full transition-colors ${['ENCRYPTING', 'DONE'].includes(uploadStep) ? 'bg-emerald-500' : 'bg-zinc-200'}`} />
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* PREVIEW DIALOG */}
            <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
                <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {previewDoc?.name}
                            {decryptionStatus === 'UNLOCKED' ? (
                                <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 gap-1">
                                    <CheckCircle2 size={12} /> Déchiffré
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="gap-1">
                                    <Lock size={12} /> Chiffrement AES-256
                                </Badge>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 bg-zinc-100 rounded-lg flex items-center justify-center relative overflow-hidden group border border-zinc-200">
                        {decryptionStatus === 'UNLOCKED' ? (
                            <div className="text-center w-full h-full bg-white p-8 overflow-auto">
                                <div className="max-w-md mx-auto border border-zinc-100 shadow-sm min-h-[500px] bg-white p-8 text-left">
                                    {/* MOCK DOCUMENT CONTENT */}
                                    <div className="flex justify-between mb-8 opacity-50">
                                        <div className="h-8 w-24 bg-zinc-200 mb-2" />
                                        <div className="h-8 w-8 bg-zinc-200" />
                                    </div>
                                    <div className="space-y-4">
                                        <h1 className="text-2xl font-bold text-zinc-900 mb-4">{previewDoc?.name}</h1>
                                        <p className="text-zinc-600 text-sm leading-relaxed">
                                            Ceci est une prévisualisation déchiffrée du document. Le contenu original a été récupéré depuis le stockage sécurisé après validation de votre clé privée.
                                        </p>
                                        <div className="h-4 bg-zinc-100 w-full rounded" />
                                        <div className="h-4 bg-zinc-100 w-5/6 rounded" />
                                        <div className="h-4 bg-zinc-100 w-4/6 rounded" />

                                        <div className="mt-8 p-4 bg-zinc-50 rounded border border-zinc-100">
                                            <p className="font-mono text-xs text-zinc-500">
                                                Digital Signature: {previewDoc?.id.toUpperCase()}-SECURE-HASH
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <FileText size={64} className="text-zinc-300 blur-sm" />
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                                    <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-indigo-600">
                                        <Lock size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-zinc-900 mb-2">Contenu Chiffré</h3>
                                    <p className="text-sm text-zinc-500 mb-6 max-w-xs">
                                        Ce document est protégé par un chiffrement AES-256 de bout en bout. Déchiffrez-le pour visualiser ou imprimer.
                                    </p>
                                    <Button onClick={handleDecrypt} disabled={decryptionStatus === 'DECRYPTING'} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white min-w-[200px]">
                                        {decryptionStatus === 'DECRYPTING' ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" /> Déchiffrement...
                                            </>
                                        ) : (
                                            <>
                                                <Eye size={16} /> Déchiffrer & Voir
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter className="sm:justify-between gap-2 border-t pt-4">
                        <div className="text-xs text-zinc-400 flex items-center">
                            {decryptionStatus === 'UNLOCKED' && "Session déchiffrée active (30s)"}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setPreviewDoc(null)}>Fermer</Button>
                            {decryptionStatus === 'UNLOCKED' && (
                                <>
                                    <Button variant="outline" className="gap-2">
                                        <CheckCircle2 size={16} /> Imprimer
                                    </Button>
                                    <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                                        <Download size={16} /> Télécharger
                                    </Button>
                                </>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* SHARE DIALOG */}
            <Dialog open={!!shareUrl} onOpenChange={() => setShareUrl(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Partage Sécurisé</DialogTitle>
                        <DialogDescription>
                            Ce lien est chiffré et expirera dans 24 heures.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2 mt-2">
                        <Input value={shareUrl || ""} readOnly className="bg-zinc-50 font-mono text-xs" />
                        <Button size="icon" onClick={() => {
                            navigator.clipboard.writeText(shareUrl || "");
                            toast.success("Lien copié !");
                            setShareUrl(null);
                        }}>
                            <Link size={16} />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* AUDIT LOG DIALOG */}
            <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shield size={20} className="text-emerald-600" />
                            Journal d'Audit de Sécurité
                        </DialogTitle>
                        <DialogDescription>
                            Traçabilité complète des accès et modifications sur votre coffre-fort.
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                        <div className="space-y-4">
                            {[
                                { action: "Déchiffrement Document", user: "Vous", time: "À l'instant", ip: "192.168.1.1", status: "success" },
                                { action: "Connexion Coffre-fort", user: "Vous", time: "Il y a 2 min", ip: "192.168.1.1", status: "success" },
                                { action: "Upload Document (Facture Travaux)", user: "Vous", time: "Il y a 2h", ip: "192.168.1.1", status: "success" },
                                { action: "Tentative d'accès partagé", user: "Lien Externe", time: "Hier à 14:30", ip: "84.23.12.4", status: "warning" },
                                { action: "Suppression Document", user: "Vous", time: "12 Déc. 2024", ip: "192.168.1.1", status: "success" },
                            ].map((log, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-2 w-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                        <div>
                                            <p className="font-medium text-zinc-900">{log.action}</p>
                                            <p className="text-xs text-zinc-500">Par {log.user} • IP: {log.ip}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-zinc-400 font-mono">{log.time}</span>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>


        </div>
    );
}

