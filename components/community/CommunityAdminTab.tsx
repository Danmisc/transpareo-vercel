"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Shield, UserPlus, Flag, Settings, Check, X, MoreHorizontal } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

export interface JoinRequest {
    id: string;
    user: { name: string; avatar?: string; email: string };
    date: string;
    message?: string;
}

export interface Report {
    id: string;
    type: 'POST' | 'COMMENT' | 'USER';
    reason: string;
    contentPreview: string;
    reporter: string;
    status: 'PENDING' | 'RESOLVED';
    date: string;
}

interface CommunityAdminTabProps {
    joinRequests?: JoinRequest[];
    reports?: Report[];
}

export function CommunityAdminTab({ joinRequests = [], reports = [] }: CommunityAdminTabProps) {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <Shield className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Panneau d'Administration</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Gérez les membres, le contenu et les paramètres de la communauté.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Requests */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <UserPlus className="w-5 h-5 text-zinc-500" />
                            Demandes d'adhésion
                            {joinRequests.length > 0 && <Badge variant="secondary" className="ml-auto">{joinRequests.length}</Badge>}
                        </CardTitle>
                        <CardDescription>Utilisateurs souhaitant rejoindre la communauté.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {joinRequests.length > 0 ? (
                            joinRequests.map((req) => (
                                <div key={req.id} className="flex items-start justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={req.user.avatar} />
                                            <AvatarFallback>{req.user.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{req.user.name}</p>
                                            <p className="text-xs text-zinc-500">{req.date}</p>
                                            {req.message && <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 italic">"{req.message}"</p>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20">
                                            <Check size={16} />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                                            <X size={16} />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-zinc-400 text-sm">Aucune demande en attente.</div>
                        )}
                    </CardContent>
                </Card>

                {/* Moderation Queue */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Flag className="w-5 h-5 text-zinc-500" />
                            File de Modération
                            {reports.length > 0 && <Badge variant="destructive" className="ml-auto">{reports.length}</Badge>}
                        </CardTitle>
                        <CardDescription>Contenu signalé nécessitant votre attention.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {reports.length > 0 ? (
                            reports.map((report) => (
                                <div key={report.id} className="p-3 rounded-xl bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className="bg-white dark:bg-zinc-900 text-red-600 border-red-200 text-[10px]">
                                            {report.type}
                                        </Badge>
                                        <span className="text-xs text-zinc-400">{report.date}</span>
                                    </div>
                                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">Motif : {report.reason}</p>
                                    <div className="p-2 bg-white dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 italic mb-3">
                                        "{report.contentPreview}"
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="ghost" className="h-7 text-xs">Ignorer</Button>
                                        <Button size="sm" variant="destructive" className="h-7 text-xs">Supprimer le contenu</Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-zinc-400 text-sm flex flex-col items-center">
                                <Check className="w-8 h-8 text-green-500 mb-2 opacity-50" />
                                Tout est calme. Bon travail !
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Settings */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Settings className="w-5 h-5 text-zinc-500" />
                            Paramètres Rapides
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center justify-between space-x-2 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                                <div className="space-y-0.5">
                                    <h4 className="font-medium text-sm">Mode Privé</h4>
                                    <p className="text-xs text-zinc-500">Seuls les membres approuvés peuvent voir le contenu.</p>
                                </div>
                                <Switch />
                            </div>
                            <div className="flex items-center justify-between space-x-2 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                                <div className="space-y-0.5">
                                    <h4 className="font-medium text-sm">Restriction des publications</h4>
                                    <p className="text-xs text-zinc-500">Seuls les admins peuvent publier (Annonces).</p>
                                </div>
                                <Switch />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
