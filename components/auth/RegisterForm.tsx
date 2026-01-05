"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AuthInput } from "./AuthInput";
import { RoleSelector } from "./RoleSelector";
import { UserRole } from "@/types/next-auth";
import { registerUser } from "@/lib/actions";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { SocialButtons } from "./SocialButtons";

interface RegisterFormProps {
    onRoleChange: (role: UserRole) => void;
}

export function RegisterForm({ onRoleChange }: RegisterFormProps) {
    const [step, setStep] = useState<"ROLE" | "DETAILS">("ROLE");
    const [role, setRole] = useState<UserRole | null>(null);

    // Form State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleRoleSelect = (selectedRole: UserRole) => {
        setRole(selectedRole);
        onRoleChange(selectedRole);
        // Small delay for better UX
        setTimeout(() => setStep("DETAILS"), 300);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role) return;

        setIsLoading(true);
        setError("");

        try {
            const res = await registerUser(name, email, password, role);

            if (res.success) {
                router.push("/login?registered=true");
            } else {
                setError(res.error || "Une erreur est survenue.");
            }
        } catch (error) {
            setError("Une erreur est survenue.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
                {step === "ROLE" ? (
                    <motion.div
                        key="role"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-8">
                            <p className="text-sm text-zinc-500 font-medium uppercase tracking-widest mb-2">Étape 1/2</p>
                            <h3 className="text-xl font-bold">Quel est votre profil ?</h3>
                        </div>

                        <RoleSelector selected={role} onSelect={handleRoleSelect} />

                        <div className="text-center text-sm text-zinc-500 mt-8">
                            Déjà un compte ?{" "}
                            <Link href="/login" className="text-zinc-900 font-bold hover:underline">
                                Se connecter
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="details"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                    >
                        <button
                            onClick={() => setStep("ROLE")}
                            className="flex items-center text-sm text-zinc-500 hover:text-zinc-900 mb-6"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" /> Retour au choix du rôle
                        </button>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <AuthInput
                                label="Nom complet"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <AuthInput
                                label="Adresse Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <AuthInput
                                label="Mot de passe"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium text-center">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 text-base rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-colors"
                                disabled={isLoading}
                            >
                                {isLoading ? "Création..." : "Terminer l'inscription"}
                            </Button>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-zinc-200" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-zinc-500">Ou s'inscrire avec</span>
                                </div>
                            </div>

                            <SocialButtons />
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
