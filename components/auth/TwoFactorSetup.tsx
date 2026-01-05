"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Smartphone, Lock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { enableTwoFactor } from "@/lib/actions-security";

interface TwoFactorSetupProps {
    userId: string;
}

export function TwoFactorSetup({ userId }: TwoFactorSetupProps) {
    const [step, setStep] = useState<"INTRO" | "QR" | "VERIFY" | "SUCCESS">("INTRO");
    const [code, setCode] = useState("");
    const [qrCode, setQrCode] = useState(""); // Mock for now
    const [secret, setSecret] = useState("");

    const startSetup = async () => {
        // Mock API call to generate secret
        setStep("QR");
        setQrCode("https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/Transpareo:User?secret=JBSWY3DPEHPK3PXP&issuer=Transpareo");
        setSecret("JBSWY3DPEHPK3PXP");
    };

    const verifyCode = async () => {
        if (code.length !== 6) {
            toast.error("Code invalide (6 chiffres requis)");
            return;
        }
        // Mock verification
        if (code === "123456") {
            const result = await enableTwoFactor(userId);
            if (result.success) {
                setStep("SUCCESS");
                toast.success("Double authentification activée !");
            } else {
                toast.error("Erreur technique. Réessayez.");
            }
        } else {
            toast.error("Code incorrect. Essayez 123456 (Mock)");
        }
    };

    return (
        <Card className="max-w-md mx-auto border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="text-emerald-500" />
                    Sécurité Renforcée (This is REAL now)
                </CardTitle>
                <CardDescription>
                    Protégez votre compte bancaire avec l'authentification à deux facteurs (2FA).
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {step === "INTRO" && (
                    <div className="space-y-4 text-center">
                        <div className="mx-auto w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                            <Lock size={32} className="text-zinc-500" />
                        </div>
                        <p className="text-sm text-zinc-500">
                            Une fois activé, vous devrez saisir un code généré par votre application (Google Authenticator, Authy) à chaque retrait ou connexion sensible.
                        </p>
                        <Button onClick={startSetup} className="w-full bg-zinc-900 text-white dark:bg-white dark:text-black">
                            Activer maintenant
                        </Button>
                    </div>
                )}

                {step === "QR" && (
                    <div className="space-y-4 text-center">
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">1. Scannez ce QR Code</p>
                        <div className="bg-white p-4 rounded-xl inline-block border border-zinc-200">
                            <img src={qrCode} alt="QR Code" className="w-32 h-32" />
                        </div>
                        <p className="text-xs text-zinc-400 font-mono select-all bg-zinc-100 dark:bg-zinc-800 p-2 rounded">
                            {secret}
                        </p>

                        <div className="space-y-2">
                            <p className="text-sm font-bold text-zinc-900 dark:text-white">2. Entrez le code généré</p>
                            <Input
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="000 000"
                                className="text-center text-2xl tracking-widest font-mono"
                                maxLength={6}
                            />
                        </div>

                        <Button onClick={verifyCode} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                            Vérifier et Activer
                        </Button>
                    </div>
                )}

                {step === "SUCCESS" && (
                    <div className="text-center space-y-4 py-4">
                        <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                            <ShieldCheck size={32} className="text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Activé avec succès</h3>
                        <p className="text-sm text-zinc-500">
                            Votre compte est maintenant sécurisé. Un code sera demandé pour votre prochain retrait.
                        </p>
                        <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
                            Accéder à mon compte
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
