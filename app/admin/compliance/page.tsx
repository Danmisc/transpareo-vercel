import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Activity, Lock, Search } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default async function CompliancePage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    // Strict Admin Check (Mocking 'ADMIN' role check or specific email for now if role not consistent)
    // if (user.role !== "ADMIN") redirect("/"); 

    const logs = await prisma.securityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: { user: { select: { name: true, email: true } } }
    });

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                            <ShieldAlert className="text-red-500" />
                            Security & Compliance Center
                        </h1>
                        <p className="text-zinc-500 mt-2">Surveillance des activités sensibles en temps réel.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-white dark:bg-zinc-900 border-l-4 border-l-red-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-500">Alertes Critiques</CardTitle>
                            <Activity size={16} className="text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-zinc-500">+0% depuis hier</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-zinc-900 border-l-4 border-l-amber-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-500">Actions 2FA</CardTitle>
                            <Lock size={16} className="text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{logs.filter(l => l.action.includes("2FA") || l.action.includes("BENEFICIARY") || l.action.includes("TRANSFER")).length}</div>
                            <p className="text-xs text-zinc-500">Authentifications fortes</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-zinc-900 border-l-4 border-l-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-500">Total Logs</CardTitle>
                            <Search size={16} className="text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{logs.length}</div>
                            <p className="text-xs text-zinc-500">Derniers 100 événements</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Journal d'Audit (Audit Trail)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-900">
                                    <tr>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Utilisateur</th>
                                        <th className="px-6 py-3">Action</th>
                                        <th className="px-6 py-3">Statut</th>
                                        <th className="px-6 py-3">Détails (Meta)</th>
                                        <th className="px-6 py-3">IP / Device</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log.id} className="bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                            <td className="px-6 py-4 font-mono text-zinc-500">
                                                {format(new Date(log.createdAt), "dd/MM HH:mm:ss", { locale: fr })}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                                                {log.user.name}
                                                <div className="text-xs text-zinc-400">{log.user.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="font-mono">
                                                    {log.action}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge className={
                                                    log.status === "SUCCESS" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" :
                                                        log.status === "FAILED" ? "bg-red-100 text-red-700 hover:bg-red-200" :
                                                            "bg-zinc-100 text-zinc-700"
                                                }>
                                                    {log.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 max-w-xs truncate text-zinc-500 font-mono text-xs">
                                                {JSON.stringify(log.metadata)}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-zinc-400">
                                                {log.ipAddress || "Unknown IP"}
                                                <br />
                                                {log.userAgent ? "Browser detected" : "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

