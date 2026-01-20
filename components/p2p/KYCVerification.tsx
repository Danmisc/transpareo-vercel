"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Loader2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import SumsubWebSdk from '@sumsub/websdk-react';
import { getSumsubToken, syncSumsubStatus } from "@/lib/actions-kyc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function KYCVerification({ currentStatus, tier }: { currentStatus: any, tier: number }) {
    const [token, setToken] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch Token on Mount
    useEffect(() => {
        // If already verified, don't load SDK
        if (currentStatus === 'VERIFIED' && tier > 1) return;

        const init = async () => {
            const res = await getSumsubToken();
            if (res.token) {
                if (res.token.startsWith("mock_")) {
                    toast.info("Mode Démo Sumsub", { description: "Ajoutez SUMSUB_APP_TOKEN pour le mode production." });
                }
                setToken(res.token);
                if (res.email) setEmail(res.email);
            } else {
                setError(res.error || "Erreur d'initialisation KYC");
            }
        };
        init();
    }, [currentStatus, tier]);

    // Already Verified View
    if (currentStatus === 'VERIFIED' && tier > 0) {
        return (
            <Card className="bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-500/20">
                <CardContent className="flex items-center gap-4 p-6">
                    <div className="bg-emerald-100 dark:bg-emerald-900/50 p-3 rounded-full text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <h3 className="font-bold text-emerald-800 dark:text-emerald-400">Identité Vérifiée (Tier {tier})</h3>
                        <p className="text-emerald-600 dark:text-emerald-500 text-sm">Vous avez accès à toutes les fonctionnalités d'investissement.</p>
                    </div>
                </CardContent>
                <div className="px-6 pb-6 pt-0">
                    <Button variant="outline" className="w-full bg-white/50 border-emerald-200 hover:bg-emerald-100 dark:bg-transparent dark:border-emerald-500/30 dark:hover:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" onClick={() => window.location.href = "/p2p/dashboard"}>
                        Retour au Dashboard
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card className="border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden">
            <CardHeader className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-white/5">
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="text-indigo-600" />
                    Vérification d'Identité
                </CardTitle>
                <CardDescription>
                    Vérification biométrique sécurisée niveau bancaire (LCB-FT).
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0 min-h-[400px] flex items-center justify-center bg-zinc-50/50">

                {!token && !error && (
                    <div className="flex flex-col items-center gap-4 p-8">
                        <Loader2 className="animate-spin text-indigo-600" size={32} />
                        <p className="text-zinc-500 text-sm">Initialisation sécurisée...</p>
                    </div>
                )}

                {error && (
                    <div className="flex flex-col items-center gap-4 p-8 text-red-500 text-center">
                        <AlertTriangle size={32} />
                        <p>{error}</p>
                        <p className="text-xs text-zinc-400">Vérifiez vos clés API Sumsub.</p>
                    </div>
                )}

                {token && token.startsWith("mock_") ? (
                    <div className="flex flex-col items-center gap-4 p-8 text-center max-w-md">
                        <div className="bg-amber-100 dark:bg-amber-900/20 p-4 rounded-full text-amber-600">
                            <ShieldCheck size={48} />
                        </div>
                        <h3 className="font-bold text-lg">Intégration Sumsub Prête</h3>
                        <p className="text-zinc-500">
                            Le module de vérification biométrique est installé. Pour l'activer, vous devez ajouter vos clés API Sumsub.
                        </p>
                        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-xs font-mono text-left w-full space-y-2">
                            <div>SUMSUB_APP_TOKEN=...</div>
                            <div>SUMSUB_SECRET_KEY=...</div>
                        </div>
                        <p className="text-xs text-zinc-400">
                            Fichier: .env
                        </p>
                    </div>
                ) : token && (
                    <div className="w-full">
                        <SumsubWebSdk
                            accessToken={token}
                            expirationHandler={() => Promise.resolve(token)}
                            config={{
                                lang: 'fr',
                                email: email || "", // Verified user email from App
                                phone: "",
                                i18n: {
                                    document: { subTitle: "Identité Nationale ou Passeport" }
                                },
                                uiConf: {
                                    customCssStr: ":root { --black: #1f2937; --grey: #f3f4f6; --primary-color: #6366f1; }"
                                },
                                onError: (error: any) => {
                                    console.error("Sumsub Error:", error);
                                },
                                onMessage: (type: string, payload: any) => {
                                    console.log("Sumsub Event:", type, payload);
                                }
                            }}
                            options={{ addViewportTag: false, adaptIframeHeight: true }}
                            onMessage={(type: string, payload: any) => {
                                // console.log("Sumsub Event:", type, payload);
                                if (type === 'idCheck.onApplicantStatusChanged') {
                                    // Status changed (e.g. pending -> completed)
                                    // Trigger server sync
                                    syncSumsubStatus().then(res => {
                                        if (res.success && res.status === 'VERIFIED') {
                                            toast.success("Identité Vérifiée !");
                                            window.location.reload(); // Refresh to show success state
                                        }
                                    });
                                }
                            }}
                            onError={(data: any) => console.error("onError", data)}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}



