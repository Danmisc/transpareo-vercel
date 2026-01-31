"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { resolveReport } from "@/lib/community-management-actions";
import { toast } from "sonner";
import { CheckCircle, XCircle, AlertTriangle, Clock, ShieldBan } from "lucide-react";
import { useRouter } from "next/navigation";

interface Report {
    id: string;
    reason: string;
    details: string | null;
    targetType: string;
    targetId: string;
    createdAt: Date;
    reporter: { name: string | null } | null;
}

interface Log {
    id: string;
    action: string;
    reason: string | null;
    createdAt: Date;
    moderator: { name: string | null; avatar: string | null };
}

interface ModerationClientProps {
    communityId: string;
    currentUserId: string;
    reports: Report[];
    logs: Log[];
}

export default function ModerationClient({ communityId, currentUserId, reports, logs }: ModerationClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleResolve = async (reportId: string, action: "DISMISS" | "BAN_USER" | "DELETE_CONTENT") => {
        setIsLoading(reportId);
        const result = await resolveReport(communityId, currentUserId, reportId, action);
        setIsLoading(null);

        if (result.success) {
            toast.success("Signalement traité");
            router.refresh();
        } else {
            toast.error("Échec du traitement du signalement");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Modération</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Gérez les signalements et la sécurité de la communauté.</p>
                </div>
                <Button variant="outline">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marquer tout comme lu
                </Button>
            </div>

            <Tabs defaultValue="queue" className="w-full">
                <TabsList className="bg-zinc-100 dark:bg-zinc-900 w-full md:w-auto grid grid-cols-3">
                    <TabsTrigger value="queue">En Attente ({reports.length})</TabsTrigger>
                    <TabsTrigger value="logs">Historique</TabsTrigger>
                    <TabsTrigger value="automod">Automod</TabsTrigger>
                </TabsList>

                <TabsContent value="queue" className="mt-6 space-y-4">
                    {reports.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                            <h3 className="text-lg font-medium">Tout est en ordre !</h3>
                            <p className="text-zinc-500">Aucun signalement en attente.</p>
                        </div>
                    ) : (
                        reports.map((report) => (
                            <Card key={report.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline">{report.targetType}</Badge>
                                                <span className="text-xs text-zinc-500 flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {new Date(report.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <CardTitle className="text-base">{report.reason}</CardTitle>
                                            <CardDescription>Signalé par {report.reporter?.name || "Anonyme"}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-md text-sm mb-4">
                                        <p className="font-medium text-xs text-zinc-500 mb-1">DÉTAILS</p>
                                        {report.details || "Aucun détail fourni."}
                                    </div>
                                    <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-md text-sm mb-4">
                                        <p className="font-medium text-xs text-zinc-500 mb-1">ID CIBLE</p>
                                        <code className="text-xs">{report.targetId}</code>
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleResolve(report.id, "DISMISS")}
                                            disabled={isLoading === report.id}
                                        >
                                            Ignorer
                                        </Button>
                                        {/* Simplified actions for now */}
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleResolve(report.id, "BAN_USER")}
                                            disabled={isLoading === report.id}
                                        >
                                            Bannir
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                <TabsContent value="logs" className="mt-6">
                    <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        {logs.map((log) => (
                            <div key={log.id} className="p-4 border-b border-zinc-100 dark:border-zinc-900 last:border-0 flex items-start gap-4">
                                <div className="mt-1">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                                        {log.moderator.name?.[0]}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm">
                                        <span className="font-medium text-zinc-900 dark:text-white">{log.moderator.name}</span>
                                        <span className="mx-2 text-zinc-400">•</span>
                                        <span className="font-medium">{log.action.replace(/_/g, " ")}</span>
                                    </p>
                                    {log.reason && <p className="text-xs text-zinc-500 mt-1">{log.reason}</p>}
                                    <p className="text-xs text-zinc-400 mt-1">{new Date(log.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="automod" className="mt-6">
                    <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-12 text-center">
                        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldBan className="w-8 h-8 text-indigo-500" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Automodération (Bientôt)</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mt-2">
                            Configurez des règles automatiques pour filtrer le spam et les contenus inappropriés avant qu'ils ne soient visibles.
                        </p>
                        <Button className="mt-6" disabled>
                            Configurer les Règles
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div >
    );
}
