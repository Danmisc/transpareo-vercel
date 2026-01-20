"use client";

import { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Une erreur est survenue.");
            } else {
                setSuccess(true);
            }
        } catch (error) {
            setError("Une erreur est survenue.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Mot de passe oublié"
            subtitle="Nous vous enverrons un lien de réinitialisation."
            role="TENANT"
        >
            <AnimatePresence mode="wait">
                {success ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-6"
                    >
                        <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                                Email envoyé !
                            </h3>
                            <p className="text-zinc-500 dark:text-zinc-400">
                                Si un compte existe avec l&apos;adresse <strong className="text-zinc-900 dark:text-white">{email}</strong>, vous recevrez un lien de réinitialisation.
                            </p>
                        </div>
                        <div className="pt-4 space-y-3">
                            <p className="text-sm text-zinc-400">
                                Vous n&apos;avez rien reçu ? Vérifiez vos spams ou{" "}
                                <button
                                    onClick={() => setSuccess(false)}
                                    className="text-zinc-900 dark:text-white font-medium hover:underline"
                                >
                                    réessayez
                                </button>
                            </p>
                            <Link
                                href="/login"
                                className="flex items-center justify-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                            >
                                <ArrowLeft size={16} />
                                Retour à la connexion
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    <motion.form
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                <Mail className="text-zinc-400" size={24} />
                                <div>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                        Réinitialisation par email
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        Un lien sécurisé sera envoyé à votre adresse.
                                    </p>
                                </div>
                            </div>

                            <AuthInput
                                label="Adresse Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg font-medium text-center">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 text-base rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors"
                            disabled={isLoading || !email}
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin mr-2" size={18} />
                            ) : null}
                            {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
                        </Button>

                        <div className="text-center text-sm text-zinc-500 mt-6">
                            <Link
                                href="/login"
                                className="flex items-center justify-center gap-2 hover:text-zinc-900 dark:hover:text-white transition-colors"
                            >
                                <ArrowLeft size={16} />
                                Retour à la connexion
                            </Link>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
        </AuthLayout>
    );
}

