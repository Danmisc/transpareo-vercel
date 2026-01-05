"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createReport } from "@/lib/actions";
import { AlertTriangle, X, Check } from "lucide-react";

interface ReportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    targetId: string;
    targetType: "POST" | "COMMENT" | "USER";
    reporterId?: string;
}

const REASONS = [
    { id: "SPAM", label: "Spam ou indésirable" },
    { id: "HARASSMENT", label: "Harcèlement ou intimidation" },
    { id: "MISINFO", label: "Fausses informations" },
    { id: "HATE", label: "Contenu haineux" },
    { id: "OTHER", label: "Autre problème" }
];

export function ReportDialog({ isOpen, onClose, targetId, targetType, reporterId }: ReportDialogProps) {
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!reason) return;
        setIsSubmitting(true);
        const res = await createReport(reporterId, targetType, targetId, reason, details);
        if (res.success) {
            setIsSuccess(true);
            setTimeout(() => {
                onClose();
                setIsSuccess(false);
                setReason("");
                setDetails("");
            }, 2000);
        } else {
            alert("Erreur lors du signalement.");
        }
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-background rounded-lg shadow-lg border p-6 m-4 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                {isSuccess ? (
                    <div className="flex flex-col items-center py-8 text-center space-y-4">
                        <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold">Signalement envoyé</h3>
                        <p className="text-muted-foreground text-sm">Merci de nous aider à garder cette communauté sûre.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="h-5 w-5" />
                                <h3 className="font-semibold">Signaler ce contenu</h3>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Raison</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {REASONS.map(r => (
                                        <button
                                            key={r.id}
                                            className={cn(
                                                "flex items-center w-full px-3 py-2 text-sm text-left rounded-md border transition-colors",
                                                reason === r.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted"
                                            )}
                                            onClick={() => setReason(r.id)}
                                        >
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Détails (optionnel)</label>
                                <Textarea
                                    placeholder="Précisez le problème..."
                                    value={details}
                                    onChange={e => setDetails(e.target.value)}
                                    className="resize-none h-24"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="ghost" onClick={onClose}>Annuler</Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!reason || isSubmitting}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {isSubmitting ? "Envoi..." : "Signaler"}
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
