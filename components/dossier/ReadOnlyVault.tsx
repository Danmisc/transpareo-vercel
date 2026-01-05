"use client";

import { FileText, Eye, Download, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ReadOnlyVaultProps {
    documents: any[];
}

export function ReadOnlyVault({ documents }: ReadOnlyVaultProps) {
    const categories = [
        { id: "ID_CARD", label: "Identité", icon: ShieldCheck },
        { id: "PAYSLIP", label: "Revenus", icon: FileText },
        { id: "TAX_RETURN", label: "Impôts", icon: FileText },
        { id: "PROOF_ADDRESS", label: "Domicile", icon: FileText },
    ];

    const getDocByType = (type: string) => documents.find((d) => d.type === type);

    const handlePreview = (doc: any) => {
        // Open in new tab or modal
        window.open(doc.url, '_blank');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => {
                const doc = getDocByType(cat.id);

                return (
                    <div
                        key={cat.id}
                        className={`
                            relative p-5 rounded-xl border transition-all duration-200
                            ${doc ? "bg-white border-zinc-200 shadow-sm hover:shadow-md" : "bg-zinc-50 border-zinc-100 border-dashed opacity-60"}
                        `}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-lg ${doc ? "bg-orange-100 text-orange-600" : "bg-zinc-100 text-zinc-400"}`}>
                                    <cat.icon size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-zinc-900">{cat.label}</h3>
                                    <span className="text-xs text-zinc-500">
                                        {doc ? "Vérifié par Transpareo" : "Non fourni"}
                                    </span>
                                </div>
                            </div>
                            {doc && (
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
                                    <ShieldCheck size={10} className="mr-1" />
                                    Vérifié
                                </Badge>
                            )}
                        </div>

                        {doc ? (
                            <div className="flex flex-col gap-2">
                                <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100 flex items-center gap-3 mb-2">
                                    {/* Fake Thumbnail */}
                                    <div className="w-10 h-10 bg-white rounded border border-zinc-200 flex items-center justify-center shrink-0">
                                        <span className="text-[10px] font-bold text-zinc-300">PDF</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-zinc-900 truncate">{doc.name}</p>
                                        <p className="text-xs text-zinc-400">{(doc.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 gap-2"
                                        onClick={() => handlePreview(doc)}
                                    >
                                        <Eye size={14} />
                                        Voir
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-zinc-500 hover:text-orange-600" onClick={() => window.open(doc.url, '_blank')}>
                                        <Download size={16} />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-24 flex items-center justify-center text-zinc-400 text-sm italic">
                                Document manquant demandez-le au candidat
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
