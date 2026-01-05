"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Landmark, CreditCard, ArrowRightLeft } from "lucide-react";

export function WalletActions() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 hover:border-orange-500/50 transition-colors cursor-pointer group">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl group-hover:bg-orange-100 dark:group-hover:bg-orange-900/20 group-hover:text-orange-600 transition-colors">
                        <Landmark size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-zinc-900 dark:text-white">Ajouter un IBAN</h4>
                        <p className="text-xs text-zinc-500">Lier un compte bancaire pour les retraits.</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 hover:border-orange-500/50 transition-colors cursor-pointer group">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl group-hover:bg-orange-100 dark:group-hover:bg-orange-900/20 group-hover:text-orange-600 transition-colors">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-zinc-900 dark:text-white">Carte Bancaire</h4>
                        <p className="text-xs text-zinc-500">Gérer vos cartes enregistrées.</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 hover:border-orange-500/50 transition-colors cursor-pointer group">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl group-hover:bg-orange-100 dark:group-hover:bg-orange-900/20 group-hover:text-orange-600 transition-colors">
                        <ArrowRightLeft size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-zinc-900 dark:text-white">Virement Programmé</h4>
                        <p className="text-xs text-zinc-500">Mettre en place un dépôt mensuel.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
