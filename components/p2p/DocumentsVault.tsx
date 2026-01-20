"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, ShieldCheck, Eye, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { UserDocument, DOC_TYPE_LABELS, DOC_STATUS_LABELS } from "@/lib/documents-config";

interface DocumentsVaultProps {
    documents: UserDocument[];
}

export function DocumentsVault({ documents }: DocumentsVaultProps) {

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "VERIFIED": return <CheckCircle2 size={14} className="text-emerald-500" />;
            case "SIGNED": return <CheckCircle2 size={14} className="text-blue-500" />;
            case "AVAILABLE": return <Download size={14} className="text-green-500" />;
            case "PENDING": return <Clock size={14} className="text-yellow-500" />;
            case "EXPIRED": return <AlertCircle size={14} className="text-red-500" />;
            default: return null;
        }
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            FISCAL: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
            LEGAL: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
            KYC: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
            CONTRACT: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
            STATEMENT: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
            OTHER: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        };
        return colors[type] || colors.OTHER;
    };

    if (documents.length === 0) {
        return (
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="text-emerald-500" />
                        Coffre-fort Numérique
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <div className="mx-auto h-16 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                            <FileText size={32} className="text-zinc-400" />
                        </div>
                        <h3 className="font-bold text-zinc-900 dark:text-white mb-2">Aucun document</h3>
                        <p className="text-zinc-500 text-sm max-w-sm mx-auto">
                            Vos documents apparaîtront ici une fois que vous aurez complété votre KYC ou effectué des investissements.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="text-emerald-500" />
                        Coffre-fort Numérique
                    </div>
                    <Badge variant="outline" className="text-xs">
                        {documents.length} document{documents.length > 1 ? 's' : ''}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {documents.map((doc) => (
                        <div
                            key={doc.id}
                            className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-white dark:bg-zinc-800 rounded-lg flex items-center justify-center shadow-sm text-zinc-400 group-hover:text-blue-500 transition-colors">
                                    <FileText size={20} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-zinc-900 dark:text-white text-sm truncate max-w-[200px] md:max-w-none">
                                        {doc.name}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                                        <Calendar size={12} />
                                        <span>
                                            {new Date(doc.createdAt).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </span>
                                        <span>•</span>
                                        <Badge
                                            variant="secondary"
                                            className={`text-[10px] h-5 border-none ${getTypeColor(doc.type)}`}
                                        >
                                            {DOC_TYPE_LABELS[doc.type]?.label || doc.type}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Status indicator */}
                                <div className="hidden sm:flex items-center gap-1.5 text-xs">
                                    {getStatusIcon(doc.status)}
                                    <span className="text-zinc-500">
                                        {DOC_STATUS_LABELS[doc.status]?.label || doc.status}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                        <Eye size={16} />
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-zinc-200 dark:border-zinc-700">
                                        <Download size={16} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

