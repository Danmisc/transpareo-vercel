"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Calculator, Heart, Home } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { createGroup, joinGroup } from "@/lib/actions/dossier";

interface GroupManagerProps {
    userId: string;
    dossier: any;
}

export function GroupManager({ userId, dossier }: GroupManagerProps) {
    const [inviteCode, setInviteCode] = useState("");

    const handleCreate = async () => {
        const res = await createGroup(userId, "Nouveau Groupe", "COUPLE"); // Defaulting to COUPLE for now
        if (res.success) toast.success("Groupe créé ! Invitez vos amis.");
    };

    const handleJoin = async () => {
        const res = await joinGroup(userId, inviteCode);
        if (res.success) toast.success("Groupe rejoint !");
        else toast.error("Code invalide");
    };

    if (dossier?.group) {
        const members = dossier.group.members || [];
        const totalIncome = members.reduce((sum: number, m: any) => sum + (m.tenant?.dossier?.verifiedIncome || 0), 0); // Simplified mock access

        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Users size={120} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                                {members.length > 2 ? "COLOCATION" : "COUPLE / DUO"}
                            </span>
                        </div>
                        <h2 className="text-3xl font-black mb-6">Dossier Groupé</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                <div className="text-indigo-200 text-sm mb-1 uppercase font-bold tracking-wider">Revenus Cumulés</div>
                                <div className="text-4xl font-bold flex items-baseline gap-1">
                                    {totalIncome > 0 ? totalIncome : "5 200"} <span className="text-xl">€</span>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 md:col-span-2 flex items-center justify-between">
                                <div>
                                    <div className="text-indigo-200 text-sm mb-2 uppercase font-bold tracking-wider">Membres</div>
                                    <div className="flex -space-x-4">
                                        {members.map((m: any, i: number) => (
                                            <Avatar key={i} className="border-4 border-indigo-500 w-12 h-12">
                                                <AvatarImage src={m.tenant?.image} />
                                                <AvatarFallback>{m.tenant?.name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        ))}
                                        <button className="w-12 h-12 rounded-full bg-white/20 border-4 border-indigo-500 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                                            <UserPlus size={20} />
                                        </button>
                                    </div>
                                </div>
                                <Button className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold">
                                    Gérer le groupe
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-white border border-zinc-200 rounded-2xl">
                        <h3 className="font-bold flex items-center gap-2 mb-2"><Heart className="text-red-500" /> Compatible Couple</h3>
                        <p className="text-sm text-zinc-500">Idéal pour fusionner vos dossiers et multiplier vos chances par 2.</p>
                    </div>
                    <div className="p-6 bg-white border border-zinc-200 rounded-2xl">
                        <h3 className="font-bold flex items-center gap-2 mb-2"><Home className="text-blue-500" /> Compatible Coloc</h3>
                        <p className="text-sm text-zinc-500">Chacun remplit sa partie, le propriétaire reçoit un dossier unique.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Empty State (No group)
    return (
        <div className="bg-white rounded-3xl border border-zinc-200 p-8 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={40} />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">Louer à plusieurs ?</h2>
            <p className="text-zinc-500 mb-8 max-w-md mx-auto">
                Créez un dossier commun pour Couple ou Colocation. Vos revenus sont additionnés pour rassurer le propriétaire.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={handleCreate} className="h-auto py-4 flex flex-col items-center gap-2 bg-zinc-900 hover:bg-zinc-800">
                    <UserPlus size={24} />
                    <span>Créer un groupe</span>
                    <span className="text-[10px] opacity-70 font-normal">Je suis le premier membre</span>
                </Button>

                <div className="flex flex-col gap-2">
                    <input
                        type="text"
                        placeholder="Code d'invitation"
                        value={inviteCode}
                        onChange={e => setInviteCode(e.target.value)}
                        className="p-3 rounded-md border border-zinc-200 text-center text-sm"
                    />
                    <Button onClick={handleJoin} variant="outline">Rejoindre un groupe</Button>
                </div>
            </div>
        </div>
    );
}

