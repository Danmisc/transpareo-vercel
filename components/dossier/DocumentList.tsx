"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Download, ShieldCheck } from "lucide-react";

export function DocumentList({ documents }: { documents: any[] }) {
    if (documents.length === 0) {
        return (
            <div className="text-center py-8 text-zinc-500 bg-zinc-50 rounded-lg border border-dashed">
                <p>Aucun document téléchargé pour le moment.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {documents.map((doc) => (
                <Card key={doc.id} className="flex items-center p-4 gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <FileText className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold truncate">{doc.name}</h4>
                            <Badge variant="secondary" className="text-[10px] h-5">{doc.type}</Badge>
                            {doc.watermarkedUrl && (
                                <Badge variant="outline" className="text-[9px] h-5 border-green-200 text-green-700 bg-green-50 flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" />
                                    FILIGRANÉ
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-zinc-500">
                            {(doc.size / 1024 / 1024).toFixed(2)} MB • Ajouté le {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                    </div>

                    <div className="flex gap-2">
                         <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-500 hover:text-zinc-900" onClick={() => window.open(doc.url, "_blank")}>
                            <Eye className="w-4 h-4" />
                         </Button>
                         {/* Usually download is restricted for viewers, but allowing for owner */}
                    </div>
                </Card>
            ))}
        </div>
    );
}

