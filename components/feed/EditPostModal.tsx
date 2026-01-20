"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { editPost } from "@/lib/actions";
import { Loader2, Clock, AlertCircle } from "lucide-react";

interface EditPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    postId: string;
    userId: string;
    currentContent: string;
    createdAt: Date;
}

const EDIT_WINDOW_MINUTES = 15;

export function EditPostModal({
    isOpen,
    onClose,
    postId,
    userId,
    currentContent,
    createdAt
}: EditPostModalProps) {
    const [content, setContent] = useState(currentContent);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);

    // Calculate remaining time
    useEffect(() => {
        const calculateRemaining = () => {
            const now = new Date();
            const created = new Date(createdAt);
            const elapsed = (now.getTime() - created.getTime()) / (1000 * 60);
            const remaining = EDIT_WINDOW_MINUTES - elapsed;
            setTimeRemaining(Math.max(0, remaining));
        };

        calculateRemaining();
        const interval = setInterval(calculateRemaining, 1000);
        return () => clearInterval(interval);
    }, [createdAt]);

    const handleSave = () => {
        if (!content.trim()) {
            setError("Le contenu ne peut pas être vide");
            return;
        }

        if (content === currentContent) {
            onClose();
            return;
        }

        setError(null);
        startTransition(async () => {
            const res = await editPost(postId, userId, content);
            if (res.success) {
                onClose();
            } else {
                setError(res.error || "Erreur lors de la modification");
            }
        });
    };

    const formatTime = (minutes: number) => {
        const mins = Math.floor(minutes);
        const secs = Math.floor((minutes - mins) * 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const isExpired = timeRemaining <= 0;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Modifier le post
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {isExpired ? (
                            <span className="text-red-500">Délai de modification expiré</span>
                        ) : (
                            <span>Temps restant: <strong>{formatTime(timeRemaining)}</strong></span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {isExpired ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Le délai de {EDIT_WINDOW_MINUTES} minutes pour modifier ce post est dépassé.
                        </p>
                    </div>
                ) : (
                    <>
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Modifiez votre post..."
                            className="min-h-[150px] resize-none"
                            disabled={isPending}
                        />

                        {error && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </p>
                        )}

                        <DialogFooter>
                            <Button variant="ghost" onClick={onClose} disabled={isPending}>
                                Annuler
                            </Button>
                            <Button onClick={handleSave} disabled={isPending || isExpired}>
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Enregistrement...
                                    </>
                                ) : (
                                    "Enregistrer"
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

