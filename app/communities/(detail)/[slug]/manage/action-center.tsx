"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Users,
    FileText,
    ShieldAlert,
    UserPlus,
    Mail,
    Activity,
    ArrowRight,
    CheckCircle,
    Clock,
    Settings,
    Crown
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DashboardStats {
    memberCount: number;
    postCount: number;
    pendingReports: number;
    pendingRequests: number;
    pendingInvites: number;
    slug: string;
}

interface ActivityLog {
    id: string;
    action: string;
    createdAt: Date;
    moderator: { name: string | null; avatar: string | null };
    reason: string | null;
}

export function ActionCenter({ stats, logs }: { stats: DashboardStats, logs: ActivityLog[] }) {
    const router = useRouter();

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Centre d'Action</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Gérez les priorités de votre communauté en un coup d'œil.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => router.push(`/communities/${stats.slug}/manage/settings`)} variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Configuration
                    </Button>
                    <Button onClick={() => router.push(`/communities/${stats.slug}/manage/members?action=invite`)} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Inviter
                    </Button>
                </div>
            </div>

            {/* High Priority Actions */}
            {(stats.pendingReports > 0 || stats.pendingRequests > 0) && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {stats.pendingReports > 0 && (
                        <Card className="border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-900/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-300 flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4" />
                                    Modération Requise
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.pendingReports}</div>
                                <p className="text-xs text-orange-700 dark:text-orange-400 mb-4">
                                    Signalements en attente de révision
                                </p>
                                <Button size="sm" variant="outline" className="w-full border-orange-200 hover:bg-orange-100 dark:border-orange-800 dark:hover:bg-orange-900/30 text-orange-800 dark:text-orange-300" asChild>
                                    <Link href={`/communities/${stats.slug}/manage/moderation`}>
                                        Traiter Maintenant <ArrowRight className="w-3 h-3 ml-2" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {stats.pendingRequests > 0 && (
                        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
                                    <UserPlus className="h-4 w-4" />
                                    Demandes d'adhésion
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.pendingRequests}</div>
                                <p className="text-xs text-blue-700 dark:text-blue-400 mb-4">
                                    Utilisateurs souhaitant rejoindre (Privé)
                                </p>
                                <Button size="sm" variant="outline" className="w-full border-blue-200 hover:bg-blue-100 dark:border-blue-800 dark:hover:bg-blue-900/30 text-blue-800 dark:text-blue-300" asChild>
                                    <Link href={`/communities/${stats.slug}/manage/requests`}>
                                        Examiner <ArrowRight className="w-3 h-3 ml-2" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Main Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Membres</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.memberCount}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <span className="text-green-500 flex items-center"><Activity className="w-3 h-3 mr-1" /> Actifs</span>
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Posts Publiés</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.postCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Contenu total
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Invitations</CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingInvites}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            En attente
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Santé Communauté</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">98%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Excellent engagement
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions & Recent Activity Layout */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Activity Feed */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Activité Récente</CardTitle>
                            <CardDescription>Journal des actions importantes de la communauté.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {logs.length === 0 ? (
                                    <div className="text-center py-6 text-zinc-500 text-sm">
                                        Aucune activité récente.
                                    </div>
                                ) : (
                                    logs.slice(0, 5).map((log) => (
                                        <div key={log.id} className="flex">
                                            <div className="flex flex-col items-center mr-4">
                                                <div className="w-px h-full bg-zinc-200 dark:bg-zinc-800" />
                                                <div className="w-2 h-2 rounded-full bg-indigo-500 my-1" />
                                                <div className="w-px h-full bg-zinc-200 dark:bg-zinc-800" />
                                            </div>
                                            <div className="pb-4">
                                                <p className="text-sm text-zinc-900 dark:text-zinc-100">
                                                    <span className="font-medium">{log.moderator.name || "Modérateur"}</span>
                                                    {" "}a effectué{" "}
                                                    <span className="font-medium text-indigo-600 dark:text-indigo-400">{log.action.replace(/_/g, " ").toLowerCase()}</span>
                                                </p>
                                                {log.reason && (
                                                    <p className="text-xs text-zinc-500 italic mt-0.5">"{log.reason}"</p>
                                                )}
                                                <p className="text-xs text-zinc-400 mt-1 flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                {logs.length > 5 && (
                                    <div className="flex pt-2">
                                        <div className="flex flex-col items-center mr-4">
                                            <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800" />
                                            <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                                        </div>
                                        <div className="pb-2">
                                            <Button variant="link" className="text-sm text-zinc-500 h-auto p-0" asChild>
                                                <Link href={`/communities/${stats.slug}/manage/moderation?tab=logs`}>
                                                    Voir tout l'historique
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Shortcuts */}
                <div className="lg:col-span-3 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Raccourcis</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <Button variant="outline" className="justify-start" asChild>
                                <Link href={`/communities/${stats.slug}/manage/roles`}>
                                    <Crown className="w-4 h-4 mr-2 text-yellow-500" />
                                    Gérer les Rôles
                                </Link>
                            </Button>
                            <Button variant="outline" className="justify-start" asChild>
                                <Link href={`/communities/${stats.slug}/manage/settings`}>
                                    <Settings className="w-4 h-4 mr-2" />
                                    Paramètres Généraux
                                </Link>
                            </Button>
                            <Button variant="outline" className="justify-start" asChild>
                                <Link href={`/communities/${stats.slug}/manage/analytics`}>
                                    <Activity className="w-4 h-4 mr-2" />
                                    Voir les Statistiques
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
                        <CardHeader>
                            <CardTitle className="text-white">Passer Premium</CardTitle>
                            <CardDescription className="text-indigo-100">Débloquez des outils avancés.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="text-sm space-y-2 mb-4">
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Export des données</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Support prioritaire</li>
                            </ul>
                            <Button size="sm" variant="secondary" className="w-full text-indigo-600 font-semibold">
                                En savoir plus
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
