"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useTransition } from "react";
import { createShareLink } from "@/lib/actions/dossier"; // Ensure this action exists & is exported
import { Share2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

// If createShareLink is not available, we need to create it (I did in step 8159)

export function ShareDialog({ userId }: { userId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [token, setToken] = useState("");
    const [isPending, startTransition] = useTransition();
    const [copied, setCopied] = useState(false);

    const handleGenerate = () => {
        startTransition(async () => {
            const res = await createShareLink(userId);
            if (res.success && res.token) {
                // Construct full URL (In prod: use ENV var for base URL)
                const link = `${window.location.origin}/dossier/shared/${res.token}`;
                setToken(link);
            } else {
                toast.error("Erreur de génération");
            }
        });
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(token);
        setCopied(true);
        toast.success("Lien copié !");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Share2 className="w-4 h-4" />
                    Partager mon dossier
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Partager votre Dossier</DialogTitle>
                    <DialogDescription>
                        Créez un lien sécurisé et temporaire (7 jours) pour les propriétaires.
                        Vos documents seront consultables en lecture seule.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {!token ? (
                        <div className="flex flex-col items-center gap-4">
                            <Button onClick={handleGenerate} disabled={isPending} className="w-full">
                                {isPending ? "Génération..." : "Générer un lien unique"}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                            <Label>Votre lien sécurisé</Label>
                            <div className="flex gap-2">
                                <Input value={token} readOnly className="font-mono text-xs bg-zinc-50" />
                                <Button size="icon" variant="outline" onClick={handleCopy}>
                                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                            <p className="text-xs text-zinc-500">
                                Ce lien expirera automatiquement dans 7 jours.
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
