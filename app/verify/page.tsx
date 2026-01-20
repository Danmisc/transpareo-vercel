"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, ArrowRight, Loader2, AlertCircle, Sparkles, RefreshCcw } from "lucide-react";
import { sendVerificationEmail, verifyEmailToken } from "@/lib/actions-identity";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

function VerifyContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();

    const [status, setStatus] = useState<"IDLE" | "VERIFYING" | "SUCCESS" | "ERROR">("IDLE");
    const [loadingSend, setLoadingSend] = useState(false);
    const [sentTo, setSentTo] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            handleVerify(token);
        }
    }, [token]);

    const handleVerify = async (t: string) => {
        setStatus("VERIFYING");
        // Add fake delay for "Processing" feel
        await new Promise(r => setTimeout(r, 1500));

        try {
            const res = await verifyEmailToken(t);
            if (res.success) {
                setStatus("SUCCESS");
                toast.success("Identité numérique validée !");
            } else {
                setStatus("ERROR");
                toast.error(res.error);
            }
        } catch (e) {
            setStatus("ERROR");
        }
    };

    const handleSend = async () => {
        setLoadingSend(true);
        try {
            const res = await sendVerificationEmail();
            if (res.success) {
                setSentTo(res.email || "votre email");
                if (res.devMode) {
                    toast.success("Mode Dév : Lien dans la console serveur du terminal.");
                } else {
                    toast.success("Email envoyé !");
                }
            } else {
                toast.error("Erreur d'envoi", {
                    description: res.error || "Vérifiez que votre email est autorisé (Mode Sandbox Resend)."
                });
            }
        } catch (e) {
            toast.error("Erreur technique");
        } finally {
            setLoadingSend(false);
        }
    };

    const StatusIcon = {
        IDLE: Mail,
        VERIFYING: Loader2,
        SUCCESS: CheckCircle,
        ERROR: AlertCircle
    }[status];

    const statusColor = {
        IDLE: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30",
        VERIFYING: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
        SUCCESS: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
        ERROR: "text-red-600 bg-red-100 dark:bg-red-900/30",
    }[status];

    // Show "Email Sent" State
    if (sentTo && status === "IDLE") {
        return (
            <div className="text-center">
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="mx-auto w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full flex items-center justify-center mb-6"
                >
                    <Mail size={40} className="animate-pulse" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-3">Email Envoyé !</h2>
                <p className="text-zinc-500 mb-2">
                    Nous avons envoyé un lien magique à :
                </p>
                <div className="bg-zinc-100 dark:bg-zinc-800 py-2 px-4 rounded-lg font-mono text-sm inline-block mb-6 select-all">
                    {sentTo}
                </div>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto mb-8 leading-relaxed">
                    Si vous ne le voyez pas, vérifiez vos spams. <br />
                    En mode <strong>Sandbox</strong>, l'email doit être celui connecté à votre compte Resend.
                </p>
                <Button variant="outline" onClick={() => setSentTo(null)} className="rounded-full">
                    <RefreshCcw size={14} className="mr-2" /> Renvoyer / Changer
                </Button>
            </div>
        );
    }

    return (
        <div className="text-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                key={status} // re-animate on change
                className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 ${statusColor}`}
            >
                <StatusIcon size={40} className={status === "VERIFYING" ? "animate-spin" : ""} />
            </motion.div>

            <AnimatePresence mode="wait">
                {status === "IDLE" && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <h2 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                            Identité Numérique
                        </h2>
                        <p className="text-zinc-500 mb-8 max-w-xs mx-auto text-lg leading-relaxed">
                            Sécurisons votre compte. Un lien unique va vous être envoyé.
                        </p>
                        <Button
                            onClick={handleSend}
                            disabled={loadingSend}
                            className="w-full h-14 text-lg rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black hover:scale-105 transition-transform duration-200"
                        >
                            {loadingSend ? "Envoi en cours..." : "Envoyer le lien magique"}
                        </Button>
                        <p className="text-xs text-zinc-400 mt-4">
                            Garantie sans spam. Lien valable 24h.
                        </p>
                    </motion.div>
                )}

                {status === "VERIFYING" && (
                    <motion.div
                        key="verifying"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h2 className="text-2xl font-bold mb-2">Vérification...</h2>
                        <p className="text-zinc-500">
                            Nous analysons votre jeton de sécurité.
                        </p>
                    </motion.div>
                )}

                {status === "SUCCESS" && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <h2 className="text-3xl font-bold mb-3 text-emerald-600 dark:text-emerald-400">Félicitations !</h2>
                        <p className="text-zinc-500 mb-8 text-lg">
                            Votre email est vérifié. Vous faites partie du club.
                        </p>
                        <Button
                            onClick={() => router.push("/p2p/dashboard")}
                            className="w-full h-14 text-lg rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                        >
                            <Sparkles className="mr-2" />
                            Entrer dans le Dashboard
                        </Button>
                    </motion.div>
                )}

                {status === "ERROR" && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2 className="text-2xl font-bold mb-2 text-red-600">Lien Expiré</h2>
                        <p className="text-zinc-500 mb-8">
                            Ce lien ne semble plus valide.
                        </p>
                        <Button
                            onClick={() => setStatus("IDLE")}
                            variant="outline"
                            className="w-full h-12 rounded-full"
                        >
                            Réessayer
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center justify-center p-4">
            {/* Logo */}
            <div className="absolute top-8 left-8 flex items-center gap-2 font-bold text-xl tracking-tighter">
                <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black">T</div>
                Transpareo
            </div>

            <Card className="max-w-md w-full border-none shadow-2xl dark:shadow-zinc-900/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
                <CardContent className="p-10">
                    <Suspense fallback={<Loader2 className="animate-spin mx-auto text-zinc-300" />}>
                        <VerifyContent />
                    </Suspense>
                    <div className="flex flex-col gap-3 w-full mt-6">
                        <Button variant="ghost" className="w-full text-zinc-500" onClick={() => window.location.href = "/p2p/dashboard"}>
                            Retour au Dashboard
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <p className="text-center text-zinc-400 text-xs mt-8">
                &copy; 2026 Transpareo Financial Services. <br />Sécurisé par birométrie et chiffrement quantique.
            </p>
        </div>
    );
}

