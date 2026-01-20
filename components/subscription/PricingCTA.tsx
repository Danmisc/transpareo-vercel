"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PricingCTA() {
    return (
        <section className="py-24 px-4 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900">
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
                    Prêt à commencer ?
                </h2>
                <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-10 max-w-xl mx-auto">
                    Rejoignez des milliers de locataires et propriétaires qui simplifient leur immobilier aujourd'hui.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/register">
                        <Button
                            size="lg"
                            className="rounded-full px-8 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                            Créer un compte
                        </Button>
                    </Link>
                    <Link href="/contact">
                        <Button
                            variant="ghost"
                            size="lg"
                            className="rounded-full px-8 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                            Contacter l'équipe
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
