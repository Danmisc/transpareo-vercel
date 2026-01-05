"use client";

import { useState } from "react";
import { postProjectUpdate } from "@/lib/actions-p2p-social";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Flag, Image as ImageIcon, Send } from "lucide-react";

interface TimelineProps {
    updates: any[];
    loanId: string;
    isOwner: boolean;
}

export function ProjectTimeline({ updates, loanId, isOwner }: TimelineProps) {
    const [isPosting, setIsPosting] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const handleSubmit = async () => {
        if (!title || !content) return;
        try {
            await postProjectUpdate({ loanId, title, content });
            toast.success("Actualité publiée !");
            setIsPosting(false);
            setTitle("");
            setContent("");
        } catch (e) {
            toast.error("Erreur lors de la publication.");
        }
    };

    return (
        <div className="space-y-8">
            {isOwner && (
                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-sm uppercase tracking-wide text-zinc-500">Poster une mise à jour</h3>
                        <Button variant="ghost" size="sm" onClick={() => setIsPosting(!isPosting)}>
                            {isPosting ? "Annuler" : "Nouveau post"}
                        </Button>
                    </div>

                    {isPosting && (
                        <div className="space-y-3 animation-in fade-in slide-in-from-top-2 duration-300">
                            <Input
                                placeholder="Titre (ex: Permis reçu !)"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="bg-white dark:bg-black/20"
                            />
                            <Textarea
                                placeholder="Dites aux investisseurs ce qui avance..."
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                className="bg-white dark:bg-black/20"
                            />
                            <div className="flex justify-end gap-2">
                                <Button size="sm" variant="outline"><ImageIcon size={16} className="mr-2" /> Photo</Button>
                                <Button size="sm" onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                    <Send size={16} className="mr-2" /> Publier
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-3 space-y-8 pb-10">
                {updates.length === 0 ? (
                    <div className="pl-8 text-zinc-500 italic">Aucune actualité pour le moment.</div>
                ) : updates.map((update) => (
                    <div key={update.id} className="relative pl-8">
                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-emerald-500 border-4 border-white dark:border-zinc-950" />

                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1">
                            <h4 className="font-bold text-lg text-zinc-900 dark:text-white">{update.title}</h4>
                            <span className="text-xs text-zinc-500">
                                {format(new Date(update.createdAt), "d MMMM yyyy", { locale: fr })}
                            </span>
                        </div>

                        <div className="prose prose-sm dark:prose-invert text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-white/5 p-4 rounded-xl border border-zinc-100 dark:border-white/5">
                            <p>{update.content}</p>
                            {update.imageUrl && (
                                <img
                                    src={update.imageUrl}
                                    alt="Update attachment"
                                    className="mt-3 rounded-lg w-full h-48 object-cover"
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
