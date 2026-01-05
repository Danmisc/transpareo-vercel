"use client";

import { useCallback, useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { Button } from "@/components/ui/button";
import { createLinkToken, exchangePublicToken } from "@/lib/actions-banking-plaid";
import { toast } from "sonner";
import { Building2, Loader2, Plus } from "lucide-react";

export function ConnectBankReal({ onSuccess }: { onSuccess?: () => void }) {
    const [token, setToken] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // 1. Generate Link Token on mount
    useEffect(() => {
        const init = async () => {
            setIsGenerating(true);
            const data = await createLinkToken();
            if (data.link_token) {
                setToken(data.link_token);
            } else {
                toast.error("Erreur connexion Plaid", { description: data.error });
            }
            setIsGenerating(false);
        };
        init();
    }, []);

    // 2. Handle Success (Token Exchange)
    const onSuccessLink = useCallback(async (public_token: string, metadata: any) => {
        toast.loading("Connexion sécurisée en cours...");

        const result = await exchangePublicToken(public_token, metadata);

        if (result.success) {
            toast.dismiss();
            toast.success("Compte connecté avec succès !");
            if (onSuccess) onSuccess();
        } else {
            toast.dismiss();
            toast.error("Échec de la liaison bancaire");
        }
    }, [onSuccess]);

    const config: Parameters<typeof usePlaidLink>[0] = {
        token,
        onSuccess: onSuccessLink,
    };

    const { open, ready } = usePlaidLink(config);

    return (
        <Button
            onClick={() => open()}
            disabled={!ready || isGenerating}
            variant="outline"
            className="rounded-full gap-2 text-zinc-600 dark:text-zinc-300 border-dashed border-zinc-300 dark:border-zinc-700"
        >
            {isGenerating ? (
                <Loader2 className="animate-spin w-4 h-4" />
            ) : (
                <Plus size={16} />
            )}
            Connecter une banque (Réel)
        </Button>
    );
}
