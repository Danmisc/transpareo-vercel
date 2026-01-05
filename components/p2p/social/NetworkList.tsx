"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCheck, Users, Shield } from "lucide-react";

interface NetworkListProps {
    receivedVouches: any[];
    sentVouches: any[];
    referrals: any[];
}

export function NetworkList({ receivedVouches, sentVouches, referrals }: NetworkListProps) {
    return (
        <Card className="border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users size={20} className="text-zinc-500" />
                    Mon Réseau de Confiance
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="received" className="w-full">
                    <TabsList className="mb-4 bg-zinc-100 dark:bg-zinc-800">
                        <TabsTrigger value="received">Ils me recommandent ({receivedVouches.length})</TabsTrigger>
                        <TabsTrigger value="sent">Je recommande ({sentVouches.length})</TabsTrigger>
                        <TabsTrigger value="referrals">Parrainages ({referrals.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="received" className="space-y-4">
                        <UserGrid users={receivedVouches} emptyText="Personne ne vous a encore recommandé." />
                    </TabsContent>

                    <TabsContent value="sent" className="space-y-4">
                        <UserGrid users={sentVouches} emptyText="Vous n'avez recommandé personne." />
                    </TabsContent>

                    <TabsContent value="referrals" className="space-y-4">
                        <UserGrid users={referrals} emptyText="Aucun ami parrainé pour le moment." />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

function UserGrid({ users, emptyText }: { users: any[], emptyText: string }) {
    if (users.length === 0) {
        return <div className="text-center py-8 text-zinc-500 text-sm italic">{emptyText}</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5">
                    <Avatar className="h-10 w-10 border border-zinc-200">
                        <AvatarImage src={user.image} />
                        <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-sm truncate">{user.name}</p>
                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                            <Shield size={10} className="text-emerald-500" />
                            <span>Score: {user.reputation || 0}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
