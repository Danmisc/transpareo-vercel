"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, ShieldCheck, Eye } from "lucide-react";

export function DocumentsVault() {
    const docs = [
        { id: 1, name: "Relevé Fiscal Annuel (IFU) 2025", type: "FISCAL", date: "01/01/2026", status: "AVAILABLE" },
        { id: 2, name: "Contrat Cadre Investisseur", type: "LEGAL", date: "15/12/2025", status: "SIGNED" },
        { id: 3, name: "Justificatif Domicile", type: "KYC", date: "10/12/2025", status: "VERIFIED" },
        { id: 4, name: "Pièce d'Identité", type: "KYC", date: "10/12/2025", status: "VERIFIED" },
    ];

    return (
        <Card className="border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="text-emerald-500" />
                    Coffre-fort Numérique
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {docs.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-white/5 hover:border-zinc-300 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-white dark:bg-zinc-800 rounded-lg flex items-center justify-center shadow-sm text-zinc-400 group-hover:text-blue-500 transition-colors">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-zinc-900 dark:text-white text-sm">{doc.name}</h4>
                                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                                        <span>{doc.date}</span>
                                        <span>•</span>
                                        <Badge variant="outline" className="text-[10px] h-5 border-zinc-200 dark:border-white/10 text-zinc-500">
                                            {doc.type}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                    <Eye size={16} />
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-zinc-200 dark:border-white/10">
                                    <Download size={16} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
