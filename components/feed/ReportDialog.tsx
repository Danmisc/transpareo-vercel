"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { createReport } from "@/lib/actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ReportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    targetId: string;
    targetType: "POST" | "COMMENT" | "USER";
    userId?: string; // Optional reporter ID
}

const REASONS = [
    { id: "spam", label: "Spam ou publicité abusive" },
    { id: "harassment", label: "Harcèlement ou intimidation" },
    { id: "misinfo", label: "Fausses informations" },
    { id: "hate", label: "Discours haineux" },
    { id: "violence", label: "Violence ou contenu graphique" },
    { id: "other", label: "Autre problème" }
];

export function ReportDialog({ open, onOpenChange, targetId, targetType, userId }: ReportDialogProps) {
    const [reason, setReason] = useState("spam");
    const [details, setDetails] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await createReport(userId, targetType, targetId, reason, details);
            toast.success("Signalement reçu", {
                description: "Merci de nous aider à garder la communauté sûre."
            });
            onOpenChange(false);
            setDetails("");
            setReason("spam");
        } catch (error) {
            toast.error("Erreur technique", { description: "Veuillez réessayer plus tard." });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Signaler le contenu</DialogTitle>
                    <DialogDescription>
                        Pourquoi signalez-vous ce contenu ? Cela reste anonyme.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <RadioGroup value={reason} onValueChange={setReason} className="space-y-2">
                        {REASONS.map((r) => (
                            <div key={r.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={r.id} id={r.id} />
                                <Label htmlFor={r.id} className="cursor-pointer font-normal">{r.label}</Label>
                            </div>
                        ))}
                    </RadioGroup>

                    {reason === "other" && (
                        <div className="space-y-2 animate-in fade-in">
                            <Label>Détails (Optionnel)</Label>
                            <Textarea
                                placeholder="Dites-nous en plus..."
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                className="resize-none"
                            />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                        Annuler
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Envoyer le signalement
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

