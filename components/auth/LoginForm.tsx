"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AuthInput } from "./AuthInput";
import { PasswordInput } from "./PasswordInput";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { SocialButtons } from "./SocialButtons";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShieldCheck, CheckCircle } from "lucide-react";

function LoginFormContent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [twoFactorCode, setTwoFactorCode] = useState("");
    const [step, setStep] = useState<"CREDENTIALS" | "2FA" | "EMAIL_NOT_VERIFIED">("CREDENTIALS");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [userId, setUserId] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    const registered = searchParams.get("registered");
    const verified = searchParams.get("verified");
    const reset = searchParams.get("reset");

    const handleCredentialsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // First, check if user has 2FA enabled
            const checkRes = await fetch("/api/auth/check-2fa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const checkData = await checkRes.json();

            if (checkData.requiresEmailVerification) {
                setStep("EMAIL_NOT_VERIFIED");
                setIsLoading(false);
                return;
            }

            // Standard sign in
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                // Generic error message for security
                setError("Email ou mot de passe incorrect.");
            } else if (checkData.twoFactorEnabled) {
                // User has 2FA, need to verify code
                setUserId(checkData.userId);
                setStep("2FA");
            } else {
                // No 2FA, redirect
                router.push("/");
                router.refresh();
            }
        } catch (error) {
            setError("Une erreur est survenue.");
        } finally {
            setIsLoading(false);
        }
    };

    const handle2FASubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // Verify 2FA code
            const res = await fetch("/api/auth/verify-2fa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, code: twoFactorCode }),
            });

            const data = await res.json();

            if (data.success) {
                router.push("/");
                router.refresh();
            } else {
                setError(data.error || "Code invalide.");
            }
        } catch (error) {
            setError("Une erreur est survenue.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Success messages */}
            {registered === "true" && step === "CREDENTIALS" && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm rounded-lg font-medium text-center flex items-center justify-center gap-2">
                    <CheckCircle size={16} />
                    Compte créé ! Vérifiez votre email.
                </div>
            )}

            {verified === "true" && step === "CREDENTIALS" && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm rounded-lg font-medium text-center flex items-center justify-center gap-2">
                    <CheckCircle size={16} />
                    Email vérifié ! Vous pouvez vous connecter.
                </div>
            )}

            {reset === "success" && step === "CREDENTIALS" && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm rounded-lg font-medium text-center flex items-center justify-center gap-2">
                    <CheckCircle size={16} />
                    Mot de passe modifié ! Connectez-vous.
                </div>
            )}

            <AnimatePresence mode="wait">
                {step === "CREDENTIALS" && (
                    <motion.form
                        key="credentials"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleCredentialsSubmit}
                        className="space-y-6"
                    >
                        <AuthInput
                            label="Adresse Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <div className="space-y-1">
                            <PasswordInput
                                label="Mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <div className="text-right">
                                <Link href="/forgot-password" className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                                    Mot de passe oublié ?
                                </Link>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg font-medium text-center">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 text-base rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={18} />
                                    Connexion...
                                </>
                            ) : "Se connecter"}
                        </Button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-black px-2 text-zinc-500 dark:text-zinc-400">Ou continuer avec</span>
                            </div>
                        </div>

                        <SocialButtons />

                        <div className="text-center text-sm text-zinc-500 mt-6">
                            Pas encore membre ?{" "}
                            <Link href="/register" className="text-zinc-900 dark:text-white font-bold hover:underline">
                                Créer un compte
                            </Link>
                        </div>
                    </motion.form>
                )}

                {step === "2FA" && (
                    <motion.form
                        key="2fa"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handle2FASubmit}
                        className="space-y-6"
                    >
                        <div className="text-center space-y-2">
                            <div className="mx-auto w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                                <ShieldCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                                Vérification en 2 étapes
                            </h3>
                            <p className="text-sm text-zinc-500">
                                Entrez le code à 6 chiffres depuis votre application d&apos;authentification.
                            </p>
                        </div>

                        <Input
                            value={twoFactorCode}
                            onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="000 000"
                            className="text-center text-2xl tracking-[0.3em] font-mono h-14"
                            maxLength={6}
                            autoFocus
                        />

                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg font-medium text-center">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 text-base rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors"
                            disabled={isLoading || twoFactorCode.length !== 6}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={18} />
                                    Vérification...
                                </>
                            ) : "Vérifier"}
                        </Button>

                        <button
                            type="button"
                            onClick={() => { setStep("CREDENTIALS"); setError(""); }}
                            className="w-full text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        >
                            ← Retour à la connexion
                        </button>
                    </motion.form>
                )}

                {step === "EMAIL_NOT_VERIFIED" && (
                    <motion.div
                        key="not-verified"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-6"
                    >
                        <div className="mx-auto w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                            <ShieldCheck className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                                Email non vérifié
                            </h3>
                            <p className="text-sm text-zinc-500">
                                Veuillez vérifier votre email avant de vous connecter.
                            </p>
                        </div>
                        <Button
                            onClick={() => { setStep("CREDENTIALS"); setError(""); }}
                            variant="outline"
                            className="w-full"
                        >
                            Retour
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function LoginForm() {
    return (
        <Suspense fallback={
            <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-zinc-400" size={32} />
            </div>
        }>
            <LoginFormContent />
        </Suspense>
    );
}

