import { getDossierByToken } from "@/lib/actions/dossier";
import { notFound } from "next/navigation";
import { OwnerDossierHeader } from "@/components/dossier/OwnerDossierHeader";
import { ReadOnlyVault } from "@/components/dossier/ReadOnlyVault";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default async function OwnerDossierPage(props: { params: Promise<{ token: string }> }) {
    const params = await props.params;
    const { token } = params;

    const result = await getDossierByToken(token);

    if (!result.success || !result.data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-zinc-900">Lien invalide ou expiré</h1>
                    <p className="text-zinc-500">Ce lien de partage n'est plus accessible.</p>
                    <Link href="/">
                        <div className="text-orange-600 hover:underline">Retour à Transpareo</div>
                    </Link>
                </div>
            </div>
        );
    }

    const dossier = result.data;
    const user = dossier.user;
    const documents = dossier?.documents || [];

    // Calculate Fake Score (or real if available)
    const score = 92; // Mock for now

    return (
        <div className="min-h-screen bg-zinc-50/50 font-sans text-zinc-900 pb-20">
            {/* Top Bar for Brand Trust */}
            <div className="bg-white border-b border-zinc-200 py-3">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={20} className="text-orange-500" />
                        <span className="font-bold text-lg tracking-tight">Transpareo <span className="text-zinc-400 font-normal">| Vérification</span></span>
                    </div>
                    <div className="text-xs text-zinc-500">
                        Vue Propriétaire Sécurisée
                    </div>
                </div>
            </div>

            <main className="container mx-auto max-w-5xl py-8 px-4 sm:px-6 space-y-8">
                {/* 1. Header */}
                <OwnerDossierHeader user={user} score={score} />

                {/* 2. Documents */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-8 w-1 bg-orange-500 rounded-full" />
                        <h2 className="text-xl font-bold text-zinc-900">Pièces Justificatives</h2>
                    </div>

                    <ReadOnlyVault documents={documents} />
                </section>

                {/* 3. Footer Trust */}
                <div className="text-center pt-8 border-t border-zinc-200 mt-12">
                    <p className="text-sm text-zinc-400">
                        Ce dossier est hébergé de manière sécurisée par Transpareo.
                        <br />
                        Les documents sont filigranés pour empêcher toute utilisation frauduleuse.
                    </p>
                </div>
            </main>
        </div>
    );
}
