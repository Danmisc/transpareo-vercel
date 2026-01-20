"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, Loader2, AlertTriangle, Mail } from "lucide-react";
import { motion } from "framer-motion";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error" | "expired">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Aucun token de vérification fourni.");
            return;
        }

        verifyEmail();
    }, [token]);

    const verifyEmail = async () => {
        try {
            const res = await fetch(`/api/auth/verify-email?token=${token}`);
            const data = await res.json();

            if (res.ok && data.success) {
                setStatus("success");
                setMessage("Votre email a été vérifié avec succès !");
                // Redirect to login after 3 seconds
                setTimeout(() => router.push("/login?verified=true"), 3000);
            } else if (data.expired) {
                setStatus("expired");
                setMessage(data.error || "Le lien a expiré.");
            } else {
                setStatus("error");
                setMessage(data.error || "Le lien est invalide.");
            }
        } catch (error) {
            setStatus("error");
            setMessage("Une erreur est survenue lors de la vérification.");
        }
    };

    return (
        <AuthLayout
            title={
                status === "loading" ? "Vérification..." :
                    status === "success" ? "Email vérifié !" :
                        "Vérification échouée"
            }
            subtitle=""
            role="TENANT"
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6"
            >
                {status === "loading" && (
                    <>
                        <div className="mx-auto w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400">
                            Vérification de votre email en cours...
                        </p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                Email vérifié !
                            </h3>
                            <p className="text-zinc-500 dark:text-zinc-400">
                                {message}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 justify-center text-sm text-zinc-400">
                            <Loader2 className="animate-spin" size={14} />
                            Redirection vers la connexion...
                        </div>
                    </>
                )}

                {status === "expired" && (
                    <>
                        <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                            <Mail className="w-8 h-8 text-amber-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400">
                                Lien expiré
                            </h3>
                            <p className="text-zinc-500 dark:text-zinc-400">
                                {message}
                            </p>
                        </div>
                        <Button asChild className="w-full">
                            <Link href="/login">Se connecter pour renvoyer</Link>
                        </Button>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-red-600 dark:text-red-400">
                                Échec de la vérification
                            </h3>
                            <p className="text-zinc-500 dark:text-zinc-400">
                                {message}
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Button asChild className="w-full">
                                <Link href="/register">Créer un nouveau compte</Link>
                            </Button>
                            <Link
                                href="/login"
                                className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm"
                            >
                                Déjà un compte ? Se connecter
                            </Link>
                        </div>
                    </>
                )}
            </motion.div>
        </AuthLayout>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <AuthLayout title="Chargement..." subtitle="" role="TENANT">
                <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-zinc-400" size={32} />
                </div>
            </AuthLayout>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}

