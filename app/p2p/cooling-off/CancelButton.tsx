"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { cancelInvestmentCoolingOff } from "@/lib/actions-compliance";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CancelInvestmentButtonProps {
    investmentId: string;
}

export function CancelInvestmentButton({ investmentId }: CancelInvestmentButtonProps) {
    const [loading, setLoading] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const router = useRouter();

    const handleCancel = async () => {
        if (!confirming) {
            setConfirming(true);
            return;
        }

        setLoading(true);
        try {
            const result = await cancelInvestmentCoolingOff(investmentId);

            if (result.success) {
                toast.success(`Investissement annulé. ${result.refundedAmount?.toLocaleString('fr-FR')} € remboursés.`);
                router.refresh();
            } else {
                toast.error(result.error || "Erreur lors de l'annulation");
            }
        } catch (error) {
            toast.error("Erreur lors de l'annulation");
        } finally {
            setLoading(false);
            setConfirming(false);
        }
    };

    if (confirming) {
        return (
            <div className="flex gap-2">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirming(false)}
                    disabled={loading}
                >
                    Non
                </Button>
                <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleCancel}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="animate-spin" size={14} /> : "Confirmer"}
                </Button>
            </div>
        );
    }

    return (
        <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
            <X size={14} className="mr-1" /> Annuler
        </Button>
    );
}

