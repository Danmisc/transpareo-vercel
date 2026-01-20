"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Lock, CheckCircle, Loader2, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

    // Validate token on mount
    useEffect(() => {
        if (!token) {
            setIsValidToken(false);
            return;
        }

        // Token exists, we'll validate on submit
        setIsValidToken(true);
    }, [token]);

    // Password strength indicator
    const getPasswordStrength = (pass: string) => {
        let strength = 0;
        if (pass.length >= 8) strength++;
        if (pass.length >= 12) strength++;
        if (/[A-Z]/.test(pass)) strength++;
        if (/[0-9]/.test(pass)) strength++;
        if (/[^A-Za-z0-9]/.test(pass)) strength++;
        return strength;
    };

    const strength = getPasswordStrength(password);
    const strengthLabels = ["Très faible", "Faible", "Moyen", "Fort", "Très fort"];
    const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-emerald-500"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Client-side validation
        if (password.length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères.");
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Une erreur est survenue.");
            } else {
                setSuccess(true);
                // Redirect to login after 3 seconds
                setTimeout(() => router.push("/login?reset=success"), 3000);
            }
        } catch (error) {
            setError("Une erreur est survenue.");
        } finally {
            setIsLoading(false);
        }
    };

    // Invalid or missing token
    if (isValidToken === false) {
        return (
            <AuthLayout
                title="Lien invalide"
                subtitle="Ce lien a expiré ou est invalide."
                role="TENANT"
            >
                <div className="text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Le lien de réinitialisation a expiré ou a déjà été utilisé.
                        Veuillez refaire une demande.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button asChild className="w-full">
                            <Link href="/forgot-password">Demander un nouveau lien</Link>
                        </Button>
                        <Link
                            href="/login"
                            className="flex items-center justify-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm"
                        >
                            <ArrowLeft size={16} />
                            Retour à la connexion
                        </Link>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Nouveau mot de passe"
            subtitle="Créez un mot de passe sécurisé."
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
                                Mot de passe modifié !
                            </h3>
                            <p className="text-zinc-500 dark:text-zinc-400">
                                Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 justify-center text-sm text-zinc-400">
                            <Loader2 className="animate-spin" size={14} />
                            Redirection vers la connexion...
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
                            <div className="relative">
                                <AuthInput
                                    label="Nouveau mot de passe"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-3 text-zinc-400 hover:text-zinc-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Password strength indicator */}
                            {password.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex gap-1">
                                        {[0, 1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? strengthColors[strength - 1] : "bg-zinc-200 dark:bg-zinc-700"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-zinc-500">
                                        Force : <span className="font-medium">{strengthLabels[strength - 1] || "Très faible"}</span>
                                    </p>
                                </div>
                            )}

                            <AuthInput
                                label="Confirmer le mot de passe"
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                error={confirmPassword && password !== confirmPassword ? "Ne correspond pas" : undefined}
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
                            disabled={isLoading || password.length < 8 || password !== confirmPassword}
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin mr-2" size={18} />
                            ) : (
                                <Lock className="mr-2" size={18} />
                            )}
                            {isLoading ? "Modification..." : "Modifier le mot de passe"}
                        </Button>
                    </motion.form>
                )}
            </AnimatePresence>
        </AuthLayout>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <AuthLayout title="Chargement..." subtitle="" role="TENANT">
                <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-zinc-400" size={32} />
                </div>
            </AuthLayout>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}

