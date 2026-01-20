import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Building, Plus, Trash2, CheckCircle2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function BankSettingsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const linkedAccounts = await prisma.linkedAccount.findMany({
        where: { userId: user.id },
        select: {
            id: true,
            providerName: true,
            accountName: true,
            mask: true,
            status: true,
            lastSync: true,
        },
        orderBy: { lastSync: 'desc' }
    });

    const primaryAccount = linkedAccounts.find(a => a.status === 'ACTIVE') || linkedAccounts[0];

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/p2p/settings">
                        <ArrowLeft size={20} />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Comptes bancaires</h1>
                    <p className="text-zinc-500 mt-1">Gérez vos comptes pour les retraits</p>
                </div>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Comptes liés</CardTitle>
                    <CardDescription>
                        {linkedAccounts.length} compte{linkedAccounts.length !== 1 ? 's' : ''} bancaire{linkedAccounts.length !== 1 ? 's' : ''}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {linkedAccounts.length === 0 ? (
                        <div className="text-center py-8">
                            <Building size={40} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                            <p className="text-zinc-500 mb-4">Aucun compte bancaire connecté</p>
                            <Button>
                                <Plus size={16} className="mr-2" />
                                Ajouter un compte
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {linkedAccounts.map((account) => {
                                const isPrimary = account.id === primaryAccount?.id;
                                return (
                                    <div
                                        key={account.id}
                                        className={`flex items-center justify-between p-4 rounded-lg border ${isPrimary
                                                ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/10'
                                                : 'border-zinc-200 dark:border-zinc-800'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                                <Building size={20} className="text-zinc-600" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-zinc-900 dark:text-white">
                                                        {account.providerName || "Compte bancaire"}
                                                    </p>
                                                    {isPrimary && (
                                                        <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                                                            <CheckCircle2 size={10} />
                                                            Principal
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-zinc-500">
                                                    {account.accountName} • {account.mask}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!isPrimary && (
                                                <Button variant="outline" size="sm">
                                                    Définir principal
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                            <Button variant="outline" className="w-full mt-2">
                                <Plus size={16} className="mr-2" />
                                Ajouter un compte
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                    <strong>Important :</strong> Le compte bancaire doit être à votre nom pour des raisons réglementaires.
                </p>
            </div>
        </div>
    );
}

