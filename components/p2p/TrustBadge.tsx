"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, ShieldCheck } from "lucide-react";
import { vouchForUser } from "@/lib/actions-p2p-social";
import { toast } from "sonner";

interface TrustBadgeProps {
    trustData: {
        score: number;
        count: number;
        vouchers: any[];
    };
    targetUserId: string;
    currentUserId: string;
}

export function TrustBadge({ trustData, targetUserId, currentUserId }: TrustBadgeProps) {
    const isSelf = targetUserId === currentUserId;

    const handleVouch = async () => {
        try {
            await vouchForUser(targetUserId, "FRIEND");
            toast.success("Vous vous portez garant !");
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    return (
        <div className="flex items-center gap-4 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30">
            <div className="flex -space-x-3">
                {trustData.vouchers.slice(0, 3).map((v, i) => (
                    <Avatar key={i} className="border-2 border-white dark:border-black w-10 h-10">
                        <AvatarImage src={v.image || ""} />
                        <AvatarFallback>{v.name?.[0]}</AvatarFallback>
                    </Avatar>
                ))}
                {trustData.count === 0 && (
                    <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center border-2 border-white dark:border-black">
                        <Users size={16} className="text-zinc-400" />
                    </div>
                )}
            </div>

            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <p className="font-bold text-zinc-900 dark:text-blue-100 text-sm">
                        {trustData.count > 0 ? `${trustData.count} Garants` : "Aucun garant"}
                    </p>
                    {trustData.score > 50 && <ShieldCheck size={16} className="text-emerald-500" />}
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400">Score de Confiance: {trustData.score}</p>
            </div>

            {!isSelf && (
                <Button size="sm" variant="secondary" onClick={handleVouch} className="bg-white dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-50">
                    Se porter garant
                </Button>
            )}
        </div>
    );
}
