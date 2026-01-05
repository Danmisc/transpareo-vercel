"use client";

import { useState, useRef, useTransition } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uploadPropertyDocument } from "@/lib/actions-owner";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Upload, FileText, Calendar as CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";

interface AddDocumentDialogProps {
    propertyId: string;
    trigger?: React.ReactNode;
}

export function AddDocumentDialog({ propertyId, trigger }: AddDocumentDialogProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Form State
    const [file, setFile] = useState<File | null>(null);
    const [category, setCategory] = useState("OTHER");
    const [expiration, setExpiration] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            toast.error("Veuillez sélectionner un fichier");
            return;
        }

        startTransition(async () => {
            const formData = new FormData();
            formData.append("propertyId", propertyId);
            formData.append("file", file);
            formData.append("category", category);
            if (expiration) formData.append("expirationDate", expiration);

            const result = await uploadPropertyDocument(formData);

            if (result.success) {
                toast.success("Document ajouté avec succès");
                setOpen(false);
                setFile(null);
                setExpiration("");
                setCategory("OTHER");
                router.refresh();
            } else {
                toast.error("Erreur lors de l'ajout du document");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button>Ajouter un document</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Ajouter un document</DialogTitle>
                    <DialogDescription>
                        Importez un document (PDF, Image) dans le coffre-fort numérique de ce bien.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* File Upload Zone */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${file ? 'border-indigo-400 bg-indigo-50' : 'border-zinc-200 hover:bg-zinc-50'}`}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                            accept=".pdf,image/*,.doc,.docx"
                        />
                        {file ? (
                            <div className="text-center">
                                <FileText className="mx-auto h-8 w-8 text-indigo-600 mb-2" />
                                <p className="font-medium text-indigo-900 line-clamp-1">{file.name}</p>
                                <p className="text-xs text-indigo-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                <Button size="sm" variant="link" className="text-indigo-600 mt-1 h-auto p-0" onClick={(e) => {
                                    e.stopPropagation();
                                    fileInputRef.current?.click();
                                }}>
                                    Changer de fichier
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <Upload className="mx-auto h-8 w-8 text-zinc-400 mb-2" />
                                <p className="font-medium text-zinc-900">Cliquez pour importer</p>
                                <p className="text-xs text-zinc-500">ou glissez-déposez ici</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Catégorie</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ACTE">Acte de Propriété</SelectItem>
                                <SelectItem value="BAIL">Bail / Contrat</SelectItem>
                                <SelectItem value="DIAG">Diagnostic (DPE, etc.)</SelectItem>
                                <SelectItem value="FACTURE">Facture</SelectItem>
                                <SelectItem value="ASSURANCE">Assurance</SelectItem>
                                <SelectItem value="AUTRE">Autre</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {(category === "DIAG" || category === "ASSURANCE" || category === "BAIL") && (
                        <div className="space-y-2 animate-in slide-in-from-top-2">
                            <Label>Date d'expiration (Optionnel)</Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                                <Input
                                    type="date"
                                    className="pl-9"
                                    value={expiration}
                                    onChange={e => setExpiration(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
                    <Button onClick={handleSubmit} className="bg-zinc-900" disabled={isPending || !file}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Ajouter
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
