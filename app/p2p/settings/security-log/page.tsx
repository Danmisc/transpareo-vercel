import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Shield, ArrowLeft, CheckCircle2, AlertTriangle, XCircle, LogIn, Key, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ACTION_ICONS: Record<string, typeof Shield> = {
    'LOGIN': LogIn,
    'WITHDRAWAL': Key,
    'CHANGE_IBAN': Key,
    'VIEW_PIN': Eye,
    '2FA_ENABLED': Shield,
    '2FA_DISABLED': Shield,
};

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string }> = {
    'SUCCESS': { icon: CheckCircle2, color: 'text-emerald-600' },
    'FAILED': { icon: XCircle, color: 'text-red-600' },
    'BLOCKED': { icon: AlertTriangle, color: 'text-amber-600' },
};

export default async function SecurityLogPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const logs = await prisma.securityLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/p2p/settings">
                        <ArrowLeft size={20} />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Historique de sécurité</h1>
                    <p className="text-zinc-500 mt-1">Activité récente sur votre compte</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Événements récents</CardTitle>
                    <CardDescription>
                        Les 50 dernières actions de sécurité sur votre compte
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {logs.length === 0 ? (
                        <div className="text-center py-8">
                            <Shield size={40} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                            <p className="text-zinc-500">Aucun événement de sécurité enregistré</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {logs.map((log) => {
                                const ActionIcon = ACTION_ICONS[log.action] || Shield;
                                const statusConfig = STATUS_CONFIG[log.status] || STATUS_CONFIG['SUCCESS'];
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <div
                                        key={log.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm">
                                                <ActionIcon size={16} className="text-zinc-600" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-zinc-900 dark:text-white text-sm">
                                                        {log.action.replace(/_/g, ' ')}
                                                    </p>
                                                    <StatusIcon size={14} className={statusConfig.color} />
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                    <span>{log.ipAddress || 'IP inconnue'}</span>
                                                    <span>•</span>
                                                    <span>{new Date(log.createdAt).toLocaleString('fr-FR')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' :
                                                log.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                            }`}>
                                            {log.status === 'SUCCESS' ? 'Succès' :
                                                log.status === 'FAILED' ? 'Échec' : 'Bloqué'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <p className="text-xs text-zinc-500 text-center mt-4">
                Si vous remarquez une activité suspecte, changez immédiatement votre mot de passe.
            </p>
        </div>
    );
}

