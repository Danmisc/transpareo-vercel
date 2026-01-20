import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Lock, ArrowLeft, Mail, Key } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { TwoFactorSetup } from "@/components/p2p/settings/TwoFactorSetup";
import Link from "next/link";

export default async function SecuritySettingsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
            twoFactorEnabled: true,
            emailVerified: true,
            email: true
        }
    });

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/settings">
                        <ArrowLeft size={20} />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Sécurité du Compte</h1>
                    <p className="text-zinc-500 mt-1">Protégez votre compte avec des options de sécurité avancées</p>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Email Verification Status */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <Mail className="text-blue-600" size={24} />
                            <CardTitle>Vérification Email</CardTitle>
                            {dbUser?.emailVerified ? (
                                <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                                    Vérifié
                                </span>
                            ) : (
                                <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                                    Non vérifié
                                </span>
                            )}
                        </div>
                        <CardDescription>
                            {dbUser?.emailVerified
                                ? `Votre email ${dbUser.email} est vérifié.`
                                : "Vérifiez votre email pour sécuriser votre compte."
                            }
                        </CardDescription>
                    </CardHeader>
                    {!dbUser?.emailVerified && (
                        <CardContent>
                            <Button variant="outline">Renvoyer le lien de vérification</Button>
                        </CardContent>
                    )}
                </Card>

                {/* 2FA Setup */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="text-indigo-600" size={24} />
                            <CardTitle>Double Authentification (2FA)</CardTitle>
                            {dbUser?.twoFactorEnabled && (
                                <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                                    Activé
                                </span>
                            )}
                        </div>
                        <CardDescription>
                            Protégez votre compte avec Google Authenticator ou Authy.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TwoFactorSetup isEnabled={!!dbUser?.twoFactorEnabled} />
                    </CardContent>
                </Card>

                {/* Password Change */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <Lock className="text-zinc-600" size={24} />
                            <CardTitle>Mot de passe</CardTitle>
                        </div>
                        <CardDescription>
                            Modifiez votre mot de passe principal.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" asChild>
                            <Link href="/forgot-password">Changer le mot de passe</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Active Sessions */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <Key className="text-amber-600" size={24} />
                            <CardTitle>Sessions Actives</CardTitle>
                        </div>
                        <CardDescription>
                            Consultez et gérez vos connexions actives.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-zinc-500 mb-4">
                            Cette fonctionnalité sera disponible prochainement.
                        </p>
                        <Button variant="outline" disabled>
                            Voir les sessions
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

