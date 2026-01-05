"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateSettingsAction, getSettingsAction } from "@/app/actions/user";
import { Loader2, Shield, Bell, Moon } from "lucide-react";
import { toast } from "sonner";

interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [settings, setSettings] = useState({
        readReceiptsEnabled: true,
        notifyOnLike: true,
        notifyOnComment: true
    });

    useEffect(() => {
        if (open) {
            getSettingsAction().then(res => {
                if (res.success && res.data) {
                    setSettings(prev => ({ ...prev, ...res.data }));
                }
            });
        }
    }, [open]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const res = await updateSettingsAction(settings);
            if (res.success) {
                toast.success("Paramètres mis à jour");
                onOpenChange(false);
            } else {
                toast.error("Erreur de sauvegarde");
            }
        } catch {
            toast.error("Erreur inconnue");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Paramètres</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="privacy" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="privacy">
                            <Shield className="w-4 h-4 mr-2" />
                            Confidentialité
                        </TabsTrigger>
                        <TabsTrigger value="notifications">
                            <Bell className="w-4 h-4 mr-2" />
                            Notifications
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="privacy" className="space-y-4 py-4">
                        <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg">
                            <div className="flex flex-col space-y-1">
                                <Label htmlFor="read-receipts" className="font-medium">Confirmations de lecture</Label>
                                <span className="text-sm text-muted-foreground">
                                    Si désactivé, vous ne verrez pas si les autres ont lu vos messages.
                                </span>
                            </div>
                            <Switch
                                id="read-receipts"
                                checked={settings.readReceiptsEnabled}
                                onCheckedChange={(c) => setSettings(s => ({ ...s, readReceiptsEnabled: c }))}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="notifications" className="space-y-4 py-4">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="likes">J'aime</Label>
                                <Switch
                                    id="likes"
                                    checked={settings.notifyOnLike}
                                    onCheckedChange={(c) => setSettings(s => ({ ...s, notifyOnLike: c }))}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="comments">Commentaires</Label>
                                <Switch
                                    id="comments"
                                    checked={settings.notifyOnComment}
                                    onCheckedChange={(c) => setSettings(s => ({ ...s, notifyOnComment: c }))}
                                />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enregistrer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
