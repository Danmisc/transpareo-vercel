"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AuthInput } from "./AuthInput";
import Link from "next/link";
import { SocialButtons } from "./SocialButtons";

export function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("Email ou mot de passe incorrect.");
            } else {
                router.push("/");
                router.refresh();
            }
        } catch (error) {
            setError("Une erreur est survenue.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <AuthInput
                label="Adresse Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <div className="space-y-1">
                <AuthInput
                    label="Mot de passe"
                    type="password"
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
                {isLoading ? "Connexion..." : "Se connecter"}
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
        </form>
    );
}
