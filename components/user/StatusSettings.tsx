"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateStatusAction } from "@/app/actions/user";
import { Loader2, Moon, Sun, Monitor, Activity } from "lucide-react";
import { toast } from "sonner";

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

    const handleSave = async () => {
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
                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                        <div className="flex flex-col space-y-1">
                            <Label htmlFor="invisible" className="font-medium">Mode Invisible</Label>
                            <span className="text-xs text-muted-foreground">
                                Ne pas apparaître dans la liste "En ligne".
                            </span>
                        </div>
                        <Switch
                            id="invisible"
                            checked={invisible}
                            onCheckedChange={setInvisible}
                        />
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
