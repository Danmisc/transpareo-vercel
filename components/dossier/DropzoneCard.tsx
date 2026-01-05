"use client";

import { useDropzone } from "react-dropzone";
import { useState } from "react";
import { addDocument, deleteDocument } from "@/lib/actions/dossier";
import { toast } from "sonner";
import { UploadCloud, CheckCircle2, Trash2, FileCheck, Eye, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DropzoneCardProps {
    type: string;
    label: string;
    icon: any; // Lucide Icon Component
    currentDoc?: any;
    userId: string;
}

export function DropzoneCard({ type, label, icon: Icon, currentDoc, userId }: DropzoneCardProps) {
    const [uploading, setUploading] = useState(false);

    // --- Upload Logic ---
    const onDrop = async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("dossierId", "temp-id"); // In real app, get dossierId or rely on user relation
        formData.append("type", type);

        // Simulate upload delay
        await new Promise(r => setTimeout(r, 1500));

        try {
            const res = await addDocument(userId, formData);
            if (res.success) {
                toast.success(`${label} ajouté avec succès`, {
                    description: "Filigrane de protection appliqué."
                });
            } else {
                toast.error("Erreur d'envoi");
            }
        } catch (e) {
            toast.error("Erreur serveur");
        } finally {
            setUploading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: { 'image/*': [], 'application/pdf': [] }
    });

    // --- Delete Logic ---
    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentDoc) return;
        const res = await deleteDocument(currentDoc.id);
        if (res.success) {
            toast.info("Document supprimé");
        }
    };

    // --- Render: Uploaded State ---
    if (currentDoc) {
        return (
            <div className="relative group overflow-hidden rounded-xl border border-zinc-200 bg-white h-[140px] flex flex-col transition-all duration-300 hover:shadow-lg hover:border-orange-200">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />

                <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <FileCheck size={18} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-zinc-900 leading-tight">{label}</h4>
                                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mt-0.5">Validé • Filigrané</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs flex-1 bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-900"
                            onClick={() => window.open(currentDoc.url, '_blank')}
                        >
                            <Eye size={12} className="mr-2" />
                            Voir
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                            onClick={handleDelete}
                        >
                            <Trash2 size={12} />
                        </Button>
                    </div>
                </div>

                {/* Secure Badge */}
                <div className="absolute top-2 right-2">
                    <Lock size={12} className="text-zinc-300" />
                </div>
            </div>
        );
    }

    // --- Render: Empty/Upload State ---
    return (
        <div
            {...getRootProps()}
            className={cn(
                "relative group rounded-xl border border-dashed h-[140px] transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-3 bg-zinc-50/50 hover:bg-white",
                isDragActive ? "border-orange-500 bg-orange-50/50" : "border-zinc-300 hover:border-orange-400"
            )}
        >
            <input {...getInputProps()} />

            {uploading ? (
                <div className="flex flex-col items-center gap-2 animate-pulse">
                    <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                    <span className="text-xs font-medium text-orange-600">Sécurisation...</span>
                </div>
            ) : (
                <>
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300",
                        isDragActive ? "bg-orange-100 text-orange-600" : "bg-zinc-100 text-zinc-400 group-hover:bg-orange-50 group-hover:text-orange-500"
                    )}>
                        <Icon size={20} strokeWidth={isDragActive ? 2.5 : 2} />
                    </div>
                    <div className="text-center px-4">
                        <p className={cn(
                            "text-sm font-semibold transition-colors",
                            isDragActive ? "text-orange-700" : "text-zinc-600 group-hover:text-zinc-900"
                        )}>
                            {label}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-1 font-medium">Glisser ou cliquer</p>
                    </div>
                </>
            )}
        </div>
    );
}
