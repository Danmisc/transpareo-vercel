import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { User, Mail, Phone, Calendar, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ProfileSettingsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
            name: true,
            email: true,
            phoneNumber: true,
            createdAt: true,
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
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Informations personnelles</h1>
                    <p className="text-zinc-500 mt-1">Gérez vos informations de profil</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User size={20} className="text-indigo-600" />
                        Profil
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            <User size={18} className="text-zinc-400" />
                            <div>
                                <p className="text-sm text-zinc-500">Nom complet</p>
                                <p className="font-medium text-zinc-900 dark:text-white">{dbUser?.name || "Non renseigné"}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm">Modifier</Button>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            <Mail size={18} className="text-zinc-400" />
                            <div>
                                <p className="text-sm text-zinc-500">Email</p>
                                <p className="font-medium text-zinc-900 dark:text-white">{dbUser?.email}</p>
                            </div>
                        </div>
                        <span className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">Vérifié</span>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            <Phone size={18} className="text-zinc-400" />
                            <div>
                                <p className="text-sm text-zinc-500">Téléphone</p>
                                <p className="font-medium text-zinc-900 dark:text-white">{dbUser?.phoneNumber || "Non renseigné"}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/p2p/settings/phone">
                                {dbUser?.phoneNumber ? "Modifier" : "Ajouter"}
                            </Link>
                        </Button>
                    </div>

                    <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                            <Calendar size={18} className="text-zinc-400" />
                            <div>
                                <p className="text-sm text-zinc-500">Membre depuis</p>
                                <p className="font-medium text-zinc-900 dark:text-white">
                                    {dbUser?.createdAt?.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

