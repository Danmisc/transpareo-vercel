"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCheck } from "lucide-react";

interface MessageReadListProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    readStatuses: any[];
    messageContent: string;
}

export function MessageReadList({ open, onOpenChange, readStatuses, messageContent }: MessageReadListProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCheck className="text-blue-500 w-5 h-5" />
                        Infos du message
                    </DialogTitle>
                </DialogHeader>

                <div className="p-4 bg-zinc-50 rounded-lg mb-4 text-sm text-zinc-700 italic border border-zinc-100 max-h-24 overflow-y-auto">
                    "{messageContent}"
                </div>

                <div className="space-y-4">
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Lu par ({readStatuses.length})
                    </h4>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                        {readStatuses.length === 0 ? (
                            <p className="text-sm text-zinc-400 text-center py-4">Pas encore lu</p>
                        ) : (
                            readStatuses.map((status) => (
                                <div key={status.userId} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-9 h-9 border border-zinc-100">
                                            <AvatarImage src={status.user?.avatar} />
                                            <AvatarFallback className="text-xs bg-zinc-100 text-zinc-500">
                                                {status.user?.name?.[0]?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-zinc-900">{status.user?.name || "Utilisateur"}</span>
                                            <span className="text-[10px] text-zinc-400 group-hover:hidden">Lu</span>
                                            <span className="text-[10px] text-blue-600 hidden group-hover:block font-medium">Voir le profil</span>
                                        </div>
                                    </div>
                                    <span className="text-xs text-zinc-500 font-medium font-mono bg-zinc-50 px-2 py-1 rounded-md">
                                        {format(new Date(status.readAt), "HH:mm", { locale: fr })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
