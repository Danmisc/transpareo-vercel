"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Shield, Snowflake, Globe, Lock, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

export function WalletCardControls() {
    const [isFrozen, setIsFrozen] = useState(false);
    const [onlineEnabled, setOnlineEnabled] = useState(true);

    const toggleFreeze = () => {
        setIsFrozen(!isFrozen);
        toast(isFrozen ? "Carte débloquée" : "Carte gelée temporairement", {
            icon: isFrozen ? <Shield className="text-emerald-500" /> : <Snowflake className="text-blue-500" />
        });
    };

    return (
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 rounded-[32px]">
            <CardHeader>
                <CardTitle className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Shield size={18} className="text-zinc-400" />
                    Sécurité & Carte
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Freeze Control */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isFrozen ? 'bg-blue-100 text-blue-600' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                            <Snowflake size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-zinc-900 dark:text-white">Geler la carte</p>
                            <p className="text-xs text-zinc-500">Bloquer temporairement</p>
                        </div>
                    </div>
                    <Switch checked={isFrozen} onCheckedChange={toggleFreeze} />
                </div>

                {/* Online Payments */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center">
                            <Globe size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-zinc-900 dark:text-white">Paiements en ligne</p>
                            <p className="text-xs text-zinc-500">Internet & Abonnements</p>
                        </div>
                    </div>
                    <Switch checked={onlineEnabled} onCheckedChange={setOnlineEnabled} />
                </div>

                {/* Pin Reveal (Mock) */}
                <Button variant="outline" className="w-full text-zinc-600 dark:text-zinc-300 rounded-xl h-12 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                    <Lock size={16} className="mr-2" />
                    Afficher le Code PIN
                </Button>

            </CardContent>
        </Card>
    );
}
