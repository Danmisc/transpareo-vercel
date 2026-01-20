"use client";

import { useState, useEffect } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
    FileText, Trash2, Edit3, Send, Clock, MoreVertical,
    Image as ImageIcon, Video, BarChart2, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getDrafts, deleteDraft, publishDraft } from "@/lib/actions-content";
import { toast } from "sonner";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

interface Draft {
    id: string;
    content: string;
    type: string;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
    attachments?: Array<{ url: string; type: string }>;
}

interface DraftsPanelProps {
    onEditDraft?: (draft: Draft) => void;
    trigger?: React.ReactNode;
}

export function DraftsPanel({ onEditDraft, trigger }: DraftsPanelProps) {
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    const loadDrafts = async () => {
        setLoading(true);
        const result = await getDrafts();
        if (result.success) {
            setDrafts(result.drafts as Draft[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (open) {
            loadDrafts();
        }
    }, [open]);

    const handleDelete = async (draftId: string) => {
        const result = await deleteDraft(draftId);
        if (result.success) {
            setDrafts(drafts.filter(d => d.id !== draftId));
            toast.success("Brouillon supprimé");
        } else {
            toast.error(result.error);
        }
    };

    const handlePublish = async (draftId: string) => {
        const result = await publishDraft(draftId);
        if (result.success) {
            setDrafts(drafts.filter(d => d.id !== draftId));
            toast.success("Brouillon publié !");
            setOpen(false);
        } else {
            toast.error(result.error);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "IMAGE": return <ImageIcon size={14} className="text-blue-500" />;
            case "VIDEO": return <Video size={14} className="text-purple-500" />;
            case "POLL": return <BarChart2 size={14} className="text-green-500" />;
            default: return <FileText size={14} className="text-zinc-400" />;
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="sm" className="gap-2">
                        <FileText size={16} />
                        Brouillons
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader className="flex flex-row items-center justify-between">
                    <SheetTitle className="flex items-center gap-2">
                        <FileText className="text-orange-500" size={20} />
                        Mes brouillons
                    </SheetTitle>
                    <Button variant="ghost" size="icon" onClick={loadDrafts} disabled={loading}>
                        <RefreshCw size={16} className={cn(loading && "animate-spin")} />
                    </Button>
                </SheetHeader>

                <div className="mt-6 space-y-3">
                    {loading ? (
                        // Skeleton loader
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 animate-pulse">
                                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2" />
                            </div>
                        ))
                    ) : drafts.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText size={48} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
                            <p className="text-zinc-500">Aucun brouillon</p>
                            <p className="text-sm text-zinc-400 mt-1">
                                Vos brouillons apparaîtront ici
                            </p>
                        </div>
                    ) : (
                        drafts.map((draft) => (
                            <div
                                key={draft.id}
                                className="group relative p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 hover:border-orange-500/30 transition-all"
                            >
                                {/* Type badge */}
                                <div className="flex items-center gap-2 mb-2">
                                    {getTypeIcon(draft.type)}
                                    <span className="text-[10px] uppercase text-zinc-400 font-medium">
                                        {draft.type}
                                    </span>
                                    <span className="text-[10px] text-zinc-400">•</span>
                                    <span className="text-[10px] text-zinc-400">
                                        {formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true, locale: fr })}
                                    </span>
                                </div>

                                {/* Content preview */}
                                <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2 mb-3">
                                    {draft.content || <span className="italic text-zinc-400">Contenu vide</span>}
                                </p>

                                {/* Image preview if exists */}
                                {draft.image && (
                                    <div className="mb-3 rounded-lg overflow-hidden h-20 bg-zinc-200 dark:bg-zinc-700">
                                        <img
                                            src={draft.image}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-xs gap-1.5"
                                            onClick={() => {
                                                onEditDraft?.(draft);
                                                setOpen(false);
                                            }}
                                        >
                                            <Edit3 size={12} />
                                            Modifier
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-xs gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            onClick={() => handleDelete(draft.id)}
                                        >
                                            <Trash2 size={12} />
                                            Supprimer
                                        </Button>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="h-8 text-xs gap-1.5 bg-orange-500 hover:bg-orange-600"
                                        onClick={() => handlePublish(draft.id)}
                                    >
                                        <Send size={12} />
                                        Publier
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {drafts.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <p className="text-xs text-zinc-400 text-center">
                            {drafts.length} brouillon{drafts.length > 1 ? "s" : ""} sauvegardé{drafts.length > 1 ? "s" : ""}
                        </p>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

