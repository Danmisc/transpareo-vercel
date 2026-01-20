"use client";

import { CreditCard, Plus, Trash2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// In a real app, this would come from Stripe or your payment provider
const mockPaymentMethods = [
    { id: '1', brand: 'visa', last4: '4242', expMonth: 12, expYear: 2027, isDefault: true },
];

export default function PaymentMethodsPage() {
    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/p2p/settings">
                        <ArrowLeft size={20} />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Moyens de paiement</h1>
                    <p className="text-zinc-500 mt-1">Gérez vos cartes pour les investissements</p>
                </div>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Cartes enregistrées</CardTitle>
                    <CardDescription>
                        Vos cartes bancaires pour payer vos investissements
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {mockPaymentMethods.length === 0 ? (
                        <div className="text-center py-8">
                            <CreditCard size={40} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                            <p className="text-zinc-500 mb-4">Aucune carte enregistrée</p>
                            <Button>
                                <Plus size={16} className="mr-2" />
                                Ajouter une carte
                            </Button>
                        </div>
                    ) : (
                        <>
                            {mockPaymentMethods.map((card) => (
                                <div
                                    key={card.id}
                                    className={`flex items-center justify-between p-4 rounded-lg border ${card.isDefault
                                            ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/10'
                                            : 'border-zinc-200 dark:border-zinc-800'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-8 rounded bg-gradient-to-br from-zinc-800 to-zinc-600 flex items-center justify-center">
                                            <span className="text-white text-xs font-bold uppercase">{card.brand}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-zinc-900 dark:text-white">
                                                    •••• {card.last4}
                                                </p>
                                                {card.isDefault && (
                                                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                                                        <CheckCircle2 size={10} />
                                                        Par défaut
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-zinc-500">
                                                Expire {card.expMonth}/{card.expYear}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!card.isDefault && (
                                            <Button variant="outline" size="sm">
                                                Définir par défaut
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full mt-4">
                                <Plus size={16} className="mr-2" />
                                Ajouter une carte
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>

            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                    <strong>Sécurisé :</strong> Vos données de paiement sont protégées par Stripe.
                    Nous ne stockons jamais vos numéros de carte complets.
                </p>
            </div>
        </div>
    );
}

