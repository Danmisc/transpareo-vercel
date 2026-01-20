"use client";

import { useState } from "react";
import { Phone, ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function PhoneSettingsPage() {
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");
    const [step, setStep] = useState<"input" | "verify">("input");
    const [loading, setLoading] = useState(false);

    const handleSendCode = async () => {
        if (!phone || phone.length < 10) return;
        setLoading(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1000));
        setLoading(false);
        setStep("verify");
    };

    const handleVerify = async () => {
        if (!code || code.length !== 6) return;
        setLoading(true);
        // Simulate verification
        await new Promise(r => setTimeout(r, 1000));
        setLoading(false);
        // In real app, would update user and redirect
        window.location.href = "/p2p/settings";
    };

    return (
        <div className="max-w-xl mx-auto py-8 px-4">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/p2p/settings">
                        <ArrowLeft size={20} />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Numéro de téléphone</h1>
                    <p className="text-zinc-500 mt-1">Ajoutez ou modifiez votre numéro</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Phone size={20} className="text-indigo-600" />
                        {step === "input" ? "Entrez votre numéro" : "Vérification"}
                    </CardTitle>
                    <CardDescription>
                        {step === "input"
                            ? "Nous vous enverrons un code de vérification par SMS."
                            : "Entrez le code reçu par SMS."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {step === "input" ? (
                        <>
                            <div>
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
                                    Numéro de téléphone
                                </label>
                                <Input
                                    type="tel"
                                    placeholder="+33 6 12 34 56 78"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="text-lg"
                                />
                            </div>
                            <Button
                                onClick={handleSendCode}
                                disabled={loading || phone.length < 10}
                                className="w-full"
                            >
                                {loading && <Loader2 size={16} className="mr-2 animate-spin" />}
                                Envoyer le code
                            </Button>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
                                    Code de vérification
                                </label>
                                <Input
                                    type="text"
                                    placeholder="123456"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="text-lg text-center tracking-widest"
                                    maxLength={6}
                                />
                                <p className="text-xs text-zinc-500 mt-2">
                                    Code envoyé à {phone}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setStep("input")}
                                    className="flex-1"
                                >
                                    Modifier le numéro
                                </Button>
                                <Button
                                    onClick={handleVerify}
                                    disabled={loading || code.length !== 6}
                                    className="flex-1"
                                >
                                    {loading && <Loader2 size={16} className="mr-2 animate-spin" />}
                                    Vérifier
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <p className="text-xs text-zinc-500 text-center mt-4">
                Votre numéro est utilisé pour la sécurité de votre compte (2FA) et les alertes importantes.
            </p>
        </div>
    );
}

