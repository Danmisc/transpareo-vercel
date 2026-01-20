"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, ShieldAlert, XCircle } from "lucide-react";

interface RiskWarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
    warnings: string[];
    amount: number;
    projectTitle: string;
}

export function RiskWarningModal({
    isOpen,
    onClose,
    onAccept,
    warnings,
    amount,
    projectTitle
}: RiskWarningModalProps) {
    const [acknowledged, setAcknowledged] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAccept = async () => {
        if (!acknowledged) return;
        setLoading(true);
        try {
            await onAccept();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => !loading && onClose()}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="pb-3 border-b">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <AlertTriangle className="text-amber-600" size={20} />
                        </div>
                        <DialogTitle className="text-lg">Avertissement Investisseur</DialogTitle>
                    </div>
                </DialogHeader>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                    {/* Investment Summary - compact */}
                    <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                        <span className="text-sm text-zinc-500">Montant</span>
                        <span className="font-bold">{amount.toLocaleString('fr-FR')} €</span>
                    </div>

                    {/* Combined Warnings - simplified */}
                    <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                        <h4 className="font-semibold text-amber-800 dark:text-amber-200 text-sm mb-3 flex items-center gap-2">
                            <ShieldAlert size={16} /> Risques à connaître
                        </h4>
                        <ul className="space-y-2 text-xs text-amber-700 dark:text-amber-300">
                            <li>• Risque de perte totale ou partielle du capital</li>
                            <li>• Fonds immobilisés pendant la durée du prêt</li>
                            <li>• Non couvert par le Fonds de Garantie des Dépôts</li>
                            {warnings.map((w, i) => (
                                <li key={i}>• {w}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Cooling-off - compact */}
                    <p className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg">
                        <strong>Rétractation:</strong> 4 jours pour annuler sans frais.
                    </p>

                    {/* Acknowledgment */}
                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${acknowledged
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10"
                            : "border-zinc-200 dark:border-zinc-700"
                        }`}>
                        <Checkbox
                            checked={acknowledged}
                            onCheckedChange={(v) => setAcknowledged(!!v)}
                        />
                        <span className="text-sm">Je comprends les risques</span>
                    </label>
                </div>

                <DialogFooter className="pt-3 border-t gap-2">
                    <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
                        Annuler
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleAccept}
                        disabled={!acknowledged || loading}
                        className="bg-orange-600 hover:bg-orange-500"
                    >
                        {loading ? "..." : "Continuer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ========================================
// BLOCKER MODAL (Cannot Invest) - Simplified
// ========================================

interface BlockerModalProps {
    isOpen: boolean;
    onClose: () => void;
    blockers: string[];
    onGoToKYC?: () => void;
    onGoToSuitability?: () => void;
}

export function BlockerModal({
    isOpen,
    onClose,
    blockers,
    onGoToKYC,
    onGoToSuitability
}: BlockerModalProps) {
    const needsKYC = blockers.some(b => b.includes("identité") || b.includes("Limite"));
    const needsSuitability = blockers.some(b => b.includes("questionnaire"));

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <XCircle className="text-red-600" size={20} />
                        </div>
                        <DialogTitle className="text-lg">Action requise</DialogTitle>
                    </div>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    {blockers.map((blocker, i) => (
                        <div
                            key={i}
                            className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg text-sm"
                        >
                            <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={16} />
                            <span className="text-red-800 dark:text-red-200">{blocker}</span>
                        </div>
                    ))}
                </div>

                <DialogFooter className="gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={onClose}>
                        Fermer
                    </Button>
                    {needsSuitability && onGoToSuitability && (
                        <Button size="sm" onClick={onGoToSuitability} className="bg-orange-600 hover:bg-orange-500">
                            Questionnaire
                        </Button>
                    )}
                    {needsKYC && onGoToKYC && (
                        <Button size="sm" onClick={onGoToKYC} className="bg-blue-600 hover:bg-blue-500">
                            Vérifier identité
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

