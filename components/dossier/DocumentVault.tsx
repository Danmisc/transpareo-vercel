"use client";

import { motion } from "framer-motion";
import { DropzoneCard } from "./DropzoneCard"; // Assuming we keep this but might want to revamp it too
import { ShieldCheck, FileText, Lock, Eye, AlertCircle, CheckCircle, UploadCloud, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress"; // Assuming we have this or use standard HTML
import { toast } from "sonner";
import { useState } from "react";

interface DocumentVaultProps {
    documents: any[];
    userId: string;
}

export function DocumentVault({ documents, userId }: DocumentVaultProps) {
    const categories = [
        { id: 'identity', label: 'Identité', required: true, icon: CheckCircle },
        { id: 'income', label: 'Revenus', required: true, icon: CheckCircle },
        { id: 'tax', label: 'Impôts', required: true, icon: CheckCircle },
        { id: 'rent', label: 'Quittances', required: false, icon: CheckCircle },
    ];

    // Mock upload handler
    const handleUpload = (catId: string) => {
        toast.success(`Upload pour ${catId} simulé !`);
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                        <Lock size={32} className="text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Coffre-fort Numérique</h3>
                        <p className="text-zinc-400 text-sm">Vos documents sont chiffrés et protégés par filigrane.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-black/20 px-4 py-2 rounded-xl">
                    <div className="text-right">
                        <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Complétion</div>
                        <div className="text-xl font-bold text-emerald-400">85%</div>
                    </div>
                    {/* Ring or Progress bar could go here */}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => {
                    const hasDoc = documents.some(d => d.type === cat.id); // Simple check
                    const docCount = documents.filter(d => d.type === cat.id).length;

                    return (
                        <div key={cat.id} className="group bg-white rounded-xl border border-zinc-200 p-5 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hasDoc ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-100 text-zinc-400'}`}>
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-zinc-900 flex items-center gap-2">
                                            {cat.label}
                                            {cat.required && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Requis</span>}
                                        </h4>
                                        <p className="text-xs text-zinc-500">{docCount} fichiers • {hasDoc ? 'À jour' : 'Manquant'}</p>
                                    </div>
                                </div>
                                {hasDoc && <CheckCircle size={18} className="text-emerald-500" />}
                            </div>

                            {/* Dropzone Area - Simplified for demo */}
                            <div
                                onClick={() => handleUpload(cat.id)}
                                className="border-2 border-dashed border-zinc-100 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-zinc-400 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer group-hover:border-zinc-300"
                            >
                                <UploadCloud size={24} />
                                <span className="text-xs font-medium">Glisser ou cliquer pour ajouter</span>
                            </div>

                            {/* File List (Mock) */}
                            {hasDoc && (
                                <div className="mt-3 space-y-2">
                                    <div className="flex items-center justify-between text-sm bg-zinc-50 p-2 rounded-lg">
                                        <span className="truncate max-w-[150px]">mon_document.pdf</span>
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0"><Eye size={12} /></Button>
                                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 size={12} /></Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-center pt-4">
                <p className="text-xs text-zinc-400 flex items-center gap-2">
                    <ShieldCheck size={12} /> Seuls les propriétaires avec qui vous partagez votre dossier auront accès.
                </p>
            </div>
        </div>
    );
}

