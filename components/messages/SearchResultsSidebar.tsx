"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X, Search } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface SearchResultsSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    results: any[];
    onJumpTo: (message: any) => void;
    isLoading: boolean;
}

export function SearchResultsSidebar({ isOpen, onClose, results, onJumpTo, isLoading }: SearchResultsSidebarProps) {
    if (!isOpen) return null;

    return (
        <div className="w-80 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col h-full shadow-xl z-20">
            <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-100 dark:border-zinc-800">
                <span className="font-semibold text-sm">Résultats ({results.length})</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                    <X size={18} />
                </Button>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2 space-y-2">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-10 text-zinc-400 gap-2">
                            <Search className="animate-pulse" />
                            <span className="text-xs">Recherche...</span>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-zinc-400 text-center px-4">
                            <span className="text-xs">Aucun résultat trouvé.</span>
                        </div>
                    ) : (
                        results.map((msg) => (
                            <div
                                key={msg.id}
                                className="group p-3 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                                onClick={() => onJumpTo(msg)}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <Avatar className="h-5 w-5">
                                        <AvatarImage src={msg.sender?.avatar || msg.sender?.image} />
                                        <AvatarFallback>{msg.sender?.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{msg.sender?.name}</span>
                                    <span className="text-[10px] text-zinc-400">{format(new Date(msg.createdAt || msg.time), "d MMM", { locale: fr })}</span>
                                </div>
                                <div className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-3 leading-relaxed pl-7">
                                    {msg.content}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
