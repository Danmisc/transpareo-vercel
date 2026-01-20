"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTwoFactorSetup, enableTwoFactor, disableTwoFactor } from "@/lib/actions-security";
import { QrCode, Loader2, CheckCircle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export function TwoFactorSetup({ isEnabled }: { isEnabled: boolean }) {
    const [setupData, setSetupData] = useState<{ secret: string; qrCode: string } | null>(null);
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(false);

    const startSetup = async () => {
        setLoading(true);
        try {
            const data = await getTwoFactorSetup();
            setSetupData(data);
        } catch (e) {
            toast.error("Impossible d'initialiser le 2FA");
        } finally {
            setLoading(false);
        }
    };

    const handleEnable = async () => {
        if (!setupData || !token) return;
        setLoading(true);
        try {
            const res = await enableTwoFactor(setupData.secret, token);
            if (res.success) {
                toast.success("Double authentification activée !");
                setSetupData(null);
            } else {
                toast.error(res.error || "Code invalide");
            }
        } catch (e) {
            toast.error("Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = async () => {
        if (!confirm("Voulez-vous vraiment désactiver la protection 2FA ?")) return;
        setLoading(true);
        try {
            await disableTwoFactor();
            toast.success("2FA désactivé");
        } catch (e) {
            toast.error("Erreur lors de la désactivation");
        } finally {
            setLoading(false);
        }
    };

    if (isEnabled) {
        return (
            <div className="flex flex-col items-start gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 p-4 rounded-lg flex items-center gap-3 w-full">
                    <CheckCircle className="shrink-0" />
                    <div>
                        <p className="font-bold">Protection Active</p>
                        <p className="text-sm">Votre compte est sécurisé par TOTP (Google Authenticator).</p>
                    </div>
                </div>
                <Button variant="destructive" onClick={handleDisable} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin mr-2" /> : <ShieldAlert className="mr-2" size={16} />}
                    Désactiver le 2FA
                </Button>
            </div>
        );
    }

    if (!setupData) {
        return (
            <div>
                <p className="text-zinc-500 mb-4">
                    Utilisez une application comme <strong>Google Authenticator</strong> ou <strong>Authy</strong> pour générer des codes uniques.
                </p>
                <Button onClick={startSetup} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                    {loading ? <Loader2 className="animate-spin mr-2" /> : <QrCode className="mr-2" size={16} />}
                    Configurer le 2FA
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start border p-6 rounded-lg bg-zinc-50 dark:bg-black/20">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={setupData.qrCode} alt="QR Code 2FA" width={192} height={192} className="w-48 h-48" />
                </div>
                <div className="space-y-4 flex-1">
                    <div>
                        <Label>Clé de configuration (si le scan échoue)</Label>
                        <div className="font-mono bg-zinc-200 dark:bg-zinc-800 p-2 rounded text-sm mt-1 select-all">
                            {setupData.secret}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Code de validation (6 chiffres)</Label>
                        <div className="flex gap-2">
                            <Input
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="000 000"
                                className="text-center text-lg tracking-widest max-w-[200px]"
                                maxLength={6}
                            />
                            <Button onClick={handleEnable} disabled={loading || token.length < 6}>
                                {loading ? <Loader2 className="animate-spin" /> : "Activer"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Button variant="ghost" onClick={() => setSetupData(null)} className="w-full text-zinc-500">
                Annuler
            </Button>
        </div>
    );
}

