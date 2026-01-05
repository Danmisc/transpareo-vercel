import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { DocumentsVault } from "@/components/p2p/DocumentsVault";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Upload, Cloud } from "lucide-react";

export default async function DocumentsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/auth/login");

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans transition-colors duration-500">
            {/* Header handled by layout */}

            <div className="container mx-auto px-4 pt-24 pb-20">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-4 uppercase tracking-wider">
                            <Shield size={14} /> Coffre-fort Chiffré AES-256
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white mb-4">
                            Mes <span className="text-emerald-600">Documents</span>.
                        </h1>
                        <p className="text-xl text-zinc-500 max-w-2xl">
                            Contrats, relevés fiscaux et justificatifs. Tout est stocké de manière sécurisée et accessible à tout moment.
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Storage Stats Sidebar */}
                    <div className="space-y-6">
                        <Card className="bg-zinc-900 text-white border-zinc-800">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-10 w-10 bg-zinc-800 rounded-full flex items-center justify-center">
                                        <Cloud size={20} className="text-zinc-400" />
                                    </div>
                                    <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">PRO</span>
                                </div>
                                <h3 className="font-bold text-lg mb-1">Stockage</h3>
                                <p className="text-3xl font-mono mb-4">45 <span className="text-base text-zinc-500">/ 100 Mo</span></p>
                                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[45%]" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10">
                            <CardContent className="p-6 space-y-4">
                                <h3 className="font-bold text-zinc-900 dark:text-white">Actions Rapides</h3>
                                <Button className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold">
                                    <Upload size={16} className="mr-2" /> Uploader
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                            <div className="flex gap-3">
                                <Lock size={20} className="text-blue-600 shrink-0 mt-1" />
                                <div>
                                    <p className="font-bold text-sm text-blue-900 dark:text-blue-300">Confidentialité Totale</p>
                                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                                        Vos documents sont chiffrés. Même nos équipes n'y ont pas accès sans votre clé privée temporaire.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content: Vault */}
                    <div className="lg:col-span-3">
                        <DocumentsVault />
                    </div>
                </div>
            </div>
        </div>
    );
}
