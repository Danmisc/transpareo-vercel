"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, Crown, Lock, Sparkles, Send } from "lucide-react";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/use-subscription";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface InMailButtonProps {
    targetUserId: string;
    targetUserName: string;
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
    showLabel?: boolean;
}

/**
 * InMail Button - Allows PRO/BUSINESS users to message anyone
 * FREE/PLUS users see an upgrade prompt
 */
export function InMailButton({
    targetUserId,
    targetUserName,
    variant = "outline",
    size = "default",
    className,
    showLabel = true
}: InMailButtonProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [showUpgrade, setShowUpgrade] = useState(false);

    const { plan, isPro } = useSubscription();
    const canSendInMail = plan === "PRO" || plan === "BUSINESS";

    const handleClick = () => {
        if (canSendInMail) {
            setIsOpen(true);
        } else {
            setShowUpgrade(true);
        }
    };

    const handleSendInMail = async () => {
        if (!message.trim()) {
            toast.error("Veuillez écrire un message");
            return;
        }

        setIsSending(true);
        try {
            const response = await fetch("/api/inmails/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipientId: targetUserId,
                    message: message.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.code === "INMAIL_LIMIT_REACHED") {
                    toast.error(data.error || "Limite d'InMails atteinte ce mois-ci");
                } else {
                    toast.error(data.error || "Erreur lors de l'envoi");
                }
                return;
            }

            toast.success(`InMail envoyé à ${targetUserName} !`);
            setIsOpen(false);
            setMessage("");

            // Optionally redirect to the conversation
            if (data.conversationId) {
                router.push(`/messages?c=${data.conversationId}`);
            }
        } catch (error) {
            toast.error("Erreur lors de l'envoi de l'InMail");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <>
            <Button
                variant={variant}
                size={size}
                onClick={handleClick}
                className={cn(
                    canSendInMail
                        ? "text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-800 dark:hover:bg-indigo-900/30"
                        : "",
                    className
                )}
            >
                <Mail className={cn("h-4 w-4", showLabel && "mr-2")} />
                {showLabel && (canSendInMail ? "InMail" : "InMail")}
                {!canSendInMail && <Lock className="h-3 w-3 ml-1 opacity-50" />}
            </Button>

            {/* Send InMail Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-indigo-500" />
                            Envoyer un InMail
                        </DialogTitle>
                        <DialogDescription>
                            Envoyez un message direct à <strong>{targetUserName}</strong>, même si vous n'êtes pas connectés.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="inmail-message">Votre message</Label>
                            <Textarea
                                id="inmail-message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={`Bonjour ${targetUserName}, je vous contacte car...`}
                                rows={5}
                                maxLength={1000}
                                className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground text-right">
                                {message.length}/1000 caractères
                            </p>
                        </div>

                        <div className="flex items-start gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                            <Sparkles className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-indigo-700 dark:text-indigo-300">
                                Les InMails ont un taux de réponse 3x supérieur aux messages classiques car ils sont mis en avant dans la boîte de réception.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSendInMail}
                            disabled={isSending || !message.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Envoi...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Envoyer l'InMail
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Upgrade Prompt Dialog */}
            <Dialog open={showUpgrade} onOpenChange={setShowUpgrade}>
                <DialogContent className="sm:max-w-[400px] text-center">
                    <DialogHeader>
                        <div className="mx-auto mb-4 h-16 w-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                            <Crown className="h-8 w-8 text-white" />
                        </div>
                        <DialogTitle className="text-xl">
                            Débloquez les InMails
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Contactez <strong>{targetUserName}</strong> et n'importe qui d'autre avec les InMails, disponibles avec le plan Pro.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-3">
                        <div className="flex items-center gap-3 text-left p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                            <Mail className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-sm">10 InMails/mois</p>
                                <p className="text-xs text-muted-foreground">Avec le plan Pro</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-left p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                            <Mail className="h-5 w-5 text-zinc-900 dark:text-white flex-shrink-0" />
                            <div>
                                <p className="font-medium text-sm">InMails illimités</p>
                                <p className="text-xs text-muted-foreground">Avec le plan Business</p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex-col gap-2 sm:flex-col">
                        <Link href="/pricing" className="w-full">
                            <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                                <Crown className="h-4 w-4 mr-2" />
                                Passer à Pro
                            </Button>
                        </Link>
                        <Button variant="ghost" onClick={() => setShowUpgrade(false)} className="w-full">
                            Plus tard
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

