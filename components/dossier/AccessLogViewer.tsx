"use client";

import { useEffect, useState } from "react";
import { getDossierAccessLogs, revokeAllLinks } from "@/lib/actions/dossier";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ShieldAlert, Globe, Clock, Ban, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface AccessLog {
    id: string;
    ipAddress: string | null;
    userAgent: string | null;
    viewedAt: Date;
    access: {
        recipientEmail: string | null;
        token: string;
    }
}

export function AccessLogViewer({ userId }: { userId: string }) {
    const [logs, setLogs] = useState<AccessLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        setLoading(true);
        const res = await getDossierAccessLogs(userId);
        if (res.success) {
            setLogs(res.data as any[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLogs();
    }, [userId]);

    const handleRevokeAll = async () => {
        if (!confirm("Voulez-vous vraiment désactiver tous les liens de partage existants ?")) return;

        const res = await revokeAllLinks(userId);
        if (res.success) {
            toast.success("Tous les liens ont été révoqués.");
            fetchLogs(); // Refresh (logs might disappear or linkage breaks, actually logs stay but access is gone)
        } else {
            toast.error("Erreur lors de la révocation.");
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                <div>
                    <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                        <ShieldAlert className="text-orange-500" size={20} />
                        Journal d'Accès Sécurisé
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                        Surveillez qui consulte votre dossier en temps réel.
                    </p>
                </div>
                <Button variant="destructive" size="sm" onClick={handleRevokeAll} className="h-8 text-xs font-semibold">
                    <Ban size={14} className="mr-2" />
                    Kill Switch (Révoquer Tout)
                </Button>
            </div>

            <div className="max-h-[300px] overflow-y-auto p-0">
                {loading ? (
                    <div className="p-8 text-center text-zinc-400 text-sm">Chargement du journal...</div>
                ) : logs.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-zinc-400 gap-3">
                        <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center">
                            <Eye size={24} className="opacity-50" />
                        </div>
                        <p className="text-sm">Aucun accès enregistré pour le moment.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left text-zinc-600">
                        <thead className="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-100 uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Source</th>
                                <th className="px-6 py-3">Contexte</th>
                                <th className="px-6 py-3">Lien utilisé</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {logs.map((log) => (
                                    <motion.tr
                                        key={log.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-medium text-zinc-900 flex items-center gap-2">
                                            <Clock size={14} className="text-zinc-400" />
                                            {formatDistanceToNow(new Date(log.viewedAt), { addSuffix: true, locale: fr })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Globe size={14} className="text-zinc-400" />
                                                <span title={log.ipAddress || 'N/A'}>
                                                    {log.ipAddress || 'IP masquée'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-zinc-400 truncate max-w-[200px]" title={log.userAgent || ''}>
                                            {log.userAgent || 'Inconnu'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-[10px] font-mono border border-indigo-100">
                                                {log.access.recipientEmail ? `Invité: ${log.access.recipientEmail}` : `Lien Public (...${log.access.token.slice(-4)})`}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

