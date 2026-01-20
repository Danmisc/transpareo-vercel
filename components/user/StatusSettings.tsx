"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateStatusAction } from "@/app/actions/user";
import { Loader2, Moon, Sun, Monitor, Activity, Crown, Lock } from "lucide-react";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/use-subscription";
import Link from "next/link";

interface StatusSettingsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentStatus: string | null;
    currentInvisible: boolean;
    onStatusUpdate?: (status: string | null, invisible: boolean) => void;
}

export function StatusSettings({ open, onOpenChange, currentStatus, currentInvisible, onStatusUpdate }: StatusSettingsProps) {
    const [status, setStatus] = useState(currentStatus || "");
    const [invisible, setInvisible] = useState(currentInvisible);
    const [isLoading, setIsLoading] = useState(false);

    // Check subscription for invisible mode
    const { plan, isPro } = useSubscription();
    const canUseInvisible = plan === "PRO" || plan === "BUSINESS";

    const handleSave = async () => {
        // If trying to enable invisible mode without PRO
        if (invisible && !canUseInvisible) {
            toast.error("Le mode invisible nécessite un abonnement Pro", {
                action: {
                    label: "Voir les plans",
                    onClick: () => window.location.href = "/pricing"
                }
            });
            return;
        }

        setIsLoading(true);
        try {
            const res = await updateStatusAction(status, invisible);
            if (res.success) {
                toast.success("Statut mis à jour");
                onOpenChange(false);
                onStatusUpdate?.(status, invisible);
            } else {
                toast.error(res.error || "Erreur");
            }
        } catch (error) {
            toast.error("Une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Définir le statut</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                            Message
                        </Label>
                        <Input
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            placeholder="En réunion 📅"
                            className="col-span-3"
                        />
                    </div>

                    {/* Invisible Mode - Gated for PRO+ */}
                    <div className={`flex items-center justify-between space-x-2 border p-3 rounded-lg transition-colors ${!canUseInvisible ? "bg-zinc-50 dark:bg-zinc-900 border-dashed" : ""}`}>
                        <div className="flex flex-col space-y-1">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="invisible" className="font-medium">Mode Invisible</Label>
                                {!canUseInvisible && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded-full">
                                        <Crown className="h-2.5 w-2.5" /> PRO
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                                Ne pas apparaître dans la liste "En ligne".
                            </span>
                        </div>

                        {canUseInvisible ? (
                            <Switch
                                id="invisible"
                                checked={invisible}
                                onCheckedChange={setInvisible}
                            />
                        ) : (
                            <Link href="/pricing">
                                <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 text-orange-600 border-orange-200 hover:bg-orange-50">
                                    <Lock className="h-3 w-3" />
                                    Débloquer
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSave} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enregistrer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

