import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Lock, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { TwoFactorSetup } from "@/components/p2p/settings/TwoFactorSetup";
import Link from "next/link";

export default async function SecurityPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
            twoFactorEnabled: true
        }
    });

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/p2p/settings">
                        <ArrowLeft size={20} />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Sécurité du Compte</h1>
                    <p className="text-zinc-500 mt-1">Protégez votre compte avec l&apos;authentification forte</p>
                </div>
            </div>

            <div className="grid gap-6">
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
                        <Button variant="outline">Changer le mot de passe</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

